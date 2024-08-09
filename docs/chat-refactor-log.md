# Chat Refactor Log

## Notes on Refactor

### Step 1: Remove Temporary IDs
- Updated `components/new-chat-button.tsx`:
  - Removed the use of temporary string IDs
  - Implemented an asynchronous function to create a new thread using the API
  - Updated the `addPane` function to use the new thread ID returned from the API
  - Added error handling and loading state

### Step 2: Unify ID Management
- Updated `hooks/useChat.ts`:
  - Changed `currentThreadId` and `threads` in `ChatStore` to use `number` type instead of `string`
  - Updated `UseChatProps` to accept `id` as a `number`
  - Modified `useChat` hook to handle thread creation within the hook itself
  - Removed `useThreadCreation` hook and related logic
  - Updated type annotations throughout the file to use `number` for thread IDs
  - Modified `vercelChatProps` to use `threadId?.toString()` for compatibility

### Additional Changes to Address Type Errors
- Updated `components/chat-panel.tsx`:
  - Modified the `useChat` hook call to parse the `id` prop as a number: `id: id ? parseInt(id, 10) : undefined`
  - Removed `ChatPanelUI` import and replaced it with a regular `div`
  - Updated `ChatShareDialog` to use `chat` prop instead of `chatId`
  - Added `input`, `handleInputChange`, and `handleSubmit` props to `PromptForm`
  - Added conditional rendering for `ButtonScrollToBottom`

- Updated `components/chat.tsx`:
  - Changed the `useChat` hook call to parse the `propId` as a number: `id: propId ? parseInt(propId, 10) : undefined`
  - Removed `setInput` prop from `EmptyScreen`
  - Removed `isLoading` prop from `ChatPanel`
  - Updated `pane.paneProps?.id` to `pane.id` in the `useHudStore.setState` call

- Updated `components/new-chat-button.tsx`:
  - Modified the `addPane` function call to add `id` as a separate property instead of including it in `paneProps`

### Step 3: Fix Type Mismatches and Prop Issues
- Updated `hooks/useChat.ts`:
  - Added a function to adapt Vercel AI SDK Message type to our custom Message type
  - Modified the return value of `useChat` to include the adapted messages

- Updated `components/chat.tsx`:
  - Updated the `ChatList` component to use the correct Message type
  - Modified the `ChatPanel` component to receive the correct props

- Updated `components/chat-panel.tsx`:
  - Updated the component to accept and use the correct props (id, input, handleInputChange, handleSubmit)

These changes address the type errors and ensure consistency across the components. The next steps in the refactor should focus on:

1. Updating any remaining components or API routes that may still be using string-based IDs
2. Ensuring that all parts of the application are consistently using number-based thread IDs
3. Thoroughly testing the chat functionality to ensure it works as expected with the new integer-based thread ID system
4. Implementing additional error handling and user feedback throughout the chat system
5. Optimizing database queries related to thread and message retrieval
6. Implementing a caching mechanism for thread data to improve performance

Remember to test the following scenarios:
- Creating new chat threads
- Loading existing threads
- Sending and receiving messages within threads
- Switching between multiple open threads
- Handling error cases (e.g., network errors, invalid thread IDs)

By implementing these changes and following up with thorough testing and optimization, the chat system will become more robust, consistent, and easier to maintain.