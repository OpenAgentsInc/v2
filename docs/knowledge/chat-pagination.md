# Chat Pagination and Infinite Scrolling

This document outlines the implementation of chat pagination and infinite scrolling for the chat history component.

## Overview

The goal is to initially load only the 10 most recent messages and then fetch more messages as the user scrolls up in the chat history. This implementation improves performance and reduces initial load time for chats with a large number of messages.

## Implementation Details

### 1. Store (store/chat.ts)

- Added pagination-related state (`hasMore`, `currentPage`) to the `ThreadData` interface.
- Updated the `setMessages` action to handle appending new messages and updating pagination information.
- Added an `incrementPage` action to increase the current page number when loading more messages.

### 2. Hook (hooks/useChat.ts)

- Modified the `fetchMessages` function to support pagination parameters (page and limit).
- Implemented a `loadMoreMessages` function to fetch older messages when the user scrolls to the top of the chat.
- Updated the `useChat` hook to return `loadMoreMessages` and `isLoading` state.

### 3. API (app/api/chat/route.ts)

- Updated the POST handler to support pagination parameters.
- Added pagination information to the response headers.
- Implemented a GET handler to fetch paginated messages for a specific thread.

### 4. Database Actions (db/actions.ts)

- Modified the `fetchThreadMessages` function to support pagination:
  - Added `page` and `limit` parameters.
  - Updated the SQL query to use `LIMIT` and `OFFSET` for pagination.
  - Return `hasMore` flag to indicate if there are more messages to load.

### 5. Chat List Component (components/chat/chat-list.tsx)

- Implemented an intersection observer to detect when the user has scrolled to the top of the chat.
- Added a "Load more" button that appears when there are more messages to fetch.
- Updated the component to append new messages to the existing list when loaded.

## Usage

To use the paginated chat history:

1. The `useChat` hook now provides `loadMoreMessages` and `isLoading` properties.
2. Pass these properties to the `ChatList` component:

```jsx
const { messages, loadMoreMessages, isLoading } = useChat({ id: threadId });

return (
  <ChatList
    messages={messages}
    loadMoreMessages={loadMoreMessages}
    hasMore={threadData.hasMore}
    isLoading={isLoading}
  />
);
```

3. The `ChatList` component will automatically load more messages when the user scrolls to the top of the chat history.

## Performance Considerations

- The initial load is faster as it only fetches the 10 most recent messages.
- Older messages are loaded on-demand, reducing unnecessary data transfer.
- The intersection observer ensures that more messages are only loaded when needed, improving overall performance.

## Future Improvements

- Implement virtual scrolling for even better performance with very large chat histories.
- Add a "Jump to bottom" button when the user has scrolled up.
- Optimize message fetching to reduce unnecessary API calls by caching already loaded messages.

## Testing

Ensure to test the following scenarios:
- Initial load of the latest 10 messages
- Scrolling up and loading more messages
- Reaching the end of the message history
- Performance with large numbers of messages
- Error handling when fetching messages fails