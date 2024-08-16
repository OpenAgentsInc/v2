import { query } from '@/convex/_generated/server';
import { Id } from '@/convex/_generated/dataModel';

export const getChatById = query({
  args: {
    chatId: 'id'
  },
  handler: async ({ db }, { chatId }) => {
    const chat = await db.get(chatId as Id<'messages'>);
    if (!chat) {
      throw new Error(`Chat with id ${chatId} not found`);
    }
    return chat;
  }
});