import type { EncodeOptions, ToonValue } from './types.js';
import { ToonEncodeError } from './types.js';
import { quoteString } from '../utils/string.js';

/**
 * Encode a value to TOON format
 */
export function encode(value: ToonValue, options: EncodeOptions = {}): string {
  const indent = options.indent ?? '  ';

  // Section: Handle root-level arrays
  if (Array.isArray(value)) {
    return encodeRootArray(value, indent);
  }

  return encodeValue(value, 0, indent);
}

/**
 * Decode TOON format to value  
 * Note: Full decoder implementation in progress
 */
export function decode(_toon: string, _options: EncodeOptions = {}): ToonValue {
  // Placeholder - full implementation in decoder.ts
  throw new ToonEncodeError('Decoder not yet fully implemented');
}

/**
 * Encode primitive values
 */
function encodePrimitive(value: unknown, inArray = false): string {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return value.toString();
  if (typeof value === 'number') {
    if (Object.is(value, -0)) return '0';
    return value.toString();
  }
  if (typeof value === 'string') return quoteString(value, inArray);

  throw new ToonEncodeError(`Unsupported primitive type: ${typeof value}`);
}

/**
 * Check if all items are primitives
 */
function isPrimitiveArray(arr: unknown[]): boolean {
  return arr.every(
    (item) =>
      item === null ||
      typeof item === 'boolean' ||
      typeof item === 'number' ||
      typeof item === 'string'
  );
}

/**
 * Encode root-level array (minimal implementation)
 */
function encodeRootArray(arr: unknown[], indent: string): string {
  if (arr.length === 0) return '[0]:';

  if (isPrimitiveArray(arr)) {
    const items = arr.map((item) => encodePrimitive(item, true));
    return `[${arr.length}]: ${items.join(',')}`;
  }

  // Complex arrays - list format
  const lines: string[] = [`[${arr.length}]:`];
  for (const item of arr) {
    lines.push(`${indent}- ${encodePrimitive(item)}`);
  }

  return lines.join('\n');
}

/**
 * Encode a value (minimal implementation)
 */
function encodeValue(
  value: ToonValue,
  depth: number,
  indent: string
): string {
  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string'
  ) {
    return encodePrimitive(value);
  }

  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);

    if (keys.length === 0) return '{}';

    const lines: string[] = [];
    const indentStr = indent.repeat(depth);

    for (const key of keys) {
      const val = obj[key];

      if (Array.isArray(val) && val.length > 0 && isPrimitiveArray(val)) {
        const items = val.map((item) => encodePrimitive(item, true));
        lines.push(`${indentStr}${key}[${val.length}]: ${items.join(',')}`);
      } else {
        const encoded = encodePrimitive(val);
        lines.push(`${indentStr}${key}: ${encoded}`);
      }
    }

    return lines.join('\n');
  }

  throw new ToonEncodeError(`Unsupported value type: ${typeof value}`);
}
