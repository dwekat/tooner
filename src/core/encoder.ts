import type { EncodeOptions, ToonValue } from './types.js';
import { ToonEncodeError } from './types.js';
import { quoteString, quoteKey, needsQuotingAsKey } from '../utils/string.js';

/**
 * Encode a value to TOON format
 */
export function encode(value: ToonValue, options: EncodeOptions = {}): string {
  const indent =
    typeof options.indent === 'number'
      ? ' '.repeat(options.indent)
      : options.indent ?? '  ';
  const delimiter = options.delimiter ?? ',';
  const keyFolding = options.keyFolding ?? false;
  const flattenDepth =
    options.flattenDepth ?? (keyFolding === 'safe' ? Infinity : 0);

  // Section: Handle root-level arrays
  if (Array.isArray(value)) {
    return encodeRootArray(value, indent, delimiter);
  }

  return encodeValue(value, 0, indent, delimiter, keyFolding, flattenDepth);
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
function encodePrimitive(
  value: unknown,
  inArray = false,
  delimiter: ',' | '\t' | '|' = ','
): string {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return value.toString();
  if (typeof value === 'number') {
    if (Object.is(value, -0)) return '0';
    return value.toString();
  }
  if (typeof value === 'string') return quoteString(value, inArray, delimiter);

  throw new ToonEncodeError(`Unsupported primitive type: ${typeof value}`);
}

/**
 * Get delimiter string for array brackets
 */
function getDelimiterInBracket(delimiter: ',' | '\t' | '|'): string {
  return delimiter === ',' ? '' : delimiter;
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
 * Check if array contains only objects with same keys
 */
function isUniformObjectArray(arr: unknown[]): boolean {
  if (arr.length === 0) return false;

  if (
    !arr.every(
      (item) =>
        item !== null && typeof item === 'object' && !Array.isArray(item)
    )
  ) {
    return false;
  }

  const firstKeys = Object.keys(arr[0] as object).sort();
  return arr.every((item) => {
    const keys = Object.keys(item as object).sort();
    return (
      keys.length === firstKeys.length &&
      keys.every((k, i) => k === firstKeys[i])
    );
  });
}

/**
 * Check if objects only contain primitives
 */
function containsOnlyPrimitives(obj: Record<string, unknown>): boolean {
  return Object.values(obj).every(
    (val) =>
      val === null ||
      typeof val === 'boolean' ||
      typeof val === 'number' ||
      typeof val === 'string'
  );
}

/**
 * Try to fold a key path (for key folding feature)
 * Returns [foldedKey, finalValue] or null if can't fold
 * flattenDepth represents max number of segments in output (e.g., a.b = 2 segments)
 */
function tryFoldPath(
  key: string,
  val: unknown,
  keyFolding: false | 'safe',
  flattenDepth: number
): [string, unknown] | null {
  if (!keyFolding || keyFolding !== 'safe') return null;
  if (flattenDepth <= 1) return null; // Need at least 2 segments to fold

  // Can't fold if current key needs quoting
  if (needsQuotingAsKey(key)) return null;

  let currentKey = key;
  let currentVal = val;
  let segmentCount = 1; // Start with 1 (the initial key)

  // Walk down single-key objects
  while (
    currentVal !== null &&
    typeof currentVal === 'object' &&
    !Array.isArray(currentVal)
  ) {
    const obj = currentVal as Record<string, unknown>;
    const keys = Object.keys(obj);

    // Only fold if exactly one key
    if (keys.length !== 1) break;

    const nextKey = keys[0];

    // Can't fold if key needs quoting
    if (needsQuotingAsKey(nextKey)) break;

    // Check if adding next segment would exceed limit
    if (segmentCount >= flattenDepth) break;

    currentKey = `${currentKey}.${nextKey}`;
    currentVal = obj[nextKey];
    segmentCount++;
  }

  // Only return folded path if we actually folded something
  if (currentKey === key) return null;

  return [currentKey, currentVal];
}

/**
 * Encode root-level array
 */
function encodeRootArray(
  arr: unknown[],
  indent: string,
  delimiter: ',' | '\t' | '|'
): string {
  const delimInBracket = getDelimiterInBracket(delimiter);

  if (arr.length === 0) return `[0${delimInBracket}]:`;

  // Section: Primitive array - inline format
  if (isPrimitiveArray(arr)) {
    const items = arr.map((item) => encodePrimitive(item, true, delimiter));
    return `[${arr.length}${delimInBracket}]: ${items.join(delimiter)}`;
  }

  // Section: Uniform object array - tabular format
  if (isUniformObjectArray(arr)) {
    const objs = arr as Record<string, unknown>[];
    if (objs.every((obj) => containsOnlyPrimitives(obj))) {
      const keys = Object.keys(objs[0]);
      const keyDelim = delimiter === ',' ? ',' : delimiter;
      const keyStr = keys.map((k) => quoteKey(k)).join(keyDelim);
      const lines: string[] = [
        `[${arr.length}${delimInBracket}]{${keyStr}}:`,
      ];

      for (const obj of objs) {
        const values = keys.map((k) =>
          encodePrimitive(obj[k], true, delimiter)
        );
        lines.push(`${indent}${values.join(delimiter)}`);
      }

      return lines.join('\n');
    }
  }

  // Section: Mixed array - list format with hyphens
  const lines: string[] = [`[${arr.length}${delimInBracket}]:`];
  for (const item of arr) {
    const encoded = encodeListItem(item, 1, indent, delimiter);
    lines.push(encoded);
  }

  return lines.join('\n');
}

/**
 * Encode array in inline format (primitives only)
 */
function encodeInlineArray(
  key: string,
  arr: unknown[],
  depth: number,
  indent: string,
  delimiter: ',' | '\t' | '|'
): string {
  const indentStr = indent.repeat(depth);
  const delimInBracket = getDelimiterInBracket(delimiter);
  const quotedKey = quoteKey(key);

  if (arr.length === 0) {
    return `${indentStr}${quotedKey}[0${delimInBracket}]:`;
  }

  const items = arr.map((item) => encodePrimitive(item, true, delimiter));
  return `${indentStr}${quotedKey}[${arr.length}${delimInBracket}]: ${items.join(delimiter)}`;
}

/**
 * Encode array in tabular format
 */
function encodeTabular(
  key: string,
  arr: Record<string, unknown>[],
  depth: number,
  indent: string,
  delimiter: ',' | '\t' | '|'
): string {
  const indentStr = indent.repeat(depth);
  const delimInBracket = getDelimiterInBracket(delimiter);
  const quotedKey = quoteKey(key);

  if (arr.length === 0) return `${indentStr}${quotedKey}[0${delimInBracket}]:`;

  const keys = Object.keys(arr[0]);
  const keyDelim = delimiter === ',' ? ',' : delimiter;
  const keysStr = keys.map((k) => quoteKey(k)).join(keyDelim);
  const lines: string[] = [
    `${indentStr}${quotedKey}[${arr.length}${delimInBracket}]{${keysStr}}:`,
  ];

  for (const item of arr) {
    const values = keys.map((k) => encodePrimitive(item[k], true, delimiter));
    const valueStr = values.join(delimiter);
    lines.push(`${indent.repeat(depth + 1)}${valueStr}`);
  }

  return lines.join('\n');
}

/**
 * Encode array in list format (with hyphens)
 */
function encodeListArray(
  key: string,
  arr: unknown[],
  depth: number,
  indent: string,
  delimiter: ',' | '\t' | '|'
): string {
  const indentStr = indent.repeat(depth);
  const delimInBracket = getDelimiterInBracket(delimiter);
  const quotedKey = quoteKey(key);
  const lines: string[] = [
    `${indentStr}${quotedKey}[${arr.length}${delimInBracket}]:`,
  ];

  for (const item of arr) {
    const encoded = encodeListItem(item, depth + 1, indent, delimiter);
    lines.push(encoded);
  }

  return lines.join('\n');
}

/**
 * Encode a single list item (with hyphen prefix)
 */
function encodeListItem(
  item: unknown,
  depth: number,
  indent: string,
  delimiter: ',' | '\t' | '|'
): string {
  const indentStr = indent.repeat(depth);
  const prefix = `${indentStr}- `;

  // Section: Primitive - inline after hyphen
  if (
    item === null ||
    typeof item === 'boolean' ||
    typeof item === 'number' ||
    typeof item === 'string'
  ) {
    return `${prefix}${encodePrimitive(item, false, delimiter)}`;
  }

  // Section: Array - format based on content
  if (Array.isArray(item)) {
    const delimInBracket = getDelimiterInBracket(delimiter);

    if (item.length === 0) {
      return `${prefix}[0${delimInBracket}]:`;
    }

    // Primitive array - inline
    if (isPrimitiveArray(item)) {
      const items = item.map((i) => encodePrimitive(i, true, delimiter));
      return `${prefix}[${item.length}${delimInBracket}]: ${items.join(delimiter)}`;
    }

    // Nested arrays or mixed - continue list format
    const lines: string[] = [`${prefix}[${item.length}${delimInBracket}]:`];
    for (const nested of item) {
      const encoded = encodeListItem(nested, depth + 1, indent, delimiter);
      lines.push(encoded);
    }
    return lines.join('\n');
  }

  // Section: Object - encode fields
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>;
    const keys = Object.keys(obj);

    if (keys.length === 0) {
      return `${prefix}{}`;
    }

    const lines: string[] = [];
    let first = true;

    for (const key of keys) {
      const val = obj[key];

      if (first) {
        // First field on hyphen line
        const fieldLines = encodeObjectField(
          key,
          val,
          depth + 1,
          indent,
          delimiter,
          false,
          0
        );
        // Split into lines, dedent continuation lines by one level
        const fieldParts = fieldLines.split('\n');
        const firstLine = fieldParts[0].trimStart();
        lines.push(`${prefix}${firstLine}`);
        
        // Add continuation lines with reduced indentation
        for (let i = 1; i < fieldParts.length; i++) {
          // Remove one level of indentation from continuation lines
          const line = fieldParts[i];
          const dedented = line.startsWith(indent) 
            ? line.slice(indent.length) 
            : line;
          lines.push(dedented);
        }
        first = false;
      } else {
        // Subsequent fields indented
        const fieldLines = encodeObjectField(
          key,
          val,
          depth + 1,
          indent,
          delimiter,
          false,
          0
        );
        lines.push(fieldLines);
      }
    }

    return lines.join('\n');
  }

  throw new ToonEncodeError(`Unsupported list item type: ${typeof item}`);
}

/**
 * Encode an object field
 */
function encodeObjectField(
  key: string,
  val: unknown,
  depth: number,
  indent: string,
  delimiter: ',' | '\t' | '|',
  keyFolding: false | 'safe',
  flattenDepth: number
): string {
  const indentStr = indent.repeat(depth);

  // Section: Try key folding first
  if (keyFolding) {
    const folded = tryFoldPath(key, val, keyFolding, flattenDepth);
    if (folded) {
      const [foldedKey, finalVal] = folded;
      // Recursively encode with the folded key and final value
      return encodeObjectField(
        foldedKey,
        finalVal,
        depth,
        indent,
        delimiter,
        false,
        0
      );
    }
  }

  // Section: Primitive value
  if (
    val === null ||
    typeof val === 'boolean' ||
    typeof val === 'number' ||
    typeof val === 'string'
  ) {
    return `${indentStr}${quoteKey(key)}: ${encodePrimitive(val, false, delimiter)}`;
  }

  // Section: Array
  if (Array.isArray(val)) {
    if (val.length === 0) {
      const delimInBracket = getDelimiterInBracket(delimiter);
      return `${indentStr}${quoteKey(key)}[0${delimInBracket}]:`;
    }

    // Primitive array - inline
    if (isPrimitiveArray(val)) {
      return encodeInlineArray(key, val, depth, indent, delimiter);
    }

    // Uniform object array with only primitives - tabular
    if (isUniformObjectArray(val)) {
      const objs = val as Record<string, unknown>[];
      if (objs.every((obj) => containsOnlyPrimitives(obj))) {
        return encodeTabular(key, objs, depth, indent, delimiter);
      }
    }

    // Mixed or nested - list format
    return encodeListArray(key, val, depth, indent, delimiter);
  }

  // Section: Nested object
  if (typeof val === 'object' && val !== null) {
    const nested = encodeValue(
      val as ToonValue,
      depth + 1,
      indent,
      delimiter,
      keyFolding,
      flattenDepth
    );
    if (nested === '') {
      // Empty object - just key with colon
      return `${indentStr}${quoteKey(key)}:`;
    }
    const lines: string[] = [`${indentStr}${quoteKey(key)}:`, nested];
    return lines.join('\n');
  }

  throw new ToonEncodeError(`Unsupported field type: ${typeof val}`);
}

/**
 * Encode a value at a given depth
 */
function encodeValue(
  value: ToonValue,
  depth: number,
  indent: string,
  delimiter: ',' | '\t' | '|',
  keyFolding: false | 'safe',
  flattenDepth: number
): string {
  // Section: Handle primitives
  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string'
  ) {
    return encodePrimitive(value, false, delimiter);
  }

  // Section: Handle objects
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);

    if (keys.length === 0) return '';

    // Section: Detect folding collisions if key folding is enabled
    const keySet = new Set(keys);
    const collisionKeys = new Set<string>();

    if (keyFolding && keyFolding === 'safe') {
      for (const key of keys) {
        const val = obj[key];
        const folded = tryFoldPath(key, val, keyFolding, flattenDepth);
        if (folded) {
          const [foldedKey] = folded;
          // Check if folded key collides with any sibling key
          if (keySet.has(foldedKey) && foldedKey !== key) {
            collisionKeys.add(key);
          }
        }
      }
    }

    const lines: string[] = [];

    for (const key of keys) {
      const val = obj[key];
      // Disable folding for this key if it has a collision
      const useKeyFolding = collisionKeys.has(key) ? false : keyFolding;
      const fieldStr = encodeObjectField(
        key,
        val,
        depth,
        indent,
        delimiter,
        useKeyFolding,
        flattenDepth
      );
      lines.push(fieldStr);
    }

    return lines.join('\n');
  }

  throw new ToonEncodeError(`Unsupported value type: ${typeof value}`);
}
