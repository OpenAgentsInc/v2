# Chat System Implementation

OpenAgents implements chat functionality as a core feature of the platform. This document outlines the key components and processes involved in the chat system.

## Data Structure

The main source of truth for these data structures is defined in `convex/schema.ts`.

[Data structure definitions remain unchanged]

## Front-end Components

[Front-end component descriptions remain unchanged]

## Core Logic

The majority of the chat logic resides in the `useChat.ts` hook, located in the `hooks/` directory. This hook provides the following functionality:

### useChat Hook
- Wraps and extends the Vercel UI useChat hook
- Manages the state of messages for a specific thread
- Handles sending new messages
- Fetches messages for a thread
- Updates the thread in the store when messages are fetched
- Integrates with custom backend actions for thread and message management
- Handles error states and user balance updates

[Other hook descriptions remain unchanged]

## UI Implementation

[UI implementation details remain unchanged]

## Tech Stack Integration

[Tech stack integration details remain unchanged]

## Key Features

[Key features remain unchanged]

## Implementation Details

1. **Vercel AI SDK Integration**: The `useChat` hook now wraps the Vercel UI `useChat` hook, extending its functionality with custom logic:
   ```typescript
   import { useChat as useVercelChat, Message as VercelMessage } from 'ai/react';

   // Inside the useChat function
   const vercelChatProps = useVercelChat({
     id: threadId?.toString(),
     initialMessages: threadData.messages as VercelMessage[],
     body: { model: model.id, tools, threadId, repoOwner: repo?.owner, repoName: repo?.name, repoBranch: repo?.branch },
     maxToolRoundtrips: 20,
     onFinish: async (message, options) => {
       // Custom logic for handling finished messages
       // ...
     },
     onError: (error) => {
       // Error handling logic
     },
   });
   ```

2. **State Management**: The implementation uses Zustand for state management, with stores for chat, balance, models, and tools:
   ```typescript
   import { useBalanceStore } from '@/store/balance';
   import { useModelStore } from '@/store/models';
   import { useRepoStore } from '@/store/repo';
   import { useToolStore } from '@/store/tools';

   // Inside the useChat function
   const model = useModelStore((state) => state.model);
   const repo = useRepoStore((state) => state.repo);
   const tools = useToolStore((state) => state.tools);
   const setBalance = useBalanceStore((state) => state.setBalance);
   ```

3. **Backend Integration**: The hook interacts with backend services for various operations:
   ```typescript
   import { createNewThread, fetchThreadMessages, saveChatMessage } from '@/db/actions';

   // Inside the useChat function
   useEffect(() => {
     if (propsId) {
       setThreadId(propsId);
       setCurrentThreadId(propsId);
     } else if (!threadId && user) {
       createNewThread({
         clerk_user_id: user.id,
         metadata: {},
       })
         .then((newThreadId) => {
           if (newThreadId && typeof newThreadId === 'string') {
             setThreadId(newThreadId as Id<"threads">);
             setCurrentThreadId(newThreadId as Id<"threads">);
           } else {
             console.error('Unexpected thread response:', newThreadId);
           }
         })
         .catch(error => {
           console.error('Error creating new thread:', error);
           toast.error('Failed to create a new chat thread. Please try again.');
         });
     }
   }, [propsId, threadId, setCurrentThreadId, user, createNewThread]);

   useEffect(() => {
     if (threadId && fetchMessages) {
       const thread: Thread = {
         id: threadId,
         title: threadData.title || 'New Chat',
         messages: fetchMessages as Message[],
         createdAt: threadData.createdAt || new Date(),
       };
       setThreadData(thread);
       setThread(threadId, thread);
     }
   }, [threadId, fetchMessages, setThread]);
   ```

4. **Error Handling and Notifications**: The system uses toast notifications for user feedback:
   ```typescript
   import { toast } from 'sonner';

   // Usage examples
   toast.error('Failed to create a new chat thread. Please try again.');
   toast.error('Failed to send message. Please try again.');
   ```

5. **Credit System**: The implementation checks and updates user credits:
   ```typescript
   // Inside onFinish callback
   if (result && result.newBalance) {
     setBalance(result.newBalance);
   }
   ```

6. **Thread Title Generation**: The system automatically generates titles for new threads:
   ```typescript
   // Inside onFinish callback
   if (updatedMessages.length === 1 && updatedMessages[0].role === 'assistant') {
     try {
       const title = await generateTitle({ threadId });
       setThreadData({ ...threadData, title });
     } catch (error) {
       console.error('Error generating title:', error);
     }
   }
   ```

7. **Message Debouncing**: To optimize performance, the system debounces message updates:
   ```typescript
   import { useDebounce } from 'use-debounce';

   // Inside the useChat function
   const [debouncedMessages] = useDebounce(vercelChatProps.messages, 250, { maxWait: 250 });
   ```

8. **Custom Message Sending**: The hook implements a custom `sendMessage` function that integrates with the Vercel chat props:
   ```typescript
   const sendMessage = useCallback(async (content: string) => {
     if (!threadId || !user) {
       console.error('No thread ID or user available');
       return;
     }

     const newMessage = createNewMessage(threadId, user.id, content);
     addMessageToThread(threadId, newMessage);

     try {
       vercelChatProps.append(newMessage as VercelMessage);
       await sendMessageMutation({
         thread_id: threadId,
         clerk_user_id: user.id,
         content,
         role: 'user',
       });
     } catch (error) {
       console.error('Error sending message:', error);
       toast.error('Failed to send message. Please try again.');
       // Remove the message from the thread if it failed to send
       setThreadData({ ...threadData, messages: threadData.messages.filter(m => m.id !== newMessage.id) });
     }
   }, [threadId, user, vercelChatProps, threadData, addMessageToThread, sendMessageMutation]);
   ```

9. **Return Value**: The hook returns an object that combines the Vercel chat props with custom properties:
   ```typescript
   return {
     ...vercelChatProps,
     messages: debouncedMessages,
     id: threadId,
     threadData,
     user,
     setCurrentThreadId,
     sendMessage,
     error,
   };
   ```

## Recent Changes and Integration

The chat system has been recently updated to integrate the Vercel UI useChat hook with our existing implementation. Here are the key changes and integration steps:

1. The `useChat` hook now accepts a `propsId` parameter instead of `threadId`, allowing for more flexible thread management.

2. Vercel AI SDK has been integrated, wrapping our custom logic around the `useVercelChat` hook.

3. State management has been enhanced to include additional stores for balance, models, repo, and tools.

4. The thread creation process has been updated to work with the new Vercel chat integration.

5. Message handling now uses the Vercel chat props for appending messages, while still maintaining our custom backend integration.

6. Error handling and user feedback have been improved with more specific error messages and toast notifications.

7. The credit system has been integrated into the chat flow, updating user balance after each message.

8. Thread title generation is now handled within the chat hook, triggered after the first assistant message.

9. Message debouncing has been implemented to optimize performance and reduce unnecessary re-renders.

10. The return value of the `useChat` hook has been expanded to include more properties and functions, providing a richer interface for components using this hook.

These changes have resulted in a more robust and feature-rich chat implementation that leverages the benefits of the Vercel AI SDK while maintaining our custom functionality and integrations.

## Additional Notes

[Additional notes remain unchanged]

For more detailed information on specific aspects of the chat system, refer to the relevant files in the codebase, particularly `hooks/useChat.ts`, the pane components, and the backend action files.