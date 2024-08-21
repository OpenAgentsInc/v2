import { useMutation } from '@tanstack/react-query';
import { ChatCoreType } from './types';
import { processMessages } from '../../utils/processMessages';

export const useChatMutations = (core: ChatCoreType) => {
  const { queryClient, threadId } = core;

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      // Implement the logic to send a message
      // This should include calling the processMessages function
      await processMessages(threadId, [{ role: 'user', content: message }]);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['messages', threadId]);
    },
  });

  return {
    sendMessage,
  };
};