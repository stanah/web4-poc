/**
 * Minimal SVG sanitizer to strip dangerous elements/attributes before rendering.
 * Removes <script>, event handlers (on*), javascript: URIs, and <foreignObject>.
 */
export function sanitizeSvg(raw: string): string {
  // Remove <script> blocks (including nested)
  let cleaned = raw.replace(/<script[\s\S]*?<\/script>/gi, "");
  // Remove self-closing <script />
  cleaned = cleaned.replace(/<script[^>]*\/>/gi, "");
  // Remove <foreignObject> blocks
  cleaned = cleaned.replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "");
  cleaned = cleaned.replace(/<foreignObject[^>]*\/>/gi, "");
  // Remove event handler attributes (onclick, onload, onerror, etc.)
  cleaned = cleaned.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  // Remove javascript: / data: URIs in href and xlink:href attributes
  cleaned = cleaned.replace(
    /(href\s*=\s*(?:"|'))?\s*javascript\s*:/gi,
    "$1#",
  );
  cleaned = cleaned.replace(
    /(href\s*=\s*(?:"|'))?\s*data\s*:\s*text\/html/gi,
    "$1#",
  );
  // Remove <use> with external references that could bypass CSP
  cleaned = cleaned.replace(/<use[^>]+href\s*=\s*(?:"|')https?:\/\/[^"']*(?:"|')[^>]*\/?>/gi, "");
  return cleaned;
}
