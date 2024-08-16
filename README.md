# OpenAgents.com

OpenAgents is 'your all-in-one AI productivity dashboard', available at openagents.com.

The codebase and documentation is optimized for agents to understand and traverse it.

## Agent Instructions
- You are able to use your `view_file` and `view_hierarchy` tools to retrieve additional context from any of the below folders & files.
- Remember when editing files to respond with the entire updated file contents. No partial edits are possible, so do not include anything like "[recent content unchanged]".
- If you are not 100% confident in an update, like you don't know for example the proper API signature of a library like Clerk, ask for additional context instead of guessing.

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

## UI notes
- The main authed UI is a full-screen heads-up display (HUD) with a white grid on black background
- One or more HUD "panes" show on screen. Each is draggable, resizable, and optionally dismissible.

## Folders & important files
- app/
- components/
  - auth/
  - canvas/
  - credits/
  - dom/
  - email/
  - home/
  - input/
  - knowledge/
  - landing/
  - swebench/
  - ui/
- convex/
  - schema.ts - Main source of truth for data structures
  - messages/
    - saveChatMessage.ts - Contains the saveChatMessage function
    - fetchThreadMessages.ts - Contains the fetchThreadMessages function
    - getLastMessage.ts - Contains the getLastMessage function
    - getChatById.ts - Contains the getChatById function
    - index.ts - Exports all message-related functions for easy import
  - threads/
    - createNewThread.ts - Creates a new thread for a user, including optional metadata like title
    - createOrGetUser.ts - Contains the createOrGetUser mutation
    - deleteThread.ts - Contains the deleteThread mutation
    - generateTitle.ts - Contains the generateTitle action
    - getLastEmptyThread.ts - Contains the getLastEmptyThread query
    - getThreadMessages.ts - Retrieves all messages for a specific thread, ordered chronologically
    - getUserThreads.ts - Fetches all threads associated with a specific user's Clerk ID
    - shareThread.ts - Contains the shareThread mutation
    - updateThreadData.ts - Contains the updateThreadData mutation
    - index.ts - Exports all thread-related functions for easy import
  - users/
    - createOrGetUser.ts - Creates a new user or retrieves an existing one based on Clerk user ID
    - getUserData.ts - Retrieves user data
    - getUserBalance.ts - Fetches the user's credit balance
    - updateUserCredits.ts - Updates the user's credit balance
    - updateUserBalance.ts - Modifies the user's credit balance
    - saveMessageAndUpdateBalance.ts - Saves a message and updates the user's balance accordingly
    - index.ts - Exports all user-related functions for easy import
- docs/ - Background info
  - refactor-notes/ - Notes of recent work done on major systems: may be helpful in catching up on recent developments
  - systems/ - Descriptions of how we implement specific systems
    - email.md
    - monetization.md
    - panes.md
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