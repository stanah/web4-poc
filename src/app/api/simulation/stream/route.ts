import { SCENARIOS } from "@/lib/ai/scenarios";
import { runSimulation, type SimulationEvent } from "@/lib/ai/simulation-engine";

export const maxDuration = 60;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const scenarioId = url.searchParams.get("scenario") || SCENARIOS[0].id;

  const scenario = SCENARIOS.find((s) => s.id === scenarioId);
  if (!scenario) {
    return new Response("Scenario not found", { status: 404 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of runSimulation(scenario)) {
          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));
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
