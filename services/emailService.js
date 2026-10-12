import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { renderCustomerInvoiceEmail } from '../templates/customerInvoiceTemplate.js';
import { renderAdminNotificationEmail } from '../templates/adminNotificationTemplate.js';
import { renderAccessGrantedEmail } from '../templates/accessGrantedTemplate.js';
import { renderTestEmail } from '../templates/testEmailTemplate.js';

dotenv.config();

// Production-safe email logger (masks email addresses and never logs secrets)
function maskEmail(email) {
  if (!email || typeof email !== 'string') return 'unknown';
  const parts = email.split('@');
  if (parts.length !== 2) return '***';
  const name = parts[0];
  const domain = parts[1];
  const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}***`;
  return `${maskedName}@${domain}`;
}

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

/**
 * Configure Nodemailer SMTP Transporter
 * Uses secure SSL on port 465 with pooling for continuous servers (Render)
 * and direct connections for serverless environments (Vercel)
 */
function createTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;

  if (!user || !pass) {
    console.warn('⚠️ WARNING: SMTP_USER or SMTP_PASS is missing in environment variables!');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    pool: !isServerless, // Disable connection pooling in serverless lambdas to prevent socket hangs
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

const transporter = createTransporter();

// Helper to get sender address
function getSenderAddress() {
  if (process.env.SMTP_FROM) {
    return process.env.SMTP_FROM;
  }
  return `"Imran Softkart" <${process.env.SMTP_USER || 'noreply@imransoftkart.com'}>`;
}

// Helper to get admin recipient address
function getAdminRecipient() {
  return process.env.ADMIN_EMAIL || process.env.SMTP_USER;
}

/**
 * Verify SMTP connection safely
 */
export async function verifySmtp() {
  try {
    await transporter.verify();
    console.log('⚡ [SMTP] Connection verified and ready to send emails.');
    return { success: true };
  } catch (error) {
    console.error('❌ [SMTP] Verification failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Sends Customer Invoice & Order Confirmation Email
 */
export async function sendCustomerInvoice({
  email,
  name,
  whatsapp,
  driveEmail,
  cart = [],
  total = 0,
  screenshotFile = null
}) {
  if (!email) {
    throw new Error('Recipient email is required for customer invoice');
  }

  const { html, text, subject } = renderCustomerInvoiceEmail({
    name,
    email,
    whatsapp,
    driveEmail,
    cart,
    total,
    hasScreenshot: Boolean(screenshotFile)
  });

  if (!html || typeof html !== 'string' || html.length < 50) {
    throw new Error('Failed to generate valid HTML template for customer invoice');
  }

  const mailOptions = {
    from: getSenderAddress(),
    to: email,
    subject,
    text,
    html,
    headers: {
      'X-Mailer': 'ImranSoftkart-Mailer',
      'X-Priority': '1'
    }
  };

  console.log(`📤 [SMTP] Sending Customer Invoice to ${maskEmail(email)}...`);
  const result = await transporter.sendMail(mailOptions);
  console.log(`✅ [SMTP] Customer Invoice sent successfully! MessageId: ${result.messageId}`);
  return result;
}

/**
 * Sends Admin Order Notification Email with optional payment screenshot attachment
 */
export async function sendAdminOrderNotification({
  email,
  name,
  whatsapp,
  driveEmail,
  cart = [],
  total = 0,
  screenshotFile = null
}) {
  const adminRecipient = getAdminRecipient();
  if (!adminRecipient) {
    throw new Error('Admin recipient email is not configured (ADMIN_EMAIL or SMTP_USER)');
  }

  const { html, text, subject } = renderAdminNotificationEmail({
    name,
    email,
    whatsapp,
    driveEmail,
    cart,
    total,
    hasScreenshot: Boolean(screenshotFile),
    orderDate: new Date().toLocaleString()
  });

  if (!html || typeof html !== 'string' || html.length < 50) {
    throw new Error('Failed to generate valid HTML template for admin notification');
  }

  const attachments = [];
  if (screenshotFile && screenshotFile.buffer) {
    attachments.push({
      filename: screenshotFile.originalname || 'payment-screenshot.jpg',
      content: screenshotFile.buffer,
      contentType: screenshotFile.mimetype || 'image/jpeg'
    });
  }

  const mailOptions = {
    from: getSenderAddress(),
    to: adminRecipient,
    subject,
    text,
    html,
    attachments,
    headers: {
      'X-Mailer': 'ImranSoftkart-AdminMailer',
      'X-Priority': '1'
    }
  };

  console.log(`📤 [SMTP] Sending Admin Alert to ${maskEmail(adminRecipient)}...`);
  const result = await transporter.sendMail(mailOptions);
  console.log(`✅ [SMTP] Admin Alert sent successfully! MessageId: ${result.messageId}`);
  return result;
}

/**
 * Sends Software Drive Access email to customer
 */
export async function sendAccessGrantedEmail({
  email,
  name,
  driveLink
}) {
  if (!email || !driveLink) {
    throw new Error('Email and driveLink are required to send access email');
  }

  const { html, text, subject } = renderAccessGrantedEmail({
    name,
    email,
    driveLink
  });

  if (!html || typeof html !== 'string' || html.length < 50) {
    throw new Error('Failed to generate valid HTML template for access email');
  }

  const mailOptions = {
    from: getSenderAddress(),
    to: email,
    subject,
    text,
    html,
    headers: {
      'X-Mailer': 'ImranSoftkart-AccessMailer'
    }
  };

  console.log(`📤 [SMTP] Sending Access Granted to ${maskEmail(email)}...`);
  const result = await transporter.sendMail(mailOptions);
  console.log(`✅ [SMTP] Access Granted sent successfully! MessageId: ${result.messageId}`);
  return result;
}

/**
 * Diagnostic test email to verify SMTP and HTML template in production
 */
export async function sendDiagnosticEmail(targetEmail) {
  const recipient = targetEmail || getAdminRecipient();
  if (!recipient) {
    throw new Error('Target email for diagnostic is not specified');
  }

  const { html, text, subject } = renderTestEmail({
    targetEmail: recipient,
    serverTime: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });

  const mailOptions = {
    from: getSenderAddress(),
    to: recipient,
    subject,
    text,
    html
  };

  console.log(`📤 [SMTP] Sending Diagnostic Test Email to ${maskEmail(recipient)}...`);
  const result = await transporter.sendMail(mailOptions);
  console.log(`✅ [SMTP] Diagnostic Test Email sent! MessageId: ${result.messageId}`);
  return result;
}

export { transporter };
