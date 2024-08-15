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

## Thoughts on Condensing
- SidebarItemButton, SidebarItemIcon, and chat-history can be integrated into the main ChatsPane component
- Keep the core functionality of chat-history (data fetching, mutations, sorting) in the new ChatsPane
- NewChatButton and SidebarList components can be directly incorporated into ChatsPane
- Animation logic can be simplified or moved to a custom hook
- Consider using more generic names for sub-components (e.g., "ChatItem" instead of "SidebarItem")
- Tooltip functionality can be kept, but may need to be adjusted for the new component structure
- Maintain the loading state handling with skeleton loaders in the new component