import { SCENARIOS } from "@/lib/ai/scenarios";
import { runSimulation, type SimulationEvent } from "@/lib/ai/simulation-engine";
import { writeFeedbackOnChain, writeValidationOnChain } from "@/lib/contracts/server-client";

export const maxDuration = 60;

const AGENT_IDS: Record<string, number> = {
  OracleBot: 1,
  TranslateAgent: 2,
  AnalystAgent: 3,
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const scenarioId = url.searchParams.get("scenario") || SCENARIOS[0].id;

  const scenario = SCENARIOS.find((s) => s.id === scenarioId);
  if (!scenario) {
    return new Response("Scenario not found", { status: 404 });
  }

  const encoder = new TextEncoder();

  // Track feedback scores per agent for post-simulation validation
  const agentScores: Record<number, number[]> = {};

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of runSimulation(scenario)) {
          // On feedback-sent, write to chain
          if (
            event.type === "feedback-sent" &&
            event.feedbackScore !== undefined &&
            event.feedbackTags
          ) {
            const targetAgentId = AGENT_IDS[event.to];
            if (targetAgentId) {
              // Track score for validation
              if (!agentScores[targetAgentId]) agentScores[targetAgentId] = [];
              agentScores[targetAgentId].push(event.feedbackScore);

              try {
                const txHash = await writeFeedbackOnChain(
                  targetAgentId,
                  event.feedbackScore,
                  event.feedbackTags[0],
                  event.feedbackTags[1],
                );
                event.txHash = txHash;
              } catch (err) {
                console.error(
                  `[simulation] Failed to write feedback on-chain for agent ${targetAgentId}:`,
                  err,
                );
              }
            }
          }

          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));

          // On simulation-complete, validate high-performing agents
          if (event.type === "simulation-complete") {
            for (const [agentIdStr, scores] of Object.entries(agentScores)) {
              const agentId = Number(agentIdStr);
              const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
              if (avg >= 4.0) {
                try {
                  const txHash = await writeValidationOnChain(
                    agentId,
                    "simulation-pass",
                    avg,
                  );
                  const validationEvent: SimulationEvent = {
                    type: "step-complete",
                    stepIndex: event.stepIndex,
                    from: "System",
                    to: Object.entries(AGENT_IDS).find(([, id]) => id === agentId)?.[0] || `Agent #${agentId}`,
                    action: "feedback",
                    content: `Validation issued for avg score ${avg.toFixed(1)}`,
                    txHash,
                    timestamp: new Date().toISOString(),
                  };
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify(validationEvent)}\n\n`),
                  );
                } catch (err) {
                  console.error(
                    `[simulation] Failed to write validation on-chain for agent ${agentId}:`,
                    err,
                  );
                }
              }
            }
          }
        }
      } catch (err) {
        const errorEvent: SimulationEvent = {
          type: "error",
          stepIndex: -1,
          from: "",
          to: "",
          action: "request",
          content: err instanceof Error ? err.message : "Unknown error",
          timestamp: new Date().toISOString(),
        };
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
