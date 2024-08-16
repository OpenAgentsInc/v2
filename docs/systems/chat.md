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

1. **Vercel AI SDK Integration**: The `useChat` hook wraps the Vercel UI `useChat` hook, extending its functionality with custom logic:
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
       if (threadId && user) {
         const updatedMessages = [...threadData.messages, message as Message];
         setMessages(threadId, updatedMessages);

         try {
           const result = await saveChatMessage(threadId, user.id, message as Message, {
             ...options,
             model: currentModelRef.current
           });
           if (result.newBalance) {
             setBalance(result.newBalance);
           }
           setError(null);

           // Generate title for new threads
           if (updatedMessages.length === 1 && updatedMessages[0].role === 'assistant') {
             try {
               const title = await generateTitle(threadId);
               updateThreadTitle(threadId, title);
             } catch (error) {
               console.error('Error generating title:', error);
             }
           }
         } catch (error: any) {
           // Error handling logic
         }
       }
     },
     onError: (error) => {
       // Error handling logic
     },
   });
   ```

2. **State Management**: The implementation uses Zustand for state management, with stores for chat, balance, models, and tools:
   ```typescript
   import { create } from 'zustand';
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
       createNewThread()
         .then(({ threadId: newThreadId }) => {
           setThreadId(newThreadId);
           setCurrentThreadId(newThreadId);
         })
         .catch(error => {
           console.error('Error creating new thread:', error);
           toast.error('Failed to create a new chat thread. Please try again.');
         });
     }
   }, [propsId, threadId, setCurrentThreadId, user]);

   useEffect(() => {
     if (threadId) {
       fetchThreadMessages(threadId)
         .then((messages) => {
           setMessages(threadId, messages);
         })
         .catch(error => {
           console.error('Error fetching thread messages:', error);
           toast.error('Failed to load chat messages. Please try refreshing the page.');
         });
     }
   }, [threadId, setMessages]);
   ```

4. **Error Handling and Notifications**: The system uses toast notifications for user feedback:
   ```typescript
   import { toast } from 'sonner';

   // Usage examples
   toast.error('Failed to create a new chat thread. Please try again.');
   toast.error('Insufficient credits. Please add more credits to continue chatting.');
   ```

5. **Credit System**: The implementation checks and updates user credits:
   ```typescript
   // Inside onFinish callback
   if (result.newBalance) {
     setBalance(result.newBalance);
   }
   ```

6. **Thread Title Generation**: The system automatically generates titles for new threads:
   ```typescript
   import { generateTitle } from '@/db/actions';

   // Inside onFinish callback
   if (updatedMessages.length === 1 && updatedMessages[0].role === 'assistant') {
     try {
       const title = await generateTitle(threadId);
       updateThreadTitle(threadId, title);
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
   const sendMessage = useCallback(async (message: string) => {
     if (!threadId || !user) {
       console.error('No thread ID or user available');
       return;
     }

     const userMessage: Message = { id: Date.now().toString(), content: message, role: 'user' };
     const updatedMessages = [...threadData.messages, userMessage];
     setMessages(threadId, updatedMessages);

     try {
       vercelChatProps.append(userMessage as VercelMessage);
       await saveChatMessage(threadId, user.id, userMessage);
     } catch (error) {
       console.error('Error sending message:', error);
       toast.error('Failed to send message. Please try again.');
       setMessages(threadId, threadData.messages);
     }
   }, [threadId, user, vercelChatProps, threadData.messages, setMessages]);
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
     setUser,
     setInput,
     sendMessage,
     error
   };
   ```

## Integration Steps for New Coding Agent

To implement the Vercel version in the current useChat hook:

1. Import the necessary dependencies, including the Vercel AI SDK:
   ```typescript
   import { useChat as useVercelChat, Message as VercelMessage } from 'ai/react';
   ```

2. Set up the state management using Zustand stores for chat, balance, models, and tools.

3. Initialize the Vercel chat props using `useVercelChat` with the appropriate configuration.

4. Implement custom logic for handling finished messages and errors in the `onFinish` and `onError` callbacks.

5. Create effects for thread creation, message fetching, and other initialization tasks.

6. Implement the custom `sendMessage` function that integrates with Vercel chat props and your backend.

7. Set up message debouncing using the `useDebounce` hook.

8. Return an object that combines Vercel chat props with your custom properties and functions.

9. Ensure proper error handling and user feedback using toast notifications throughout the hook.

10. Integrate the credit system by updating the user's balance when necessary.

11. Implement thread title generation for new threads.

By following these steps and referring to the code snippets provided in the Implementation Details section, a new coding agent should be able to successfully implement the Vercel version in the current useChat hook.

## Additional Notes

[Additional notes remain unchanged]

For more detailed information on specific aspects of the chat system, refer to the relevant files in the codebase, particularly `useChat.ts`, the pane components, and the backend action files.