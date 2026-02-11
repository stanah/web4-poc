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
    name?: string;
    arguments?: Record<string, unknown>;
    message?: A2AMessage;
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const agentId = parseInt(id, 10);
  let rpcId: string | number = 0;

  try {
    const agent = getAgentById(agentId);
    if (!agent) {
      return NextResponse.json(
        { jsonrpc: "2.0", id: rpcId, error: { code: -32602, message: `Agent ${agentId} not found` } },
        { status: 404 },
      );
    }

    const body = (await request.json()) as JsonRpcRequest;
    rpcId = body.id ?? 0;

    const serviceType = agent.services[0]?.type;

    // --- MCP Protocol (tools/call) ---
    if (serviceType === "MCP") {
      if (body.jsonrpc !== "2.0" || body.method !== "tools/call") {
        return NextResponse.json(
          { jsonrpc: "2.0", id: rpcId, error: { code: -32601, message: "Method not supported. Use tools/call" } },
          { status: 400 },
        );
      }

      const toolName = body.params?.name;
      const args = body.params?.arguments ?? {};

      // Build prompt from tool name and arguments
      const userPrompt = toolName
        ? `ツール「${toolName}」が以下の引数で呼び出されました: ${JSON.stringify(args)}。適切に処理してください。`
        : `以下のリクエストを処理してください: ${JSON.stringify(args)}`;

      const { text } = await generateText({
        model: getModel(agent.model),
        system: getAgentPrompt(agentId),
        prompt: (args.query as string) || (args.pair as string) || userPrompt,
      });

      return NextResponse.json({
        jsonrpc: "2.0",
        id: rpcId,
        result: {
          content: [{ type: "text", text }],
        },
      });
    }

    // --- A2A Protocol (message/send) ---
    if (body.jsonrpc !== "2.0" || body.method !== "message/send") {
      return NextResponse.json(
        { jsonrpc: "2.0", id: rpcId, error: { code: -32601, message: "Method not supported. Use message/send" } },
        { status: 400 },
      );
    }

    const userText = body.params?.message?.parts
      ?.filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("\n");

    if (!userText) {
      return NextResponse.json(
        { jsonrpc: "2.0", id: rpcId, error: { code: -32602, message: "No text content in message" } },
        { status: 400 },
      );
    }

    const { text } = await generateText({
      model: getModel(agent.model),
      system: getAgentPrompt(agentId),
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
      { status: 500 },
    );
  }
}
