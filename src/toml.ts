/**
 * TOML <-> TOON converter
 */
import { parse } from '@iarna/toml';
import { encode as encodeCore } from './core/encoder.js';
import type { EncodeOptions, DecodeOptions, ToonValue } from './core/types.js';

/**
 * Encode TOML string to TOON format
 */
export function encode(toml: string, options?: EncodeOptions): string {
  const obj = parse(toml) as ToonValue;
  return encodeCore(obj, options);
}

/**
 * Decode TOON format to TOML string
 * Note: TOML stringification not implemented yet
 */
export function decode(_toon: string, _options?: DecodeOptions): string {
  throw new Error('TOML decode not yet implemented');
}
