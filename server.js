import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Set up multer to keep file in memory
const upload = multer({ storage: multer.memoryStorage() });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.post('/api/send-invoice', upload.single('screenshot'), async (req, res) => {
  try {
    const { email, name, whatsapp, driveEmail, cartData, total } = req.body;
    const cart = JSON.parse(cartData);

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Immediately respond to the client to make the UI feel fast
    res.status(200).json({ success: true, message: 'Order is being processed in the background' });

    // Process the rest asynchronously in the background
    (async () => {
      try {
        // Create beautiful items table for invoice
    const invoiceItemsHtml = cart.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #334155; color: #e2e8f0;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #334155; text-align: center; color: #e2e8f0;">1</td>
        <td style="padding: 12px; border-bottom: 1px solid #334155; text-align: right; color: #e2e8f0;">₹${item.price}</td>
      </tr>
    `).join('');

    // Prepare attachments
    const attachments = [];
    if (req.file) {
      attachments.push({
        filename: req.file.originalname,
        content: req.file.buffer
      });
    }

    const productNames = cart.map(item => item.name).join(', ');

    const mailOptions = {
      from: `"Imran Softkart" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Order Received & Under Review - Imran Softkart',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #030712; padding: 40px 10px;">
            <tr>
              <td align="center">
                <!-- Main Card -->
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.8); border: 1px solid #1e293b;">
                  
                  <!-- Gradient Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #00f2fe 0%, #1e3a8a 100%); padding: 45px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 900; letter-spacing: -1px; text-shadow: 0 4px 10px rgba(0,0,0,0.3);">Imran Softkart</h1>
                      <p style="color: #e0f2fe; margin: 12px 0 0 0; font-size: 15px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Order Received & Under Review</p>
                    </td>
                  </tr>

                  <!-- Hero Message -->
                  <tr>
                    <td style="padding: 40px 40px 10px 40px; text-align: center;">
                      <div style="background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 50px; display: inline-block; padding: 10px 20px; margin-bottom: 25px;">
                        <span style="color: #34d399; font-weight: bold; font-size: 14px;">✓ Order Successfully Placed</span>
                      </div>
                      <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 26px; font-weight: 800;">Hi ${name || 'there'}, we're thrilled to have you! 🎉</h2>
                      <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.8; color: #94a3b8; text-align: left;">
                        Thank you for choosing Imran Softkart for your premium software needs. We have received your order for <strong style="color: #38bdf8;">${productNames}</strong>. 
                        Our billing team is currently performing a quick security check and verifying your payment.
                      </p>
                      ${req.file ? '<p style="margin: 0 0 25px 0; font-size: 14px; color: #34d399; font-weight: bold; text-align: left;">📎 Your payment screenshot has been securely attached.</p>' : ''}

                      ${productNames.includes('Windows 11 Pro Lifetime') ? `
                      <div style="background-color: #064e3b; border-radius: 12px; padding: 20px; border: 1px solid #059669; text-align: center; margin-bottom: 25px;">
                        <h3 style="margin: 0 0 10px 0; color: #10b981; font-size: 18px;">Automated Delivery - Windows 11 Pro</h3>
                        <p style="color: #ecfdf5; margin: 0 0 15px 0; font-size: 15px; line-height: 1.5;">Please click the button below to request access to your Windows 11 Pro Lifetime software.<br>Ensure you are signed into your Drive email (<strong style="color: #6ee7b7;">${driveEmail}</strong>) when requesting.</p>
                        <a href="https://drive.google.com/file/d/1zIVFPLI4PyBYG26mZv9dxTmX1eALn4tj/view?usp=drive_link" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: #022c22; text-decoration: none; font-weight: bold; border-radius: 6px; margin-top: 5px;">Request Drive Access</a>
                      </div>
                      ` : ''}
                    </td>
                  </tr>
                  <!-- Timeline / What happens next -->
                  <tr>
                    <td style="padding: 0 40px 30px 40px;">
                      <div style="background-color: #1e293b; border-radius: 12px; padding: 30px; border: 1px solid #334155;">
                        <h3 style="margin: 0 0 20px 0; color: #fcd34d; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">What Happens Next?</h3>
                        
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td width="30" valign="top" style="padding-bottom: 15px; font-size: 20px;">⏳</td>
                            <td style="padding-bottom: 15px;">
                              <strong style="color: #ffffff; font-size: 15px;">Step 1: Payment Verification</strong><br>
                              <span style="color: #94a3b8; font-size: 14px;">We manually verify your transaction (usually takes 5–15 mins).</span>
                            </td>
                          </tr>
                          <tr>
                            <td width="30" valign="top" style="padding-bottom: 15px; font-size: 20px;">🚀</td>
                            <td style="padding-bottom: 15px;">
                              <strong style="color: #ffffff; font-size: 15px;">Step 2: Instant Access Granted</strong><br>
                              <span style="color: #94a3b8; font-size: 14px;">You'll receive a second email with your exclusive Google Drive link.</span>
                            </td>
                          </tr>
                          <tr>
                            <td width="30" valign="top" style="font-size: 20px;">💻</td>
                            <td>
                              <strong style="color: #ffffff; font-size: 15px;">Step 3: Download & Enjoy</strong><br>
                              <span style="color: #94a3b8; font-size: 14px;">Download your lifetime, pre-activated software directly to: <strong style="color: #38bdf8;">${driveEmail}</strong>.</span>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr>

                  <!-- Order Summary -->
                  <tr>
                    <td style="padding: 0 40px 40px 40px;">
                      <h3 style="margin: 0 0 15px 0; color: #ffffff; font-size: 18px; border-bottom: 1px solid #334155; padding-bottom: 10px;">Order Summary</h3>
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 10px;">
                        ${invoiceItemsHtml}
                        <tr>
                          <td colspan="2" style="padding: 20px 0 0 0; text-align: right; font-weight: 700; color: #94a3b8; font-size: 16px;">Total Amount Paid:</td>
                          <td style="padding: 20px 0 0 0; text-align: right; font-weight: 800; color: #38bdf8; font-size: 22px;">₹${total}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #0b1120; padding: 30px 40px; text-align: center; border-top: 1px solid #1e293b;">
                      <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">
                        Need immediate assistance? <a href="https://t.me/imransoftwares" style="color: #00f2fe; text-decoration: none;">Contact us on Telegram</a>.
                      </p>
                      <p style="margin: 0; color: #475569; font-size: 12px;">
                        &copy; ${new Date().getFullYear()} Imran Softkart. Premium Software Solutions.<br>
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    let emailSuccess = false;
    let emailError = null;
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Customer Invoice sent: %s', info.messageId);

    // Prepare Admin Notification Email
    const adminMailOptions = {
      from: `"Imran Softwares Alerts" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Sending to the admin themselves
      subject: `🚨 NEW ORDER RECEIVED: ${name} (₹${total})`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #ffffff;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 1px solid #334155;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #f43f5e 0%, #fb923c 100%); padding: 30px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">🚨 Action Required</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px; font-weight: 600;">Verify Payment & Grant Access</p>
                    </td>
                  </tr>

                  <!-- Customer Details -->
                  <tr>
                    <td style="padding: 30px 30px 20px 30px;">
                      <h2 style="margin: 0 0 15px 0; color: #fb923c; font-size: 20px; border-bottom: 1px solid #334155; padding-bottom: 10px;">Customer Details</h2>
                      <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 16px; color: #cbd5e1;">
                        <tr><td style="padding: 8px 0;"><strong>Name:</strong></td> <td style="padding: 8px 0; color: #fff;">${name || 'N/A'}</td></tr>
                        <tr><td style="padding: 8px 0;"><strong>Email:</strong></td> <td style="padding: 8px 0; color: #38bdf8;">${email}</td></tr>
                        <tr><td style="padding: 8px 0;"><strong>WhatsApp:</strong></td> <td style="padding: 8px 0; color: #4ade80;">${whatsapp || 'N/A'}</td></tr>
                        <tr><td style="padding: 8px 0;"><strong>Drive Access Email:</strong></td> <td style="padding: 8px 0;"><span style="background-color: #fde047; color: #000; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${driveEmail}</span></td></tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Order Summary -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      <h2 style="margin: 0 0 15px 0; color: #f472b6; font-size: 20px; border-bottom: 1px solid #334155; padding-bottom: 10px;">Order Summary</h2>
                      <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; border: 1px solid #1e293b;">
                        <ul style="margin: 0; padding: 0; list-style-type: none; color: #e2e8f0; font-size: 15px;">
                          ${cart.map(item => `<li style="padding-bottom: 10px;">• ${item.name} <span style="color: #94a3b8;">(₹${item.price})</span></li>`).join('')}
                        </ul>
                        <p style="margin: 15px 0 0 0; font-size: 18px; font-weight: bold; color: #fff; text-align: right; border-top: 1px solid #334155; padding-top: 15px;">
                          Total: <span style="color: #4ade80;">₹${total}</span>
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #020617; padding: 25px 30px; text-align: center; border-top: 1px solid #1e293b;">
                      <p style="margin: 0; color: #94a3b8; font-size: 14px;">
                        Check the attached screenshot to verify the payment.<br><br>
                        <strong>Next Step:</strong> Go to Google Drive and share the folder with <strong>${driveEmail}</strong>.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      attachments: attachments
    };

      const adminInfo = await transporter.sendMail(adminMailOptions);
      console.log('Admin Notification sent: %s', adminInfo.messageId);
      emailSuccess = true;
    } catch (err) {
      console.error('Error sending email:', err);
      emailError = err.message;
    }

    // Send data to Google Sheet Webhook if configured
    if (process.env.GOOGLE_SHEET_WEBHOOK) {
      try {
        const productNames = cart.map(item => item.name).join(', ');
        
        let screenshotBase64 = null;
        let screenshotMimeType = null;
        let screenshotName = null;

        if (req.file) {
          screenshotBase64 = req.file.buffer.toString('base64');
          screenshotMimeType = req.file.mimetype;
          screenshotName = req.file.originalname;
        }

        const response = await fetch(process.env.GOOGLE_SHEET_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          redirect: 'manual',
          body: JSON.stringify({
            date: new Date().toLocaleString(),
            name,
            email,
            whatsapp,
            products: productNames,
            driveEmail,
            total,
            screenshotBase64,
            screenshotMimeType,
            screenshotName
          })
        });
        
        console.log('Google Sheets Webhook Response Status:', response.status);
        if (response.status === 302) {
          console.log('Successfully saved to Google Sheets (302 Redirect = Success in Apps Script)');
        } else {
          const resultText = await response.text();
          console.log('Webhook Response Body:', resultText);
          console.error('Failed to save to Google Sheets. Check webhook permissions.');
        }
      } catch (err) {
        console.error('Error saving to Google Sheets:', err);
      }
    }

    // Send data to Telegram if configured
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      try {
        const productNames = cart.map(item => item.name).join(', ');
        const telegramMessage = `🚨 *NEW ORDER RECEIVED* 🚨\n\n👤 *Customer Details:*\nName: ${name || 'N/A'}\nEmail: ${email}\nWhatsApp: ${whatsapp || 'N/A'}\nDrive Email: ${driveEmail}\n\n🛒 *Order Summary:*\nProducts: ${productNames}\n💰 *Total:* ₹${total}`;

        let telegramResponse;
        if (req.file) {
          const formData = new FormData();
          formData.append('chat_id', process.env.TELEGRAM_CHAT_ID);
          formData.append('caption', telegramMessage);
          formData.append('parse_mode', 'Markdown');
          const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
          formData.append('photo', blob, req.file.originalname);

          telegramResponse = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`, {
            method: 'POST',
            body: formData
          });
        } else {
          telegramResponse = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: process.env.TELEGRAM_CHAT_ID,
              text: telegramMessage + '\n\n⚠️ No Payment Screenshot Provided.',
              parse_mode: 'Markdown'
            })
          });
        }

        if (telegramResponse.ok) {
          console.log('Successfully sent notification to Telegram');
        } else {
          console.error('Failed to send Telegram notification:', await telegramResponse.text());
        }
      } catch (err) {
        console.error('Error sending Telegram notification:', err);
      }
    }

    if (emailSuccess) {
          console.log('Order processed successfully (background)');
        } else {
          console.log('Order saved to sheets, but emails failed (background):', emailError);
        }
      } catch (backgroundError) {
        console.error('Background processing error:', backgroundError);
      }
    })();

  } catch (error) {
    console.error('Unexpected server error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
});

