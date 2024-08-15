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

## Thoughts on Condensing
- SidebarItemButton and SidebarItemIcon can be integrated into the main ChatsPane component
- Animation logic can be simplified or moved to a custom hook
- Consider using more generic names like "ChatItemButton" and "ChatItemIcon" in the new component
- Tooltip functionality can be kept, but may need to be adjusted for the new component structure