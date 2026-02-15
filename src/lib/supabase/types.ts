/**
 * Supabase Database type definitions.
 * Generated from the migration schema for ERC-8004 AI Agent Economy.
 */

export interface AgentServiceJson {
  type: "MCP" | "A2A";
  name: string;
  description: string;
  endpoint?: string;
}

// Standalone row/insert types to avoid circular self-references

export interface AgentRow {
  id: number;
  token_id: number;
  owner: string;
  metadata_uri: string;
  name: string;
  description: string;
  image: string | null;
  tags: string[];
  services: AgentServiceJson[];
  block_number: number;
  tx_hash: string;
  created_at: string;
  updated_at: string;
}

export interface AgentInsert {
  token_id: number;
  owner: string;
  metadata_uri: string;
  name: string;
  description: string;
  image?: string | null;
  tags: string[];
  services: AgentServiceJson[];
  block_number: number;
  tx_hash: string;
}

export interface FeedbackRow {
  id: number;
  agent_id: number;
  from_address: string;
  value: string; // NUMERIC returned as string by PostgREST to preserve int256 precision
  decimals: number;
  tag1: string;
  tag2: string;
  block_number: number;
  tx_hash: string;
  block_timestamp: string;
  created_at: string;
}

export interface FeedbackInsert {
  agent_id: number;
  from_address: string;
  value: string; // NUMERIC - use string to preserve int256 precision
  decimals: number;
  tag1: string;
  tag2: string;
  block_number: number;
  tx_hash: string;
  block_timestamp: string;
}

export interface ValidationRow {
  id: number;
  agent_id: number;
  validator: string;
  validation_type: string;
  validation_data: string;
  block_number: number;
  tx_hash: string;
  block_timestamp: string;
  created_at: string;
}

export interface ValidationInsert {
  agent_id: number;
  validator: string;
  validation_type: string;
  validation_data: string;
  block_number: number;
  tx_hash: string;
  block_timestamp: string;
}

export interface ReputationSummaryRow {
  agent_id: number;
  total_feedback: number;
  average_score: string; // NUMERIC returned as string by PostgREST
  tag_counts: Record<string, number>;
  last_feedback_at: string | null;
  updated_at: string;
}

export interface IndexerStateRow {
  id: number;
  contract_name: string;
  last_block: number;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      agents: {
        Row: AgentRow;
        Insert: AgentInsert;
        Update: Partial<AgentInsert>;
      };
      feedback: {
        Row: FeedbackRow;
        Insert: FeedbackInsert;
        Update: Partial<FeedbackInsert>;
      };
      validations: {
        Row: ValidationRow;
        Insert: ValidationInsert;
        Update: Partial<ValidationInsert>;
      };
      reputation_summaries: {
        Row: ReputationSummaryRow;
        Insert: Omit<ReputationSummaryRow, "updated_at">;
        Update: Partial<Omit<ReputationSummaryRow, "updated_at">>;
      };
      indexer_state: {
        Row: IndexerStateRow;
        Insert: Omit<IndexerStateRow, "id" | "updated_at">;
        Update: Partial<Omit<IndexerStateRow, "id" | "updated_at">>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      upsert_reputation_summary: {
        Args: { p_agent_id: number };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
  };
}

/** Convenience type aliases */
export type Agent = AgentRow;
export type Feedback = FeedbackRow;
export type Validation = ValidationRow;
export type ReputationSummary = ReputationSummaryRow;