// New Endpoint: Admin sends Drive Access email to User
app.post('/api/send-access', async (req, res) => {
  try {
    const { email, name, driveLink } = req.body;

    if (!email || !driveLink) {
      return res.status(400).json({ error: 'Email and Drive Link are required' });
    }

    const accessMailOptions = {
      from: `"Imran Softkart" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🎉 Your Software Access is Ready! - Imran Softkart',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #030712; padding: 40px 10px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.8); border: 1px solid #1e293b;">
                  
                  <!-- Banner -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                      <div style="background-color: rgba(255,255,255,0.2); width: 60px; height: 60px; border-radius: 50%; display: inline-block; line-height: 60px; font-size: 30px; margin-bottom: 15px;">🔓</div>
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase;">Access Granted!</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px; font-weight: 600;">Your software is ready for download.</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 40px 30px 40px;">
                      <h2 style="margin: 0 0 15px 0; color: #34d399; font-size: 22px;">Hello ${name || 'there'},</h2>
                      <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.8; color: #cbd5e1;">
                        Great news! We have successfully verified your payment. You have been granted full, lifetime access to your purchased software.
                      </p>
                      
                      <!-- Call to Action -->
                      <div style="text-align: center; margin: 40px 0; padding: 30px; background-color: #1e293b; border-radius: 12px; border: 1px dashed #475569;">
                        <p style="margin: 0 0 20px 0; font-size: 15px; color: #94a3b8;">Click the secure link below to access your Google Drive folder:</p>
                        <a href="${driveLink}" style="background: linear-gradient(135deg, #00f2fe 0%, #3b82f6 100%); color: #ffffff; padding: 16px 36px; text-decoration: none; border-radius: 50px; font-size: 18px; font-weight: bold; display: inline-block; box-shadow: 0 10px 20px rgba(0, 242, 254, 0.25); text-transform: uppercase; letter-spacing: 1px;">
                          Download Software Now
                        </a>
                      </div>

                      <div style="background-color: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 10px;">
                        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #fbbf24;">
                          <strong>Important Note:</strong> You must be logged into Google with the email you provided at checkout to view these files.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #0b1120; padding: 30px 40px; text-align: center; border-top: 1px solid #1e293b;">
                      <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">
                        Having trouble? <a href="https://t.me/mistersystemservice" style="color: #34d399; text-decoration: none;">Reach out to our support team</a>.
                      </p>
                      <p style="margin: 0; color: #475569; font-size: 12px;">
                        &copy; ${new Date().getFullYear()} Imran Softkart. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    await transporter.sendMail(accessMailOptions);
    res.status(200).json({ success: true, message: 'Drive access email sent to user successfully!' });
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
if (process.env.NODE_ENV !== 'production' || process.env.RENDER) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
