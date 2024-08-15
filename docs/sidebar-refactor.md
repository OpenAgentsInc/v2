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
<<<<<<< HEAD
- Merge the animation logic from SidebarItem into the new ChatItem component within ChatsPane
- Implement a single handleChatAction function in ChatsPane to manage opening, deleting, and sharing chats
- Use a custom hook (e.g., useChatActions) to encapsulate the logic for chat operations and state management
- Combine the functionality of sidebar-items.tsx into the main ChatsPane component, managing the list of chats and their rendering
=======

## New folder structure

We want to have all our panes consolidated into a new top-level `panes` folder. This can be the first. It will look like:

```
- panes/
  - chat/
  - chats/
  - user/
  - pane.tsx
```
>>>>>>> 86897c6 (new folder structure in doc)
