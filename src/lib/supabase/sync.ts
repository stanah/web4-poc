import { getSupabaseServerClient } from "./server";
import { bytes32ToTag } from "@/lib/erc8004/types";
import type { AgentMetadata } from "@/lib/erc8004/types";

/**
 * Supabase sync service.
 * Called by the /api/indexer/sync webhook to persist Ponder-indexed data
 * into Supabase for efficient querying by the Next.js frontend.
 */

interface PonderAgent {
  tokenId: number;
  owner: string;
  metadataUri: string;
  blockNumber: number;
  txHash: string;
  timestamp: number;
}

interface PonderFeedback {
  id: string;
  agentId: number;
  from: string;
  value: string;
  decimals: number;
  tag1: string;
  tag2: string;
  blockNumber: number;
  txHash: string;
  timestamp: number;
}

interface PonderValidation {
  id: string;
  agentId: number;
  validator: string;
  validationType: string;
  blockNumber: number;
  txHash: string;
  timestamp: number;
}

/**
 * Check if a URL points to a private/internal IP range (SSRF prevention).
 */
function isPrivateUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    const hostname = url.hostname;
    // Block private IPs, localhost, link-local, metadata endpoints
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "[::1]" ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("169.254.") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal")
    ) {
      return true;
    }
    // Only allow HTTPS for external URLs
    if (url.protocol !== "https:") return true;
    return false;
  } catch {
    return true;
  }
}

/**
 * Parse agent metadata from a data URI or fetch from external URL.
 * Includes SSRF protection: blocks private IPs, enforces HTTPS, adds timeout.
 */
async function parseMetadata(uri: string): Promise<AgentMetadata | null> {
  try {
    if (uri.startsWith("data:")) {
      const json = uri.split(",")[1];
      return JSON.parse(atob(json));
    } else if (uri.startsWith("https://")) {
      if (isPrivateUrl(uri)) return null;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        const res = await fetch(uri, { signal: controller.signal });
        if (!res.ok) return null;
        return await res.json();
      } finally {
        clearTimeout(timeout);
      }
    }
  } catch {
    // Invalid metadata
  }
  return null;
}

/**
 * Sync agents from Ponder to Supabase.
 */
export async function syncAgents(agents: PonderAgent[]): Promise<number> {
  const supabase = getSupabaseServerClient();
  let synced = 0;

  for (const agent of agents) {
    const metadata = await parseMetadata(agent.metadataUri);

    const { error } = await supabase
      .from("agents")
      .upsert(
        {
          token_id: agent.tokenId,
          owner: agent.owner,
          metadata_uri: agent.metadataUri,
          name: metadata?.name ?? `Agent #${agent.tokenId}`,
          description: metadata?.description ?? "",
          image: metadata?.image ?? null,
          tags: metadata?.tags ?? [],
          services: metadata?.services ?? [],
          block_number: agent.blockNumber,
          tx_hash: agent.txHash,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "token_id" },
      );

    if (!error) synced++;
  }

  return synced;
}

/**
 * Sync feedback entries from Ponder to Supabase.
 * Also triggers reputation summary recalculation.
 */
export async function syncFeedback(entries: PonderFeedback[]): Promise<number> {
  const supabase = getSupabaseServerClient();
  let synced = 0;
  const affectedAgents = new Set<number>();

  for (const entry of entries) {
    const { error } = await supabase
      .from("feedback")
      .upsert(
        {
          agent_id: entry.agentId,
          from_address: entry.from,
          value: entry.value,
          decimals: entry.decimals,
          tag1: bytes32ToTag(entry.tag1 as `0x${string}`),
          tag2: bytes32ToTag(entry.tag2 as `0x${string}`),
          block_number: entry.blockNumber,
          tx_hash: entry.txHash,
          block_timestamp: new Date(entry.timestamp * 1000).toISOString(),
        },
        { onConflict: "tx_hash" },
      );

    if (!error) {
      synced++;
      affectedAgents.add(entry.agentId);
    }
  }

  // Recalculate reputation summaries for affected agents
  for (const agentId of affectedAgents) {
    const { error: rpcError } = await supabase.rpc("upsert_reputation_summary", { p_agent_id: agentId });
    if (rpcError) {
      console.error(`[sync] Failed to update reputation summary for agent ${agentId}:`, rpcError);
    }
  }

  return synced;
}

/**
 * Sync validations from Ponder to Supabase.
 */
export async function syncValidations(
  validations: PonderValidation[],
): Promise<number> {
  const supabase = getSupabaseServerClient();
  let synced = 0;

  for (const v of validations) {
    const { error } = await supabase
      .from("validations")
      .upsert(
        {
          agent_id: v.agentId,
          validator: v.validator,
          validation_type: v.validationType,
          validation_data: "",
          block_number: v.blockNumber,
          tx_hash: v.txHash,
          block_timestamp: new Date(v.timestamp * 1000).toISOString(),
        },
        { onConflict: "tx_hash" },
      );

    if (!error) synced++;
  }

  return synced;
}
