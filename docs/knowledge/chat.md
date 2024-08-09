# Chat implementation

This document shows the request lifecycle of the chat implementation and key components of the chat functionality.

The openagentsinc/v2 codebase implements this now, with recent updates to the "New Chat" functionality.

Key points:
- The codebase uses Next.js v14 (app router) with React v18, TypeScript, and Vercel Postgres
- All users must be logged in via Clerk
- Database structure is simply `users`, `threads`, and `messages`.
  - See knowledge/database.md for more detail
- A user can have more than one thread open
- The user stays on the home route and the chat is loaded in a HUD-style draggable+resizable modal we call Pane 
  - Panes are managed in store/hud.ts

## Request Lifecycle
1. An authed user visits the home route @ openagents.com
2. The `middleware.ts` file uses the default Clerk middleware so methods like `auth()` and `getCurrentUser()` are available. (Those two methods are server-only)
3. `app/layout.tsx` calls `initDatabase()` to initialize the database connection and ensure seed data is present (temporary / commented out for now)
   - `initDatabase()` in `lib/init-db.ts` ensures the `seed()` function runs only once when the app starts
   - `lib/db/seed.ts` seeds the database with test data
4. The main catchall route `app/[[...rest]]/page.tsx` confirms the user is logged in and shows the `HomeDashboard` component
5. Server component `components/dashboard/HomeDashboard.tsx` renders a pane with the user's chat history and the HUD
6. Client component `components/hud/hud.tsx` renders all chat panes managed by the hud store
   - Panes are defined in `components/hud/pane.tsx` and managed in `store/hud.ts`
7. Each chat pane has a child Chat component defined in `components/chat.tsx` 
   - The Chat component receives the `id` prop, which corresponds to the thread ID

## New Chat Functionality
The "New Chat" button in the sidebar creates a new chat pane with a fresh thread. Here's how it works:

1. The `NewChatButton` component (`components/new-chat-button.tsx`) is rendered in the `ChatHistory` component (`components/chat-history.tsx`).
2. When clicked, the `NewChatButton` uses the `addPane` function from the `useHudStore` (defined in `store/hud.ts`) to create a new chat pane.
3. The `HUD` component (`components/hud/hud.tsx`) renders all chat panes, including the newly created one.
4. Each chat pane renders a `Chat` component with a unique `id` prop, ensuring that each chat has its own thread.

This implementation allows users to create and manage multiple chat threads simultaneously, enhancing the overall user experience and functionality of the application.

## Chat Thread ID Creation and Management

The current implementation of chat thread ID creation and management has some issues that need to be addressed. Here's an overview of how it currently works and the areas that need improvement:

### Current Implementation

1. New Chat Button (components/new-chat-button.tsx):
   - When clicked, it generates a new thread ID using `'new-thread-' + Date.now()`.
   - This temporary ID is set as the current thread ID in the chat store.
   - A new pane is added to the HUD with this temporary ID.

2. Chat Component (components/chat.tsx):
   - Receives an `id` prop (propId) which may be undefined for new chats.
   - Uses the `useChat` hook with this propId.
   - Also uses the `useThreadCreation` hook, which may create a new thread ID.

3. useChat Hook (hooks/useChat.ts):
   - Manages the thread ID state, using either the propId, currentThreadId from the store, or a newly created ID.
   - Uses the `useThreadCreation` hook to create a new thread if needed.
   - Handles the creation of new threads and updating of the current thread ID in the store.

4. useThreadCreation Hook (hooks/useThreadCreation.ts):
   - Responsible for creating a new thread by making a POST request to '/api/thread'.
   - Returns the new thread ID created by the server.

### Issues and Areas for Improvement

1. Temporary String IDs:
   - The `NewChatButton` component generates temporary string IDs (`'new-thread-' + Date.now()`) instead of using proper database-generated IDs.
   - These temporary IDs are used in the chat store and for creating new panes, which can lead to inconsistencies.

2. Asynchronous Thread Creation:
   - The thread creation process is asynchronous, but the current implementation doesn't handle this properly in all cases.
   - There's a potential race condition between setting the temporary ID and creating the actual thread.

3. ID Type Inconsistency:
   - The codebase uses string IDs throughout, but the database likely uses integer IDs for threads.
   - This inconsistency can lead to type mismatches and potential errors.

4. Multiple ID States:
   - There are multiple places where the thread ID is stored or managed (chat store, local state in useChat, useThreadCreation), which can lead to synchronization issues.

5. Error Handling:
   - The error handling for thread creation is minimal and doesn't provide a clear way to recover or retry if thread creation fails.

### Refactoring Suggestions

1. Remove Temporary IDs:
   - Eliminate the use of temporary string IDs in the `NewChatButton` component.
   - Instead, create a new thread immediately when the button is clicked and use the returned ID from the server.

2. Unify ID Management:
   - Centralize the management of thread IDs, possibly in the chat store.
   - Ensure that all components and hooks use the same source of truth for thread IDs.

3. Type Consistency:
   - Use a consistent type for thread IDs throughout the application, preferably matching the database type (likely number).
   - Update all relevant interfaces and type definitions to reflect this change.

4. Improve Asynchronous Handling:
   - Implement proper loading states and error handling for thread creation.
   - Ensure that the UI reflects the current state of thread creation (loading, success, error).

5. Simplify Thread Creation Flow:
   - Consider moving the thread creation logic entirely to the `NewChatButton` component or a dedicated service.
   - Ensure that a new pane is only added after a thread has been successfully created.

6. Update API and Database Interactions:
   - Modify the '/api/thread' endpoint to always return an integer ID.
   - Update all database queries and insertions to use the correct ID type.

7. Improve Error Recovery:
   - Implement a retry mechanism for thread creation in case of network errors.
   - Provide clear feedback to the user if thread creation fails and offer options to retry or cancel.

By addressing these issues and implementing the suggested refactoring, the chat system will become more robust, consistent, and easier to maintain. The use of proper database-generated integer IDs will ensure data integrity and improve overall system reliability.