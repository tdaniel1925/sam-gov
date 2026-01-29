# Supabase Welcome Email Setup

This guide will help you configure a welcome email that's automatically sent when users sign up.

## Step 1: Access Supabase Email Templates

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `dtcwjaunekcbnrtshgok`
3. Navigate to **Authentication** → **Email Templates**

## Step 2: Customize the "Confirm signup" Template

The signup confirmation email doubles as a welcome email. Click on **Confirm signup** and replace the default template with:

### Subject Line:
```
Welcome to SAM.gov Opportunities, {{ .Data.first_name }}!
```

### Email Body (HTML):
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(to right, #2563eb, #4f46e5); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Welcome to SAM.gov Opportunities!</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #111827; font-size: 24px; margin: 0 0 20px 0;">Hi {{ .Data.first_name }},</h2>

              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Welcome aboard! We're excited to help you discover federal government contract opportunities.
              </p>

              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Please confirm your email address to get started:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600;">
                      Confirm Your Email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Or copy and paste this link into your browser:<br/>
                <a href="{{ .ConfirmationURL }}" style="color: #2563eb; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />

              <h3 style="color: #111827; font-size: 18px; margin: 0 0 15px 0;">What's Next?</h3>
              <ul style="color: #374151; font-size: 16px; line-height: 1.8; padding-left: 20px;">
                <li>Browse thousands of government contract opportunities</li>
                <li>Save opportunities that match your business</li>
                <li>Set up alerts for specific NAICS codes</li>
                <li>Track deadlines and updates</li>
              </ul>

              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
                If you have any questions, just reply to this email. We're here to help!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                SAM.gov Opportunities Platform
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                If you didn't create this account, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## Step 3: Test the Email

1. Save the email template in Supabase
2. Create a test account on your signup page
3. Check your inbox for the welcome email

## Available Variables

You can use these variables in your email templates:

- `{{ .Data.first_name }}` - User's first name
- `{{ .Data.last_name }}` - User's last name
- `{{ .Data.full_name }}` - User's full name
- `{{ .Email }}` - User's email address
- `{{ .ConfirmationURL }}` - Email confirmation link
- `{{ .Token }}` - Confirmation token
- `{{ .SiteURL }}` - Your site URL

## Email Settings

Make sure your Supabase project has:

1. **SMTP configured** (or use Supabase's built-in email service)
2. **Email confirmation enabled** in Authentication settings
3. **Redirect URLs** configured to include your production domain

## Testing Locally

When testing locally, the confirmation link will redirect to `localhost:5173/dashboard`. Make sure to add this URL to your Supabase **Redirect URLs** list:

1. Go to **Authentication** → **URL Configuration**
2. Add `http://localhost:5173/dashboard` to Redirect URLs
3. Add `https://sam-gov-nu.vercel.app/dashboard` for production

## Troubleshooting

**Emails not sending?**
- Check Supabase email logs in **Authentication** → **Email Templates** → **Logs**
- Verify SMTP configuration
- Check spam folder
- Ensure email confirmation is enabled in Auth settings

**Confirmation links not working?**
- Verify redirect URLs are configured correctly
- Check that `emailRedirectTo` in the signup code matches allowed URLs
- Clear browser cache and try again
