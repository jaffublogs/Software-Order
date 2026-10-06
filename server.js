import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Set up multer to keep file in memory
const upload = multer({ storage: multer.memoryStorage() });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, 
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password',
  },
});

app.post('/api/send-invoice', upload.single('screenshot'), async (req, res) => {
  try {
    const { email, name, whatsapp, utr, cartData, total } = req.body;
    const cart = JSON.parse(cartData);

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

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

    const mailOptions = {
      from: `"Imran Softwares" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Invoice & Order Confirmation - Imran Softwares',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 0; background-color: #070b19; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #ffffff;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #070b19; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #111827; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 1px solid #1f2937;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #000000; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">Imran Softwares</h1>
                      <p style="color: rgba(0,0,0,0.7); margin: 10px 0 0 0; font-size: 16px; font-weight: 600;">OFFICIAL INVOICE & RECEIPT</p>
                    </td>
                  </tr>

                  <!-- Greeting -->
                  <tr>
                    <td style="padding: 40px 30px 20px 30px;">
                      <h2 style="margin: 0 0 15px 0; color: #00f2fe; font-size: 24px;">Hello ${name || 'Valued Customer'},</h2>
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #94a3b8;">
                        Thank you for your recent purchase. We have received your order details and your UTR transaction ID: <strong style="color: #fff;">${utr}</strong>.
                      </p>
                      ${req.file ? '<p style="margin: 0 0 20px 0; font-size: 14px; color: #10b981;">✓ Payment screenshot successfully attached to your order.</p>' : ''}
                    </td>
                  </tr>

                  <!-- Invoice Details -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      <div style="background-color: #1f2937; border-radius: 8px; padding: 25px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding-bottom: 15px;">
                              <h3 style="margin: 0; color: #00f2fe; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">Invoice Details</h3>
                            </td>
                            <td style="padding-bottom: 15px; text-align: right;">
                              <p style="margin: 0; color: #94a3b8; font-size: 14px;">Date: ${new Date().toLocaleDateString()}</p>
                            </td>
                          </tr>
                        </table>
                        
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 10px;">
                          <thead>
                            <tr>
                              <th style="padding: 12px; border-bottom: 2px solid #00f2fe; text-align: left; color: #94a3b8; font-size: 14px; text-transform: uppercase;">Product</th>
                              <th style="padding: 12px; border-bottom: 2px solid #00f2fe; text-align: center; color: #94a3b8; font-size: 14px; text-transform: uppercase;">Qty</th>
                              <th style="padding: 12px; border-bottom: 2px solid #00f2fe; text-align: right; color: #94a3b8; font-size: 14px; text-transform: uppercase;">Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${invoiceItemsHtml}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colspan="2" style="padding: 20px 12px 0 12px; text-align: right; font-weight: bold; color: #ffffff; font-size: 18px;">Total Paid:</td>
                              <td style="padding: 20px 12px 0 12px; text-align: right; font-weight: bold; color: #00f2fe; font-size: 20px;">₹${total}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </td>
                  </tr>

                  <!-- Next Steps -->
                  <tr>
                    <td style="padding: 0 30px 40px 30px;">
                      <h3 style="margin: 0 0 15px 0; color: #f093fb; font-size: 20px;">What happens next?</h3>
                      <p style="margin: 0 0 15px 0; font-size: 15px; line-height: 1.6; color: #e2e8f0;">
                        Our billing team is currently manually verifying your payment against the provided UTR. This process usually takes <strong>5 to 15 minutes</strong> during business hours.
                      </p>
                      <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #e2e8f0;">
                        Once verified, you will receive a second email granting you direct access to download your software from Google Drive.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #030712; padding: 25px 30px; text-align: center; border-top: 1px solid #1f2937;">
                      <p style="margin: 0; color: #64748b; font-size: 13px;">
                        &copy; ${new Date().getFullYear()} Imran Softwares. All rights reserved.<br>
                        Thank you for trusting us with your software needs.
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
                        <tr><td style="padding: 8px 0;"><strong>UTR Number:</strong></td> <td style="padding: 8px 0;"><span style="background-color: #fde047; color: #000; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${utr}</span></td></tr>
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
                        Check the attached screenshot to verify the UTR.<br><br>
                        <strong>Next Step:</strong> Go to Google Drive and share the folder with <strong>${email}</strong>.
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
            utr,
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

    if (emailSuccess) {
      res.status(200).json({ success: true, message: 'Order processed successfully' });
    } else {
      res.status(207).json({ success: true, message: 'Order saved to sheets, but emails failed', error: emailError });
    }
  } catch (error) {
    console.error('Unexpected server error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
