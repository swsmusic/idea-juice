import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createSuggestion = mutation({
  args: {
    videoId: v.id("videos"),
    type: v.string(),
    suggestion: v.string(),
    reason: v.optional(v.string()),
    priority: v.number(),
  },
  handler: async (ctx, args) => {
    const suggestionId = await ctx.db.insert("suggestions", {
      ...args,
      status: "pending",
    });
    return suggestionId;
  },
});

export const getSuggestionsByVideo = query({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("suggestions")
      .withIndex("by_video", (q) => q.eq("videoId", args.videoId))
      .collect();
  },
});

export const getPendingSuggestions = query({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("suggestions")
      .withIndex("by_video", (q) => q.eq("videoId", args.videoId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
  },
});

export const updateSuggestionStatus = mutation({
  args: {
    suggestionId: v.id("suggestions"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const updates: any = { status: args.status };
    if (args.status === "implemented") {
      updates.implementedAt = Date.now();
    }
    await ctx.db.patch(args.suggestionId, updates);
  },
});
