const nodemailer = require('nodemailer');

async function sendPasswordResetEmail(email, resetUrl) {
  // Production: Gmail SMTP — DMARC-aligned for @gmail.com senders
  if (process.env.EMAIL_FROM && process.env.GMAIL_APP_PASSWORD) {
    console.log('📧 Using Gmail SMTP for email delivery');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    try {
      const info = await transporter.sendMail({
        from: `"Exam Prep Platform" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: 'Password Reset Request - Exam Prep',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #7c3aed; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; padding: 12px 30px; background: #7c3aed; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header"><h1>Password Reset Request</h1></div>
              <div class="content">
                <p>Hello,</p>
                <p>You requested to reset your password for your Exam Prep account.</p>
                <p>Click the button below to reset your password:</p>
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #7c3aed;">${resetUrl}</p>
                <p><strong>This link will expire in 1 hour.</strong></p>
                <p>If you didn't request a password reset, please ignore this email.</p>
                <p>Best regards,<br>The Exam Prep Team</p>
              </div>
              <div class="footer"><p>This is an automated email. Please do not reply.</p></div>
            </div>
          </body>
          </html>
        `,
        text: `Reset your Exam Prep password: ${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.`,
      });

      console.log('\n✅ Password reset email sent via Gmail');
      console.log('📧 Recipient:', email);
      console.log('📧 Message ID:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('\n❌ Gmail SMTP send failed:', error.message);
      throw new Error('Failed to send password reset email. Please try again later.');
    }
  }

  // Development fallback: Ethereal (preview only — not delivered to real inboxes)
  console.log('\n📧 ═══════════════════════════════════════════════════');
  console.log('📧 Using Ethereal Email (DEVELOPMENT MODE)');
  console.log('📧 Emails will NOT be delivered to real inboxes');
  console.log('📧 Check the preview URL in console after each email');
  console.log('📧 ═══════════════════════════════════════════════════\n');

  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });

    const info = await transporter.sendMail({
      from: '"Exam Prep Platform" <noreply@examprep.com>',
      to: email,
      subject: 'Password Reset Request - Exam Prep',
      html: `<p>Reset your password: <a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour.</p>`,
      text: `Reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('\n✅ ═══════════════════════════════════════════════════');
    console.log('✅ PASSWORD RESET EMAIL SENT (Test Mode)');
    console.log('📧 Preview URL:', previewUrl);
    console.log('📧 Recipient:', email);
    console.log('✅ ═══════════════════════════════════════════════════\n');

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error('❌ Ethereal fallback failed:', error.message);
    throw new Error('Failed to send password reset email. Please try again later.');
  }
}

module.exports = { sendPasswordResetEmail };
