/**
 * YAML <-> TOON converter
 */
import { parse, stringify } from 'yaml';
import { encode as encodeCore, decode as decodeCore } from './core/encoder.js';
import type { EncodeOptions, DecodeOptions } from './core/types.js';

/**
 * Encode YAML string to TOON format
 */
export function encode(yaml: string, options?: EncodeOptions): string {
  const obj = parse(yaml);
  return encodeCore(obj, options);
}

/**
 * Decode TOON format to YAML string
 */
export function decode(toon: string, options?: DecodeOptions): string {
  const obj = decodeCore(toon, options);
  return stringify(obj);
}

