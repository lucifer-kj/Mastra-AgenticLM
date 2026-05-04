import { handleChatStream } from "@mastra/ai-sdk";
import { createUIMessageStreamResponse } from "ai";
import { mastra } from "@/mastra";

export async function POST(req: Request) {
  console.log("[SERVER] Incoming Chat Request");
  try {
    const params = await req.json();
    
    // handleChatStream automatically captures telemetry if configured in Mastra instance
    const stream = await handleChatStream({
      mastra,
      agentId: "chatAgent",
      params,
    });

    return createUIMessageStreamResponse({ stream: stream as any });
  } catch (error: any) {
    console.error("[SERVER] Chat Error:", error.message);
    return new Response(JSON.stringify({ 
      error: "Internal Server Error", 
      details: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
