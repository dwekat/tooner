---
"tooner": patch
---

Fix: Resolve 5 additional ReDoS vulnerabilities in decoder.
- Removed `[ \t]*` before `(.*)$` in regex patterns to prevent catastrophic backtracking
- Added `.trimStart()` calls to handle whitespace in JavaScript instead

