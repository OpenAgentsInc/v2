# Pane Refactor - 2024-08-16

## Overview

This document outlines the refactoring of the pane-related code in our project. The goal was to split the functionality from `store/pane.ts`, `store/paneUtils.ts`, and `store/hudActions.ts` into smaller, more focused functions across multiple files.

## New Structure

We propose the following new structure:

```
store/panes/
├── types.ts
├── constants.ts
├── utils/
│   ├── calculatePanePosition.ts
│   ├── adjustPanePosition.ts
│   ├── createNewPaneWithPosition.ts
│   ├── ensureChatsPaneExists.ts
│   └── handleChatPanePosition.ts
├── actions/
│   ├── addPane.ts
│   ├── removePane.ts
│   ├── updatePanePosition.ts
│   ├── updatePaneSize.ts
│   ├── openChatPane.ts
│   ├── bringPaneToFront.ts
│   └── setActivePane.ts
└── index.ts
```

## Refactored Code

Here's a consolidated version of the refactored code:

\`\`\`typescript
// store/panes/types.ts
import { Id } from "../../convex/_generated/dataModel";

export interface Pane {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  chatId?: Id<"chats">;
}

export interface PaneState {
  panes: Pane[];
  activePane: string | null;
}

// store/panes/constants.ts
export const PANE_WIDTH = 400;
export const PANE_HEIGHT = 300;
export const PANE_MARGIN = 20;

// store/panes/utils/calculatePanePosition.ts
import { Pane } from '../types';
import { PANE_WIDTH, PANE_HEIGHT, PANE_MARGIN } from '../constants';

export function calculatePanePosition(panes: Pane[]): { x: number; y: number } {
  // Implementation here
}

// store/panes/utils/adjustPanePosition.ts
import { Pane } from '../types';

export function adjustPanePosition(pane: Pane, panes: Pane[]): { x: number; y: number } {
  // Implementation here
}

// store/panes/utils/createNewPaneWithPosition.ts
import { Pane } from '../types';
import { calculatePanePosition } from './calculatePanePosition';
import { PANE_WIDTH, PANE_HEIGHT } from '../constants';

export function createNewPaneWithPosition(type: string, panes: Pane[]): Pane {
  // Implementation here
}

// store/panes/utils/ensureChatsPaneExists.ts
import { Pane } from '../types';
import { createNewPaneWithPosition } from './createNewPaneWithPosition';

export function ensureChatsPaneExists(panes: Pane[]): Pane[] {
  // Implementation here
}

// store/panes/utils/handleChatPanePosition.ts
import { Pane } from '../types';
import { adjustPanePosition } from './adjustPanePosition';

export function handleChatPanePosition(chatPane: Pane, panes: Pane[]): Pane {
  // Implementation here
}

// store/panes/actions/addPane.ts
import { Pane, PaneState } from '../types';
import { createNewPaneWithPosition } from '../utils/createNewPaneWithPosition';

export function addPane(state: PaneState, type: string): PaneState {
  // Implementation here
}

// store/panes/actions/removePane.ts
import { PaneState } from '../types';

export function removePane(state: PaneState, paneId: string): PaneState {
  // Implementation here
}

// store/panes/actions/updatePanePosition.ts
import { PaneState } from '../types';

export function updatePanePosition(state: PaneState, paneId: string, x: number, y: number): PaneState {
  // Implementation here
}

// store/panes/actions/updatePaneSize.ts
import { PaneState } from '../types';

export function updatePaneSize(state: PaneState, paneId: string, width: number, height: number): PaneState {
  // Implementation here
}

// store/panes/actions/openChatPane.ts
import { Id } from "../../../convex/_generated/dataModel";
import { PaneState } from '../types';
import { ensureChatsPaneExists } from '../utils/ensureChatsPaneExists';
import { handleChatPanePosition } from '../utils/handleChatPanePosition';

export function openChatPane(state: PaneState, chatId: Id<"chats">): PaneState {
  // Implementation here
}

// store/panes/actions/bringPaneToFront.ts
import { PaneState } from '../types';

export function bringPaneToFront(state: PaneState, paneId: string): PaneState {
  // Implementation here
}

// store/panes/actions/setActivePane.ts
import { PaneState } from '../types';

export function setActivePane(state: PaneState, paneId: string | null): PaneState {
  // Implementation here
}

// store/panes/index.ts
export * from './types';
export * from './constants';
export * from './utils/calculatePanePosition';
export * from './utils/adjustPanePosition';
export * from './utils/createNewPaneWithPosition';
export * from './utils/ensureChatsPaneExists';
export * from './utils/handleChatPanePosition';
export * from './actions/addPane';
export * from './actions/removePane';
export * from './actions/updatePanePosition';
export * from './actions/updatePaneSize';
export * from './actions/openChatPane';
export * from './actions/bringPaneToFront';
export * from './actions/setActivePane';
\`\`\`

## Next Steps

1. Implement the logic for each function in their respective files.
2. Update `store/pane.ts` to use the new structure and imported functions.
3. Remove the old `store/paneUtils.ts` and `store/hudActions.ts` files.
4. Update any imports in other files that were using the old structure.
5. Test thoroughly to ensure all functionality is preserved.

## Benefits of this Refactor

1. Improved code organization and maintainability
2. Better separation of concerns
3. Easier to test individual functions
4. More flexibility for future changes and additions

## Updating store/pane.ts

The `store/pane.ts` file needs to be updated to use the new structure. Here's an outline of the changes:

1. Import all necessary functions and types from the new `store/panes/index.ts` file.
2. Replace the existing pane-related logic with calls to the new functions.
3. Update the state management to use the new `PaneState` type.
4. Ensure that all existing functionality is preserved while using the new structure.

Example:

\`\`\`typescript
import { create } from 'zustand';
import { PaneState, addPane, removePane, updatePanePosition, updatePaneSize, openChatPane, bringPaneToFront, setActivePane } from './panes';

const usePane = create<PaneState>((set) => ({
  panes: [],
  activePane: null,
  addPane: (type: string) => set((state) => addPane(state, type)),
  removePane: (paneId: string) => set((state) => removePane(state, paneId)),
  updatePanePosition: (paneId: string, x: number, y: number) => set((state) => updatePanePosition(state, paneId, x, y)),
  updatePaneSize: (paneId: string, width: number, height: number) => set((state) => updatePaneSize(state, paneId, width, height)),
  openChatPane: (chatId: Id<"chats">) => set((state) => openChatPane(state, chatId)),
  bringPaneToFront: (paneId: string) => set((state) => bringPaneToFront(state, paneId)),
  setActivePane: (paneId: string | null) => set((state) => setActivePane(state, paneId)),
}));

export default usePane;
\`\`\`

This refactor will significantly improve the organization and maintainability of the pane-related code in the project.