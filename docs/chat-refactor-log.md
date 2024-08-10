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
  - Added `input`, `handleInputChange`, and `handleSubmit` props to `PromptForm`
  - Added conditional rendering for `ButtonScrollToBottom`
  - Changed `id` prop type from `string` to `number`
  - Updated the `useHudStore.setState` call to use `id.toString()` for comparison
  - Fixed import paths for types (Message from '@/types', ServerActionResult and Chat from '@/lib/types')

- Updated `components/chat.tsx`:
  - Changed the `useChat` hook call to parse the `propId` as a number: `id: propId ? parseInt(propId, 10) : undefined`
  - Removed `setInput` prop from `EmptyScreen`
  - Removed `isLoading` prop from `ChatPanel`
  - Updated `pane.paneProps?.id` to `pane.id` in the `useHudStore.setState` call
  - Changed `id` prop type in `ChatProps` to `number`
  - Updated `useChat` hook call to directly use `number` type for `id`
  - Ensured all `useEffect` hooks and other logic handle `number` type for `id`

- Updated `components/new-chat-button.tsx`:
  - Modified the `addPane` function call to add `id` as a separate property instead of including it in `paneProps`

### Step 3: Fix Type Mismatches and Prop Issues
- Updated `hooks/useChat.ts`:
  - Added a function to adapt Vercel AI SDK Message type to our custom Message type
  - Modified the return value of `useChat` to include the adapted messages

### Step 4: Fix Import Path for Database Module
- Updated `app/api/thread/route.ts`:
  - Changed import path for `db` from `@/lib/db` to `db`

### Step 5: Update Chat Type Definition
- Updated `lib/types.ts`:
  - Changed the `id` property in the `Chat` interface from `string` to `number`:
    ```typescript
    export interface Chat extends Record<string, any> {
      id: number
      // ... other properties
    }
    ```

### Step 6: Update Components Using Chat Type
- Updated `components/sidebar-items.tsx`:
  - Changed `removeChatAsync` and `shareChatAsync` functions to use `number` type for `id`:
    ```typescript
    const removeChatAsync = async (args: { id: number; path: string }): Promise<ServerActionResult<void>> => {
      // ...
    }

    const shareChatAsync = async (id: number): Promise<ServerActionResult<Chat>> => {
      // ...
    }
    ```

- Updated `components/sidebar-actions.tsx`:
  - Updated `SidebarActionsProps` interface to use `number` type for `id`:
    ```typescript
    interface SidebarActionsProps {
      chat: Chat
      removeChat: (args: { id: number; path: string }) => Promise<ServerActionResult<void>>
      shareChat: (id: number) => Promise<ServerActionResult<Chat>>
    }
    ```
  - Updated `handleShareChat` function to accept a `number` type for `id`:
    ```typescript
    const handleShareChat = React.useCallback((id: number) => {
      // ...
    }, [shareChat])
    ```

### Step 7: Update ChatShareDialog Component
- Updated `components/chat-share-dialog.tsx`:
  - Changed the `chat` prop type to use `number` for `id`:
    ```typescript
    interface ChatShareDialogProps extends DialogProps {
      chat: {
        id: number
        title: string
        messages: Message[]
      }
      shareChat: (id: number) => Promise<ServerActionResult<Chat>>
      onCopy: () => void
    }
    ```

### Step 8: Update SidebarItem Component
- Updated `components/sidebar-item.tsx`:
  - Modified `isActive` and `isOpen` checks to compare `pane.id` with `chat.id.toString()`:
    ```typescript
    const isActive = panes.some(pane => pane.id === chat.id.toString() && pane.type === 'chat' && pane.isActive)
    const isOpen = panes.some(pane => pane.id === chat.id.toString() && pane.type === 'chat')
    ```
  - Updated the `newPane` object in the `handleClick` function to use `chat.id.toString()`:
    ```typescript
    const newPane = {
      id: chat.id.toString(),
      title: chat.title,
      type: 'chat' as const,
      content: { id: chat.id, oldContent: chat.messages?.join('\n') }
    }
    ```

### Step 9: Verify API Routes and Database Actions
- Reviewed `app/api/chat/route.ts`:
  - Confirmed that it's correctly handling `threadId` as a number
  - Includes a check to ensure `threadId` is a valid number

- Reviewed `app/api/thread/route.ts`:
  - Confirmed that it's correctly handling thread IDs as numbers
  - `getLastEmptyThread` and `createNewThread` functions return number-type thread IDs

- Reviewed `db/actions.ts`:
  - Confirmed that all functions are consistently using number-type thread IDs
  - Includes checks for `isNaN(threadId)` where appropriate

### Step 10: Improve Loading of Existing Messages
- Updated `hooks/useChat.ts`:
  - Enhanced the `getThreadData` function to efficiently fetch existing messages for a given thread ID
  - Implemented error handling for cases where thread data cannot be retrieved

- Updated `store/chat.ts`:
  - Optimized the `threads` state management to handle large numbers of messages efficiently
  - Added a `fetchThreadMessages` action to load messages from the database when not present in the store

- Updated `components/chat.tsx`:
  - Implemented loading states to provide feedback when fetching existing messages
  - Added error handling for cases where message loading fails

- Created `docs/knowledge/loading-existing-messages.md`:
  - Documented the process of loading existing messages
  - Provided an overview of the components and functions involved in message loading
  - Suggested potential improvements for the message loading system

These changes address the type errors and ensure consistency across the components and API routes. The next steps in the refactor should focus on:

1. Implementing additional error handling and user feedback throughout the chat system
2. Optimizing database queries related to thread and message retrieval
3. Implementing a caching mechanism for thread data to improve performance
4. Conducting thorough testing of all chat functionality to ensure it works as expected with the new integer-based thread ID system

Remember to test the following scenarios:
- Creating new chat threads
- Loading existing threads
- Sending and receiving messages within threads
- Switching between multiple open threads
- Handling error cases (e.g., network errors, invalid thread IDs)

By implementing these changes and following up with thorough testing and optimization, the chat system will become more robust, consistent, and easier to maintain.