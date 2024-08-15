# Sidebar Refactor: Condensing into ChatsPane

## Current Components

### SidebarItemButton.tsx
- Renders a button for sidebar items
- Uses Framer Motion for animations
- Props: onClick, isOpen, isActive, title, shouldAnimate
- Conditional rendering based on props
- Animates text when shouldAnimate is true

## Thoughts on Condensing
- SidebarItemButton can be integrated into the main ChatsPane component
- Animation logic can be simplified or moved to a custom hook
- Consider using a more generic name like "ChatItemButton" in the new component