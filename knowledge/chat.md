# Chat implementation

This document shows the request lifecycle of the chat implementation. 

The openagentsinc/v2 codebase largely implements this now, but there is still some work to be done to fix bugs in the codebase and bring it entirely in line with this document. Treat this as source of truth.

A few points:
- All users must be logged in
  - We use Clerk for auth
- Database structure is simply `users`, `threads`, and `messages`.
  - See knowledge/database.md for more detail
- A user can have more than one thread open
- The user stays on the home route and the chat is loaded in a HUD-style draggable+resizable modal we call Pane 
  - Panes are managed in store/hud.ts

