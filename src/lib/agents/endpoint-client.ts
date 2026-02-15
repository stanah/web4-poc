const TIMEOUT_MS = 30_000;

export async function callAgentEndpoint(
  endpoint: string,
  serviceType: "MCP" | "A2A",
  serviceName: string,
  userMessage: string
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const body =
      serviceType === "MCP"
        ? {
            jsonrpc: "2.0",
            id: 1,
            method: "tools/call",
            params: {
              name: serviceName,
              arguments: { query: userMessage },
            },
          }
        : {
            jsonrpc: "2.0",
            id: 1,
            method: "message/send",
            params: {
              message: {
                role: "user",
                parts: [{ type: "text", text: userMessage }],
              },
            },
          };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Endpoint returned ${response.status}`);
    }

    const json = await response.json();

    if (json.error) {
      throw new Error(json.error.message ?? "Endpoint returned an error");
    }

    if (serviceType === "MCP") {
      return json.result?.content?.[0]?.text ?? "";
    }
    return json.result?.artifacts?.[0]?.parts?.[0]?.text ?? "";
  } finally {
    clearTimeout(timer);
  }
}
