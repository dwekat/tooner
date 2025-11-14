/**
 * TOON value types
 */
export type ToonPrimitive = string | number | boolean | null;
export type ToonValue =
  | ToonPrimitive
  | ToonObject
  | ToonArray
  | ToonValue[];

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
   * Indentation string (default: 2 spaces)
   */
  indent?: string;
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

