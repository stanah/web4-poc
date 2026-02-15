import { ponder } from "ponder:registry";
import { agent } from "ponder:schema";

/**
 * Index IdentityRegistry Transfer events.
 * A Transfer from address(0) indicates a new agent registration (mint).
 * Subsequent transfers track ownership changes.
 */
ponder.on("IdentityRegistry:Transfer", async ({ event, context }) => {
  const { from, to, tokenId } = event.args;
  const isMint = from === "0x0000000000000000000000000000000000000000";

  if (isMint) {
    // New agent registration: read tokenURI from contract
    let metadataUri = "";
    try {
      const uri = await context.client.readContract({
        abi: context.contracts.IdentityRegistry.abi,
        address: context.contracts.IdentityRegistry.address,
        functionName: "tokenURI",
        args: [tokenId],
      });
      metadataUri = uri as string;
    } catch (err) {
      console.warn(`[IdentityRegistry] Failed to read tokenURI for token ${tokenId}:`, err);
    }

    await context.db
      .insert(agent)
      .values({
        tokenId: Number(tokenId),
        owner: to,
        metadataUri,
        blockNumber: Number(event.block.number),
        txHash: event.transaction.hash,
        timestamp: Number(event.block.timestamp),
      })
      .onConflictDoUpdate({
        owner: to,
        metadataUri,
        blockNumber: Number(event.block.number),
      });
  } else {
    // Ownership transfer — use upsert in case the indexer started after mint
    await context.db
      .insert(agent)
      .values({
        tokenId: Number(tokenId),
        owner: to,
        metadataUri: "",
        blockNumber: Number(event.block.number),
        txHash: event.transaction.hash,
        timestamp: Number(event.block.timestamp),
      })
      .onConflictDoUpdate({
        owner: to,
        blockNumber: Number(event.block.number),
      });
  }
});
