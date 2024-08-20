# Resend API: Send Email

This document outlines the Resend API's email sending functionality and our internal implementation using Convex.

## API Endpoint

`POST https://api.resend.com/emails`

## Request Body

| Name | Type | Description |
|------|------|-------------|
| from | string | Sender email address. |
| to | string or array | Recipient email address(es). |
| subject | string | Email subject. |
| bcc | string or array | BCC recipient email address(es). |
| cc | string or array | CC recipient email address(es). |
| reply_to | string or array | Reply-To email address(es). |
| html | string | HTML version of the email. |
| text | string | Text version of the email. |
| attachments | array | Files to be attached to the email. |
| headers | object | Custom headers to add to the email. |
| tags | array | Tags for the email. |

## Response

A successful response will have a status code of 200 and include the following field:

| Name | Type | Description |
|------|------|-------------|
| id | string | Unique identifier for the email. |

## Error Codes

- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 422: Unprocessable Entity
- 429: Too Many Requests
- 500: Internal Server Error

## Our Convex Implementation

### Schema

We'll add the following table to our Convex schema (`convex/schema.ts`):

```typescript
export default defineSchema({
  // ... existing tables ...
  emails: defineTable({
    userId: v.string(),
    from: v.string(),
    to: v.array(v.string()),
    subject: v.string(),
    html: v.optional(v.string()),
    text: v.optional(v.string()),
    cc: v.optional(v.array(v.string())),
    bcc: v.optional(v.array(v.string())),
    replyTo: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    status: v.string(), // "pending", "sent", "failed"
    resendId: v.optional(v.string()),
    createdAt: v.number(),
    sentAt: v.optional(v.number()),
  }).index("by_userId", ["userId"]),
});
```

### Convex Action

We'll create a new Convex action in `convex/emails/sendEmail.ts`:

```typescript
import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from 'resend';

export const sendEmail = action({
  args: {
    from: v.string(),
    to: v.union(v.string(), v.array(v.string())),
    subject: v.string(),
    html: v.optional(v.string()),
    text: v.optional(v.string()),
    cc: v.optional(v.union(v.string(), v.array(v.string()))),
    bcc: v.optional(v.union(v.string(), v.array(v.string()))),
    replyTo: v.optional(v.union(v.string(), v.array(v.string()))),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    try {
      const result = await resend.emails.send({
        from: args.from,
        to: args.to,
        subject: args.subject,
        html: args.html,
        text: args.text,
        cc: args.cc,
        bcc: args.bcc,
        reply_to: args.replyTo,
        tags: args.tags,
      });

      // Store the email in our database
      await ctx.db.insert("emails", {
        userId: ctx.auth.userId,
        ...args,
        status: "sent",
        resendId: result.id,
        createdAt: Date.now(),
        sentAt: Date.now(),
      });

      return { success: true, id: result.id };
    } catch (error) {
      // Store the failed email attempt
      await ctx.db.insert("emails", {
        userId: ctx.auth.userId,
        ...args,
        status: "failed",
        createdAt: Date.now(),
      });

      return { success: false, error: error.message };
    }
  },
});
```

This implementation covers the basic email sending functionality while also storing the email data in our Convex database for record-keeping and potential retry mechanisms.

## Usage

To send an email using this Convex action:

```typescript
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

const SendEmailComponent = () => {
  const sendEmail = useMutation(api.emails.sendEmail);

  const handleSendEmail = async () => {
    const result = await sendEmail({
      from: "onboarding@resend.dev",
      to: "delivered@resend.dev",
      subject: "Hello World",
      html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
    });

    if (result.success) {
      console.log("Email sent successfully:", result.id);
    } else {
      console.error("Failed to send email:", result.error);
    }
  };

  return <button onClick={handleSendEmail}>Send Email</button>;
};
```

This setup allows us to send emails through the Resend API while maintaining a record of all sent emails in our Convex database.