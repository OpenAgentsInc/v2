import { useState, useCallback } from 'react';
import { Id } from '../../convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ChatCoreType, Message } from './types';

export const useChat = (): ChatCoreType => {
  const [threadId, setThreadId] = useState<Id<'threads'> | null>(null);

  const messages = useQuery(api.messages.fetchThreadMessages, threadId ? { thread_id: threadId } : 'skip');
  const sendMessage = useMutation(api.messages.saveChatMessage);
  const updateThreadTitle = useMutation(api.threads.updateThreadData);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!threadId) return;

    const newMessage: Message = {
      threadId,
      content,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    await sendMessage({
      thread_id: threadId,
      content,
      role: 'user',
    });

    // You might want to invalidate the messages query here or handle optimistic updates
  }, [threadId, sendMessage]);

  const handleUpdateTitle = useCallback(async (newTitle: string) => {
    if (!threadId) return;

    await updateThreadTitle({
      thread_id: threadId,
      metadata: { title: newTitle },
    });

    // You might want to invalidate the thread query here or handle optimistic updates
  }, [threadId, updateThreadTitle]);

  return {
    threadId,
    setThreadId,
    messages: messages || [],
    sendMessage: handleSendMessage,
    updateTitle: handleUpdateTitle,
  };
};