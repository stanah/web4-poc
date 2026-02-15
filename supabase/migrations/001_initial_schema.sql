-- ============================================================
-- Web4 PoC - ERC-8004 AI Agent Economy
-- Supabase Database Schema
-- ============================================================

-- Agents table: indexed from IdentityRegistry Transfer events
CREATE TABLE IF NOT EXISTS agents (
  id            BIGSERIAL PRIMARY KEY,
  token_id      INTEGER NOT NULL UNIQUE,
  owner         TEXT NOT NULL,
  metadata_uri  TEXT NOT NULL DEFAULT '',
  name          TEXT NOT NULL DEFAULT '',
  description   TEXT NOT NULL DEFAULT '',
  image         TEXT,
  tags          TEXT[] NOT NULL DEFAULT '{}',
  services      JSONB NOT NULL DEFAULT '[]',
  block_number  INTEGER NOT NULL DEFAULT 0,
  tx_hash       TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agents_owner ON agents (owner);
CREATE INDEX idx_agents_tags ON agents USING GIN (tags);
CREATE INDEX idx_agents_token_id ON agents (token_id);

-- Feedback table: indexed from ReputationRegistry FeedbackGiven events
CREATE TABLE IF NOT EXISTS feedback (
  id              BIGSERIAL PRIMARY KEY,
  agent_id        INTEGER NOT NULL REFERENCES agents(token_id),
  from_address    TEXT NOT NULL,
  value           NUMERIC NOT NULL,
  decimals        INTEGER NOT NULL DEFAULT 2,
  tag1            TEXT NOT NULL DEFAULT '',
  tag2            TEXT NOT NULL DEFAULT '',
  block_number    INTEGER NOT NULL DEFAULT 0,
  tx_hash         TEXT NOT NULL UNIQUE,
  block_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feedback_agent_id ON feedback (agent_id);
CREATE INDEX idx_feedback_from ON feedback (from_address);
CREATE INDEX idx_feedback_timestamp ON feedback (block_timestamp);

-- Validations table: indexed from ValidationRegistry Validated events
CREATE TABLE IF NOT EXISTS validations (
  id               BIGSERIAL PRIMARY KEY,
  agent_id         INTEGER NOT NULL REFERENCES agents(token_id),
  validator        TEXT NOT NULL,
  validation_type  TEXT NOT NULL DEFAULT '',
  validation_data  TEXT NOT NULL DEFAULT '',
  block_number     INTEGER NOT NULL DEFAULT 0,
  tx_hash          TEXT NOT NULL UNIQUE,
  block_timestamp  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_validations_agent_id ON validations (agent_id);
CREATE INDEX idx_validations_validator ON validations (validator);

-- Reputation summaries: materialized aggregation of feedback per agent
CREATE TABLE IF NOT EXISTS reputation_summaries (
  agent_id         INTEGER PRIMARY KEY REFERENCES agents(token_id),
  total_feedback   INTEGER NOT NULL DEFAULT 0,
  average_score    NUMERIC NOT NULL DEFAULT 0,
  tag_counts       JSONB NOT NULL DEFAULT '{}',
  last_feedback_at TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexer state: tracks Ponder sync progress per contract
CREATE TABLE IF NOT EXISTS indexer_state (
  id             BIGSERIAL PRIMARY KEY,
  contract_name  TEXT NOT NULL UNIQUE,
  last_block     INTEGER NOT NULL DEFAULT 0,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Function: Recalculate reputation summary for an agent
-- Called by Ponder webhook after new feedback is indexed
-- ============================================================
CREATE OR REPLACE FUNCTION upsert_reputation_summary(p_agent_id INTEGER)
RETURNS VOID AS $$
DECLARE
  v_total    INTEGER;
  v_avg      NUMERIC;
  v_tags     JSONB;
  v_last     TIMESTAMPTZ;
BEGIN
  SELECT
    COUNT(*),
    COALESCE(AVG(value / POWER(10, decimals)), 0),
    MAX(block_timestamp)
  INTO v_total, v_avg, v_last
  FROM feedback
  WHERE agent_id = p_agent_id;

  -- Aggregate tag counts
  SELECT COALESCE(jsonb_object_agg(tag, cnt), '{}')
  INTO v_tags
  FROM (
    SELECT tag, COUNT(*) as cnt FROM (
      SELECT tag1 AS tag FROM feedback WHERE agent_id = p_agent_id AND tag1 != ''
      UNION ALL
      SELECT tag2 AS tag FROM feedback WHERE agent_id = p_agent_id AND tag2 != ''
    ) tags
    GROUP BY tag
  ) agg;

  INSERT INTO reputation_summaries (agent_id, total_feedback, average_score, tag_counts, last_feedback_at, updated_at)
  VALUES (p_agent_id, v_total, v_avg, v_tags, v_last, NOW())
  ON CONFLICT (agent_id) DO UPDATE SET
    total_feedback = v_total,
    average_score  = v_avg,
    tag_counts     = v_tags,
    last_feedback_at = v_last,
    updated_at     = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Trigger: Auto-update updated_at on agents table
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- RLS Policies (Row Level Security)
-- ============================================================
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE indexer_state ENABLE ROW LEVEL SECURITY;

-- Public read access for agents, feedback, validations, reputation (anon + authenticated)
CREATE POLICY "Public read agents" ON agents FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read feedback" ON feedback FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read validations" ON validations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read reputation" ON reputation_summaries FOR SELECT TO anon, authenticated USING (true);

-- Service role (indexer) can insert/update all tables — restrict to service_role only
CREATE POLICY "Service insert agents" ON agents FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service update agents" ON agents FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service insert feedback" ON feedback FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service insert validations" ON validations FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service manage reputation" ON reputation_summaries FOR ALL TO service_role USING (true);
CREATE POLICY "Service manage indexer_state" ON indexer_state FOR ALL TO service_role USING (true);
