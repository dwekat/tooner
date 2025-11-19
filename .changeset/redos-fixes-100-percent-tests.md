---
"tooner": patch
---

**Security & Bug Fixes - 100% Test Pass Rate Achieved**

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

