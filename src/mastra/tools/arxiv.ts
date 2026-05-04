import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const arxivSearch = createTool({
  id: "arxivSearch",
  description: "Search academic papers on ArXiv.",
  inputSchema: z.object({
    query: z.string().describe("The search query for ArXiv"),
  }),
  execute: async ({ context }) => {
    try {
      const url = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(context.query)}&start=0&max_results=3`;
      const response = await fetch(url);
      const data = await response.text();
      return { data };
    } catch (e) {
      console.error(e);
      return { error: "Failed to search ArXiv" };
    }
  },
});
