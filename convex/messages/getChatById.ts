import { query } from '@/convex/_generated/server';
import { Id } from '@/convex/_generated/dataModel';

export const getChatById = query({
  args: {
    chatId: Id<'messages'>
  },
  handler: async ({ db }, { chatId }) => {
    const chat = await db.get(chatId);
    if (!chat) {
      throw new Error(`Chat with id ${chatId} not found`);
    }
    return chat;
  }
});