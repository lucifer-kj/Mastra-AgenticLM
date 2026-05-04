import { handleChatStream } from "@mastra/ai-sdk";
import { createUIMessageStreamResponse } from "ai";
import { mastra } from "@/mastra";

export async function POST(req: Request) {
  try {
    const params = await req.json();
    const stream = await handleChatStream({
      mastra,
      agentId: "chatAgent",
      params,
    });
    return createUIMessageStreamResponse({ stream: stream as any });
  } catch (error) {
    console.error("Error in chat route:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
