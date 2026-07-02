import { internalAction, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./_helpers";

export const savePushToken = mutation({
  args: {
    sessionToken: v.string(),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.sessionToken);
    await ctx.db.patch(user._id, { pushToken: args.token });
  },
});

export const sendPush = internalAction({
  args: {
    token: v.string(),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        to: args.token,
        title: args.title,
        body: args.body,
        data: args.data ?? {},
        sound: "default",
        priority: "high",
      }),
    });
  },
});