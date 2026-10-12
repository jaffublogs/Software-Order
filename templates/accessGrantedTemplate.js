import { escapeHtml, getBaseHtmlWrapper } from './templateUtils.js';

/**
 * Renders the Software Access Granted Email (HTML & Plain Text)
 */
export function renderAccessGrantedEmail({
  name = 'Customer',
  email = '',
  driveLink = ''
}) {
  const safeName = escapeHtml(name || 'Customer');
  const safeDriveLink = escapeHtml(driveLink);

  const bodyContent = `
    <!-- Header Banner -->
    <tr>
      <td style="background-color: #047857; background: linear-gradient(135deg, #059669 0%, #064e3b 100%); padding: 36px 30px; text-align: center;" class="mobile-padding">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase;">
          &#128275; Access Granted!
        </h1>
        <p style="color: #a7f3d0; margin: 8px 0 0 0; font-size: 14px; font-weight: 700; letter-spacing: 1px;">
          Your software files are ready for download
        </p>
      </td>
    </tr>

    <!-- Content Card -->
    <tr>
      <td style="padding: 35px 35px 25px 35px;" class="mobile-padding">
        <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 20px; font-weight: 700;">
          Hello ${safeName},
        </h2>
        
        <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.7; color: #cbd5e1;">
          Great news! Your payment has been verified successfully. You have now been granted full lifetime access to your purchased software.
        </p>

        <!-- Prominent Download Box -->
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 25px 0; background-color: #162032; border: 2px dashed #0284c7; border-radius: 12px;">
          <tr>
            <td align="center" style="padding: 30px 20px;">
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #94a3b8; font-weight: 600;">
                Click the secure link below to open your Google Drive folder:
              </p>
              
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background-color: #0284c7; border-radius: 50px;">
                    <a href="${safeDriveLink}" target="_blank" style="display: inline-block; padding: 16px 38px; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">
                      &#128190; Download Software Now
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 18px 0 0 0; font-size: 12px; color: #64748b; word-break: break-all;">
                Or copy and paste this URL into your browser:<br/>
                <a href="${safeDriveLink}" target="_blank" style="color: #38bdf8; text-decoration: underline;">${safeDriveLink}</a>
              </p>
            </td>
          </tr>
        </table>

        <!-- Notice -->
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #451a03; border-left: 4px solid #f59e0b; border-radius: 4px;">
          <tr>
            <td style="padding: 12px 16px;">
              <strong style="color: #fde68a; font-size: 13px;">Important Note:</strong>
              <p style="margin: 4px 0 0 0; font-size: 13px; line-height: 1.5; color: #fef3c7;">
                Make sure you are signed into Google with the email address you provided during checkout (<strong style="color: #ffffff;">${escapeHtml(email)}</strong>) to access the files.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  const html = getBaseHtmlWrapper({
    title: 'Your Software Access is Ready! - Imran Softkart',
    previewText: `Your payment has been verified. Click here to download your purchased software on Google Drive.`,
    bodyContent
  });

  const text = [
    `========================================`,
    `ACCESS GRANTED - IMRAN SOFTKART`,
    `========================================`,
    ``,
    `Hello ${name || 'Customer'},`,
    ``,
    `Great news! We have successfully verified your payment. You have been granted full, lifetime access to your software.`,
    ``,
    `GOOGLE DRIVE DOWNLOAD LINK:`,
    `${driveLink}`,
    ``,
    `IMPORTANT: Make sure you are signed into Google using ${email} to access and download the files.`,
    ``,
    `Need help? Contact support on Telegram: https://t.me/mistersystemservice`,
    ``,
    `(c) ${new Date().getFullYear()} Imran Softkart. All rights reserved.`
  ].join('\n');

  return { html, text, subject: '🎉 Your Software Access is Ready! - Imran Softkart' };
}
