import { streamText } from "ai";
import { getModel } from "./provider";
import { AGENT_PROMPTS } from "./agent-prompts";
import { DEMO_AGENTS, getAgentById } from "@/lib/agents/seed-data";
import type { Scenario, ScenarioStep } from "./scenarios";

const AGENT_IDS: Record<string, number> = Object.fromEntries(
  DEMO_AGENTS.map((a) => [a.name, a.id]),
);

export type SimulationEventType =
  | "step-start"
  | "agent-message"
  | "agent-message-delta"
  | "feedback-sent"
  | "step-complete"
  | "simulation-complete"
  | "error";

export interface SimulationEvent {
  type: SimulationEventType;
  stepIndex: number;
  from: string;
  to: string;
  action: ScenarioStep["action"];
  content?: string;
  feedbackScore?: number;
  feedbackTags?: [string, string];
  txHash?: string;
  timestamp: string;
}

export async function* runSimulation(
  scenario: Scenario,
): AsyncGenerator<SimulationEvent> {
  const conversationContext: Record<string, string[]> = {};

  for (let i = 0; i < scenario.steps.length; i++) {
    const step = scenario.steps[i];
    const fromId = AGENT_IDS[step.from];
    const toId = AGENT_IDS[step.to];

    yield {
      type: "step-start",
      stepIndex: i,
      from: step.from,
      to: step.to,
      action: step.action,
      content: step.prompt,
      timestamp: new Date().toISOString(),
    };

    if (step.action === "feedback") {
      yield {
        type: "feedback-sent",
        stepIndex: i,
        from: step.from,
        to: step.to,
        action: "feedback",
        feedbackScore: step.feedbackScore,
        feedbackTags: step.feedbackTags,
        content: `${step.from} rated ${step.to}: ${step.feedbackScore}/5 [${step.feedbackTags?.join(", ")}]`,
        timestamp: new Date().toISOString(),
      };

      yield {
        type: "step-complete",
        stepIndex: i,
        from: step.from,
        to: step.to,
        action: step.action,
        timestamp: new Date().toISOString(),
      };

      continue;
    }

    // Determine which agent generates the response
    const respondingAgentId =
      step.action === "request" ? toId : fromId;
    const respondingAgentName =
      step.action === "request" ? step.to : step.from;
    const systemPrompt = AGENT_PROMPTS[respondingAgentId] || "";

    // Build context from prior conversation
    const contextKey = `${step.from}-${step.to}`;
    const priorContext = conversationContext[contextKey] || [];

    const contextMessages = priorContext.map((msg, idx) => ({
      role: (idx % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
      content: msg,
    }));

    const agentConfig = getAgentById(respondingAgentId);
    const model = agentConfig?.model ? getModel(agentConfig.model) : getModel();

    const result = streamText({
      model,
      system: `${systemPrompt}\n\nYou are in an A2A (Agent-to-Agent) interaction. You are ${respondingAgentName} responding to ${step.action === "request" ? step.from : step.to}. Keep your response concise (max 150 words).`,
      messages: [...contextMessages, { role: "user" as const, content: step.prompt }],
    });

    let fullResponse = "";

    for await (const chunk of result.textStream) {
      fullResponse += chunk;
      yield {
        type: "agent-message-delta",
        stepIndex: i,
        from: respondingAgentName,
        to: step.action === "request" ? step.from : step.to,
        action: step.action,
        content: chunk,
        timestamp: new Date().toISOString(),
      };
    }

    // Store conversation for context continuity
    if (!conversationContext[contextKey]) {
      conversationContext[contextKey] = [];
    }
    conversationContext[contextKey].push(step.prompt, fullResponse);

    yield {
      type: "agent-message",
      stepIndex: i,
      from: respondingAgentName,
      to: step.action === "request" ? step.from : step.to,
      action: step.action,
      content: fullResponse,
      timestamp: new Date().toISOString(),
    };

    yield {
      type: "step-complete",
      stepIndex: i,
      from: step.from,
      to: step.to,
      action: step.action,
      timestamp: new Date().toISOString(),
    };
  }

  yield {
    type: "simulation-complete",
    stepIndex: scenario.steps.length,
    from: "",
    to: "",
    action: "request",
    timestamp: new Date().toISOString(),
  };
}

export { AGENT_IDS };
