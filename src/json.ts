/**
 * JSON <-> TOON converter
 */
import { encode as encodeCore, decode as decodeCore } from './core/encoder.js';
import type { EncodeOptions, DecodeOptions } from './core/types.js';

/**
 * Encode JSON string to TOON format
 */
export function encode(json: string, options?: EncodeOptions): string {
  const obj = JSON.parse(json);
  return encodeCore(obj, options);
}

/**
 * Decode TOON format to JSON string
 */
export function decode(toon: string, options?: DecodeOptions): string {
  const obj = decodeCore(toon, options);
  return JSON.stringify(obj);
}

