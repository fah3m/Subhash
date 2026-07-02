import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./_helpers";

export const saveEvidence = mutation({
  args: {
    sessionToken: v.string(),
    title: v.string(),
    category: v.union(
      v.literal("photo"),
      v.literal("video"),
      v.literal("audio"),
      v.literal("screenshot"),
      v.literal("medical"),
      v.literal("document")
    ),
    fileUrl: v.string(),
    cloudinaryPublicId: v.string(),
    fileFormat: v.optional(v.string()),
    fileSizeBytes: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.sessionToken);
    const { sessionToken: _, ...rest } = args;

    const evidenceId = await ctx.db.insert("evidence", {
      userId: user._id,
      ...rest,
      timestamp: Date.now(),
    });

    await ctx.db.insert("timelineEvents", {
      userId: user._id,
      type: "evidence_uploaded",
      description: `Evidence uploaded: "${args.title}"`,
      relatedId: evidenceId,
      timestamp: Date.now(),
    });

    return evidenceId;
  },
});

export const listEvidence = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    const user = await requireUser(ctx, sessionToken);
    return await ctx.db
      .query("evidence")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const deleteEvidence = mutation({
  args: {
    sessionToken: v.string(),
    evidenceId: v.id("evidence"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.sessionToken);
    const item = await ctx.db.get(args.evidenceId);
    if (!item || item.userId !== user._id) throw new Error("Not found");
    await ctx.db.delete(args.evidenceId);
  },
});