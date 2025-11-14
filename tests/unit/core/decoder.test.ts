import { describe, it, expect } from 'vitest';
import { decode } from '../../../src/core/decoder.js';
import { getDecodeFixtures } from '../../utils/fixtures.js';

describe('TOON Decoder - Official Fixtures', () => {
  const fixtures = getDecodeFixtures();

  for (const fixture of fixtures) {
    describe(fixture.description, () => {
      for (const test of fixture.tests) {
        it(test.name, () => {
          const result = decode(test.input as string);
          expect(result).toEqual(test.expected);
        });
      }
    });
  }
});

describe('TOON Decoder - Basic functionality', () => {
  it('decodes null', () => {
    expect(decode('null')).toBe(null);
  });

  it('decodes true', () => {
    expect(decode('true')).toBe(true);
  });

  it('decodes false', () => {
    expect(decode('false')).toBe(false);
  });

  it('decodes number', () => {
    expect(decode('42')).toBe(42);
  });

  it('decodes decimal', () => {
    expect(decode('3.14')).toBe(3.14);
  });

  it('decodes unquoted string', () => {
    expect(decode('hello')).toBe('hello');
  });

  it('decodes quoted string', () => {
    expect(decode('"hello"')).toBe('hello');
  });

  it('decodes empty quoted string', () => {
    expect(decode('""')).toBe('');
  });

  it('decodes simple object', () => {
    const toon = 'name: Alice\nage: 30';
    const result = decode(toon);
    expect(result).toEqual({ name: 'Alice', age: 30 });
  });

  it('decodes tabular array', () => {
    const toon = `users[2]{id,name}:
  1,Alice
  2,Bob`;
    const result = decode(toon);
    expect(result).toEqual({
      users: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ],
    });
  });

  it('decodes simple array', () => {
    const toon = `items[3]:
  1
  2
  3`;
    const result = decode(toon);
    expect(result).toEqual({ items: [1, 2, 3] });
  });

  it('decodes quoted keyword as string', () => {
    expect(decode('"true"')).toBe('true');
    expect(decode('"false"')).toBe('false');
    expect(decode('"null"')).toBe('null');
  });
});

