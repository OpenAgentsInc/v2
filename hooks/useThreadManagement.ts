import { useState, useEffect } from 'react';
import { useConvex } from 'convex/react';
import { api } from '../convex/_generated/api';
import { toast } from 'sonner';
import { useChatStore } from './useChatStore';
import { Id } from '../convex/_generated/dataModel';

export function useThreadManagement(propsId?: string) {
    const convex = useConvex();
    const { currentThreadId, setCurrentThreadId, setMessages } = useChatStore();
    const [threadId, setThreadId] = useState<string | null>(propsId || currentThreadId);

    useEffect(() => {
        if (propsId) {
            setThreadId(propsId);
            setCurrentThreadId(propsId);
        } else if (!threadId) {
            convex.mutation(api.threads.createNewThread)
                .then((newThreadId) => {
                    setThreadId(newThreadId);
                    setCurrentThreadId(newThreadId);
                })
                .catch(error => {
                    console.error('Error creating new thread:', error);
                    toast.error('Failed to create a new chat thread. Please try again.');
                });
        }
    }, [propsId, threadId, setCurrentThreadId, convex]);

    useEffect(() => {
        if (threadId) {
            convex.query(api.messages.fetchThreadMessages, { thread_id: threadId as Id<"threads"> })
                .then((messages) => {
                    setMessages(threadId, messages);
                })
                .catch(error => {
                    console.error('Error fetching thread messages:', error);
                    toast.error('Failed to load chat messages. Please try refreshing the page.');
                });
        }
    }, [threadId, setMessages, convex]);

    return { threadId, setThreadId };
}