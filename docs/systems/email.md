# Emailing System

We integrate with the Resend API for our email needs. This document outlines our email system setup, capabilities, implementation plan, and queueing strategy.

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

[... Previous implementation plan remains unchanged ...]

## Email Queueing and Background Processing

To handle a large number of email jobs efficiently and outside the HTTP request lifecycle, we need to implement a robust queueing system. Here's our strategy:

### 1. Queueing System

We'll use Bull, a Redis-based queue for Node.js, to manage our email queue. Bull provides features like job prioritization, retries, and scheduling, which are crucial for our email system.

#### Setup:

1. Install Bull: `npm install bull`
2. Set up a Redis instance (we can use a managed service like Redis Labs or run it locally for development)

#### Implementation:

Create a new file `lib/emailQueue.ts`:

```typescript
import Queue from 'bull';
import { Resend } from 'resend';

const emailQueue = new Queue('email', process.env.REDIS_URL);

const resend = new Resend(process.env.RESEND_API_KEY);

emailQueue.process(async (job) => {
  const { to, from, subject, html, text } = job.data;
  
  try {
    const result = await resend.emails.send({
      to,
      from,
      subject,
      html,
      text
    });
    return result;
  } catch (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
});

export const queueEmail = (emailData) => {
  return emailQueue.add(emailData);
};

export default emailQueue;
```

### 2. Integration with Convex

Since Convex doesn't natively support long-running background jobs, we'll use a hybrid approach:

1. Use Convex for storing email data and managing the email queue state.
2. Use a separate Node.js worker (deployed on a platform like Vercel Serverless Functions or AWS Lambda) to process the queue.

#### Convex Schema Update:

Add a new table to `convex/schema.ts`:

```typescript
emailQueue: defineTable({
  userId: v.string(),
  status: v.string(), // "queued", "processing", "completed", "failed"
  emailData: v.object({
    to: v.string(),
    from: v.string(),
    subject: v.string(),
    html: v.optional(v.string()),
    text: v.optional(v.string()),
  }),
  attempts: v.number(),
  createdAt: v.number(),
  processedAt: v.optional(v.number()),
}).index("by_status", ["status"]),
```

#### Convex Function for Queueing:

Create `convex/emails/queueEmail.ts`:

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const queueEmail = mutation({
  args: {
    to: v.string(),
    from: v.string(),
    subject: v.string(),
    html: v.optional(v.string()),
    text: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const emailId = await ctx.db.insert("emailQueue", {
      userId: ctx.auth.userId,
      status: "queued",
      emailData: args,
      attempts: 0,
      createdAt: Date.now(),
    });
    
    // Trigger the worker to process the queue
    await fetch(process.env.WORKER_WEBHOOK_URL, { method: 'POST' });
    
    return emailId;
  },
});
```

### 3. Worker Implementation

Create a new file `workers/emailProcessor.js`:

```javascript
import { ConvexHttpClient } from "convex/browser";
import { queueEmail } from "../lib/emailQueue";

const convex = new ConvexHttpClient(process.env.CONVEX_URL);

export default async function (req, res) {
  const queuedEmails = await convex.query("emails:getQueuedEmails");
  
  for (const email of queuedEmails) {
    try {
      await convex.mutation("emails:updateEmailStatus", { id: email._id, status: "processing" });
      await queueEmail(email.emailData);
      await convex.mutation("emails:updateEmailStatus", { id: email._id, status: "completed" });
    } catch (error) {
      await convex.mutation("emails:updateEmailStatus", { 
        id: email._id, 
        status: "failed", 
        error: error.message 
      });
    }
  }
  
  res.status(200).end();
}
```

### 4. Monitoring and Management

- Implement a dashboard in the Email Management HUD Pane to monitor the email queue status.
- Use Bull's built-in events to track job progress and update the Convex database accordingly.

### 5. Scaling Considerations

- As the number of emails increases, consider scaling the Redis instance and adding more worker processes.
- Implement rate limiting to comply with Resend's API limits and avoid overwhelming the email service.

## Next Steps

1. Set up Redis and integrate Bull for email queueing
2. Implement the worker for processing queued emails
3. Update Convex schema and functions to work with the queueing system
4. Create a monitoring dashboard in the Email Management HUD Pane
5. Conduct load testing to ensure the system can handle high volumes of emails
6. Implement error handling and retry mechanisms for failed email sends

Remember to always follow best practices for email sending, including proper unsubscribe mechanisms and compliance with anti-spam laws.

[... Rest of the document remains unchanged ...]