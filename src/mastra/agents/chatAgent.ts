import { Agent } from "@mastra/core/agent";
import { google } from "@ai-sdk/google";
import { reasoningAgent } from "./reasoningAgent";

export const chatAgent = new Agent({
  id: "chatAgent",
  name: "AgenticLM (Primary)",
  instructions:
    "You are the primary interface for AgenticLM. Your goal is to provide fast, helpful responses. For general chat, use your internal knowledge. If a user asks for web search, academic papers, or complex reasoning, use the 'reasoningAgent' tool. IMPORTANT: Once you receive the answer from the 'reasoningAgent', synthesize it for the user and DO NOT call it again for the same query. Avoid recursive loops.",
  model: google("gemini-2.5-flash"),
  tools: {
    reasoningAgent,
  },
});
