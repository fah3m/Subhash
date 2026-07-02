import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./_helpers";

export const inviteContact = mutation({
  args: {
    sessionToken: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.sessionToken);

    const normalizedEmail = args.email.toLowerCase().trim();

    // Don't allow inviting yourself
    if (normalizedEmail === user.email) {
      throw new Error("You can't invite yourself.");
    }

    // Don't allow duplicates
    const existing = await ctx.db
      .query("trustedContacts")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .filter((q) => q.eq(q.field("email"), normalizedEmail))
      .first();

    if (existing) throw new Error("This person is already in your circle.");

    const invitedUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();

    await ctx.db.insert("trustedContacts", {
      ownerId: user._id,
      contactUserId: invitedUser?._id,
      email: normalizedEmail,
      name: args.name.trim(),
      status: "pending",
      invitedAt: Date.now(),
    });

    await ctx.db.insert("timelineEvents", {
      userId: user._id,
      type: "contact_added",
      description: `Invited ${args.name} to trusted circle`,
      timestamp: Date.now(),
    });
  },
});

export const acceptInvite = mutation({
  args: {
    sessionToken: v.string(),
    contactId: v.id("trustedContacts"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.sessionToken);
    const contact = await ctx.db.get(args.contactId);
    if (!contact) throw new Error("Invite not found.");

    await ctx.db.patch(args.contactId, {
      status: "accepted",
      contactUserId: user._id,
    });
  },
});

export const removeContact = mutation({
  args: {
    sessionToken: v.string(),
    contactId: v.id("trustedContacts"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.sessionToken);
    const contact = await ctx.db.get(args.contactId);
    if (!contact || contact.ownerId !== user._id) throw new Error("Not found.");
    await ctx.db.delete(args.contactId);
  },
});

export const listMyContacts = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    const user = await requireUser(ctx, sessionToken);
    return await ctx.db
      .query("trustedContacts")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();
  },
});

export const listPendingInvites = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    const user = await requireUser(ctx, sessionToken);

    const invites = await ctx.db
      .query("trustedContacts")
      .filter((q) =>
        q.and(
          q.eq(q.field("email"), user.email),
          q.eq(q.field("status"), "pending")
        )
      )
      .collect();

    // Fetch the sender's details for each invite
    return await Promise.all(
      invites.map(async (invite) => {
        const sender = await ctx.db.get(invite.ownerId);
        return {
          ...invite,
          senderName: sender?.name ?? "Unknown",
          senderEmail: sender?.email ?? "",
        };
      })
    );
  },
});