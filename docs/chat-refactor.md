# Chat Refactor Plan

This document outlines the plan for refactoring the chat-related components and functionality in our project.

## Objectives

1. Move and consolidate the `components/chat/` directory to `panes/chat/`
2. Refactor and simplify the duplicates between `store/chat.ts` and `hooks/useChat.ts`
3. Ensure the chat pane consumes the refactored functionality correctly

## Step 1: Move and Consolidate `components/chat/` to `panes/chat/`

1. Create a new directory: `panes/chat/`
2. Move all files from `components/chat/` to `panes/chat/`
3. Update import statements in all moved files to reflect the new directory structure
4. Update any files that import from `components/chat/` to import from `panes/chat/` instead
5. Remove the now-empty `components/chat/` directory

## Step 2: Refactor `store/chat.ts` and `hooks/useChat.ts`

1. Analyze the contents of both files to identify duplicated functionality
2. Create a new file `panes/chat/chatUtils.ts` to house shared functionality
3. Move common functions and types to `chatUtils.ts`
4. Update `store/chat.ts`:
   - Import shared functionality from `chatUtils.ts`
   - Remove any duplicated code
   - Ensure it only contains store-specific logic
5. Update `hooks/useChat.ts`:
   - Import shared functionality from `chatUtils.ts`
   - Remove any duplicated code
   - Ensure it only contains hook-specific logic
6. If possible, consider merging `store/chat.ts` into `hooks/useChat.ts` if there's significant overlap

## Step 3: Update Chat Pane to Use Refactored Functionality

1. Locate the main chat pane component (likely in `panes/chat/ChatPane.tsx` or similar)
2. Update imports to use the refactored `useChat` hook and any other necessary imports from `chatUtils.ts`
3. Ensure all chat functionality is working correctly with the refactored code
4. Remove any unused imports or code that's no longer necessary due to the refactor

## Step 4: Testing and Verification

1. Run the application and thoroughly test all chat-related functionality
2. Ensure that creating, sending, and receiving messages work as expected
3. Verify that any chat-specific features (e.g., code highlighting, markdown rendering) are still functioning
4. Check for any console errors or warnings related to the refactored code

## Step 5: Code Cleanup and Documentation

1. Remove any commented-out code that's no longer needed
2. Update comments and documentation in the refactored files to reflect the new structure
3. Update any project-wide documentation that references the old chat component structure or store/hook usage
