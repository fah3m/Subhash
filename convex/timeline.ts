import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./_helpers";

export const listEvents = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    const user = await requireUser(ctx, sessionToken);
    return await ctx.db
      .query("timelineEvents")
      .withIndex("by_user_time", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});
