# Panes

The application uses a pane-based system for managing different UI components. Each pane represents a distinct functional area of the application.

## Pane Types

- **Chat**: Displays an individual chat thread.
- **Chats**: Shows a list of all chat threads.
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
- **ChatsPane**: Renders the list of all chat threads.
- **UserStatus**: Displays user information and settings.

## Recent Changes

- Added support for the ChatsPane component in the `PaneManager`.
- Ensured proper initialization of the Chats pane in the pane store.
- Updated the `PaneManager` to render the ChatsPane component when the pane type is 'chats'.

## Usage

To add a new pane type:
1. Create a new component for the pane content.
2. Export the component from `panes/index.ts`.
3. Add a new condition in `PaneManager.tsx` to render the new pane type.
4. Update the pane store in `store/pane.ts` if a default instance of the new pane is needed.

Remember to keep this documentation updated when making changes to the pane system.