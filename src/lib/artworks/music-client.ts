/**
 * ACE-Step 1.5 Music Generation API Client
 *
 * Interfaces with a self-hosted ACE-Step 1.5 server for AI music generation.
 * ACE-Step uses a diffusion-based approach with step-level conditioning for
 * high-quality music generation from text prompts and lyrics.
 *
 * Expected server: ACE-Step 1.5 Gradio API or compatible REST endpoint.
 * Environment variable: ACE_STEP_API_URL (default: http://localhost:7860)
 */

export interface MusicGenerationRequest {
  /** Text description/tags for the music (e.g., "electronic ambient blockchain theme") */
  prompt: string;
  /** Lyrics for vocal generation (can be empty for instrumental) */
  lyrics: string;
  /** Duration in seconds (10-300) */
  duration?: number;
  /** Number of diffusion steps (higher = better quality, slower) */
  infer_steps?: number;
  /** Guidance scale for prompt adherence */
  guidance_scale?: number;
  /** Scheduler type */
  scheduler_type?: "euler" | "heun";
  /** CFG type */
  cfg_type?: "apg" | "cfg";
  /** Omega for APG scheduler */
  omega?: number;
  /** Manual seed for reproducibility (-1 for random) */
  seed?: number;
}

export interface MusicGenerationResponse {
  /** URL path to the generated audio file */
  audioUrl: string;
  /** Duration of the generated audio in seconds */
  duration: number;
  /** Seed used for generation */
  seed: number;
}

const ACE_STEP_API_URL =
  process.env.ACE_STEP_API_URL || "http://localhost:7860";

/**
 * Generate music using ACE-Step 1.5.
 *
 * Calls the Gradio API endpoint. The server is expected to expose
 * a /api/predict or /run/predict endpoint compatible with the
 * ACE-Step Gradio interface.
 */
export async function generateMusic(
  request: MusicGenerationRequest,
): Promise<MusicGenerationResponse> {
  const payload = {
    data: [
      request.prompt,
      request.lyrics,
      request.duration ?? 60,
      request.infer_steps ?? 60,
      request.guidance_scale ?? 15,
      request.scheduler_type ?? "euler",
      request.cfg_type ?? "apg",
      request.omega ?? 10,
      request.seed ?? -1,
    ],
  };

  const response = await fetch(`${ACE_STEP_API_URL}/api/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new MusicGenerationError(
      `ACE-Step API returned ${response.status}: ${response.statusText}`,
    );
  }

  const result = await response.json();

  // Gradio returns data as an array — audio file info is typically first
  const audioData = result.data?.[0];
  if (!audioData) {
    throw new MusicGenerationError("No audio data in ACE-Step response");
  }

  // audioData can be: { name: "path/to/file.wav", ... } or a direct URL
  const audioUrl =
    typeof audioData === "string"
      ? audioData
      : audioData.url || `${ACE_STEP_API_URL}/file=${audioData.name}`;

  return {
    audioUrl,
    duration: request.duration ?? 60,
    seed: result.data?.[1] ?? -1,
  };
}

/**
 * Check if ACE-Step server is available.
 */
export async function checkAceStepHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${ACE_STEP_API_URL}/info`, {
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export class MusicGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MusicGenerationError";
  }
}

/**
 * Parse genre tags from a music prompt into structured metadata.
 */
export function parseGenreFromPrompt(prompt: string): {
  genre: string;
  key: string;
  bpm: number;
} {
  const genrePatterns: Record<string, RegExp> = {
    electronic: /electronic|edm|synth|techno|ambient/i,
    "hip-hop": /hip[- ]?hop|rap|trap|boom[- ]?bap/i,
    rock: /rock|guitar|punk|metal|grunge/i,
    jazz: /jazz|swing|bebop|blues/i,
    classical: /classical|orchestra|symphony|piano/i,
    pop: /pop|dance|disco|funk/i,
    "lo-fi": /lo[- ]?fi|chill|relaxing|study/i,
  };

  let genre = "electronic";
  for (const [name, pattern] of Object.entries(genrePatterns)) {
    if (pattern.test(prompt)) {
      genre = name;
      break;
    }
  }

  // Extract BPM if mentioned
  const bpmMatch = prompt.match(/(\d{2,3})\s*bpm/i);
  const bpm = bpmMatch ? parseInt(bpmMatch[1], 10) : getDefaultBpm(genre);

  // Extract key if mentioned
  const keyMatch = prompt.match(
    /\b([A-G][#b]?)\s*(major|minor|maj|min)?\b/i,
  );
  const key = keyMatch
    ? `${keyMatch[1]}${keyMatch[2] ? (keyMatch[2].startsWith("min") ? "m" : "") : "m"}`
    : getDefaultKey(genre);

  return { genre, key, bpm };
}

function getDefaultBpm(genre: string): number {
  const defaults: Record<string, number> = {
    electronic: 128,
    "hip-hop": 90,
    rock: 120,
    jazz: 110,
    classical: 80,
    pop: 120,
    "lo-fi": 75,
  };
  return defaults[genre] ?? 120;
}

function getDefaultKey(genre: string): string {
  const defaults: Record<string, string> = {
    electronic: "Am",
    "hip-hop": "Cm",
    rock: "Em",
    jazz: "Dm",
    classical: "C",
    pop: "G",
    "lo-fi": "Fm",
  };
  return defaults[genre] ?? "Am";
}
