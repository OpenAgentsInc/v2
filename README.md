([Open-sourced August 29th.](https://x.com/OpenAgentsInc/status/1829308058679365748) Any horrific bugs please DM us!)

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
  - api/
  - share/
    - [threadId]/
      - page.tsx
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
  - ui/ - Contains shad-ui components. PRIORITIZE USING THESE COMPONENTS WHENEVER POSSIBLE!
    - alert-dialog, badge, button, card, codeblock, dialog, dropdown-menu, form, icons, input, label, scroll-area, select, separator, sheet, slider, sonner, switch, table, textarea, tooltip
- convex/
  - schema.ts - Main source of truth for data structures
  - messages/
    - saveChatMessage.ts - Contains the saveChatMessage function
    - fetchThreadMessages.ts - Retrieves all messages for a specific thread, ordered chronologically from oldest to newest
    - getLastMessage.ts - Fetches the most recent message for the authenticated user
    - getChatById.ts - Retrieves a specific chat message by its ID
    - index.ts - Exports all message-related functions for easy import
  - threads/
    - createNewThread.ts - Creates a new thread for a user, including optional metadata like title
    - createOrGetUser.ts - Creates a new user or retrieves an existing one based on Clerk user ID
    - deleteThread.ts - Deletes a thread and all its associated messages
    - generateTitle.ts - Generates a concise title for a thread based on its messages using AI
    - getLastEmptyThread.ts - Retrieves the most recent thread for a user that has no messages, useful for continuing empty conversations
    - getThreadMessages.ts - Fetches all messages for a specific thread, ordered chronologically from oldest to newest
    - getUserThreads.ts - Retrieves all threads associated with a specific user's Clerk ID, without any specific ordering
    - shareThread.ts - Generates and stores a share token for a thread, enabling sharing functionality
    - updateThreadData.ts - Updates thread metadata, specifically the title field
    - index.ts - Exports all thread-related functions for easy import
  - users/
    - createOrGetUser.ts - Creates a new user or retrieves an existing one based on Clerk user ID
    - getUserData.ts - Retrieves the first user record matching the given Clerk user ID
    - getUserBalance.ts - Fetches the user's credit balance, returning 0 if the user is not found
    - updateUserCredits.ts - Updates the user's credit balance
    - saveMessageAndUpdateBalance.ts - Saves a message and updates the user's balance accordingly
    - index.ts - Exports all user-related functions for easy import
- docs/ - Background info
  - refactor-notes/ - Notes of recent work done on major systems: may be helpful in catching up on recent developments
  - systems/ - Descriptions of how we implement specific systems
    - chat.md
    - dynamic-titles.md
    - email.md
    - monetization.md
    - panes.md
    - sharing-and-referrals.md
- hooks/
  - useChat.ts - Where most chat logic resides
- lib/
- panes/ - HUD panes
  - chat/ - Chat pane shows an individual chat (thread)
  - chats/ - Chats pane shows list of user chats (threads)
    - ChatActions.tsx
    - ChatItem.tsx
    - ChatShareDialog.tsx
    - ChatsPane.tsx
    - index.ts - Exports all
    - NewChatButton.tsx
    - useChatActions.ts
  - user/ - User pane shows name/avatar, settings, credit balance
- public/
- store/
- tools/
- types/
