import { NextResponse } from "next/server";
import { generateText } from "ai";
import { getModel } from "@/lib/ai/provider";
import { getAgentPrompt } from "@/lib/ai/agent-prompts";
import { getAgentById } from "@/lib/agents/seed-data";

export const maxDuration = 30;

interface A2AMessage {
  role: string;
  parts: { type: string; text: string }[];
}

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params: {
    message: A2AMessage;
  };
}

export async function POST(request: Request) {
  let rpcId: string | number = 0;
  try {
    const body = (await request.json()) as JsonRpcRequest;
    rpcId = body.id ?? 0;

    if (body.jsonrpc !== "2.0" || body.method !== "message/send") {
      return NextResponse.json(
        { jsonrpc: "2.0", id: rpcId, error: { code: -32601, message: "Method not supported. Use message/send" } },
        { status: 400 }
      );
    }

    const userText = body.params?.message?.parts
      ?.filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("\n");

    if (!userText) {
      return NextResponse.json(
        { jsonrpc: "2.0", id: rpcId, error: { code: -32602, message: "No text content in message" } },
        { status: 400 }
      );
    }

    const agent = getAgentById(3);
    const { text } = await generateText({
      model: getModel(agent?.model),
      system: getAgentPrompt(3),
      prompt: userText,
    });

    return NextResponse.json({
      jsonrpc: "2.0",
      id: rpcId,
      result: {
        artifacts: [
          {
            parts: [{ type: "text", text }],
          },
        ],
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json(
      { jsonrpc: "2.0", id: rpcId, error: { code: -32603, message } },
      { status: 500 }
    );
  }
}
