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