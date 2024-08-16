import { query } from './_generated/server';
import { Doc } from './_generated/dataModel';

export const getLastMessage = query(async ({ db, auth }): Promise<Doc<'messages'> | null> => {
  const identity = await auth.getUserIdentity();
  if (!identity) {
    throw new Error('Unauthenticated call to getLastMessage');
  }

  const messages = await db
    .query('messages')
    .order('desc')
    .filter((q) => q.eq(q.field('userId'), identity.subject))
    .take(1);

  return messages[0] || null;
});