import { query } from "../_generated/server"

export const getAllUsers = query({
  args: {},
  async handler(ctx) {
    const users = await ctx.db.query("users").collect();

    // Remove sensitive information (email and credits) from each user
    // const sanitizedUsers = users.map(({ credits, ...user }) => user);

    return users;
  },
});
