import { ponder } from "ponder:registry";
import { validation } from "ponder:schema";

/**
 * Index ValidationRegistry Validated events.
 * Each event represents a third-party validation recorded for an agent.
 */
ponder.on("ValidationRegistry:Validated", async ({ event, context }) => {
  const { agentId, validator, validationType } = event.args;

  const id = `${event.transaction.hash}-${event.log.logIndex}`;

  await context.db
    .insert(validation)
    .values({
      id,
      agentId: Number(agentId),
      validator,
      validationType,
      blockNumber: Number(event.block.number),
      txHash: event.transaction.hash,
      timestamp: Number(event.block.timestamp),
    })
    .onConflictDoNothing();
});
