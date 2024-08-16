# Chat System Implementation

OpenAgents implements chat functionality as a core feature of the platform. This document outlines the key components and processes involved in the chat system.

## Data Structure

The main source of truth for these data structures is defined in `convex/schema.ts`.

### User
```typescript
users: defineTable({
  clerk_user_id: v.string(),
  email: v.string(),
  image: v.optional(v.string()),
  credits: v.number(),
  createdAt: v.string(),
})
  .index('by_clerk_user_id', ['clerk_user_id'])
  .index('by_email', ['email'])
```

### Thread
```typescript
threads: defineTable({
  user_id: v.id("users"),
  clerk_user_id: v.string(),
  metadata: v.optional(v.object({})),
  createdAt: v.string(),
  shareToken: v.optional(v.string()),
})
  .index('by_user_id', ['user_id'])
  .index('by_clerk_user_id', ['clerk_user_id'])
  .index('by_shareToken', ['shareToken'])
```

### Message
```typescript
messages: defineTable({
  thread_id: v.id("threads"),
  clerk_user_id: v.string(),
  role: v.string(),
  content: v.string(),
  created_at: v.string(),
  tool_invocations: v.optional(v.object({})),
  finish_reason: v.optional(v.string()),
  total_tokens: v.optional(v.number()),
  prompt_tokens: v.optional(v.number()),
  completion_tokens: v.optional(v.number()),
  model_id: v.optional(v.string()),
  cost_in_cents: v.optional(v.number()),
})
  .index('by_thread_id', ['thread_id'])
  .index('by_clerk_user_id', ['clerk_user_id'])
```

## Front-end Components

1. **Chat Pane**: Located in `panes/chat/`, this component displays an individual chat (thread).
2. **Chats Pane**: Located in `panes/chats/`, this component shows a list of user chats (threads).
3. **User Pane**: Located in `panes/user/`, this component displays user information, including settings that may affect chat behavior.

## Core Logic

The majority of the chat logic resides in the `useChat.ts` hook, located in the `hooks/` directory. This hook likely handles:

- Fetching and updating chat messages
- Sending new messages
- Managing chat state

## UI Implementation

The chat interface is part of the main authenticated UI, which is a full-screen heads-up display (HUD) with a white grid on a black background. Chat-related panes (Chat, Chats, and User) are draggable, resizable, and optionally dismissible.

## Tech Stack Integration

The chat system leverages several key technologies in the stack:

- **Next.js & React**: For rendering the chat interface and managing component state.
- **Zustand**: Likely used for global state management related to chat.
- **Convex**: Used for real-time data synchronization and storage of chat-related data.
- **Clerk**: Handles user authentication, which is crucial for associating chats with users.
- **Shad UI**: Provides UI components that may be used in building the chat interface.

## Additional Notes

- The chat system integrates with a credit system, as seen in the `users` table schema.
- Messages can include tool invocations, suggesting integration with external tools or AI capabilities.
- The system tracks token usage and costs, likely for billing or usage monitoring purposes.
- Threads can be shared via a `shareToken`, indicating a feature for sharing conversations.
- The `messages` table includes fields for tracking AI model usage, such as `model_id` and token counts.

For more detailed information on specific aspects of the chat system, refer to the relevant files in the codebase, particularly `useChat.ts`, the pane components, and the Convex data files.