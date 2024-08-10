# Chat Pagination and Infinite Scrolling

This document outlines the implementation of chat pagination and infinite scrolling for the chat history component.

## Overview

The goal is to initially load only the 10 most recent messages and then fetch more messages as the user scrolls up in the chat history.

## Implementation Steps

1. Modify the chat state to include pagination information.
2. Update the API endpoint to support pagination.
3. Implement infinite scrolling in the chat component.
4. Update the chat list component to handle paginated data.

## Files to Change

1. `store/chat.ts`: Update the chat store to include pagination state.
2. `hooks/useChat.ts`: Modify the hook to fetch paginated messages and handle infinite scrolling.
3. `app/api/chat/route.ts`: Update the API route to support pagination parameters.
4. `components/chat/chat-list.tsx`: Modify the component to handle infinite scrolling and display paginated messages.

## Detailed Changes

### 1. store/chat.ts

- Add pagination-related state (e.g., `hasMore`, `currentPage`).
- Update the `setMessages` action to handle appending new messages.

### 2. hooks/useChat.ts

- Implement a function to fetch more messages when scrolling.
- Update the initial message fetching to only retrieve the latest 10 messages.

### 3. app/api/chat/route.ts

- Add support for `page` and `limit` query parameters.
- Modify the database query to fetch messages based on these parameters.

### 4. components/chat/chat-list.tsx

- Implement an intersection observer to detect when the user has scrolled to the top.
- Add a loading indicator for when more messages are being fetched.
- Update the component to append new messages to the existing list when loaded.

## Implementation Details

The infinite scrolling will be implemented using the Intersection Observer API. When the topmost message comes into view, it will trigger a fetch for the next batch of messages.

The chat store will need to keep track of whether there are more messages to load and the current page number. The `useChat` hook will provide a function to load more messages, which will be called when the intersection observer detects that the user has scrolled to the top of the current message list.

The API will need to be updated to accept pagination parameters and return the appropriate slice of messages along with a flag indicating if there are more messages available.

## Testing

Ensure to test the following scenarios:
- Initial load of the latest 10 messages
- Scrolling up and loading more messages
- Reaching the end of the message history
- Performance with large numbers of messages

## Future Improvements

- Implement virtual scrolling for better performance with very large chat histories.
- Add a "Jump to bottom" button when the user has scrolled up.
- Optimize message fetching to reduce unnecessary API calls.