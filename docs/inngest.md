# Inngest Chat Refactor

We're refactoring our chat system to use Inngest for background jobs, replacing the Vercel AI SDK's useChat hook. This decouples chat flow from browser sessions for more robust experiences.

## New Chat Flow

1. User Interaction: React components trigger `sendMessage()` server action.
2. Server Action (`sendMessage()`):
   - Authenticate user (Clerk)
   - Trigger Inngest event
   - Return initial response
3. Inngest Event Handler (`processMessage`):
   - Save user message (Convex)
   - Gather context
   - Prepare tools
   - LLM interaction
   - Process response
   - Save AI response (Convex)
4. Client-Side Updates: Real-time updates via Convex
5. Continuation/Retry: Use Inngest scheduling

## Implementation

1. Inngest Setup:
   - Install: `npm install inngest`
   - Configure: `inngest/client.ts`
   - Set up functions

2. Database Updates (Convex schema):
   - Add `inngestJobId` and `status` to `messages` table

3. Server-Side Changes:
   - `lib/chat/sendMessage.ts`: Server action
   - `inngest/functions/processMessage/`: Event handlers
   - Utility functions for context and tools

4. Client-Side Updates:
   - Update `panes/chat/ChatPane.tsx`
   - Implement real-time updates

5. Error Handling and Monitoring:
   - Robust error handling in Inngest functions
   - Use Inngest's monitoring features
   - Custom logging in Convex functions

## Next Steps

1. Refine `processMessage` function:
   - Enhance AI processing logic
   - Implement error handling and retries
   - Improve context gathering and tool preparation

2. Enhance `sendMessage` server action:
   - Add input validation and rate limiting

3. Update Convex schema and queries

4. Modify client-side components for async updates

5. Implement comprehensive error handling and monitoring

## Refactored `sendMessage` Function

The `sendMessage` function is now modular:
1. `lib/chat/authenticateUser.ts`: User authentication
2. `lib/chat/triggerInngestEvent.ts`: Inngest event triggering
3. `lib/chat/sendMessage.ts`: Main coordination function

This refactoring improves testability and maintainability.

## Inngest Function Structure

- `inngest/functions/processMessage/index.ts`: Main function
- `inngest/functions/processMessage/gatherContext.ts`: Collects message history and tools
- `inngest/functions/processMessage/infer.ts`: Handles LLM interaction
- `inngest/functions/processMessage/saveAssistantMessage.ts`: Saves AI responses
- `inngest/functions/processMessage/saveUserMessage.ts`: Saves user messages

Each file handles a specific part of the message processing workflow, improving modularity and maintainability.