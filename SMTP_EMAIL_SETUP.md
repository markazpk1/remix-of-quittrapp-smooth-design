# SMTP Email Configuration Guide

## Current Status
The email functionality is **simulated** by default. Emails are logged to the console but not actually sent.

## To Enable Real Email Sending

### 1. Configure Environment Variables

Add these to your `.env` file:

```env
# Email Configuration (SMTP)
VITE_SMTP_CONFIGURED=true
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=your-email@gmail.com
VITE_SMTP_PASS=your-app-password
VITE_SMTP_FROM=noreply@yourdomain.com
```

### 2. Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for your application
3. **Use the app password** as `VITE_SMTP_PASS`

### 3. Other SMTP Providers

**Outlook/Hotmail:**
```env
VITE_SMTP_HOST=smtp-mail.outlook.com
VITE_SMTP_PORT=587
```

**SendGrid:**
```env
VITE_SMTP_HOST=smtp.sendgrid.net
VITE_SMTP_PORT=587
```

**Mailgun:**
```env
VITE_SMTP_HOST=smtp.mailgun.org
VITE_SMTP_PORT=587
```

### 4. Production Considerations

- **Never commit SMTP credentials to git**
- **Use environment variables in production**
- **Consider using email services like SendGrid for better deliverability**
- **Test with a test email account first**

## Current Behavior

### Without SMTP (Default)
- ✅ Email composition dialog works
- ✅ Form validation works
- ✅ Emails logged to console
- ✅ Shows "Email Logged" message
- ❌ No actual email sent

### With SMTP Configured
- ✅ All above features
- ✅ Real emails sent to recipients
- ✅ Shows "Email Sent" message
- ✅ Professional email delivery

## Implementation Notes

The current implementation checks `VITE_SMTP_CONFIGURED` to determine whether to:
- Log emails to console (development/testing)
- Send real emails via SMTP (production)

To implement actual SMTP sending, you would need to:
1. Add an SMTP service (like Nodemailer for Node.js backend)
2. Create an API endpoint for email sending
3. Update the `sendUserEmail` function to call the real SMTP service

## Security Notes

- SMTP credentials should be server-side only
- Consider using email service APIs instead of direct SMTP
- Implement rate limiting for email sending
- Add email templates for better formatting
