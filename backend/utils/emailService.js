const nodemailer = require('nodemailer');

/**
 * Create email transporter
 * Priority order:
 * 1. SendGrid (production-ready, free tier available)
 * 2. Gmail (if configured)
 * 3. Ethereal (automatic test email for development)
 */
async function createTransporter() {
  // Option 1: SendGrid (Recommended for production)
  if (process.env.SENDGRID_API_KEY) {
    console.log('📧 Using SendGrid for email delivery');
    try {
      return nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
      });
    } catch (error) {
      console.error('❌ SendGrid configuration error:', error.message);
      console.log('📧 Falling back to next available email service...');
    }
  }

  // Option 2: Gmail (if configured)
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    // Check if placeholder value is still present
    if (process.env.GMAIL_APP_PASSWORD.includes('your-16-char') || process.env.GMAIL_APP_PASSWORD.includes('placeholder')) {
      console.log('⚠️  Gmail App Password not configured (placeholder detected)');
      console.log('📧 Skipping Gmail, falling back to Ethereal...');
    } else {
      console.log('📧 Using Gmail SMTP for email delivery');
      try {
        return nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
          },
        });
      } catch (error) {
        console.error('❌ Gmail configuration error:', error.message);
        console.log('📧 Falling back to Ethereal...');
      }
    }
  }

  // Option 3: Ethereal Email (automatic test account for development)
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log('\n📧 ═══════════════════════════════════════════════════');
    console.log('📧 Using Ethereal Email (DEVELOPMENT MODE)');
    console.log('📧 Emails will NOT be delivered to real inboxes');
    console.log('📧 Check the preview URL in console after each email');
    console.log('📧 ═══════════════════════════════════════════════════\n');
    
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (error) {
    console.error('❌ Failed to create Ethereal test account:', error.message);
    console.error('❌ All email service options exhausted');
    return null;
  }
}

/**
 * Send password reset email
 * @param {string} email - Recipient email address
 * @param {string} resetUrl - Password reset URL with token
 */
async function sendPasswordResetEmail(email, resetUrl) {
  try {
    const transporter = await createTransporter();

    if (!transporter) {
      console.error('❌ Email service not available');
      throw new Error('Email service configuration error');
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Exam Prep Platform" <noreply@examprep.com>',
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
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
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
              <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
              <p>Best regards,<br>The Exam Prep Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Password Reset Request

You requested to reset your password for your Exam Prep account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email.

Best regards,
The Exam Prep Team
      `.trim(),
    };

    const info = await transporter.sendMail(mailOptions);
    
    // Log preview URL for Ethereal (development)
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('\n✅ ═══════════════════════════════════════════════════');
      console.log('✅ PASSWORD RESET EMAIL SENT (Test Mode)');
      console.log('📧 Preview URL:', previewUrl);
      console.log('📧 Recipient:', email);
      console.log('📧 Open the URL above to view the email');
      console.log('✅ ═══════════════════════════════════════════════════\n');
    } else {
      console.log('\n✅ Password reset email sent successfully');
      console.log('📧 Recipient:', email);
      console.log('📧 Message ID:', info.messageId);
      console.log('');
    }
    
    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    // Detailed error logging for debugging
    console.error('\n❌ ═══════════════════════════════════════════════════');
    console.error('❌ EMAIL SENDING FAILED');
    console.error('📧 Recipient:', email);
    console.error('❌ Error Code:', error.code || 'UNKNOWN');
    console.error('❌ Error Message:', error.message);
    if (error.command) {
      console.error('❌ SMTP Command:', error.command);
    }
    if (error.responseCode) {
      console.error('❌ Response Code:', error.responseCode);
    }
    console.error('❌ ═══════════════════════════════════════════════════\n');
    
    // Throw user-friendly error
    throw new Error('Failed to send password reset email. Please try again later.');
  }
}

module.exports = {
  sendPasswordResetEmail,
};
