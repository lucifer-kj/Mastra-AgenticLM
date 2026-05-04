import { Agent } from "@mastra/core/agent";
import { groq } from "@ai-sdk/groq";
import { tavilySearch } from "../tools/tavily";
import { arxivSearch } from "../tools/arxiv";

export const reasoningAgent = new Agent({
  id: "reasoningAgent",
  name: "Groq Reasoning Engine",
  instructions:
    "You are a high-speed reasoning engine. Analyze the user query and use tools if needed. Synthesize a concise but complete answer. If you use a tool, explain briefly what you found.",
  model: groq("llama-3.3-70b-versatile"),
  tools: {
    tavilySearch,
    arxivSearch,
  },
});
