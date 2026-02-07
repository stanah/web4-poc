import { Openfort } from "@openfort/openfort-js";

let openfortInstance: Openfort | null = null;

/**
 * Get or create the Openfort client singleton.
 * Uses the publishable key for client-side operations.
 */
export function getOpenfortClient(): Openfort {
  if (openfortInstance) return openfortInstance;

  const publishableKey = process.env.NEXT_PUBLIC_OPENFORT_PUBLIC_KEY;
  if (!publishableKey) {
    throw new Error("Missing NEXT_PUBLIC_OPENFORT_PUBLIC_KEY");
  }

  openfortInstance = new Openfort({
    baseConfiguration: {
      publishableKey,
    },
  });

  return openfortInstance;
}
