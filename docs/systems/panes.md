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

### Chat Pane Behavior

When a new chat pane is opened:
- The Chats pane must always remain visible and should never be replaced or removed.
- If only one chat pane was previously open, the new chat pane replaces it, maintaining the same x/y/width/height.
- If the command button (on macOS) or its equivalent (on other operating systems) is held down while clicking, the new chat pane is tiled with an offset, keeping the previous pane(s) open.
- The first chat pane opened should take up most of the screen, not inheriting the size of the Chats pane.
- This behavior applies specifically to chat panes and should not affect other pane types.

## Implementation Details

- The `PaneManager` component in `panes/PaneManager.tsx` is responsible for rendering all panes.
- Pane state is managed using Zustand, with the store defined in `store/pane.ts`.
- The initial state includes a default Chats pane.
- The `openChatPane` function in `store/hudActions.ts` handles the logic for opening new chat panes while preserving the Chats pane.

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
- Updated chat pane behavior to replace existing pane or tile with offset based on user interaction.

## Key Implementation Points

1. **Preserving the Chats Pane**: 
   - The `openChatPane` function in `store/hudActions.ts` should always check for the existence of the Chats pane.
   - If the Chats pane is not present, it should be created with default properties.
   - The Chats pane should always be moved to the beginning of the panes array to ensure it's rendered first.

2. **Handling New Chat Panes**:
   - When opening a new chat pane, the function should first filter existing chat panes.
   - If it's the first chat pane, it should take up most of the screen.
   - If replacing an existing chat pane, it should maintain the same position and size.
   - When tiling, it should add an offset to the position of the last pane.

3. **Command Key Behavior**:
   - The `isCommandKeyHeld` parameter in `openChatPane` determines whether to replace an existing chat pane or tile a new one.
   - This parameter should be passed from the UI component that triggers the new chat pane creation.

## Usage

To add a new pane type:
1. Create a new component for the pane content.
2. Export the component from `panes/index.ts`.
3. Add a new condition in `PaneManager.tsx` to render the new pane type.
4. Update the pane store in `store/pane.ts` if a default instance of the new pane is needed.
5. If the new pane type requires special behavior, update the relevant functions in `store/hudActions.ts`.

## Common Pitfalls to Avoid

1. Never remove or replace the Chats pane when opening a new chat pane.
2. Ensure that the Chats pane is always at the beginning of the panes array.
3. When implementing new pane types, consider how they interact with existing panes, especially the Chats pane.
4. Always test new pane-related features with various combinations of open panes to ensure consistent behavior.

Remember to keep this documentation updated when making changes to the pane system. When in doubt, refer to the implementation in `store/hudActions.ts` and `store/pane.ts` for the most up-to-date logic.