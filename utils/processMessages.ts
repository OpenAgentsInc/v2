import { Message } from '../hooks/chat/types';
import { inngest } from '../inngest/client';

export const processMessages = async (threadId: string, messages: Message[]) => {
  await inngest.send({
    name: 'chat/process.message',
    data: {
      threadId,
      messages,
    },
  });
};