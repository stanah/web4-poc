import { NextResponse } from "next/server";
import { syncAgents, syncFeedback, syncValidations } from "@/lib/supabase/sync";

/**
 * POST /api/indexer/sync
 *
 * Webhook endpoint called by Ponder (or a cron job) to sync indexed
 * blockchain data into Supabase. Protected by a shared secret.
 *
 * Body: { type: "agents" | "feedback" | "validations", data: [...] }
 */
export async function POST(request: Request) {
  // Fail closed: reject if webhook secret is not configured
  const expectedToken = process.env.INDEXER_WEBHOOK_SECRET;
  if (!expectedToken) {
    console.error("[indexer/sync] INDEXER_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !Array.isArray(data)) {
      return NextResponse.json(
        { error: "Invalid payload: expected { type, data[] }" },
        { status: 400 },
      );
    }

    let synced = 0;

    switch (type) {
      case "agents":
        synced = await syncAgents(data);
        break;
      case "feedback":
        synced = await syncFeedback(data);
        break;
      case "validations":
        synced = await syncValidations(data);
        break;
      default:
        return NextResponse.json(
          { error: `Unknown type: ${type}` },
          { status: 400 },
        );
    }

    return NextResponse.json({
      ok: true,
      type,
      synced,
      total: data.length,
    });
  } catch (err) {
    console.error("[indexer/sync] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
