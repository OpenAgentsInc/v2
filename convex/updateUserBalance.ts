import { mutation } from './_generated/server';
import { v } from 'convex/values';

export default mutation(async ({ db }, { clerk_user_id, cost_in_cents }: { clerk_user_id: string, cost_in_cents: number }) => {
  const user = await db
    .query('users')
    .withIndex('by_clerk_user_id', (q) => q.eq('clerk_user_id', clerk_user_id))
    .first();

  if (!user) {
    throw new Error('User not found');
  }

  await db.patch(user._id, { credits: user.credits - cost_in_cents / 100 });
});