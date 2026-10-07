const nodemailer = require('nodemailer');

/**
 * Sends an email using Nodemailer.
 * Supports:
 * 1. Real SMTP (Gmail, Outlook, Brevo, SendGrid, etc.) via .env variables
 * 2. Automatic Ethereal test account or console fallback if SMTP is not configured.
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Subject line
 * @param {string} options.text - Plaintext body
 * @param {string} options.html - HTML body
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    let transporter;

    // 1. Check if SMTP configuration exists in environment variables
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else if (process.env.EMAIL_SERVICE === 'gmail' && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS, // 16-character Google App Password
        },
      });
    } else {
      // 2. Fallback: Log to console in development
      console.log(`\n======================================================`);
      console.log(`📧 [EMAIL SIMULATION (SMTP not configured in .env)]`);
      console.log(`➡️  To: ${to}`);
      console.log(`📋 Subject: ${subject}`);
      console.log(`📝 Content:\n${text}`);
      console.log(`======================================================\n`);
      return { success: true, simulated: true };
    }

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'UniSkill Portal'}" <${process.env.FROM_EMAIL || process.env.EMAIL_USER || process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Message sent successfully to ${to} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Service Error] Failed to send email to ${to}:`, error.message);
    // Do not crash the application if email delivery encounters a network error
    return { success: false, error: error.message };
  }
};

/**
 * Sends a pre-styled 6-Digit OTP security email
 */
const sendOtpEmail = async ({ to, userName, otp }) => {
  const subject = `UniSkill - ${otp} is your verification code`;
  const text = `Hello ${userName || 'User'},\n\nYour 6-digit password recovery code is: ${otp}\n\nThis code will expire in 10 minutes. If you did not request this code, please ignore this email or contact university administration.\n\nBest regards,\nUniSkill Academic Platform`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
          .content { padding: 32px 28px; }
          .otp-box { background: #f1f5f9; border: 2px dashed #6366f1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
          .otp-code { font-family: 'Courier New', monospace; font-size: 36px; font-weight: 900; letter-spacing: 12px; color: #4338ca; margin: 0; padding-left: 12px; }
          .footer { padding: 20px 28px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b; }
          .warning { font-size: 12px; color: #dc2626; margin-top: 16px; background: #fef2f2; padding: 10px 14px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>UniSkill</h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">University Academic & Skill Management Portal</p>
          </div>
          <div class="content">
            <h2 style="font-size: 18px; font-weight: 700; margin-top: 0;">Password Recovery Request</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">
              Hello <strong>${userName || 'Student/Staff'}</strong>,
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">
              We received a request to reset your UniSkill portal password. Use the following 6-digit one-time password (OTP) to verify your account:
            </p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
              <div style="font-size: 12px; font-weight: 600; color: #6366f1; margin-top: 8px;">Valid for 10 minutes</div>
            </div>
            <div class="warning">
              ⚠️ <strong>Security Notice:</strong> Never share this code with anyone. University staff will never ask for your verification code or password.
            </div>
          </div>
          <div class="footer">
            <p style="margin: 0;">This is an automated security message from the UniSkill Platform.</p>
            <p style="margin: 4px 0 0 0;">If you did not initiate this password reset, please ignore this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return await sendEmail({ to, subject, text, html });
};

module.exports = {
  sendEmail,
  sendOtpEmail,
};
