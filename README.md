# tooner

[![npm version](https://badge.fury.io/js/tooner.svg)](https://www.npmjs.com/package/tooner)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<a href="https://www.buymeacoffee.com/dwekat" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" width="217"></a>

**Token-efficient serialization for LLMs** - Convert JSON/YAML/TOML to TOON format

## Installation

```bash
npm install tooner

# Or with other package managers
pnpm add tooner
yarn add tooner
```

## What is TOON?

Token-Oriented Object Notation (TOON) is a compact, human-readable serialization format designed for passing structured data to Large Language Models with significantly reduced token usage (typically 30-60% fewer tokens than JSON).

TOON's sweet spot is **uniform arrays of objects** – multiple fields per row, same structure across items. See the [official specification](https://github.com/toon-format/spec) for complete details.

## Usage

### Core API (Object ↔ TOON)

```typescript
import { encode, decode } from 'tooner';

const data = {
  users: [
    { id: 1, name: 'Alice', role: 'admin' },
    { id: 2, name: 'Bob', role: 'user' },
  ],
};

// Encode to TOON
const toon = encode(data);
console.log(toon);
// Output:
// users[2]{id,name,role}:
//   1,Alice,admin
//   2,Bob,user

// Decode from TOON
const decoded = decode(toon);
// Returns original data structure
```

### Format Converters (Tree-Shakable)

```typescript
// JSON ↔ TOON
import { encode, decode } from 'tooner/json';

const jsonString = '{"name":"Alice","age":30}';
const toon = encode(jsonString);

// YAML ↔ TOON
import { encode as yamlEncode } from 'tooner/yaml';

const yamlString = 'name: Alice\nage: 30';
const toon = yamlEncode(yamlString);

// TOML ↔ TOON
import { encode as tomlEncode } from 'tooner/toml';

const tomlString = 'name = "Alice"\nage = 30';
const toon = tomlEncode(tomlString);
```

### CLI

```bash
# Encode JSON to TOON
npx tooner encode input.json -o output.toon

# Encode YAML to TOON
npx tooner encode input.yaml -f yaml -o output.toon

# Decode TOON to JSON
npx tooner decode input.toon -o output.json

# Decode TOON to YAML
npx tooner decode input.toon -f yaml -o output.yaml
```

## Current Status

### ✅ Implemented

- ✅ Project structure with tree-shakable exports
- ✅ TypeScript configuration with strict mode
- ✅ Build system (tsup) with dual package support (ESM + CJS)
- ✅ CLI tool with commander
- ✅ Format converter structure (JSON, YAML, TOML)
- ✅ **Complete TOON Encoder**:
  - Primitive values (strings, numbers, booleans, null)
  - Objects and nested objects
  - Inline arrays: `tags[3]: a,b,c`
  - List format with hyphens for mixed arrays
  - Tabular format for uniform object arrays
  - Root-level arrays (all formats)
  - Alternative delimiters (comma, tab, pipe)
  - Proper key quoting and escaping
  - Whitespace handling
- ✅ **Complete TOON Decoder** (363/363 tests passing - 100%):
  - Parse TOON indentation structure
  - Parse inline arrays with all delimiters
  - Parse list format with nested objects
  - Parse tabular format
  - Handle all primitive types (including scientific notation)
  - Path expansion with `expandPaths: 'safe'` option
  - Strict mode with indentation validation
  - Custom indent sizes
  - Validate array lengths and field counts
  - Error handling with line numbers
  - Escape sequence handling
- ✅ Test infrastructure with Vitest
- ✅ Official TOON test fixtures (363/363 passing - 100%)
- ✅ Security hardened (ReDoS vulnerabilities patched)

### 📋 TODO

- ❌ **Documentation**:
  - Comprehensive API documentation
  - More usage examples
  - Performance benchmarks
  - Comparison with JSON/YAML/TOML

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Build
pnpm build

# Lint
pnpm lint

# Format
pnpm format
```

## Bundle Sizes (Estimated)

Tree-shakable design ensures you only bundle what you use:

- `tooner` (core): ~4KB
- `tooner/json`: ~4KB (no extra deps)
- `tooner/yaml`: ~20KB (includes yaml parser)
- `tooner/toml`: ~15KB (includes toml parser)

## Architecture

### Tree-Shaking First

- Each entry point is completely independent
- No shared state between converters
- Core has zero dependencies
- Format parsers only imported when needed

### File Structure

```
tooner/
├── src/
│   ├── core/
│   │   ├── encoder.ts     # TOON encoder
│   │   ├── decoder.ts     # TOON decoder (TODO)
│   │   └── types.ts       # Shared types
│   ├── json.ts            # Entry: tooner/json
│   ├── yaml.ts            # Entry: tooner/yaml
│   ├── toml.ts            # Entry: tooner/toml
│   └── index.ts           # Entry: tooner
├── cli/
│   └── index.ts           # CLI tool
└── tests/
    ├── fixtures/          # Official TOON test fixtures
    ├── unit/              # Unit tests
    ├── integration/       # Integration tests
    └── performance/       # Benchmarks
```

## Contributing

This project follows the [official TOON specification](https://github.com/toon-format/spec). Contributions are welcome! Please see issues tagged with "good first issue" or "help wanted".

## License

MIT © 2025

## Resources

- [TOON Specification](https://github.com/toon-format/spec)
- [TOON Reference Implementation](https://github.com/toon-format/toon)
