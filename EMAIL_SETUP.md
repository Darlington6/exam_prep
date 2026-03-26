# Email Setup Guide

## Overview
This platform sends transactional emails (password resets, notifications, etc.). As the **platform owner**, you configure the email service **once**, and it works for all users globally.

**Users never need to configure anything** - they just use the platform!

---

## Quick Start (Development)

**No configuration needed!** 

The platform automatically uses **Ethereal Email** in development mode:
- Run your backend: `node server.js`
- Test forgot password
- Check the backend console for the email preview URL
- Click the URL to see the email in a web interface

---

## Production Setup (Choose One)

### Option 1: SendGrid (Recommended) ⭐

**Why SendGrid?**
- ✅ Free tier: 100 emails/day forever
- ✅ Professional delivery rates
- ✅ Easy setup (5 minutes)
- ✅ Built for transactional emails

**Setup Steps:**

1. **Sign up for SendGrid**
   - Go to https://signup.sendgrid.com/
   - Complete the signup (free account)

2. **Create an API Key**
   - Log in to SendGrid
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Name it: "Exam Prep Platform"
   - Choose "Full Access" or "Restricted Access" (with Mail Send permission)
   - Copy the API key (you'll only see it once!)

3. **Configure your `.env` file**
   ```env
   SENDGRID_API_KEY=SG.your-actual-api-key-here
   EMAIL_FROM="Exam Prep" <noreply@yourdomain.com>
   ```

4. **Restart your backend**
   ```bash
   node server.js
   ```

5. **Test it!**
   - Use the forgot password feature
   - You'll receive a real email! ✉️

---

### Option 2: Gmail (Alternative)

**Good for:** Small projects, testing

**Setup Steps:**

1. **Enable 2-Step Verification**
   - Visit https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Create App Password**
   - Visit https://myaccount.google.com/apppasswords
   - App: Mail
   - Device: Other → "Exam Prep"
   - Copy the 16-character password

3. **Configure your `.env` file**
   ```env
   GMAIL_USER=youremail@gmail.com
   GMAIL_APP_PASSWORD=abcdefghijklmnop
   ```

4. **Restart your backend**

**Note:** Gmail has daily sending limits (~500 emails/day)

---

## Verification

After setup, test the email service:

```bash
# Start backend
cd backend
node server.js

# In another terminal, test with curl
curl -X POST http://localhost:5001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Check the backend console for confirmation and your email inbox!

---

## Troubleshooting

**Email not received?**
- Check spam/junk folder
- Verify API key is correct in `.env`
- Check backend console for errors
- For SendGrid: verify sender identity in SendGrid dashboard

**Still using Ethereal (test emails)?**
- Your email service isn't configured
- Check `.env` file has `SENDGRID_API_KEY` or `GMAIL_USER` + `GMAIL_APP_PASSWORD`
- Restart backend after changing `.env`

---

## Production Deployment

When deploying (Heroku, AWS, Vercel, etc.):

1. Add environment variables to your hosting platform
2. **Never commit** `.env` file to git!
3. Use your hosting provider's environment variable settings:
   - Heroku: Settings → Config Vars
   - Vercel: Project Settings → Environment Variables
   - AWS: Parameter Store or Secrets Manager

---

## Cost

- **SendGrid Free Tier:** 100 emails/day forever (sufficient for most startups)
- **SendGrid Paid:** $19.95/mo for 50,000 emails/month
- **Gmail:** Free (with limits)

For a global platform, **SendGrid is the professional choice**.
