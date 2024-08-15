# Sidebar Refactor: Condensing into ChatsPane

## Current Components

### SidebarItemButton.tsx
- Renders a button for sidebar items
- Uses Framer Motion for animations
- Props: onClick, isOpen, isActive, title, shouldAnimate
- Conditional rendering based on props
- Animates text when shouldAnimate is true

### SidebarItemIcon.tsx
- Renders an icon for sidebar items
- Uses IconMessage and IconUsers from custom UI components
- Includes a tooltip for shared chats
- Props: sharePath (optional)
- Conditionally renders different icons based on sharePath

### chat-history.tsx
- Main component for managing chat history in the sidebar
- Uses Convex for data fetching and mutations
- Implements functions for adding, removing, and sharing chats
- Renders NewChatButton and SidebarList components
- Handles loading state with skeleton loaders
- Sorts chats by creation date

### new-chat-button.tsx
- Renders a button to create a new chat
- Uses Convex mutations to create a new user (if needed) and a new thread
- Handles the creation process with loading state
- Adds the new chat to the list and opens a new chat pane
- Integrates with HUD store for opening chat panes

### sidebar-actions.tsx
- Provides action buttons for each chat item (delete and share)
- Uses AlertDialog for delete confirmation
- Implements share functionality with clipboard API
- Handles loading states for both delete and share actions
- Integrates with Next.js router for navigation after delete

### sidebar-desktop.tsx
- Server component for rendering the desktop sidebar
- Uses Clerk for authentication
- Renders the Sidebar component with ChatHistory
- Applies responsive styling for desktop view

### sidebar-footer.tsx
- Simple component for rendering the footer of the sidebar
- Accepts children and className props
- Applies default styling for flex layout and padding

### sidebar-item.tsx
- Renders individual chat items in the sidebar
- Handles chat selection, opening, and deletion
- Uses Framer Motion for animations
- Integrates with HUD store for pane management
- Displays icons for shared chats and delete action
- Implements click handlers for opening chats and deleting threads

### sidebar-items.tsx
- Renders a list of SidebarItem components
- Manages the list of chats and their deletion
- Passes down props to SidebarItem and SidebarActions components
- Handles chat deletion and updates the chat list accordingly

## Thoughts on Condensing
- Combine SidebarItemButton, SidebarItemIcon, chat-history, new-chat-button, sidebar-actions, sidebar-footer, sidebar-item, and sidebar-items into the main ChatsPane component
- Keep the core functionality of chat-history and new-chat-button (data fetching, mutations, sorting) in the new ChatsPane
- Simplify the component structure by integrating NewChatButton and SidebarActions directly into ChatsPane
- Move the chat creation logic from new-chat-button into a custom hook or utility function
- Consider using more generic names for sub-components (e.g., "ChatItem" instead of "SidebarItem")
- Maintain the loading state handling for chat list, new chat creation, and chat actions
- Ensure that the HUD store integration for opening chat panes is preserved in the new component
- Keep the AlertDialog for delete confirmation, but consider moving it to a separate component for reusability
- Optimize the component to reduce prop drilling by using context or custom hooks where appropriate
- Consolidate icon components (IconShare, IconTrash) into a shared icon library if not already done
- Consider creating a custom hook for handling chat actions (delete, share) to simplify the main component
- Retain the server-side rendering approach for the desktop sidebar, but integrate it with the new ChatsPane component
- Ensure that the responsive styling for desktop view is maintained in the new component structure
- Incorporate the footer functionality directly into the ChatsPane component, allowing for flexible content in the footer area
- Merge the animation logic from SidebarItem into the new ChatItem component within ChatsPane
- Implement a single handleChatAction function in ChatsPane to manage opening, deleting, and sharing chats
- Use a custom hook (e.g., useChatActions) to encapsulate the logic for chat operations and state management
- Combine the functionality of sidebar-items.tsx into the main ChatsPane component, managing the list of chats and their rendering

## New folder structure

We want to have all our panes consolidated into a new top-level `panes` folder. This can be the first. It will look like:

```
- panes/
  - chat/
  - chats/
  - user/
  - pane.tsx
```

## Pane Usage in HUD

The HUD (Heads-Up Display) system in the application uses a pane-based architecture to manage different UI components. Here's an overview of how panes are used:

1. Pane Management:
   - The HUD store (store/hud.ts) manages the state of all panes using Zustand.
   - Panes are stored in an array, allowing for multiple panes to be open simultaneously.
   - Each pane has properties like position (x, y), size (width, height), and a unique ID.

2. Pane Actions:
   - addPane: Adds a new pane to the HUD, with an option to tile it alongside existing panes.
   - removePane: Removes a pane from the HUD based on its ID.
   - updatePanePosition: Updates the position of a specific pane.
   - updatePaneSize: Updates the size of a specific pane.
   - openChatPane: Specifically opens a chat pane, likely with pre-configured settings.
   - bringPaneToFront: Moves a pane to the top of the visual stack.
   - setActivePane: Sets a specific pane as the active (focused) pane.

3. Chat Integration:
   - The HUD store tracks whether the chat is open (isChatOpen).
   - It provides a method to open chat panes (openChatPane), which is likely used when starting new conversations.

4. Terminal Integration:
   - The HUD store keeps track of the active terminal ID (activeTerminalId).
   - This suggests that terminal functionality is integrated into the pane system, allowing for multiple terminal instances.

5. Input Handling:
   - The store tracks whether an input is focused (isInputFocused) and whether the repo input is open (isRepoInputOpen).
   - These states help manage focus and keyboard interactions across different panes and inputs.

6. Persistence:
   - The HUD store uses Zustand's persist middleware to save certain state (panes and lastPanePosition) to local storage.
   - This allows the application to restore the user's workspace layout on page reload or revisit.

7. Pane Positioning:
   - The calculatePanePosition utility is exported, suggesting that there's logic to automatically position new panes based on existing ones.

8. Component Integration:
   - The components in the components/hud/ directory (UserStatus.tsx, balance.tsx, hud.tsx, pane.tsx) likely use the HUD store to render and manage individual panes and their contents.

This pane-based architecture allows for a flexible and dynamic user interface, where users can open, close, move, and resize different components of the application as needed. The ChatsPane refactor should integrate seamlessly with this existing pane management system, utilizing the HUD store for state management and pane operations.