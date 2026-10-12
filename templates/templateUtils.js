/**
 * Email Template Utilities
 * Provides HTML escaping, currency formatting, and email-client-safe wrappers
 * with support for Gmail, Outlook, Apple Mail, and mobile clients.
 */

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

/**
 * Generates an email-client-safe HTML document wrapper with:
 * - Proper XHTML doctype and MSO conditional comments for Outlook
 * - Strict inline CSS with solid hex color fallbacks for gradients and transparency
 * - Viewport and mobile scaling support
 * - Hidden preview text snippet for email clients
 */
export function getBaseHtmlWrapper({ title, previewText = '', bodyContent }) {
  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
  <title>${escapeHtml(title)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; min-width: 100% !important; height: 100% !important; background-color: #030712; }
    @media only screen and (max-width: 620px) {
      .container-table { width: 100% !important; max-width: 100% !important; }
      .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
      .mobile-center { text-align: center !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #030712; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased; color: #f8fafc;">
  <!-- Preview Text (Hidden in body, visible in inbox list) -->
  ${previewText ? `
  <div style="display: none; font-size: 1px; color: #030712; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
    ${escapeHtml(previewText)}
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  ` : ''}

  <!-- Main Background Container -->
  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #030712; width: 100%; min-width: 100%;">
    <tr>
      <td align="center" style="padding: 30px 10px 40px 10px;">
        <!--[if (gte mso 9)|(IE)]>
        <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
        <tr>
        <td align="center" valign="top" width="600">
        <![endif]-->
        
        <!-- Main Content Card -->
        <table role="presentation" class="container-table" width="600" border="0" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; background-color: #0f172a; border-radius: 14px; overflow: hidden; border: 1px solid #1e293b; border-collapse: separate;">
          ${bodyContent}
          
          <!-- Universal Footer -->
          <tr>
            <td style="background-color: #080d1a; padding: 25px 30px; text-align: center; border-top: 1px solid #1e293b;" class="mobile-padding">
              <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 13px; line-height: 1.6;">
                Need help or have questions? Contact us on Telegram: 
                <a href="https://t.me/mistersystemservice" target="_blank" style="color: #38bdf8; text-decoration: underline; font-weight: bold;">@mistersystemservice</a>
              </p>
              <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.5;">
                &copy; ${currentYear} Imran Softkart. Premium Genuine Software Solutions.<br/>
                All rights reserved.
              </p>
            </td>
          </tr>
        </table>
        
        <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
}
