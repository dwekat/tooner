/**
 * TOON value types
 */
export type ToonPrimitive = string | number | boolean | null;
export type ToonValue = ToonPrimitive | ToonObject | ToonArray | ToonValue[];

export interface ToonObject {
  [key: string]: ToonValue;
}

export type ToonArray = ToonValue[];

/**
 * Encoder options
 */
export interface EncodeOptions {
  /**
   * Enable strict validation during encoding
   */
  strict?: boolean;
  /**
   * Indentation (default: 2)
   * - number: Number of spaces
   * - string: Custom indentation string
   */
  indent?: number | string;
  /**
   * Array delimiter (default: comma)
   * - ',' - Comma delimiter (default)
   * - '\t' - Tab delimiter
   * - '|' - Pipe delimiter
   */
  delimiter?: ',' | '\t' | '|';
  /**
   * Key folding mode (default: none)
   * - false/undefined: No key folding
   * - 'safe': Fold single-key chains into dotted paths
   */
  keyFolding?: false | 'safe';
  /**
   * Maximum depth for key folding (default: Infinity when keyFolding is 'safe')
   * - 0: No folding
   * - n: Fold up to n levels
   */
  flattenDepth?: number;
}

/**
 * Decoder options
 */
export interface DecodeOptions {
  /**
   * Enable strict validation during decoding
   */
  strict?: boolean;
}

/**
 * Errors
 */
export class ToonError extends Error {
  constructor(
    message: string,
    public line?: number,
    public column?: number
  ) {
    super(message);
    this.name = 'ToonError';
  }
}

export class ToonEncodeError extends ToonError {
  constructor(message: string) {
    super(message);
    this.name = 'ToonEncodeError';
  }
}

export class ToonDecodeError extends ToonError {
  constructor(message: string, line?: number, column?: number) {
    super(message, line, column);
    this.name = 'ToonDecodeError';
  }
}
