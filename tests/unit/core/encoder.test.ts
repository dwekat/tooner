import { describe, it, expect } from 'vitest';
import { encode } from '../../../src/core/encoder.js';
import { getEncodeFixtures } from '../../utils/fixtures.js';

describe('TOON Encoder - Official Fixtures', () => {
  const fixtures = getEncodeFixtures();

  for (const fixture of fixtures) {
    describe(fixture.description, () => {
      for (const test of fixture.tests) {
        it(test.name, () => {
          const result = encode(test.input);
          expect(result).toBe(test.expected);
        });
      }
    });
  }
});

describe('TOON Encoder - Basic functionality', () => {
  it('encodes null', () => {
    expect(encode(null)).toBe('null');
  });

  it('encodes boolean true', () => {
    expect(encode(true)).toBe('true');
  });

  it('encodes boolean false', () => {
    expect(encode(false)).toBe('false');
  });

  it('encodes number', () => {
    expect(encode(42)).toBe('42');
  });

  it('encodes decimal', () => {
    expect(encode(3.14)).toBe('3.14');
  });

  it('encodes safe string without quotes', () => {
    expect(encode('hello')).toBe('hello');
  });

  it('encodes empty string with quotes', () => {
    expect(encode('')).toBe('""');
  });

  it('encodes simple object', () => {
    const result = encode({ name: 'Alice', age: 30 });
    expect(result).toContain('name: Alice');
    expect(result).toContain('age: 30');
  });

  it('encodes simple array', () => {
    const result = encode({ items: [1, 2, 3] });
    expect(result).toContain('items[3]:');
  });

  it('encodes uniform array in tabular format', () => {
    const result = encode({
      users: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ],
    });
    expect(result).toContain('users[2]{id,name}:');
    expect(result).toContain('1,Alice');
    expect(result).toContain('2,Bob');
  });

  it('normalizes negative zero', () => {
    expect(encode(-0)).toBe('0');
  });
});

