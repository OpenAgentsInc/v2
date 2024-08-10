# Chat Refactor Log

This document logs the actions taken to refactor the chat implementation, incorporating server actions and improving the overall functionality.

## Date: [Current Date]

### 1. Created Server Actions (db/actions.ts)

Added new server actions to handle database operations:

- `createNewThread`: Creates a new chat thread in the database
- `fetchThreadMessages`: Retrieves messages for a specific thread
- `saveMessage`: Saves a new message to the database

### 2. Updated useChat Hook (hooks/useChat.ts)

Modified the `useChat` hook to incorporate server actions and improve functionality:

- Imported new server actions from `db/actions.ts`
- Added error handling and toast notifications for better user feedback
- Updated thread creation process to use `createNewThread` server action
- Added a new `useEffect` hook to fetch existing messages when a thread is loaded
- Updated `onFinish` callback in `useVercelChat` to save AI messages using `saveMessage` server action
- Modified `sendMessage` function to use optimistic updates and `saveMessage` server action

### Key Changes in useChat Hook:

1. Thread Creation:
   ```typescript
   createNewThread()
     .then((newThreadId) => {
       setThreadId(newThreadId);
       setCurrentThreadId(newThreadId);
     })
     .catch(error => {
       console.error('Error creating new thread:', error);
       toast.error('Failed to create a new chat thread. Please try again.');
     });
   ```

2. Fetching Existing Messages:
   ```typescript
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

3. Saving AI Messages:
   ```typescript
   onFinish: async (message) => {
     if (threadId) {
       const adaptedMessage = adaptMessage(message);
       const updatedMessages = [...threadData.messages, adaptedMessage];
       setMessages(threadId, updatedMessages);
       
       try {
         await saveMessage(threadId, adaptedMessage);
       } catch (error) {
         console.error('Error saving AI message:', error);
         toast.error('Failed to save AI response. Some messages may be missing.');
       }
     }
   },
   ```

4. Sending User Messages:
   ```typescript
   const sendMessage = useCallback(async (message: string) => {
     if (!threadId) {
       console.error('No thread ID available');
       return;
     }

     const userMessage: CustomMessage = { id: Date.now().toString(), content: message, role: 'user' };
     const updatedMessages = [...threadData.messages, userMessage];
     setMessages(threadId, updatedMessages);

     try {
       // Optimistically update the UI
       vercelChatProps.append(userMessage as VercelMessage);

       // Save the message to the database
       await saveMessage(threadId, userMessage);
     } catch (error) {
       console.error('Error sending message:', error);
       toast.error('Failed to send message. Please try again.');
       // Revert the optimistic update
       setMessages(threadId, threadData.messages);
     }
   }, [threadId, vercelChatProps, threadData.messages, setMessages]);
   ```

### Next Steps and Considerations

1. Implement pagination for long chat threads
2. Add a loading state while fetching messages
3. Implement real-time updates if multiple users can interact with the same thread
4. Add more robust error handling and recovery mechanisms
5. Consider caching strategies to improve performance
6. Implement message editing and deletion functionality if required
7. Add typing indicators for a better user experience
8. Implement message search functionality within threads

This refactor improves the chat functionality by ensuring proper data persistence, error handling, and user feedback. It also sets the foundation for further enhancements to the chat system.