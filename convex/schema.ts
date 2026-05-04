import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  threads: defineTable({
    title: v.optional(v.string()),
    createdAt: v.number(),
  }),
  messages: defineTable({
    threadId: v.id("threads"),
    role: v.string(), // "user" | "assistant" | "system"
    content: v.string(),
    createdAt: v.number(),
  }).index("by_thread", ["threadId"]),
});
