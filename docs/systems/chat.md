# Chat System Implementation

OpenAgents implements chat functionality as a core feature of the platform. This document outlines the key components and processes involved in the chat system.

## Data Structure

The main source of truth for these data structures is defined in `convex/schema.ts`.

[Data structure definitions remain unchanged]

## Front-end Components

[Front-end component descriptions remain unchanged]

## Core Logic

The majority of the chat logic resides in the `useChat.ts` hook, located in the `hooks/` directory. This hook provides the following functionality:

### useChat Hook
- Wraps and extends the Vercel UI useChat hook
- Manages the state of messages for a specific thread
- Handles sending new messages
- Fetches messages for a thread
- Updates the thread in the store when messages are fetched
- Integrates with custom backend actions for thread and message management
- Handles error states and user balance updates

[Other hook descriptions remain unchanged]

## UI Implementation

[UI implementation details remain unchanged]

## Tech Stack Integration

[Tech stack integration details remain unchanged]

## Key Features

[Key features remain unchanged]

## Implementation Details

[Implementation details remain unchanged]

## Recent Changes and Integration

[Recent changes and integration details remain unchanged]

## Chat Pane Behavior

The chat system is closely integrated with the pane management system. Here are the key points to remember:

1. **Chats Pane Persistence**: 
   - The Chats pane (listing all chat threads) must always remain visible.
   - It should never be replaced or removed when opening new chat panes.

2. **Opening New Chat Panes**:
   - When opening a new chat pane, the behavior depends on the current state and user interaction:
     a. If it's the first chat pane, it should occupy most of the screen.
     b. If there's one existing chat pane and the command key is not held, it replaces the existing chat pane.
     c. If the command key is held or there are multiple chat panes, it tiles the new pane with an offset.

3. **Implementation Location**:
   - The logic for this behavior is primarily implemented in the `openChatPane` function in `store/hudActions.ts`.

4. **Key Considerations**:
   - Always check for the existence of the Chats pane before manipulating panes.
   - Ensure the Chats pane is always at the beginning of the panes array.
   - When replacing or tiling chat panes, maintain the position and size appropriately.

5. **UI Integration**:
   - The UI component that triggers new chat pane creation (e.g., `NewChatButton.tsx`) should pass the `isCommandKeyHeld` parameter to the `openChatPane` function.

6. **Testing**:
   - Always test new chat-related features with various combinations of open panes to ensure consistent behavior.

For more detailed information on the pane system, refer to the `docs/systems/panes.md` file.

## Additional Notes

[Additional notes remain unchanged]

For more detailed information on specific aspects of the chat system, refer to the relevant files in the codebase, particularly `hooks/useChat.ts`, the pane components, and the backend action files. Always ensure that changes to the chat system consider the implications on pane management and vice versa.