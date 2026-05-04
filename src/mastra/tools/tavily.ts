import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const tavilySearch = createTool({
  id: "tavilySearch",
  description: "Search the web using Tavily API.",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
  }),
  execute: async ({ query }) => {
    try {
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: process.env.TAVILY_API_KEY,
          query: query,
          search_depth: "basic",
        }),
      });
      return await response.json();
    } catch (e) {
      console.error(e);
      return { error: "Failed to search Tavily" };
    }
  },
});
