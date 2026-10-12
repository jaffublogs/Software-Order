import { renderCustomerInvoiceEmail } from '../templates/customerInvoiceTemplate.js';
import { renderAdminNotificationEmail } from '../templates/adminNotificationTemplate.js';
import { renderAccessGrantedEmail } from '../templates/accessGrantedTemplate.js';
import { renderTestEmail } from '../templates/testEmailTemplate.js';
import { verifySmtp } from '../services/emailService.js';

console.log('🧪 Starting Email Template & System Test...\n');

let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
  } else {
    console.error(`❌ FAIL: ${testName}`);
    failedTests++;
  }
}

// 1. Test Customer Invoice Template
console.log('--- 1. Customer Invoice Template Test ---');
const customerData = {
  name: 'John & Jane Doe <script>alert(1)</script>',
  email: 'customer@example.com',
  whatsapp: '+919876543210',
  driveEmail: 'driveuser@gmail.com',
  cart: [
    { name: 'Windows 11 Pro Lifetime', price: 499 },
    { name: 'MS Office 2024 Pro Plus', price: 699 }
  ],
  total: 1198,
  hasScreenshot: true
};

const customerEmail = renderCustomerInvoiceEmail(customerData);
assert(typeof customerEmail.html === 'string' && customerEmail.html.length > 500, 'Customer HTML rendered non-empty string');
assert(customerEmail.html.includes('<!DOCTYPE html PUBLIC'), 'Customer HTML has valid email doctype');
assert(customerEmail.html.includes('John &amp; Jane Doe &lt;script&gt;alert(1)&lt;/script&gt;'), 'Customer HTML correctly escapes dynamic values');
assert(customerEmail.html.includes('Windows 11 Pro Lifetime'), 'Customer HTML includes product names');
assert(customerEmail.html.includes('₹1,198'), 'Customer HTML includes formatted price');
assert(customerEmail.html.includes('driveuser@gmail.com'), 'Customer HTML includes drive email');
assert(customerEmail.html.includes('Automated Delivery - Windows 11 Pro'), 'Customer HTML includes Win 11 special access CTA');
assert(typeof customerEmail.text === 'string' && customerEmail.text.includes('1,198'), 'Customer plain-text fallback populated');

// 2. Test Admin Notification Template
console.log('\n--- 2. Admin Notification Template Test ---');
const adminEmail = renderAdminNotificationEmail(customerData);
assert(typeof adminEmail.html === 'string' && adminEmail.html.length > 500, 'Admin HTML rendered non-empty string');
assert(adminEmail.html.includes('&#128680; New Customer Order Received'), 'Admin HTML contains alert banner');
assert(adminEmail.html.includes('John &amp; Jane Doe'), 'Admin HTML contains customer name');
assert(adminEmail.html.includes('Payment Screenshot Attached'), 'Admin HTML indicates screenshot attached');
assert(adminEmail.html.includes('Open Google Drive'), 'Admin HTML includes quick action buttons');
assert(adminEmail.subject.includes('New Order Alert'), 'Admin Subject correctly formatted');
assert(typeof adminEmail.text === 'string' && adminEmail.text.includes('ACTION REQUIRED'), 'Admin plain-text fallback populated');

// 3. Test Access Granted Template
console.log('\n--- 3. Access Granted Template Test ---');
const accessEmail = renderAccessGrantedEmail({
  name: 'John Doe',
  email: 'customer@example.com',
  driveLink: 'https://drive.google.com/drive/folders/sample-link-123'
});
assert(typeof accessEmail.html === 'string' && accessEmail.html.length > 500, 'Access HTML rendered non-empty string');
assert(accessEmail.html.includes('https://drive.google.com/drive/folders/sample-link-123'), 'Access HTML contains Drive link CTA');
assert(accessEmail.html.includes('Access Granted!'), 'Access HTML contains Access Granted banner');
assert(typeof accessEmail.text === 'string' && accessEmail.text.includes('GOOGLE DRIVE DOWNLOAD LINK'), 'Access plain-text fallback populated');

// 4. Test Diagnostic Email Template
console.log('\n--- 4. Diagnostic Test Email Template Test ---');
const testDiag = renderTestEmail({ targetEmail: 'test@example.com' });
assert(typeof testDiag.html === 'string' && testDiag.html.includes('test@example.com'), 'Diagnostic template populated target email');

// 5. Test SMTP Connectivity
console.log('\n--- 5. SMTP Connectivity Test ---');
verifySmtp().then(smtpRes => {
  assert(smtpRes.success, 'SMTP Server verification returned success');
  
  if (failedTests === 0) {
    console.log('\n🎉 ALL 14 EMAIL TEMPLATE & SMTP TESTS PASSED!\n');
    process.exit(0);
  } else {
    console.error(`\n❌ ${failedTests} tests failed.\n`);
    process.exit(1);
  }
}).catch(err => {
  console.error('SMTP verify exception:', err);
  process.exit(1);
});
