# OpenAgents.com

## Tech stack
- Next.js v14 (app router)
- React v18.3
- Tailwind
- Zustand
- Convex
- Clerk
- Vercel hosting
- Shad UI components + custom HUD panes

## Primary data types
- Message
- Thread - What we call 'chats' in the front-end
- User

## Folders & important files
- app/
- components/
- convex/
  - messages.ts
  - schema.ts - Main source of truth for data structures
  - threads.ts
  - users.ts
- docs/
- hooks/
  - useChat.ts - Where most chat logic resides
- lib/
- panes/ - HUD panes
  - chat/ - Chat pane shows an individual chat (thread)
  - chats/ - Chats pane shows list of user chats (threads)
  - user/ - User pane shows name/avatar, settings, credit balance
- public/
- store/
- tools/
- types/
