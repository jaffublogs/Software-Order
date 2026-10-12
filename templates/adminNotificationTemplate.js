import { escapeHtml, formatCurrency, getBaseHtmlWrapper } from './templateUtils.js';

/**
 * Renders the Admin Order Alert Email (HTML & Plain Text)
 */
export function renderAdminNotificationEmail({
  name = 'Customer',
  email = '',
  whatsapp = '',
  driveEmail = '',
  cart = [],
  total = 0,
  hasScreenshot = false,
  orderDate = new Date().toLocaleString()
}) {
  const safeName = escapeHtml(name || 'Customer');
  const safeEmail = escapeHtml(email);
  const safeWhatsapp = escapeHtml(whatsapp || 'Not provided');
  const safeDriveEmail = escapeHtml(driveEmail || email);
  const formattedTotal = formatCurrency(total);
  const productNames = cart.map(item => item.name).join(', ') || 'Software Order';

  const cleanWhatsappDigits = (whatsapp || '').replace(/\D/g, '');
  const whatsappUrl = cleanWhatsappDigits 
    ? `https://wa.me/${cleanWhatsappDigits.length === 10 ? '91' + cleanWhatsappDigits : cleanWhatsappDigits}` 
    : '';

  // Items rows
  const itemsHtml = cart.map((item, index) => {
    const isLast = index === cart.length - 1;
    const borderStyle = isLast ? '' : 'border-bottom: 1px solid #273549;';
    return `
      <tr>
        <td style="padding: 10px 14px; color: #f1f5f9; font-size: 14px; font-weight: 500; ${borderStyle}">
          ${escapeHtml(item.name)}
        </td>
        <td align="center" style="padding: 10px 14px; color: #94a3b8; font-size: 14px; ${borderStyle}">
          1
        </td>
        <td align="right" style="padding: 10px 14px; color: #f59e0b; font-size: 14px; font-weight: 700; ${borderStyle}">
          ${formatCurrency(item.price)}
        </td>
      </tr>
    `;
  }).join('');

  const bodyContent = `
    <!-- Header Banner: Orange/Red Alert Theme -->
    <tr>
      <td style="background-color: #b45309; background: linear-gradient(135deg, #d97706 0%, #7c2d12 100%); padding: 34px 30px; text-align: center;" class="mobile-padding">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase;">
          &#128680; New Customer Order Received
        </h1>
        <p style="color: #fef3c7; margin: 8px 0 0 0; font-size: 14px; font-weight: 700; letter-spacing: 1px;">
          Action Required: Verify Payment &amp; Grant Access
        </p>
      </td>
    </tr>

    <!-- Summary Box -->
    <tr>
      <td style="padding: 30px 35px 20px 35px;" class="mobile-padding">
        <!-- Badge -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
          <tr>
            <td style="background-color: #78350f; border: 1px solid #d97706; border-radius: 20px; padding: 6px 14px;">
              <span style="color: #fcd34d; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                Total Received: ${formattedTotal}
              </span>
            </td>
          </tr>
        </table>

        <!-- Customer Info Box -->
        <h3 style="margin: 0 0 12px 0; color: #ffffff; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
          Customer Contact Details
        </h3>
        
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #162032; border: 1px solid #273549; border-radius: 8px; margin-bottom: 24px;">
          <tr>
            <td style="padding: 14px 18px;">
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color: #94a3b8; font-size: 13px; padding-bottom: 8px; width: 140px;">Customer Name:</td>
                  <td style="color: #ffffff; font-size: 14px; font-weight: 700; padding-bottom: 8px;">${safeName}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; font-size: 13px; padding-bottom: 8px;">Customer Email:</td>
                  <td style="color: #38bdf8; font-size: 13px; font-weight: 600; padding-bottom: 8px;">
                    <a href="mailto:${safeEmail}" style="color: #38bdf8; text-decoration: underline;">${safeEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; font-size: 13px; padding-bottom: 8px;">WhatsApp:</td>
                  <td style="color: #34d399; font-size: 13px; font-weight: 700; padding-bottom: 8px;">
                    ${safeWhatsapp}
                    ${whatsappUrl ? `&nbsp; <a href="${whatsappUrl}" target="_blank" style="color: #22c55e; text-decoration: underline; font-size: 12px;">(Open WhatsApp)</a>` : ''}
                  </td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; font-size: 13px; padding-bottom: 8px;">Google Drive Email:</td>
                  <td style="color: #fcd34d; font-size: 14px; font-weight: 700; padding-bottom: 8px;">${safeDriveEmail}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; font-size: 13px;">Date &amp; Time:</td>
                  <td style="color: #cbd5e1; font-size: 13px;">${escapeHtml(orderDate)}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Order Items Box -->
        <h3 style="margin: 0 0 12px 0; color: #ffffff; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
          Ordered Items
        </h3>

        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #162032; border: 1px solid #273549; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
          <thead>
            <tr style="background-color: #1e293b;">
              <th align="left" style="padding: 10px 14px; color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase;">Product</th>
              <th align="center" style="padding: 10px 14px; color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase; width: 60px;">Qty</th>
              <th align="right" style="padding: 10px 14px; color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase; width: 90px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
            <tr style="background-color: #131c2e; border-top: 2px solid #334155;">
              <td colspan="2" align="right" style="padding: 12px 14px; color: #94a3b8; font-size: 13px; font-weight: 700;">
                Total Collected:
              </td>
              <td align="right" style="padding: 12px 14px; color: #f59e0b; font-size: 18px; font-weight: 800;">
                ${formattedTotal}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Screenshot Notification -->
        ${hasScreenshot ? `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px; background-color: #064e3b; border-left: 4px solid #10b981; border-radius: 4px;">
          <tr>
            <td style="padding: 14px 18px;">
              <strong style="color: #6ee7b7; font-size: 14px;">&#128206; Payment Screenshot Attached:</strong><br/>
              <span style="color: #d1fae5; font-size: 13px;">The customer's payment screenshot is attached to this email. Verify the transaction amount against your UPI/Bank statement.</span>
            </td>
          </tr>
        </table>
        ` : `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px; background-color: #451a03; border-left: 4px solid #f59e0b; border-radius: 4px;">
          <tr>
            <td style="padding: 14px 18px;">
              <strong style="color: #fde68a; font-size: 14px;">&#9888; No Payment Screenshot Attached</strong><br/>
              <span style="color: #fef3c7; font-size: 13px;">The customer did not upload a screenshot. Check Bank/UPI app manually for incoming INR ${formattedTotal} from ${safeName}.</span>
            </td>
          </tr>
        </table>
        `}

        <!-- Admin Action Buttons -->
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-top: 10px;">
          <tr>
            <td align="center" style="padding: 10px 0;">
              <p style="margin: 0 0 12px 0; color: #94a3b8; font-size: 13px;">Quick Actions:</p>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background-color: #0284c7; border-radius: 6px; padding: 0 8px;">
                    <a href="https://drive.google.com" target="_blank" style="display: inline-block; padding: 12px 20px; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; text-transform: uppercase;">
                      Open Google Drive
                    </a>
                  </td>
                  ${whatsappUrl ? `
                  <td width="15"></td>
                  <td align="center" style="background-color: #15803d; border-radius: 6px; padding: 0 8px;">
                    <a href="${whatsappUrl}" target="_blank" style="display: inline-block; padding: 12px 20px; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; text-transform: uppercase;">
                      Chat on WhatsApp
                    </a>
                  </td>
                  ` : ''}
                </tr>
              </table>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  `;

  const html = getBaseHtmlWrapper({
    title: `New Order Alert: ${formattedTotal} - ${safeName} (${productNames})`,
    previewText: `New order from ${safeName} for ${productNames} totaling ${formattedTotal}. Verify payment and grant Drive access.`,
    bodyContent
  });

  const text = [
    `========================================`,
    `🚨 NEW ORDER RECEIVED - IMRAN SOFTKART`,
    `========================================`,
    ``,
    `CUSTOMER DETAILS:`,
    `- Name: ${name || 'Customer'}`,
    `- Customer Email: ${email}`,
    `- WhatsApp: ${whatsapp || 'Not provided'}`,
    `- Google Drive Email: ${driveEmail || email}`,
    `- Date: ${orderDate}`,
    ``,
    `ORDER DETAILS:`,
    `- Products: ${productNames}`,
    `- Total Amount: ${formattedTotal}`,
    `- Payment Screenshot: ${hasScreenshot ? 'ATTACHED to this email' : 'NONE provided'}`,
    ``,
    `ACTION REQUIRED:`,
    `1. Verify payment in your UPI/Bank statement.`,
    `2. Share Google Drive software access with ${driveEmail || email}.`,
    whatsappUrl ? `Customer WhatsApp Chat: ${whatsappUrl}` : '',
    ``,
    `Imran Softkart Admin Notification System`
  ].filter(Boolean).join('\n');

  return { 
    html, 
    text, 
    subject: `🚨 New Order Alert: ${formattedTotal} - ${name || 'Customer'} (${productNames})` 
  };
}
