# tooner

## 0.1.5

### Patch Changes

- Upgrade devDependencies: @types/node to v25, eslint to v10, vitest to v4.1

## 0.1.4

### Patch Changes

- Update repository URLs to dwekat organization

## 0.1.3

### Patch Changes

- c030721: Chore: Update dependencies and migrate to ESLint v9 flat config.
  - Updated @types/node, @typescript-eslint/\*, @vitest/coverage-v8, commander, eslint, eslint-config-prettier, vitest to latest versions
  - Migrated from .eslintrc.cjs to eslint.config.js (ESLint v9 flat config format)
- 42cc922: Security: Fix glob CLI command injection vulnerability (CVE-2025-64756).
  - Added pnpm override to force glob@>=10.5.0
  - Upgraded transitive dependency glob 10.4.5 → 13.0.0
- 6afc99e: Fix: Resolve 5 additional ReDoS vulnerabilities in decoder.
  - Removed `[ \t]*` before `(.*)$` in regex patterns to prevent catastrophic backtracking
  - Added `.trimStart()` calls to handle whitespace in JavaScript instead
- 320a772: **Security & Bug Fixes - 100% Test Pass Rate Achieved**

  ### Security Fixes
  - Fixed 5 ReDoS (Regular Expression Denial of Service) vulnerabilities in decoder
  - Replaced vulnerable `\s*` patterns with `[ \t]*` to prevent exponential backtracking on malicious input

  ### Bug Fixes
  1. **Array length validation**: Fixed `parseArray` to correctly track consumed lines when delegating to `parseListFormat`
  2. **Path expansion conflicts**: Non-dotted keys now properly check for conflicts during path expansion in strict mode
  3. **Array overflow detection**: Added validation to detect extra list items beyond declared array count
  4. **Missing colon detection**: Fixed nested context tracking to properly throw errors for missing colons in key-value pairs

  ### Test Coverage
  - **All 363/363 official TOON specification tests now passing (100%)**
  - Up from 358/363 (98.6%)

  ### Details
  - Added `depth` parameter throughout parsing functions to track nested contexts
  - Improved error messages with accurate line numbers
  - Enhanced validation for strict mode compliance
