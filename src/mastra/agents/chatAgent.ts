import { Agent } from "@mastra/core/agent";
import { tavilySearch } from "../tools/tavily";
import { arxivSearch } from "../tools/arxiv";

export const chatAgent = new Agent({
  name: "chatAgent",
  instructions: "You are a highly capable AI assistant with access to web search and academic papers. Use the provided tools to answer user queries thoughtfully and accurately. If searching the web or arxiv, synthesize the information nicely.",
  model: {
    provider: "GOOGLE",
    name: "gemini-2.5-flash",
  },
  tools: {
    tavilySearch,
    arxivSearch,
  },
});
