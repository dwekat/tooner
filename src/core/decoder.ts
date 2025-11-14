import type { DecodeOptions, ToonValue } from './types.js';
import { ToonDecodeError } from './types.js';
import { parseString } from '../utils/string.js';

/**
 * Decode TOON format to value
 */
export function decode(toon: string, _options: DecodeOptions = {}): ToonValue {
  const lines = toon.split('\n');
  const result = parseLines(lines, 0);
  return result.value;
}

interface ParseResult {
  value: ToonValue;
  linesConsumed: number;
}

/**
 * Parse primitive value from string
 */
function parsePrimitive(str: string): ToonValue {
  const trimmed = str.trim();

  // Section: Handle quoted strings
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return parseString(trimmed);
  }

  // Section: Handle keywords
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;

  // Section: Handle numbers
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  // Section: Unquoted string
  return trimmed;
}

/**
 * Get indentation level
 */
function getIndentLevel(line: string): number {
  const match = line.match(/^(\s*)/);
  if (!match) return 0;
  return match[1].length;
}

/**
 * Parse tabular array
 */
function parseTabular(
  header: string,
  lines: string[],
  startIndex: number
): ParseResult {
  // Parse header: key[count]{field1,field2}:
  const match = header.match(/^(\w+)\[(\d+)\]\{([^}]+)\}:\s*$/);
  if (!match) {
    throw new ToonDecodeError('Invalid tabular array header', startIndex);
  }

  const count = parseInt(match[2], 10);
  const keys = match[3].split(',').map((k) => k.trim());

  const result: Record<string, ToonValue>[] = [];
  let lineIndex = startIndex + 1;

  // Parse rows
  for (let i = 0; i < count; i++) {
    if (lineIndex >= lines.length) {
      throw new ToonDecodeError(
        `Expected ${count} rows, got ${i}`,
        lineIndex
      );
    }

    const line = lines[lineIndex];
    const values = parseRow(line, keys.length);

    if (values.length !== keys.length) {
      throw new ToonDecodeError(
        `Row has ${values.length} values, expected ${keys.length}`,
        lineIndex
      );
    }

    const obj: Record<string, ToonValue> = {};
    for (let j = 0; j < keys.length; j++) {
      obj[keys[j]] = parsePrimitive(values[j]);
    }
    result.push(obj);

    lineIndex++;
  }

  return {
    value: result,
    linesConsumed: count + 1,
  };
}

/**
 * Parse comma-separated row
 */
function parseRow(line: string, _expectedCount: number): string[] {
  const trimmed = line.trim();
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  let escaped = false;

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];

    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      current += char;
      escaped = true;
      continue;
    }

    if (char === '"') {
      current += char;
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

/**
 * Parse array declaration
 */
function parseArray(
  header: string,
  lines: string[],
  startIndex: number
): ParseResult {
  // Check if tabular format
  if (header.includes('{')) {
    return parseTabular(header, lines, startIndex);
  }

  // Parse header: key[count]:
  const match = header.match(/^(\w+)\[(\d+)\]:\s*$/);
  if (!match) {
    throw new ToonDecodeError('Invalid array header', startIndex);
  }

  const count = parseInt(match[2], 10);

  if (count === 0) {
    return { value: [], linesConsumed: 1 };
  }

  const result: ToonValue[] = [];
  let lineIndex = startIndex + 1;
  const baseIndent = getIndentLevel(lines[lineIndex]);

  while (result.length < count && lineIndex < lines.length) {
    const line = lines[lineIndex];
    if (line.trim() === '') {
      lineIndex++;
      continue;
    }

    const indent = getIndentLevel(line);
    if (indent < baseIndent) break;

    const value = parsePrimitive(line);
    result.push(value);
    lineIndex++;
  }

  return {
    value: result,
    linesConsumed: lineIndex - startIndex,
  };
}

/**
 * Parse lines into value
 */
function parseLines(lines: string[], startIndex: number): ParseResult {
  let lineIndex = startIndex;
  const result: Record<string, ToonValue> = {};

  // Section: Find base indentation
  let baseIndent = -1;
  for (let i = startIndex; i < lines.length; i++) {
    if (lines[i].trim() !== '') {
      baseIndent = getIndentLevel(lines[i]);
      break;
    }
  }

  if (baseIndent === -1) {
    return { value: null, linesConsumed: 0 };
  }

  while (lineIndex < lines.length) {
    const line = lines[lineIndex];

    // Skip blank lines
    if (line.trim() === '') {
      lineIndex++;
      continue;
    }

    const indent = getIndentLevel(line);

    // End of current object
    if (indent < baseIndent && lineIndex > startIndex) {
      break;
    }

    // Only process lines at current indent level
    if (indent !== baseIndent) {
      lineIndex++;
      continue;
    }

    const content = line.trim();

    // Section: Handle tabular arrays
    if (content.match(/^\w+\[\d+\]\{[^}]+\}:\s*$/)) {
      const parsed = parseTabular(content, lines, lineIndex);
      const key = content.match(/^(\w+)\[/)![1];
      result[key] = parsed.value;
      lineIndex += parsed.linesConsumed;
      continue;
    }

    // Section: Handle arrays
    if (content.match(/^\w+\[\d+\]:\s*$/)) {
      const parsed = parseArray(content, lines, lineIndex);
      const key = content.match(/^(\w+)\[/)![1];
      result[key] = parsed.value;
      lineIndex += parsed.linesConsumed;
      continue;
    }

    // Section: Handle key: value
    if (content.includes(':')) {
      const colonIndex = content.indexOf(':');
      const key = content.substring(0, colonIndex).trim();
      const valueStr = content.substring(colonIndex + 1).trim();

      if (valueStr === '') {
        // Nested object
        const nestedStart = lineIndex + 1;
        const nested = parseLines(lines, nestedStart);
        result[key] = nested.value;
        lineIndex = nestedStart + nested.linesConsumed;
      } else {
        // Primitive value
        result[key] = parsePrimitive(valueStr);
        lineIndex++;
      }
      continue;
    }

    // Standalone value (shouldn't happen in well-formed TOON)
    lineIndex++;
  }

  // Section: Return result
  const keys = Object.keys(result);
  if (keys.length === 0) {
    return { value: null, linesConsumed: lineIndex - startIndex };
  }

  return { value: result, linesConsumed: lineIndex - startIndex };
}

