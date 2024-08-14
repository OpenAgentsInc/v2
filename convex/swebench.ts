import { query } from "./_generated/server";

export const getAllSWEData = query({
  handler: async (ctx) => {
    const allData = await ctx.db.query("sbv_datum").collect();
    return allData;
  },
});
