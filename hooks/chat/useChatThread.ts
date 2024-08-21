import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ChatCoreType, Thread } from './types';
import { inngest } from '../../inngest/client';

export const useChatThread = (core: ChatCoreType) => {
  const { queryClient, threadId, setThreadId } = core;
  const [threadData, setThreadData] = useState<Thread | null>(null);

  const thread = useQuery({
    queryKey: ['thread', threadId],
    queryFn: async () => {
      // Implement the logic to fetch thread data
      // For now, we'll return a dummy thread
      return {
        id: threadId,
        title: 'New Chat',
        createdAt: new Date(),
        userId: 'user123',
        path: '',
      } as Thread;
    },
    enabled: !!threadId,
  });

  useEffect(() => {
    if (thread.data) {
      setThreadData(thread.data);
    }
  }, [thread.data]);

  const updateTitle = useMutation({
    mutationFn: async (newTitle: string) => {
      if (!threadId) throw new Error('No thread ID');
      // Implement the logic to update the thread title
      await inngest.send({
        name: 'thread/update.title',
        data: { threadId, newTitle },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['thread', threadId]);
    },
  });

  return {
    threadId,
    setThreadId,
    threadData,
    setThreadData,
    updateTitle: updateTitle.mutate,
    isLoading: thread.isLoading,
    isError: thread.isError,
    error: thread.error,
  };
};