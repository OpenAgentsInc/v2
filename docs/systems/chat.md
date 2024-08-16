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

The chat system is implemented using several React components:

1. **Chat Pane**: Located in `panes/chat/Chat.tsx`, this component is the main container for an individual chat thread.
   - Uses the `useChat` hook to manage messages, send messages, and handle loading states.
   - Implements auto-scrolling using the `useChatScroll` hook.
   - Renders a `ChatList` component to display messages and an `InputBar` component for message input.

2. **ChatList**: Located in `panes/chat/ChatList.tsx`, this component renders the list of messages in a chat thread.

3. **ChatMessage**: Located in `panes/chat/ChatMessage.tsx`, this component renders individual chat messages.

4. **InputBar**: Located in `components/input/InputBar.tsx`, this component handles user input for sending messages.

5. **Chats Pane**: Located in `panes/chats/`, this component shows a list of user chats (threads).

6. **User Pane**: Located in `panes/user/`, this component displays user information, including settings that may affect chat behavior.

## Core Logic

The majority of the chat logic resides in the `useChat.ts` hook, located in the `hooks/` directory. This hook provides the following functionality:

### useChat Hook
- Manages the state of messages for a specific thread
- Handles sending new messages
- Fetches messages for a thread
- Updates the thread in the store when messages are fetched

### useChatActions Hook
- Handles creating new chat threads

### useThreadList Hook
- Retrieves the list of chat threads for the current user

### useChatScroll Hook
- Manages auto-scrolling behavior for the chat interface

## UI Implementation

The chat interface is part of the main authenticated UI, which is a full-screen heads-up display (HUD) with a white grid on a black background. Chat-related panes (Chat, Chats, and User) are draggable, resizable, and optionally dismissible.

The main Chat component (`panes/chat/Chat.tsx`) uses a flex layout to ensure proper positioning of the message list and input bar:
- The message list takes up the majority of the space with `flex-1` and `overflow-auto`.
- The input bar is positioned at the bottom using `sticky bottom-0`.

## Tech Stack Integration

The chat system leverages several key technologies in the stack:

- **Next.js & React**: For rendering the chat interface and managing component state.
- **Zustand**: Used for global state management related to chat (useChatStore).
- **Convex**: Used for real-time data synchronization and storage of chat-related data.
- **Clerk**: Handles user authentication, which is crucial for associating chats with users.
- **Shad UI**: Provides UI components that may be used in building the chat interface.

## Key Features

1. **Real-time messaging**: Messages are sent and received in real-time using Convex mutations and queries.
2. **Thread management**: Users can create new chat threads and switch between existing ones.
3. **Message persistence**: All messages are stored in the Convex database and can be retrieved for each thread.
4. **User authentication**: Clerk is used to authenticate users and associate messages with specific users.
5. **Error handling**: The system includes error handling for message sending and thread creation failures.
6. **Loading states**: Loading states are managed to provide feedback to users during operations.
7. **Thread metadata**: Threads can have metadata such as titles and last message previews.
8. **Auto-scrolling**: The chat interface automatically scrolls to the latest message when new messages are added.
9. **Responsive design**: The chat interface is designed to be responsive and work well on various screen sizes.

## Additional Notes

- The chat system integrates with a credit system, as seen in the `users` table schema.
- Messages can include tool invocations, suggesting integration with external tools or AI capabilities.
- The system tracks token usage and costs, likely for billing or usage monitoring purposes.
- Threads can be shared via a `shareToken`, indicating a feature for sharing conversations.
- The `messages` table includes fields for tracking AI model usage, such as `model_id` and token counts.

For more detailed information on specific aspects of the chat system, refer to the relevant files in the codebase, particularly `useChat.ts`, the pane components, and the Convex data files.