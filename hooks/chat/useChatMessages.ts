import { useQuery } from '@tanstack/react-query';
import { ChatCoreType, Message } from './types';

export const useChatMessages = (core: ChatCoreType) => {
  const { queryClient, threadId } = core;

  const messages = useQuery({
    queryKey: ['messages', threadId],
    queryFn: async () => {
      // Implement the logic to fetch messages for the thread
      // This should return an array of Message objects
      // For now, we'll return an empty array
      return [] as Message[];
    },
    enabled: !!threadId,
  });

  const processedMessages = messages.data?.map((message) => ({
    ...message,
    content: message.content.trim() === '' && (!message.toolInvocations || Object.keys(message.toolInvocations).length === 0)
      ? "--"
      : message.content
  })) || [];

  return {
    messages: processedMessages,
    isLoading: messages.isLoading,
    isError: messages.isError,
    error: messages.error,
  };
};