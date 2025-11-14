/**
 * Check if string needs quoting in TOON format
 */
export function needsQuoting(str: string): boolean {
  // Empty strings need quotes
  if (str.length === 0) return true;

  // Keywords need quotes
  if (str === 'true' || str === 'false' || str === 'null') return true;

  // Numbers need quotes (including scientific notation)
  if (/^-?\d+(\.\d+)?(e[+-]?\d+)?$/i.test(str)) return true;

  // Leading zeros (non-numeric) need quotes
  if (/^0\d/.test(str)) return true;

  // TOON syntax characters need quotes
  if (/^[[\]{}]/.test(str) || str.includes('[') || str.includes('{')) {
    return true;
  }

  // List item marker needs quotes
  if (str === '-' || /^-\s/.test(str)) return true;

  // Control characters need quotes
  if (/[\n\r\t\\"]/.test(str)) return true;

  // Whitespace-only strings need quotes
  if (/^\s+$/.test(str)) return true;

  // Safe string pattern: letters, numbers, underscore, spaces, unicode
  // If it doesn't match this, it needs quotes
  return !/^[\w\s\u0080-\uFFFF]+$/.test(str);
}

/**
 * Check if string needs quoting specifically in array context
 * (stricter rules for comma/colon delimiters)
 */
export function needsQuotingInArray(str: string): boolean {
  if (needsQuoting(str)) return true;

  // In arrays, strings with commas or colons need quotes
  if (str.includes(',') || str.includes(':')) return true;

  return false;
}

/**
 * Check if string needs quoting as object key
 */
export function needsQuotingAsKey(str: string): boolean {
  // Keys with special characters need quotes
  if (str.includes(':') || str.includes(',') || str.includes(' ')) {
    return true;
  }
  return false;
}

/**
 * Escape special characters in string for TOON
 */
export function escapeString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Unescape TOON string
 */
export function unescapeString(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

/**
 * Quote string if needed for TOON
 */
export function quoteString(str: string, inArray = false): string {
  const needs = inArray ? needsQuotingInArray(str) : needsQuoting(str);
  if (needs) {
    return `"${escapeString(str)}"`;
  }
  return str;
}

/**
 * Quote key if needed
 */
export function quoteKey(key: string): string {
  if (needsQuotingAsKey(key)) {
    return `"${escapeString(key)}"`;
  }
  return key;
}

/**
 * Parse quoted or unquoted string from TOON
 */
export function parseString(str: string): string {
  const trimmed = str.trim();

  // Check if quoted
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    const content = trimmed.slice(1, -1);
    return unescapeString(content);
  }

  return trimmed;
}
