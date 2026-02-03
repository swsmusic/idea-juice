import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createVideo = mutation({
  args: {
    channelId: v.id("channels"),
    platformVideoId: v.string(),
    title: v.optional(v.string()),
    publishedAt: v.optional(v.number()),
    views: v.optional(v.number()),
    likes: v.optional(v.number()),
    comments: v.optional(v.number()),
    ctr: v.optional(v.number()),
    avgViewDuration: v.optional(v.number()),
    thumbnailUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if video already exists
    const existing = await ctx.db
      .query("videos")
      .withIndex("by_platform_id", (q) =>
        q.eq("channelId", args.channelId).eq("platformVideoId", args.platformVideoId)
      )
      .first();

    if (existing) {
      // Update existing video
      await ctx.db.patch(existing._id, {
        ...args,
        analyzedAt: Date.now(),
      });
      return existing._id;
    }

    // Create new video
    const videoId = await ctx.db.insert("videos", {
      ...args,
      analyzedAt: Date.now(),
    });
    return videoId;
  },
});

export const getVideosByChannel = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("videos")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .collect();
  },
});

export const getVideoById = query({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.videoId);
  },
});
