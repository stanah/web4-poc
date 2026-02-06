import { streamText, UIMessage, convertToModelMessages } from "ai";
import { getModel } from "@/lib/ai/provider";
import { getAgentPrompt } from "@/lib/ai/agent-prompts";
import { getAgentById } from "@/lib/agents/seed-data";

export const maxDuration = 30;

export async function POST(request: Request) {
  const { messages, agentId }: { messages: UIMessage[]; agentId: number } =
    await request.json();

  try {
    const agent = getAgentById(agentId);
    const result = streamText({
      model: getModel(agent?.model),
      system: getAgentPrompt(agentId),
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate response";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
