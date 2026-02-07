import { onchainTable, index, primaryKey } from "@ponder/core";

/**
 * Ponder schema for indexed ERC-8004 contract data.
 * These tables are managed by Ponder and kept in sync with on-chain state.
 */

export const agent = onchainTable("agent", (t) => ({
  tokenId: t.integer().primaryKey(),
  owner: t.hex().notNull(),
  metadataUri: t.text().notNull().default(""),
  blockNumber: t.integer().notNull(),
  txHash: t.hex().notNull(),
  timestamp: t.integer().notNull(),
}), (table) => ({
  ownerIdx: index().on(table.owner),
}));

export const feedbackEntry = onchainTable("feedback_entry", (t) => ({
  id: t.text().primaryKey(), // txHash-logIndex
  agentId: t.integer().notNull(),
  from: t.hex().notNull(),
  value: t.bigint().notNull(),
  decimals: t.integer().notNull(),
  tag1: t.hex().notNull(),
  tag2: t.hex().notNull(),
  blockNumber: t.integer().notNull(),
  txHash: t.hex().notNull(),
  timestamp: t.integer().notNull(),
}), (table) => ({
  agentIdx: index().on(table.agentId),
  fromIdx: index().on(table.from),
}));

export const validation = onchainTable("validation", (t) => ({
  id: t.text().primaryKey(), // txHash-logIndex
  agentId: t.integer().notNull(),
  validator: t.hex().notNull(),
  validationType: t.text().notNull(),
  blockNumber: t.integer().notNull(),
  txHash: t.hex().notNull(),
  timestamp: t.integer().notNull(),
}), (table) => ({
  agentIdx: index().on(table.agentId),
  validatorIdx: index().on(table.validator),
}));
