import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./_helpers";

export const triggerAlert = internalMutation({
  args: {
    userId: v.id("users"),
    checkInId: v.optional(v.id("checkIns")),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    batteryPercent: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const contacts = await ctx.db
      .query("trustedContacts")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.userId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    const notifiedIds = contacts
      .map((c) => c.contactUserId)
      .filter(Boolean) as any[];

    await ctx.db.insert("sosAlerts", {
      userId: args.userId,
      checkInId: args.checkInId,
      triggeredAt: Date.now(),
      latitude: args.latitude,
      longitude: args.longitude,
      batteryPercent: args.batteryPercent,
      message: "🚨 Emergency alert triggered",
      notifiedContacts: notifiedIds,
    });

    await ctx.db.insert("timelineEvents", {
      userId: args.userId,
      type: "sos_triggered",
      description: "SOS alert sent to trusted contacts",
      timestamp: Date.now(),
    });
  },
});

// Manual SOS trigger from the SOS button
export const triggerManual = mutation({
  args: {
    sessionToken: v.string(),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    batteryPercent: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.sessionToken);

    const contacts = await ctx.db
      .query("trustedContacts")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    const notifiedIds = contacts
      .map((c) => c.contactUserId)
      .filter(Boolean) as any[];

    await ctx.db.insert("sosAlerts", {
      userId: user._id,
      triggeredAt: Date.now(),
      latitude: args.latitude,
      longitude: args.longitude,
      batteryPercent: args.batteryPercent,
      message: "🚨 Emergency alert triggered",
      notifiedContacts: notifiedIds,
    });

    await ctx.db.insert("timelineEvents", {
      userId: user._id,
      type: "sos_triggered",
      description: "SOS alert manually triggered",
      timestamp: Date.now(),
    });
  },
});

// Alerts from people who trust the current user, that this user hasn't dismissed yet
export const listIncoming = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.sessionToken);

    const alerts = await ctx.db
      .query("sosAlerts")
      .filter((q) => q.neq(q.field("userId"), user._id))
      .order("desc")
      .collect();

    const relevant = alerts.filter(
      (a) =>
        a.notifiedContacts.includes(user._id) &&
        !(a.dismissedBy ?? []).includes(user._id)
    );

    const withNames = await Promise.all(
      relevant.map(async (a) => {
        const sender = await ctx.db.get(a.userId);
        return { ...a, senderName: sender?.name ?? "Unknown" };
      })
    );

    return withNames.slice(0, 20);
  },
});

// Mark an alert as seen/cleared for the current viewer only
export const dismissAlert = mutation({
  args: {
    sessionToken: v.string(),
    alertId: v.id("sosAlerts"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.sessionToken);
    const alert = await ctx.db.get(args.alertId);
    if (!alert) return;

    const dismissedBy = alert.dismissedBy ?? [];
    if (!dismissedBy.includes(user._id)) {
      await ctx.db.patch(args.alertId, {
        dismissedBy: [...dismissedBy, user._id],
      });
    }
  },
});