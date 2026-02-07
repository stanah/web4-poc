import { createOpenAI } from "@ai-sdk/openai";

export interface ModelConfig {
  provider: string;
  modelId: string;
}

const providers: Record<string, ReturnType<typeof createOpenAI>> = {};

function getProvider(name: string): ReturnType<typeof createOpenAI> {
  if (providers[name]) return providers[name];

  const envPrefix = name.toUpperCase().replace(/-/g, "_");
  const apiKey = process.env[`${envPrefix}_API_KEY`] ?? "";
  const baseURL = process.env[`${envPrefix}_BASE_URL`];

  providers[name] = createOpenAI({
    ...(baseURL ? { baseURL } : {}),
    apiKey,
  });
  return providers[name];
}

const defaultConfig: ModelConfig = {
  provider: process.env.AI_PROVIDER ?? "openrouter",
  modelId: process.env.AI_MODEL ?? "deepseek/deepseek-chat",
};

export function getModel(config?: ModelConfig) {
  const { provider, modelId } = config ?? defaultConfig;
  return getProvider(provider)(modelId);
}
