import { createOpenAI } from "@ai-sdk/openai";

const provider = createOpenAI({
  baseURL: process.env.AI_BASE_URL || "https://api.deepseek.com",
  apiKey: process.env.AI_API_KEY || "",
});

export function getModel() {
  const modelId = process.env.AI_MODEL || "deepseek-chat";
  return provider(modelId);
}
