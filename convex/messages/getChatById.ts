import { query } from './_generated/server';
import { Id } from './_generated/dataModel';

export const getChatById = query(async ({ db }, chatId: Id<'messages'>) => {
  const chat = await db.get(chatId);
  if (!chat) {
    throw new Error(`Chat with id ${chatId} not found`);
  }
  return chat;
});