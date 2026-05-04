import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.threadId);
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("threads").order("desc").collect();
  },
});

export const create = mutation({
  args: { title: v.optional(v.string()) },
  handler: async (ctx, args) => {
    return await ctx.db.insert("threads", {
      title: args.title,
      createdAt: Date.now(),
    });
  },
});
