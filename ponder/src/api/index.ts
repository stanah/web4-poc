import { Hono } from "hono";
import { db } from "ponder:api";
import { agent, feedbackEntry, validation } from "ponder:schema";
import { desc, eq, sql } from "ponder";

/**
 * Ponder REST API endpoints for ERC-8004 indexed data.
 */
const app = new Hono();

// GET /api/agents - List all indexed agents
app.get("/api/agents", async (c) => {
  const results = await db.select().from(agent).orderBy(desc(agent.tokenId));
  return c.json({ agents: results, total: results.length });
});

// GET /api/agents/:tokenId - Get a specific agent
app.get("/api/agents/:tokenId", async (c) => {
  const tokenId = parseInt(c.req.param("tokenId"));
  const results = await db
    .select()
    .from(agent)
    .where(eq(agent.tokenId, tokenId))
    .limit(1);

  if (results.length === 0) {
    return c.json({ error: "Agent not found" }, 404);
  }

  return c.json(results[0]);
});

// GET /api/feedback/:agentId - Get feedback for an agent
app.get("/api/feedback/:agentId", async (c) => {
  const agentId = parseInt(c.req.param("agentId"));
  const limit = parseInt(c.req.query("limit") ?? "50");
  const offset = parseInt(c.req.query("offset") ?? "0");

  const results = await db
    .select()
    .from(feedbackEntry)
    .where(eq(feedbackEntry.agentId, agentId))
    .orderBy(desc(feedbackEntry.timestamp))
    .limit(limit)
    .offset(offset);

  return c.json({ feedback: results, total: results.length });
});

// GET /api/feedback/:agentId/summary - Get aggregated feedback summary
app.get("/api/feedback/:agentId/summary", async (c) => {
  const agentId = parseInt(c.req.param("agentId"));

  const results = await db
    .select({
      totalFeedback: sql<number>`count(*)`,
      averageScore: sql<number>`coalesce(avg(${feedbackEntry.value} / power(10, ${feedbackEntry.decimals})), 0)`,
    })
    .from(feedbackEntry)
    .where(eq(feedbackEntry.agentId, agentId));

  const summary = results[0] ?? { totalFeedback: 0, averageScore: 0 };

  return c.json({
    agentId,
    totalFeedback: Number(summary.totalFeedback),
    averageScore: Number(summary.averageScore),
  });
});

// GET /api/validations/:agentId - Get validations for an agent
app.get("/api/validations/:agentId", async (c) => {
  const agentId = parseInt(c.req.param("agentId"));

  const results = await db
    .select()
    .from(validation)
    .where(eq(validation.agentId, agentId))
    .orderBy(desc(validation.timestamp));

  return c.json({ validations: results, total: results.length });
});

export default app;
