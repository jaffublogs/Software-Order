import { escapeHtml, getBaseHtmlWrapper } from './templateUtils.js';

/**
 * Renders a Diagnostic / Test Email to verify SMTP and HTML rendering
 */
export function renderTestEmail({
  targetEmail = '',
  serverTime = new Date().toISOString(),
  environment = process.env.NODE_ENV || 'production'
}) {
  const bodyContent = `
    <!-- Header Banner -->
    <tr>
      <td style="background-color: #0369a1; background: linear-gradient(135deg, #0284c7 0%, #1e3a8a 100%); padding: 36px 30px; text-align: center;" class="mobile-padding">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">
          &#9889; SMTP &amp; HTML Template Test
        </h1>
        <p style="color: #bae6fd; margin: 8px 0 0 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
          Imran Softkart Production Delivery Test
        </p>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding: 35px 35px 25px 35px;" class="mobile-padding">
        <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 20px; font-weight: 700;">
          SMTP &amp; HTML Rendering Verified!
        </h2>
        
        <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.7; color: #cbd5e1;">
          If you are reading this email with rich dark styling, blue gradients, formatted tables, and crisp buttons, your production HTML email rendering pipeline is working perfectly!
        </p>

        <!-- Diagnostics Table -->
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #162032; border: 1px solid #273549; border-radius: 8px; margin-bottom: 25px;">
          <tr>
            <td style="padding: 16px;">
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color: #94a3b8; font-size: 13px; padding-bottom: 8px; width: 140px;">Recipient:</td>
                  <td style="color: #38bdf8; font-size: 13px; font-weight: 700; padding-bottom: 8px;">${escapeHtml(targetEmail)}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; font-size: 13px; padding-bottom: 8px;">Environment:</td>
                  <td style="color: #34d399; font-size: 13px; font-weight: 700; padding-bottom: 8px;">${escapeHtml(environment)}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; font-size: 13px; padding-bottom: 8px;">Server Timestamp:</td>
                  <td style="color: #e2e8f0; font-size: 13px; padding-bottom: 8px;">${escapeHtml(serverTime)}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; font-size: 13px;">HTML Status:</td>
                  <td style="color: #10b981; font-size: 13px; font-weight: 700;">&#10003; Formatted HTML5 / Inline CSS</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Sample Button -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 20px 0;">
          <tr>
            <td align="center" style="background-color: #0284c7; border-radius: 6px;">
              <a href="https://t.me/mistersystemservice" target="_blank" style="display: inline-block; padding: 12px 28px; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px;">
                Verified Telegram Support
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  const html = getBaseHtmlWrapper({
    title: 'SMTP & HTML Template Diagnostic Test - Imran Softkart',
    previewText: 'Diagnostic test email verifying SMTP and HTML template rendering in production.',
    bodyContent
  });

  const text = [
    `========================================`,
    `SMTP & HTML TEMPLATE TEST`,
    `========================================`,
    `Recipient: ${targetEmail}`,
    `Environment: ${environment}`,
    `Server Timestamp: ${serverTime}`,
    `HTML Status: OK`,
    ``,
    `This is a diagnostic email from Imran Softkart.`
  ].join('\n');

  return { html, text, subject: '⚡ SMTP & HTML Email Test - Imran Softkart' };
}
