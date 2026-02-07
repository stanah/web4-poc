import { ponder } from "@/generated";
import { agent, feedbackEntry, validation } from "../../ponder.schema";
import { desc, eq, sql } from "@ponder/core";

/**
 * Ponder GraphQL API is auto-generated.
 * These additional REST endpoints provide custom query patterns.
 */

// GET /api/agents - List all indexed agents
ponder.get("/api/agents", async (c) => {
  const results = await c.db.select().from(agent).orderBy(desc(agent.tokenId));
  return c.json({ agents: results, total: results.length });
});

// GET /api/agents/:tokenId - Get a specific agent
ponder.get("/api/agents/:tokenId", async (c) => {
  const tokenId = parseInt(c.req.param("tokenId"));
  const results = await c.db
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
ponder.get("/api/feedback/:agentId", async (c) => {
  const agentId = parseInt(c.req.param("agentId"));
  const limit = parseInt(c.req.query("limit") ?? "50");
  const offset = parseInt(c.req.query("offset") ?? "0");

  const results = await c.db
    .select()
    .from(feedbackEntry)
    .where(eq(feedbackEntry.agentId, agentId))
    .orderBy(desc(feedbackEntry.timestamp))
    .limit(limit)
    .offset(offset);

  return c.json({ feedback: results, total: results.length });
});

// GET /api/feedback/:agentId/summary - Get aggregated feedback summary
ponder.get("/api/feedback/:agentId/summary", async (c) => {
  const agentId = parseInt(c.req.param("agentId"));

  const results = await c.db
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
ponder.get("/api/validations/:agentId", async (c) => {
  const agentId = parseInt(c.req.param("agentId"));

  const results = await c.db
    .select()
    .from(validation)
    .where(eq(validation.agentId, agentId))
    .orderBy(desc(validation.timestamp));

  return c.json({ validations: results, total: results.length });
});
