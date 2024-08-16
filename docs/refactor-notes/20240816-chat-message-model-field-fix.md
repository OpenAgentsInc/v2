# Chat Message Model Field Fix

This document outlines the fix implemented to resolve the "ArgumentValidationError" occurring when saving chat messages.

## Objective

Fix the error occurring in `useChat.ts` related to an extra `model` field when saving chat messages.

## Problem Description

The `saveChatMessage` function in the Convex backend expects a `model_id` field, but the `useChat` hook is sending a `model` field instead. This causes an ArgumentValidationError when trying to save chat messages.

Error message:
```
ArgumentValidationError: Object contains extra field `model` that is not in the validator.

Object: {clerk_user_id: "user_2jnjDgQlmnhbApGnuZqmdRHau4A", content: "...", model: "anthropic.claude-3-5-sonnet-20240620-v1:0", role: "assistant", thread_id: "jh78w4jq5c9bb2bzy9g0wvcxjs6yy3t9"}
Validator: v.object({clerk_user_id: v.string(), completion_tokens: v.optional(v.float64()), content: v.string(), cost_in_cents: v.optional(v.float64()), finish_reason: v.optional(v.string()), model_id: v.optional(v.string()), prompt_tokens: v.optional(v.float64()), role: v.string(), thread_id: v.id("threads"), tool_invocations: v.optional(v.object({})), total_tokens: v.optional(v.float64())})
```

## Solution

Update the `useChat` hook in `hooks/useChat.ts` to send `model_id` instead of `model` when saving chat messages.

## Implementation Steps

1. Locate the `sendMessage` function in `hooks/useChat.ts`.
2. Update the `saveChatMessage` call to use `model_id` instead of `model`.
3. Ensure that the `model_id` is correctly extracted from the `model` object.

## Code Changes

```typescript
// In hooks/useChat.ts

const sendMessage = useCallback(async (content: string) => {
  // ... existing code ...

  try {
    vercelChatProps.append(newMessage as VercelMessage);
    await saveChatMessage({
      thread_id: threadId,
      clerk_user_id: user.id,
      content,
      role: 'user',
      model_id: model.id, // Use model_id instead of model
    });
  } catch (error) {
    console.error('Error sending message:', error);
    toast.error('Failed to send message. Please try again.');
    // Remove the message from the thread if it failed to send
    setThreadData({ ...threadData, messages: threadData.messages.filter(m => m.id !== newMessage.id) });
  }
}, [threadId, user, vercelChatProps, threadData, setThreadData, model]);
```

## Testing and Verification

1. Update the `useChat` hook with the changes.
2. Test the chat functionality, particularly sending new messages.
3. Verify that the "ArgumentValidationError" no longer occurs when saving chat messages.
4. Ensure that all other chat-related functionality continues to work as expected.

## Progress Log

- [2024-08-16]: Identified the issue in `useChat` hook
- [2024-08-16]: Implemented the fix in `hooks/useChat.ts`
- [2024-08-16]: Tested the solution and verified that the error is resolved

## Next Steps

1. Monitor the application for any potential side effects of this change.
2. Update any documentation or comments in other parts of the codebase that may reference the old behavior of saving chat messages.
3. Consider adding more robust error handling and type checking in the `useChat` hook to prevent similar issues in the future.

## Conclusion

This fix resolves the "ArgumentValidationError" by ensuring that the correct field name (`model_id`) is used when saving chat messages. The change is minimal but crucial for the proper functioning of the chat system.