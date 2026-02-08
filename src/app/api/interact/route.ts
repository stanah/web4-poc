import {
  streamText,
  UIMessage,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";
import { getModel } from "@/lib/ai/provider";
import { getAgentPrompt } from "@/lib/ai/agent-prompts";
import { getAgentById } from "@/lib/agents/seed-data";
import { callAgentEndpoint } from "@/lib/agents/endpoint-client";

export const maxDuration = 30;

export async function POST(request: Request) {
  const { messages, agentId }: { messages: UIMessage[]; agentId: number } =
    await request.json();

  const agent = getAgentById(agentId);
  const lastUserMessage =
    messages
      .filter((m) => m.role === "user")
      .pop()
      ?.parts?.filter((p) => p.type === "text")
      .map((p) => (p as { type: "text"; text: string }).text)
      .join("\n") ?? "";

  const service = agent?.services[0];

  if (agent && service?.endpoint) {
    try {
      const text = await callAgentEndpoint(
        service.endpoint,
        service.type,
        service.name,
        lastUserMessage
      );

      return createUIMessageStreamResponse({
        stream: createUIMessageStream({
          execute({ writer }) {
            writer.write({ type: "text-start", id: "endpoint-response" });
            writer.write({
              type: "text-delta",
              id: "endpoint-response",
              delta: text,
            });
            writer.write({ type: "text-end", id: "endpoint-response" });
          },
        }),
      });
    } catch {
      // Fallback to direct LLM call
    }
  }

  try {
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
