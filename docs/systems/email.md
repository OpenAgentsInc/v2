# Emailing System

We integrate with the Resend API for our email needs and use Inngest for queueing and background processing. This document outlines our email system setup, capabilities, and implementation plan.

## Current Setup

- We use Resend API for email sending.
- Setup is based on their [NextJS quickstart](https://resend.com/docs/send-with-nextjs).
- Basic email template: `components/email/email-template.tsx`
- Demo sending route: `app/api/send/route.ts`

## Capabilities

1. **Single Email Sending**: We can send individual emails to users.
2. **Bulk Email Campaigns**: We can coordinate email campaigns to multiple recipients.
3. **User Management**: We can manage our user list for email purposes.

## Implementation Plan

### 1. Create Email Management HUD Pane

- Add a new folder `panes/email/` with the following files:
  - `EmailPane.tsx`: Main container for email management
  - `EmailList.tsx`: Display list of sent/scheduled emails
  - `EmailCompose.tsx`: Interface for composing new emails
  - `EmailCampaign.tsx`: Interface for creating and managing email campaigns
- Use Shad UI components from `components/ui/` for consistency

### 2. Update Convex Schema

Modify `convex/schema.ts` to include new tables:
- `emails`: Store individual email data
- `emailCampaigns`: Manage email campaigns
- `emailAudiences`: Store audience information

### 3. Add Convex Functions for Email Operations

Create `convex/emails/` folder with:
- `sendEmail.ts`: Send individual emails
- `createCampaign.ts`: Create email campaigns
- `addToAudience.ts`: Manage email audiences
- `getEmailStats.ts`: Retrieve email analytics
- `index.ts`: Export all email-related functions

### 4. Integrate Resend API

- Add Resend API configuration to environment variables
- Create `lib/resend.ts` to initialize and export the Resend client

### 5. Implement Email Templates

- Enhance `components/email/email-template.tsx`
- Create additional templates for different purposes (welcome, newsletter, etc.)
- Use React Email components for styling and responsiveness

### 6. Update User Management

- Modify `convex/users/getUserData.ts` to include email preferences and subscription status
- Add `convex/users/updateEmailPreferences.ts` for managing user email settings

### 7. Implement Email Queueing and Background Processing with Inngest

#### Setup Inngest

1. Install Inngest: `npm install inngest`
2. Create an Inngest account and set up a new project
3. Add Inngest API key to environment variables

#### Implementation

Create a new file `lib/inngest.ts`:

```typescript
import { Inngest } from 'inngest';
import { Resend } from 'resend';

// Initialize Inngest client
export const inngest = new Inngest({ name: 'OpenAgents Email System' });

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Define the email sending function
export const sendEmail = inngest.createFunction(
  { name: 'Send Email' },
  { event: 'email/send' },
  async ({ event, step }) => {
    const { to, from, subject, html, text } = event.data;

    const result = await step.run('Send email with Resend', async () => {
      return resend.emails.send({
        to,
        from,
        subject,
        html,
        text
      });
    });

    return { result };
  }
);

// Function to queue an email
export const queueEmail = (emailData) => {
  return inngest.send({
    name: 'email/send',
    data: emailData,
  });
};
```

#### Update Convex Function for Queueing

Modify `convex/emails/sendEmail.ts`:

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { queueEmail } from "../../lib/inngest";

export const sendEmail = mutation({
  args: {
    to: v.string(),
    from: v.string(),
    subject: v.string(),
    html: v.optional(v.string()),
    text: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const emailId = await ctx.db.insert("emails", {
      userId: ctx.auth.userId,
      status: "queued",
      ...args,
      createdAt: Date.now(),
    });
    
    // Queue the email with Inngest
    await queueEmail(args);
    
    return emailId;
  },
});
```

### 8. Add Email Analytics

- Create `convex/emails/getEmailAnalytics.ts` to fetch and process engagement data from Resend
- Implement visualization components in the email HUD pane

### 9. Update Main Application Logic

- Modify `hooks/useChat.ts` to include email-related actions if necessary
- Create `hooks/useEmail.ts` for email-specific logic

### 10. Documentation

- Keep this document (`docs/systems/email.md`) updated with implementation details and usage instructions
- Add comments to new components and functions

### 11. Testing

- Create unit tests for new Convex functions in `convex/emails/`
- Add integration tests for the email HUD pane and its interactions with the backend
- Test Inngest functions locally using their CLI tools

### 12. Security and Compliance

- Implement access controls in Convex functions to ensure users can only access their own email data
- Add unsubscribe links to all outgoing emails
- Ensure compliance with anti-spam laws and data protection regulations

## Resend API Integration

### Sending Emails

Basic example of sending an email:

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

Key endpoints for managing recipient lists:

- Create an audience: `POST /audiences`
- Add contacts to an audience: `POST /audiences/{audience_id}/contacts`
- Remove contacts from an audience: `DELETE /audiences/{audience_id}/contacts`

## Styling Email Templates

Steps to implement React Email for better styling:

1. Install React Email: `npm install @react-email/components`
2. Use React Email components in our templates
3. Test emails across different clients using React Email's preview functionality

## Next Steps

1. Set up Inngest and integrate it with our email system
2. Implement the email queueing mechanism using Inngest
3. Create Inngest functions for processing queued emails
4. Update Convex schema and functions to work with the Inngest queueing system
5. Implement the email management HUD pane
6. Develop and style email templates using React Email
7. Implement user email preference management
8. Set up email scheduling capabilities using Inngest's delay feature
9. Develop email analytics and visualization components
10. Conduct thorough testing of all new features, including Inngest functions
11. Ensure security measures and compliance with email regulations

Remember to always follow best practices for email sending, including proper unsubscribe mechanisms and compliance with anti-spam laws.