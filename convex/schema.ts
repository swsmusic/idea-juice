import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    phylloUserId: v.optional(v.string()),
    subscriptionTier: v.string(), // 'discovery', 'growth', 'scale'
  }).index("by_email", ["email"]),

  channels: defineTable({
    userId: v.id("users"),
    platform: v.string(), // 'youtube', 'tiktok', etc.
    platformChannelId: v.string(),
    channelName: v.optional(v.string()),
    phylloAccountId: v.optional(v.string()),
    connectedAt: v.number(),
    lastSyncedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_platform_id", ["userId", "platform", "platformChannelId"]),

  videos: defineTable({
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
    analyzedAt: v.optional(v.number()),
  })
    .index("by_channel", ["channelId"])
    .index("by_platform_id", ["channelId", "platformVideoId"]),

  suggestions: defineTable({
    videoId: v.id("videos"),
    type: v.string(), // 'title', 'thumbnail', 'hook', 'length', etc.
    suggestion: v.string(),
    reason: v.optional(v.string()),
    priority: v.number(), // 1-5
    status: v.string(), // 'pending', 'implemented', 'dismissed'
    implementedAt: v.optional(v.number()),
  })
    .index("by_video", ["videoId"])
    .index("by_status", ["status"]),
});
