# tooner

**Token-efficient serialization for LLMs** - Convert JSON/YAML/TOML to TOON format

> ⚠️ **Work in Progress**: This library is under active development. The encoder has basic functionality, but the decoder and many TOON spec features are not yet implemented.

## Installation

```bash
npm install tooner
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

// Decode from TOON (not yet implemented)
const decoded = decode(toon);
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

# Decode TOON to JSON (not yet implemented)
npx tooner decode input.toon -o output.json

# Decode TOON to YAML (not yet implemented)
npx tooner decode input.toon -f yaml -o output.yaml
```

## Current Status

### ✅ Implemented

- ✅ Project structure with tree-shakable exports
- ✅ TypeScript configuration with strict mode
- ✅ Build system (tsup) with dual package support (ESM + CJS)
- ✅ CLI tool with commander
- ✅ Format converter structure (JSON, YAML, TOML)
- ✅ Basic encoder for simple cases:
  - Primitive values (strings, numbers, booleans, null)
  - Simple objects
  - Primitive arrays (inline format)
  - Root-level arrays
- ✅ Test infrastructure with Vitest
- ✅ Official TOON test fixtures

### 🚧 In Progress / TODO

- ❌ **Complete TOON Encoder**:
  - List format with hyphens for mixed arrays
  - Nested arrays support
  - Tabular format for uniform object arrays
  - Alternative delimiters (tab, pipe)
  - Key folding/path expansion
  - Proper key quoting
  - Whitespace handling
  - Strict mode validations

- ❌ **TOON Decoder**: Not yet implemented
  - Parse TOON indentation structure
  - Parse inline arrays
  - Parse list format
  - Parse tabular format
  - Handle all primitive types
  - Validate field counts
  - Error handling with line/column info

- ❌ **Advanced Features**:
  - Custom delimiters
  - Key folding options
  - Path expansion
  - Strict mode
  - Custom indent size

- ❌ **Testing**: 
  - 217 of 363 tests failing (encoder incomplete)
  - Need decoder tests
  - Need integration tests
  - Need performance benchmarks

- ❌ **Documentation**:
  - API documentation
  - Examples
  - Performance benchmarks
  - Comparison with JSON

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

