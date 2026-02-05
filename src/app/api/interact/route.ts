import { streamText, UIMessage, convertToModelMessages } from "ai";
import { getModel } from "@/lib/ai/provider";
import { getAgentPrompt } from "@/lib/ai/agent-prompts";

export const maxDuration = 30;

export async function POST(request: Request) {
  const { messages, agentId }: { messages: UIMessage[]; agentId: number } =
    await request.json();

  const result = streamText({
    model: getModel(),
    system: getAgentPrompt(agentId),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
