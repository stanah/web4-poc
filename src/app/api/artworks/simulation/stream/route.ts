import { runArtworkSimulation } from "@/lib/artworks/creation-engine";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  const signal = request.signal;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of runArtworkSimulation()) {
          if (signal.aborted) break;
          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));
        }
      } catch (err) {
        if (signal.aborted) {
          // Client disconnected — silently stop
        } else {
          const errorEvent = {
            type: "error",
            agentName: "System",
            content: err instanceof Error ? err.message : "Unknown error",
            timestamp: new Date().toISOString(),
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`),
          );
        }
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
