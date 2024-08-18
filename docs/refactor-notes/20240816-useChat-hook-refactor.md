# useChat Hook Refactor

Date: 2024-08-16

## Summary of Changes

We have refactored the `useChat.ts` file to improve code organization, maintainability, and readability. The main changes include:

1. Created a new directory `hooks/chat/` to contain all chat-related hooks.
2. Split the original `useChat.ts` file into five new files:
   - `useChatCore.ts`: Contains the main `useChat` hook logic.
   - `useChatActions.ts`: Contains the `useChatActions` hook for creating new threads.
   - `useThreadList.ts`: Contains the `useThreadList` hook for fetching and managing the list of threads.
   - `types.ts`: Contains shared types and interfaces used across the chat hooks.
   - `index.ts`: Re-exports all the hooks and types from the chat directory.
3. Updated the original `hooks/useChat.ts` file to re-export everything from the new `chat` directory.

## Benefits

This new structure offers several benefits:
- Improved code organization and readability
- Easier maintenance and testing of individual components
- Better separation of concerns
- Simplified imports for consumers of these hooks

## Usage

To use these hooks in components, developers can now import them like this:

```typescript
import { useChat, useChatActions, useThreadList } from '@/hooks/useChat'
```

This change maintains the existing API while providing a more modular and maintainable structure for the chat-related hooks.

## Next Steps

- Update any components or tests that directly import from `hooks/useChat.ts` to ensure they still work with the new structure.
- Consider adding unit tests for each individual hook in the new structure.
- Review and update documentation to reflect the new file structure and import patterns.