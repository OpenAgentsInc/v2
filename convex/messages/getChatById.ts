import { query } from '@/convex/_generated/server';
import { v } from 'convex/values';

export const getChatById = query({
  args: {
    chatId: v.id('messages')
  },
  handler: async ({ db }, { chatId }) => {
    const chat = await db.get(chatId);
    if (!chat) {
      throw new Error(`Chat with id ${chatId} not found`);
    }
    return chat;
  }
});