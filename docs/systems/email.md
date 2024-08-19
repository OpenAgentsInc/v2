# Emailing System

We integrate with the Resend API for our email needs. This document outlines our email system setup, capabilities, and future plans.

## Current Setup

- We use Resend API for email sending.
- Setup is based on their [NextJS quickstart](https://resend.com/docs/send-with-nextjs).
- Basic email template: `components/email/email-template.tsx`
- Demo sending route: `app/api/send/route.ts`

## Capabilities

1. **Single Email Sending**: We can send individual emails to users.
2. **Bulk Email Campaigns**: We can coordinate email campaigns to multiple recipients.
3. **User Management**: We can manage our user list for email purposes.

## Planned Features

1. **HUD Panes**: Implement specific HUD panes for email management and campaign coordination.
2. **Audience Management**: Utilize Resend's 'Audiences' API for better recipient list management.
3. **Email Templates**: Develop and manage multiple email templates for various purposes.
4. **Campaign Analytics**: Implement tracking and analytics for email campaigns.

## Resend API Integration

### Sending Emails

To send an email, use the Resend API. Here's a basic example:

```javascript
import { Resend } from 'resend';

const resend = new Resend('re_123456789');

resend.emails.send({
  from: 'onboarding@resend.dev',
  to: 'delivered@resend.dev',
  subject: 'Hello World',
  html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
});
```

### Audiences API

We plan to use Resend's Audiences API for managing recipient lists. Key endpoints:

- Create an audience: `POST /audiences`
- Add contacts to an audience: `POST /audiences/{audience_id}/contacts`
- Remove contacts from an audience: `DELETE /audiences/{audience_id}/contacts`

## Styling Email Templates

We need to improve our email template styling. Resend supports React Email for creating beautiful, responsive emails. Steps to implement:

1. Install React Email: `npm install @react-email/components`
2. Use React Email components in our templates
3. Test emails across different clients using React Email's preview functionality

## Next Steps

1. Implement HUD panes for email management
2. Set up Audiences API integration for user list management
3. Create multiple email templates for different purposes (welcome, newsletter, etc.)
4. Implement tracking and analytics for sent emails
5. Develop a system for scheduling and automating email campaigns

Remember to always follow best practices for email sending, including proper unsubscribe mechanisms and compliance with anti-spam laws.