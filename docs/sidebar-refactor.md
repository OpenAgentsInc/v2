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

## Thoughts on Condensing
- Combine SidebarItemButton, SidebarItemIcon, chat-history, and new-chat-button into the main ChatsPane component
- Keep the core functionality of chat-history and new-chat-button (data fetching, mutations, sorting) in the new ChatsPane
- Simplify the component structure by integrating NewChatButton directly into ChatsPane
- Move the chat creation logic from new-chat-button into a custom hook or utility function
- Consider using more generic names for sub-components (e.g., "ChatItem" instead of "SidebarItem")
- Maintain the loading state handling for both chat list and new chat creation
- Ensure that the HUD store integration for opening chat panes is preserved in the new component
- Tooltip functionality can be kept, but may need to be adjusted for the new component structure
- Optimize the component to reduce prop drilling by using context or custom hooks where appropriate