# Panes

The application uses a pane-based system for managing different UI components. Each pane represents a distinct functional area of the application.

## Pane Types

- **Chat**: Displays an individual chat thread.
- **Chats**: Shows a list of chat threads.
- **User**: Displays user information and settings.
- **Diff**: Shows differences in content (e.g., for code comparisons).

## Pane Management

- Panes use string IDs for identification.
- For chat thread panes, the ID format is "thread-[string version of the convex ID]" (no brackets).
- The Chats pane has a fixed ID of 'chats'.

## Implementation Details

- The `PaneManager` component in `panes/PaneManager.tsx` is responsible for rendering all panes.
- Pane state is managed using Zustand, with the store defined in `store/pane.ts`.
- The initial state includes a default Chats pane.

## Components

- **Chat**: Renders an individual chat thread.
- **ChatsPane**: Renders the list of chat threads.
  - Displays the 25 most recent chats.
  - Chats are sorted in reverse chronological order (newest first).
  - Uses a dark theme with hover and active states for better user interaction.
- **ChatItem**: Represents a single chat in the ChatsPane.
  - Implements hover and tap animations for improved user feedback.
  - Shows/hides action buttons (share, delete) on hover.
  - Highlights the active chat.
- **UserStatus**: Displays user information and settings.

## Recent Changes

- Added support for the ChatsPane component in the `PaneManager`.
- Ensured proper initialization of the Chats pane in the pane store.
- Updated the `PaneManager` to render the ChatsPane component when the pane type is 'chats'.
- Modified ChatsPane to show only the 25 most recent chats in reverse chronological order.
- Implemented efficient sorting and limiting of chats using `useMemo` in ChatsPane.
- Updated ChatItem and ChatsPane components with new styling and interactions:
  - Implemented a dark theme for better visual consistency.
  - Added hover and active states for chat items.
  - Implemented show/hide functionality for action buttons on hover.
  - Added Framer Motion animations for smooth interactions.
- Integrated active chat highlighting in the ChatsPane.

## Usage

To add a new pane type:
1. Create a new component for the pane content.
2. Export the component from `panes/index.ts`.
3. Add a new condition in `PaneManager.tsx` to render the new pane type.
4. Update the pane store in `store/pane.ts` if a default instance of the new pane is needed.

Remember to keep this documentation updated when making changes to the pane system.