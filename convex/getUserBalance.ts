import { query } from './_generated/server';
import { v } from 'convex/values';

export default query({
  args: { clerk_user_id: v.string() },
  handler: async ({ db }, { clerk_user_id }) => {
    const user = await db
      .query('users')
      .withIndex('by_clerk_user_id', (q) => q.eq('clerk_user_id', clerk_user_id))
      .first();

    return user?.credits ?? 0;
  },
});