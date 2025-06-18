const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// Read the full HTML report
const reportPath = path.join(__dirname, 'playwright-report', 'index.html');
const reportHTML = fs.readFileSync(reportPath, 'utf-8');

// Set up Mailtrap transporter
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "apismtp@mailtrap.io", // Replace with your actual Mailtrap user
    pass: "6e956c88a717c61a5eaf2057c48c5c23" // Replace with your actual Mailtrap password
  }
});

// Define email content
const mailOptions = {
  from: 'test@example.com',
  to: 'chetanpatil@blubirch.com',
  subject: 'Playwright Test Report',
  html: `
    <p>Hi Chetan,</p>
    <p>Here is the full Playwright HTML report:</p>
    <div style="border:1px solid #ccc; padding:10px; margin-top:10px;">
      ${reportHTML}
    </div>
  `
};

// Send the email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.error('❌ Email failed:', error);
  }
  console.log('✅ Email sent:', info.response);
});
