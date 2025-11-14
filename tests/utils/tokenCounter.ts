/**
 * Simple token counter for comparing efficiency
 * Uses a basic approximation: 1 token ≈ 4 characters for English
 * This is a rough estimate similar to GPT tokenization
 */
export function countTokens(text: string): number {
  // Basic approximation: ~4 chars per token
  return Math.ceil(text.length / 4);
}

/**
 * Calculate token reduction percentage
 */
export function calculateReduction(
  jsonSize: number,
  toonSize: number
): number {
  return Math.round(((jsonSize - toonSize) / jsonSize) * 100);
}

/**
 * Format token stats for display
 */
export function formatTokenStats(jsonTokens: number, toonTokens: number) {
  const reduction = calculateReduction(jsonTokens, toonTokens);
  return {
    json: jsonTokens,
    toon: toonTokens,
    saved: jsonTokens - toonTokens,
    reduction: `${reduction}%`,
  };
}

