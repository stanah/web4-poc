import { ponder } from "@/generated";
import { feedbackEntry } from "../ponder.schema";

/**
 * Index ReputationRegistry FeedbackGiven events.
 * Each event represents a feedback score submitted for an agent.
 */
ponder.on("ReputationRegistry:FeedbackGiven", async ({ event, context }) => {
  const { agentId, from, value, decimals, tag1, tag2 } = event.args;

  const id = `${event.transaction.hash}-${event.log.logIndex}`;

  await context.db
    .insert(feedbackEntry)
    .values({
      id,
      agentId: Number(agentId),
      from,
      value,
      decimals,
      tag1,
      tag2,
      blockNumber: Number(event.block.number),
      txHash: event.transaction.hash,
      timestamp: Number(event.block.timestamp),
    })
    .onConflictDoNothing();
});
