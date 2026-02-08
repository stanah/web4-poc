import { NextResponse } from "next/server";
import { generateText } from "ai";
import { getModel } from "@/lib/ai/provider";
import { getAgentPrompt } from "@/lib/ai/agent-prompts";
import { getAgentById } from "@/lib/agents/seed-data";

export const maxDuration = 30;

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params: {
    name: string;
    arguments?: Record<string, unknown>;
  };
}

export async function POST(request: Request) {
  let rpcId: string | number = 0;
  try {
    const body = (await request.json()) as JsonRpcRequest;
    rpcId = body.id ?? 0;

    if (body.jsonrpc !== "2.0" || body.method !== "tools/call") {
      return NextResponse.json(
        { jsonrpc: "2.0", id: rpcId, error: { code: -32601, message: "Method not supported. Use tools/call" } },
        { status: 400 }
      );
    }

    const toolName = body.params?.name;
    const args = body.params?.arguments ?? {};

    const agent = getAgentById(1);
    let userPrompt: string;

    if (toolName === "get_price") {
      const pair = (args.pair as string) || "ETH/USD";
      userPrompt = `取引ペア ${pair} の現在価格データを提供してください。`;
    } else if (toolName === "compare_assets") {
      const assets = (args.assets as string[]) || ["ETH", "BTC"];
      userPrompt = `以下の資産を比較分析してください: ${assets.join(", ")}`;
    } else {
      return NextResponse.json(
        { jsonrpc: "2.0", id: rpcId, error: { code: -32602, message: `Unknown tool: ${toolName}` } },
        { status: 400 }
      );
    }

    const { text } = await generateText({
      model: getModel(agent?.model),
      system: getAgentPrompt(1),
      prompt: userPrompt,
    });

    return NextResponse.json({
      jsonrpc: "2.0",
      id: rpcId,
      result: {
        content: [{ type: "text", text }],
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
