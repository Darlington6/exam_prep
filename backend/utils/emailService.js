const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');

const SENDGRID_TEMPLATE_ID = 'd-9c16e45629ee4f7d94259cb400f88f76';

async function sendPasswordResetEmail(email, resetUrl) {
  // Production: SendGrid Dynamic Template
  if (process.env.SENDGRID_API_KEY) {
    console.log('📧 Using SendGrid Dynamic Template for email delivery');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: email,
      from: process.env.EMAIL_FROM,
      templateId: SENDGRID_TEMPLATE_ID,
      dynamicTemplateData: { resetUrl },
    };

    try {
      await sgMail.send(msg);
      console.log('\n✅ Password reset email sent via SendGrid');
      console.log('📧 Recipient:', email);
      return { success: true };
    } catch (error) {
      console.error('\n❌ SendGrid send failed:', error.message);
      if (error.response) {
        console.error('❌ SendGrid error body:', JSON.stringify(error.response.body));
      }
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
