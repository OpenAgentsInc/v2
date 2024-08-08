# Chat implementation

This document shows the request lifecycle of the chat implementation. 

The openagentsinc/v2 codebase largely implements this now, but there is still some work to be done to fix bugs in the codebase and bring it entirely in line with this document. Treat this as source of truth.

A few points:
- The codebase uses Next.js v14 (app router) with React v18, TypeScript, and Vercel Postgres
- All users must be logged in via Clerk
- Database structure is simply `users`, `threads`, and `messages`.
  - See knowledge/database.md for more detail
- A user can have more than one thread open
- The user stays on the home route and the chat is loaded in a HUD-style draggable+resizable modal we call Pane 
  - Panes are managed in store/hud.ts

## Request Lifecycle
- An authed user visits the home route @ openagents.com
- The `middleware.ts` file uses the default Clerk middleware so methods like `auth()` and `getCurrentUser()` are available. (Those two methods are server-only)
- `app/layout.tsx` calls `initDatabase()` to initialize the database connection and ensure seed data is present (temporary)
- The main catchall route `app/[[...rest]]/page.tsx` confirms the user is logged in and shows the `HomeDashboard` component
- Server component `components/dashboard/HomeDashboard.tsx` renders a pane with the user's chat history and the HUD
- Client component `components/hud/hud.tsx` renders all chat panes managed by the hud store
  - Panes are defined in `components/hud/pane.tsx` and managed in `store/hud.ts`
- Each chat pane has a child Chat component defined in `components/chat.tsx` 

