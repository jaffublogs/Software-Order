import { escapeHtml, formatCurrency, getBaseHtmlWrapper } from './templateUtils.js';

/**
 * Renders the Customer Order Confirmation & Invoice Email (HTML & Plain Text)
 */
export function renderCustomerInvoiceEmail({
  name = 'Customer',
  email = '',
  whatsapp = '',
  driveEmail = '',
  cart = [],
  total = 0,
  hasScreenshot = false
}) {
  const safeName = escapeHtml(name || 'Customer');
  const safeEmail = escapeHtml(email);
  const safeDriveEmail = escapeHtml(driveEmail || email);
  const formattedTotal = formatCurrency(total);
  const productNames = cart.map(item => item.name).join(', ') || 'Software Order';

  // Build items rows
  const itemsHtml = cart.map((item, index) => {
    const isLast = index === cart.length - 1;
    const borderStyle = isLast ? '' : 'border-bottom: 1px solid #273549;';
    return `
      <tr>
        <td style="padding: 12px 14px; color: #f1f5f9; font-size: 14px; font-weight: 500; ${borderStyle}">
          ${escapeHtml(item.name)}
        </td>
        <td align="center" style="padding: 12px 14px; color: #94a3b8; font-size: 14px; ${borderStyle}">
          1
        </td>
        <td align="right" style="padding: 12px 14px; color: #38bdf8; font-size: 14px; font-weight: 700; ${borderStyle}">
          ${formatCurrency(item.price)}
        </td>
      </tr>
    `;
  }).join('');

  const isWindows11 = productNames.toLowerCase().includes('windows 11 pro');

  const bodyContent = `
    <!-- Header Banner with Solid Color Fallback + Gradient -->
    <tr>
      <td style="background-color: #0369a1; background: linear-gradient(135deg, #0284c7 0%, #0f172a 100%); padding: 36px 30px; text-align: center;" class="mobile-padding">
        <h1 style="color: #ffffff; margin: 0; font-size: 30px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.2;">
          Imran Softkart
        </h1>
        <p style="color: #bae6fd; margin: 10px 0 0 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">
          Order Received &bull; Under Verification
        </p>
      </td>
    </tr>

    <!-- Status Badge & Greeting -->
    <tr>
      <td style="padding: 35px 35px 15px 35px;" class="mobile-padding">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 22px;">
          <tr>
            <td style="background-color: #064e3b; border: 1px solid #059669; border-radius: 20px; padding: 6px 16px;">
              <span style="color: #34d399; font-size: 13px; font-weight: 700;">
                &#10003; Order Successfully Submitted
              </span>
            </td>
          </tr>
        </table>

        <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 22px; font-weight: 700; line-height: 1.3;">
          Hi ${safeName}, thank you for your order!
        </h2>
        
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.7; color: #cbd5e1;">
          We have received your order for <strong style="color: #38bdf8;">${escapeHtml(productNames)}</strong>.
          Our team is currently verifying your payment details. Once verified, direct download access will be granted to your Google Drive email.
        </p>

        ${hasScreenshot ? `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
          <tr>
            <td style="background-color: #132f27; border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 4px;">
              <span style="color: #34d399; font-size: 13px; font-weight: 600;">
                &#128206; Payment screenshot attached and securely queued for verification.
              </span>
            </td>
          </tr>
        </table>
        ` : ''}

        ${isWindows11 ? `
        <!-- Windows 11 Automated Drive Access Box -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 15px 0 25px 0; background-color: #064e3b; border-radius: 10px; border: 1px solid #059669;">
          <tr>
            <td style="padding: 22px;" align="center">
              <h3 style="margin: 0 0 8px 0; color: #a7f3d0; font-size: 17px; font-weight: 700;">
                Automated Delivery - Windows 11 Pro Lifetime
              </h3>
              <p style="color: #ecfdf5; margin: 0 0 16px 0; font-size: 14px; line-height: 1.6;">
                Click below to request access directly with your Google Drive email:<br/>
                <strong style="color: #6ee7b7;">${safeDriveEmail}</strong>
              </p>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background-color: #10b981; border-radius: 6px;">
                    <a href="https://drive.google.com/file/d/1zIVFPLI4PyBYG26mZv9dxTmX1eALn4tj/view?usp=drive_link" target="_blank" style="display: inline-block; padding: 12px 28px; color: #022c22; text-decoration: none; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
                      Request Drive Access
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        ` : ''}
      </td>
    </tr>

    <!-- Order Summary Table -->
    <tr>
      <td style="padding: 0 35px 25px 35px;" class="mobile-padding">
        <h3 style="margin: 0 0 14px 0; color: #ffffff; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
          Order Details
        </h3>

        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #162032; border: 1px solid #273549; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background-color: #1e293b;">
              <th align="left" style="padding: 10px 14px; color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Product</th>
              <th align="center" style="padding: 10px 14px; color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; width: 60px;">Qty</th>
              <th align="right" style="padding: 10px 14px; color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; width: 90px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
            <tr style="background-color: #131c2e; border-top: 2px solid #334155;">
              <td colspan="2" align="right" style="padding: 14px; color: #94a3b8; font-size: 14px; font-weight: 700;">
                Total Amount Paid:
              </td>
              <td align="right" style="padding: 14px; color: #38bdf8; font-size: 18px; font-weight: 800;">
                ${formattedTotal}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Target Delivery Details -->
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-top: 15px; background-color: #111a2e; border: 1px solid #1e293b; border-radius: 8px;">
          <tr>
            <td style="padding: 14px 18px;">
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color: #94a3b8; font-size: 13px; padding-bottom: 6px;">Delivery Google Drive Email:</td>
                  <td align="right" style="color: #38bdf8; font-size: 13px; font-weight: 700; padding-bottom: 6px;">${safeDriveEmail}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; font-size: 13px;">Customer Email:</td>
                  <td align="right" style="color: #e2e8f0; font-size: 13px; font-weight: 600;">${safeEmail}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Next Steps Timeline -->
    <tr>
      <td style="padding: 0 35px 30px 35px;" class="mobile-padding">
        <div style="background-color: #131e33; border-radius: 10px; padding: 22px; border: 1px solid #202e48;">
          <h4 style="margin: 0 0 16px 0; color: #fcd34d; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
            What Happens Next?
          </h4>
          
          <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td width="32" valign="top" style="padding-bottom: 14px; font-size: 18px; line-height: 1;">&#9203;</td>
              <td style="padding-bottom: 14px;">
                <strong style="color: #ffffff; font-size: 14px;">1. Payment Verification</strong><br/>
                <span style="color: #94a3b8; font-size: 13px; line-height: 1.5;">Our billing team verifies your transaction (usually takes 5&ndash;15 minutes).</span>
              </td>
            </tr>
            <tr>
              <td width="32" valign="top" style="padding-bottom: 14px; font-size: 18px; line-height: 1;">&#128640;</td>
              <td style="padding-bottom: 14px;">
                <strong style="color: #ffffff; font-size: 14px;">2. Access Granted</strong><br/>
                <span style="color: #94a3b8; font-size: 13px; line-height: 1.5;">You will receive a confirmation email with your direct Google Drive download link.</span>
              </td>
            </tr>
            <tr>
              <td width="32" valign="top" style="font-size: 18px; line-height: 1;">&#128187;</td>
              <td>
                <strong style="color: #ffffff; font-size: 14px;">3. Download &amp; Enjoy Lifetime Use</strong><br/>
                <span style="color: #94a3b8; font-size: 13px; line-height: 1.5;">Log in to Google Drive with <strong style="color: #38bdf8;">${safeDriveEmail}</strong> to download and activate your software.</span>
              </td>
            </tr>
          </table>
        </div>
      </td>
    </tr>
  `;

  const html = getBaseHtmlWrapper({
    title: `Order Received - Imran Softkart (${productNames})`,
    previewText: `Thank you for your order! Your software purchase for ${productNames} is currently being verified.`,
    bodyContent
  });

  const text = [
    `========================================`,
    `IMRAN SOFTKART - ORDER CONFIRMATION`,
    `========================================`,
    ``,
    `Hello ${name || 'Customer'},`,
    ``,
    `Thank you for choosing Imran Softkart for your premium software needs!`,
    `We have received your order for: ${productNames}`,
    ``,
    `Total Amount Paid: ${formattedTotal}`,
    `Google Drive Access Email: ${driveEmail || email}`,
    `Customer Contact Email: ${email}`,
    whatsapp ? `WhatsApp Number: ${whatsapp}` : '',
    ``,
    `----------------------------------------`,
    `WHAT HAPPENS NEXT:`,
    `1. Payment Verification: Our billing team is verifying your payment screenshot (usually 5-15 mins).`,
    `2. Access Granted: You will receive an email once your download link is active.`,
    `3. Download & Install: You will get full lifetime access on Google Drive.`,
    ``,
    `Need immediate assistance? Contact us on Telegram: https://t.me/mistersystemservice`,
    ``,
    `(c) ${new Date().getFullYear()} Imran Softkart. All rights reserved.`
  ].filter(Boolean).join('\n');

  return { html, text, subject: `Order Received & Under Review - Imran Softkart (${productNames})` };
}
