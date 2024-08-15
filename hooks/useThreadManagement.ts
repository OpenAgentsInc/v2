import { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { toast } from 'sonner';
import { useChatStore } from './useChatStore';
import { Id } from '../convex/_generated/dataModel';
import { Message } from '@/types';
import { useUser } from '@clerk/nextjs';

export function useThreadManagement(propsId?: string) {
  const { currentThreadId, setCurrentThreadId, setMessages } = useChatStore();
  const [threadId, setThreadId] = useState<string | null>(propsId || currentThreadId);
  const { user } = useUser();

  const createNewThread = useMutation(api.threads.createNewThread);
  const fetchThreadMessages = useQuery(api.messages.fetchThreadMessages, threadId ? { thread_id: threadId as Id<"threads"> } : "skip");

  useEffect(() => {
    if (propsId) {
      setThreadId(propsId);
      setCurrentThreadId(propsId);
    } else if (currentThreadId) {
      setThreadId(currentThreadId);
    } else if (!threadId && user) {
      createNewThread({
        clerk_user_id: user.id,
        metadata: {} // You can add any additional metadata here if needed
      })
        .then((newThread) => {
          if (newThread && newThread._id) {
            setThreadId(newThread._id);
            setCurrentThreadId(newThread._id);
          } else {
            console.error('Unexpected thread response:', newThread);
          }
        })
        .catch(error => {
          console.error('Error creating new thread:', error);
          toast.error('Failed to create a new chat thread. Please try again.');
        });
    }
  }, [propsId, threadId, currentThreadId, setCurrentThreadId, createNewThread, user]);

  useEffect(() => {
    if (threadId && fetchThreadMessages) {
      const formattedMessages: Message[] = fetchThreadMessages.map((msg: any) => ({
        id: msg._id,
        content: msg.content,
        role: msg.role,
        createdAt: msg._creationTime,
      }));
      setMessages(threadId, formattedMessages);
    }
  }, [threadId, fetchThreadMessages, setMessages]);

  return { threadId, setThreadId };
}