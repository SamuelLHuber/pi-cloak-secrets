# Changelog

## 1.0.1 — 2026-10-03

- Verify loading and typechecking against Pi 1.0.0, with pinned development dependencies and a reproducible lockfile.
- Add regression coverage for direct and codemode-nested read-result redaction and non-text blocks.
- Scope remains read-result cloaking, not an operating-system secret sandbox.

Verification: `npm ci --ignore-scripts --legacy-peer-deps`, `npm run check`, `npm test`; real Pi 1.0 extension-loader smoke check.
