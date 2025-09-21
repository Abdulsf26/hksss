# Email Setup Instructions for School Life Survey

## 📧 How to Configure Email Sending

To enable email functionality for your survey, you need to set up EmailJS (a free service for sending emails from client-side JavaScript).

**IMPORTANT**: All survey responses will be sent to **hajifathullah@gmail.com** automatically.

### Step 1: Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### Step 2: Add Email Service
1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, Yahoo, etc.)
4. Follow the setup instructions for your provider
5. Note down your **Service ID**

### Step 3: Create Email Template
1. Go to "Email Templates" in your dashboard
2. Click "Create New Template"
3. Use this template content:

**Subject:** `{{subject}}`

**Content:**
```
From: {{from_name}}
To: {{to_email}}

{{message}}

---
Raw Survey Data:
{{survey_data}}

Submitted on: {{timestamp}}
```

4. Save the template and note down your **Template ID**

### Step 4: Get Public Key
1. Go to "Account" → "General"
2. Copy your **Public Key**

### Step 5: Update Configuration
Open `script.js` and replace these values:

```javascript
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';        // Replace with your Service ID
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';      // Replace with your Template ID  
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';        // Replace with your Public Key
```

**Note**: The admin email is already set to `hajifathullah@gmail.com` - no need to change this.

### Step 6: Test the Setup
1. Open `index.html` in your browser
2. Fill out the survey form
3. Submit the form
4. Check hajifathullah@gmail.com inbox for the survey results

## 🔧 Alternative: Manual Email Setup

If you prefer not to use EmailJS, you can modify the code to use other email services:

### Option 1: Formspree
1. Go to [https://formspree.io/](https://formspree.io/)
2. Create a free account
3. Create a new form
4. Replace the email sending code with Formspree's endpoint

### Option 2: Netlify Forms
1. Deploy your site to Netlify
2. Add `netlify` attribute to your form
3. Netlify will automatically handle form submissions

### Option 3: Custom Backend
Create a simple backend service using:
- Node.js with Nodemailer
- Python with Flask/Django
- PHP with PHPMailer
- Any other backend technology

## 📋 Email Template Variables

The email template uses these variables:
- `{{to_email}}` - Always hajifathullah@gmail.com
- `{{from_name}}` - School Life Survey System
- `{{subject}}` - New School Life Survey Response Received
- `{{message}}` - Formatted survey results
- `{{survey_data}}` - Raw JSON data
- `{{timestamp}}` - When the response was submitted

## 🚨 Important Notes

1. **Free Limits**: EmailJS free plan allows 200 emails/month
2. **Security**: Never expose sensitive API keys in client-side code
3. **Testing**: Always test with your own email first
4. **Backup**: Keep a copy of your configuration values
5. **Admin Email**: All responses go to hajifathullah@gmail.com automatically

## 🆘 Troubleshooting

### Common Issues:
1. **"EmailJS not defined"** - Check if the EmailJS script is loaded
2. **"Service not found"** - Verify your Service ID is correct
3. **"Template not found"** - Verify your Template ID is correct
4. **"Invalid public key"** - Verify your Public Key is correct
5. **Emails not received** - Check spam folder and email provider settings

### Debug Steps:
1. Open browser developer tools (F12)
2. Check the Console tab for error messages
3. Verify all configuration values are correct
4. Test with a simple email first

## 📞 Support

If you need help:
1. Check EmailJS documentation: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
2. EmailJS support: [https://www.emailjs.com/support/](https://www.emailjs.com/support/)
3. Check the browser console for detailed error messages
