import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createChannel = mutation({
  args: {
    userId: v.id("users"),
    platform: v.string(),
    platformChannelId: v.string(),
    channelName: v.optional(v.string()),
    phylloAccountId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const channelId = await ctx.db.insert("channels", {
      ...args,
      connectedAt: Date.now(),
    });
    return channelId;
  },
});

export const getChannelsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("channels")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const updateChannelSync = mutation({
  args: {
    channelId: v.id("channels"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.channelId, {
      lastSyncedAt: Date.now(),
    });
  },
});
