import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function verify() {
  try {
    await transporter.verify();
    console.log('SMTP Connection Successful!');
  } catch (error) {
    console.error('SMTP Connection Failed:', error.message);
  }
}

verify();
