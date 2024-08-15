import { useCallback } from 'react';
import { useConvex } from 'convex/react';
import { api } from '../convex/_generated/api';
import { toast } from 'sonner';
import { useChatStore } from './useChatStore';
import { Message } from '@/types';
import { Id } from '../convex/_generated/dataModel';

export function useMessageHandling(threadId: string | null, vercelChatProps: any, clerkUserId: string) {
    const convex = useConvex();
    const { setMessages, getThreadData } = useChatStore();

    const sendMessage = useCallback(async (message: string) => {
        if (!threadId) {
            console.error('No thread ID available');
            return;
        }

        const userMessage: Message = { 
            id: Date.now().toString(), 
            content: message, 
            role: 'user', 
            createdAt: new Date()
        };
        const threadData = getThreadData(threadId);
        const updatedMessages = [...threadData.messages, userMessage];
        setMessages(threadId, updatedMessages);

        try {
            vercelChatProps.append(userMessage);
            await convex.mutation(api.messages.saveChatMessage, {
                thread_id: threadId as Id<"threads">,
                clerk_user_id: clerkUserId,
                role: userMessage.role,
                content: userMessage.content,
            });
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message. Please try again.');
            setMessages(threadId, threadData.messages);
        }
    }, [threadId, vercelChatProps, convex, setMessages, getThreadData, clerkUserId]);

    return { sendMessage };
}