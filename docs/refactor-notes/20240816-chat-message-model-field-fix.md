# Chat Message Model Field Fix

This document outlines the fix implemented to resolve the "ArgumentValidationError" occurring when saving chat messages.

## Objective

Fix the error occurring in `useChat.ts` related to an extra `model` field when saving chat messages.

## Problem Description

The `saveChatMessage` function in the Convex backend expects a `model_id` field, but the `useChat` hook was sending a `model` field instead. This caused an ArgumentValidationError when trying to save chat messages.

Error message:
```
ArgumentValidationError: Object contains extra field `model` that is not in the validator.

Object: {clerk_user_id: "user_2jnjDgQlmnhbApGnuZqmdRHau4A", content: "...", model: "anthropic.claude-3-5-sonnet-20240620-v1:0", role: "assistant", thread_id: "jh78w4jq5c9bb2bzy9g0wvcxjs6yy3t9"}
Validator: v.object({clerk_user_id: v.string(), completion_tokens: v.optional(v.float64()), content: v.string(), cost_in_cents: v.optional(v.float64()), finish_reason: v.optional(v.string()), model_id: v.optional(v.string()), prompt_tokens: v.optional(v.float64()), role: v.string(), thread_id: v.id("threads"), tool_invocations: v.optional(v.object({})), total_tokens: v.optional(v.float64())})
```

## Solution

Update the `useChat` hook in `hooks/useChat.ts` to send `model_id` instead of `model` when saving chat messages.

## Implementation Steps

1. Locate the `useChat` function in `hooks/useChat.ts`.
2. Update the `onFinish` callback in `vercelChatProps` to use `model_id` instead of `model`.
3. Update the `sendMessage` function to include the `model_id` field when calling `sendMessageMutation`.
4. Add `model` to the dependency array of the `sendMessage` useCallback.

## Code Changes

```typescript
// In hooks/useChat.ts

// Inside vercelChatProps.onFinish
const result = await sendMessageMutation({
  thread_id: threadId,
  clerk_user_id: user.id,
  content: message.content,
  role: message.role,
  model_id: currentModelRef.current || model.id, // Changed from model to model_id
})

// Inside sendMessage function
await sendMessageMutation({
  thread_id: threadId,
  clerk_user_id: user.id,
  content,
  role: 'user',
  model_id: model.id, // Added this line
})

// Updated dependency array for sendMessage useCallback
}, [threadId, user, vercelChatProps, threadData, addMessageToThread, sendMessageMutation, model])
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
4. Review other parts of the codebase where model information is being sent to the backend to ensure consistency in using `model_id`.

## Conclusion

This fix resolves the "ArgumentValidationError" by ensuring that the correct field name (`model_id`) is used when saving chat messages. The change is minimal but crucial for the proper functioning of the chat system. It highlights the importance of maintaining consistency between frontend and backend data structures and the need for thorough type checking and validation.