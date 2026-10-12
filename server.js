import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  sendCustomerInvoice,
  sendAdminOrderNotification,
  sendAccessGrantedEmail,
  sendDiagnosticEmail,
  verifySmtp
} from './services/emailService.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Set up multer to keep uploaded files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max limit
});

// Verify SMTP connection on startup without blocking
verifySmtp().catch(err => {
  console.error('SMTP Startup Check Failed:', err.message);
});

// Health check and diagnostic endpoint
app.get(['/api/health', '/health'], async (req, res) => {
  const smtpCheck = await verifySmtp();
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'production',
    smtpConfigured: Boolean(process.env.SMTP_USER && process.env.SMTP_PASS),
    smtpConnected: smtpCheck.success,
    timestamp: new Date().toISOString()
  });
});

// Diagnostic endpoint to test HTML email delivery
app.all(['/api/test-email', '/test-email'], async (req, res) => {
  try {
    const targetEmail = req.query.to || req.body?.to || process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    if (!targetEmail) {
      return res.status(400).json({ error: 'Recipient email is required (?to=you@example.com)' });
    }

    const result = await sendDiagnosticEmail(targetEmail);
    res.json({
      success: true,
      message: `Diagnostic HTML test email sent to ${targetEmail}`,
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Test email delivery failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Order Submission & Invoice Delivery Endpoint
app.post(['/api/send-invoice', '/send-invoice'], upload.single('screenshot'), async (req, res) => {
  try {
    const { email, name, whatsapp, driveEmail, cartData, total } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    let cart = [];
    try {
      cart = typeof cartData === 'string' ? JSON.parse(cartData) : (cartData || []);
      if (!Array.isArray(cart)) cart = [];
    } catch (e) {
      console.warn('Failed to parse cartData JSON, falling back to empty cart:', e.message);
      cart = [];
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('ERROR: SMTP_USER or SMTP_PASS is missing in environment variables!');
      return res.status(500).json({ 
        error: 'Email configuration missing on server. Please set SMTP_USER and SMTP_PASS in Vercel/Render dashboard.' 
      });
    }

    const parsedTotal = parseFloat(total) || 0;
    const screenshotFile = req.file || null;

    // Send Customer and Admin Emails concurrently using our verified templates
    const [customerMailResult, adminMailResult] = await Promise.allSettled([
      sendCustomerInvoice({
        email,
        name,
        whatsapp,
        driveEmail,
        cart,
        total: parsedTotal,
        screenshotFile
      }),
      sendAdminOrderNotification({
        email,
        name,
        whatsapp,
        driveEmail,
        cart,
        total: parsedTotal,
        screenshotFile
      })
    ]);

    const emailSuccess = customerMailResult.status === 'fulfilled';
    const emailError = customerMailResult.status === 'rejected' ? customerMailResult.reason.message : null;

    if (customerMailResult.status === 'fulfilled') {
      console.log('⚡ Customer Invoice successfully sent:', customerMailResult.value.messageId);
    } else {
      console.error('❌ Customer Invoice delivery failed:', customerMailResult.reason?.message || customerMailResult.reason);
    }

    if (adminMailResult.status === 'fulfilled') {
      console.log('⚡ Admin Notification successfully sent:', adminMailResult.value.messageId);
    } else {
      console.error('❌ Admin Notification delivery failed:', adminMailResult.reason?.message || adminMailResult.reason);
    }

    // Trigger Google Sheet Webhook and Telegram notifications
    const sideEffectPromises = [];

    // Send data to Google Sheet Webhook if configured
    if (process.env.GOOGLE_SHEET_WEBHOOK) {
      const productNames = cart.map(item => item.name).join(', ') || 'Software Order';
      let screenshotBase64 = null;
      let screenshotMimeType = null;
      let screenshotName = null;

      if (req.file) {
        screenshotBase64 = req.file.buffer.toString('base64');
        screenshotMimeType = req.file.mimetype;
        screenshotName = req.file.originalname;
      }

      const sheetPromise = fetch(process.env.GOOGLE_SHEET_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        redirect: 'manual',
        body: JSON.stringify({
          date: new Date().toLocaleString(),
          name: name || '',
          email: email || '',
          whatsapp: whatsapp || '',
          products: productNames,
          driveEmail: driveEmail || email || '',
          total: parsedTotal,
          screenshotBase64,
          screenshotMimeType,
          screenshotName
        })
      }).then(res => {
        console.log('Google Sheets Webhook Status:', res.status);
      }).catch(err => {
        console.error('Error saving to Google Sheets:', err.message);
      });

      sideEffectPromises.push(sheetPromise);
    }

    // Send data to Telegram if configured
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const productNames = cart.map(item => item.name).join(', ') || 'Software Order';
      const telegramMessage = `🚨 *NEW ORDER RECEIVED* 🚨\n\n👤 *Customer Details:*\nName: ${name || 'N/A'}\nEmail: ${email}\nWhatsApp: ${whatsapp || 'N/A'}\nDrive Email: ${driveEmail || email}\n\n🛒 *Order Summary:*\nProducts: ${productNames}\n💰 *Total:* ₹${parsedTotal}`;

      let tgPromise;
      if (req.file) {
        const formData = new FormData();
        formData.append('chat_id', process.env.TELEGRAM_CHAT_ID);
        formData.append('caption', telegramMessage);
        formData.append('parse_mode', 'Markdown');
        const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
        formData.append('photo', blob, req.file.originalname);

        tgPromise = fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`, {
          method: 'POST',
          body: formData
        });
      } else {
        tgPromise = fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: telegramMessage + '\n\n⚠️ No Payment Screenshot Provided.',
            parse_mode: 'Markdown'
          })
        });
      }

      sideEffectPromises.push(
        tgPromise
          .then(res => console.log('Telegram Notification status:', res.status))
          .catch(err => console.error('Telegram notification error:', err.message))
      );
    }

    // Await background tasks before concluding response
    if (sideEffectPromises.length > 0) {
      await Promise.allSettled(sideEffectPromises);
    }

    if (emailSuccess) {
      console.log('Order processed and emails dispatched.');
      return res.status(200).json({ 
        success: true, 
        message: 'Order processed and HTML invoice dispatched successfully!' 
      });
    } else {
      console.error('Failed to send invoice email:', emailError);
      return res.status(500).json({ 
        success: false, 
        error: `Order recorded, but invoice email could not be sent: ${emailError || 'Unknown error'}` 
      });
    }
  } catch (error) {
    console.error('Unexpected server error in send-invoice:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint: Admin sends Drive Access email to User
app.post(['/api/send-access', '/send-access'], async (req, res) => {
  try {
    const { email, name, driveLink } = req.body;

    if (!email || !driveLink) {
      return res.status(400).json({ error: 'Email and Drive Link are required' });
    }

    const result = await sendAccessGrantedEmail({ email, name, driveLink });
    res.status(200).json({ 
      success: true, 
      message: 'Drive access email sent to user successfully!',
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Error sending access email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend static files in production
app.use(express.static(path.join(__dirname, 'dist')));

app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
