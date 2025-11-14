/**
 * Check if string needs quoting in TOON format
 * @param str String to check
 * @param delimiter Active delimiter (affects whether commas need quoting)
 */
export function needsQuoting(
  str: string,
  delimiter: ',' | '\t' | '|' = ','
): boolean {
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

  // Leading or trailing whitespace needs quotes
  if (str !== str.trim()) return true;

  // Safe string pattern: letters, numbers, underscore, spaces, unicode
  // When delimiter is not comma, commas are also safe
  const safePattern =
    delimiter === ','
      ? /^[\w\s\u0080-\uFFFF]+$/
      : /^[\w\s,\u0080-\uFFFF]+$/;

  return !safePattern.test(str);
}

/**
 * Check if string needs quoting specifically in array context
 * (stricter rules based on active delimiter)
 */
export function needsQuotingInArray(
  str: string,
  delimiter: ',' | '\t' | '|' = ','
): boolean {
  if (needsQuoting(str, delimiter)) return true;

  // Strings containing the active delimiter need quotes
  if (str.includes(delimiter)) return true;

  // Colons always need quotes in arrays
  if (str.includes(':')) return true;

  return false;
}

/**
 * Check if string needs quoting as object key
 */
export function needsQuotingAsKey(str: string): boolean {
  // Empty string needs quotes
  if (str.length === 0) return true;

  // Numeric keys need quotes
  if (/^\d+$/.test(str)) return true;

  // Keys starting with hyphen need quotes
  if (str.startsWith('-')) return true;

  // Keys containing hyphens need quotes (ambiguous with paths)
  if (str.includes('-')) return true;

  // Keys with special characters need quotes
  if (
    str.includes(':') ||
    str.includes(',') ||
    str.includes(' ') ||
    str.includes('[') ||
    str.includes(']') ||
    str.includes('{') ||
    str.includes('}') ||
    str.includes('\n') ||
    str.includes('\t') ||
    str.includes('\r') ||
    str.includes('"')
  ) {
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
export function quoteString(
  str: string,
  inArray = false,
  delimiter: ',' | '\t' | '|' = ','
): string {
  const needs = inArray
    ? needsQuotingInArray(str, delimiter)
    : needsQuoting(str, delimiter);
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
