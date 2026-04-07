# Research: ESLint 9 Major Version Upgrade

**Feature Branch**: `001-eslint-upgrade`  
**Date**: 2026-02-12

## Executive Summary

ESLint 9 introduces "flat config" as the new default configuration system, replacing `.eslintrc.*` files with a single `eslint.config.js`. This migration is mandatory as the old configuration system is deprecated. All related dependencies have ESLint 9-compatible versions available.

---

## Research Findings

### 1. ESLint 9 Flat Config Migration

**Decision**: Migrate to flat config format using `eslint.config.js`

**Rationale**:
- Flat config is the default and only supported format in ESLint 9.x
- Provides better performance and explicit dependency resolution
- Eliminates the confusing configuration cascade from `.eslintrc.*` files
- ESLint provides an automated migration tool: `npx @eslint/migrate-config`

**Alternatives Considered**:
- `ESLINT_USE_FLAT_CONFIG=false` environment variable (rejected: only delays the inevitable, deprecated)
- Manual rewrite without migration tool (rejected: tool handles most cases automatically)

**Key Requirements**:
- Node.js v18.18.0 or above (project already requires >=18, compatible)
- Replace `.eslintrc.js` and `.eslintrc.json` files with single `eslint.config.js`

---

### 2. typescript-eslint Compatibility

**Decision**: Upgrade to typescript-eslint v7.x or v8.x (both support ESLint 9)

**Rationale**:
- typescript-eslint supports ESLint `^8.57.0 || ^9.0.0`
- Current project has v5.62.0 which does NOT support ESLint 9
- v7+ uses the unified `typescript-eslint` package instead of separate `@typescript-eslint/*` packages
- Node.js requirement: `^18.18.0 || ^20.9.0 || >=21.1.0` (compatible)

**Alternatives Considered**:
- Keep @typescript-eslint/* v5.x (rejected: incompatible with ESLint 9)
- Use @typescript-eslint/* v6.x (rejected: v7+ recommended for ESLint 9 with unified package)

**Migration Notes**:
- Can use either individual packages or unified `typescript-eslint` package
- Unified package simplifies configuration in flat config

---

### 3. eslint-plugin-node → eslint-plugin-n

**Decision**: Replace `eslint-plugin-node` with `eslint-plugin-n` v17.x

**Rationale**:
- `eslint-plugin-node` is unmaintained (last release was 11.1.0 in 2020)
- `eslint-plugin-n` is the community-maintained fork with active development
- v17.x supports ESLint 9 and flat config format
- Rule names remain the same (just plugin name changes from `node/` to `n/`)

**Alternatives Considered**:
- Continue using eslint-plugin-node (rejected: unmaintained, no ESLint 9 support)
- Remove Node.js-specific linting (rejected: valuable rules for CLI tooling)

**Migration Notes**:
- Update rule references: `node/shebang` → `n/shebang`
- Use `nodePlugin.configs["flat/recommended-script"]` for recommended config

---

### 4. babel-eslint Assessment

**Decision**: Remove `babel-eslint` entirely

**Rationale**:
- `babel-eslint` is deprecated (last release was 10.1.0 in 2020)
- Project uses TypeScript, which has its own parser (`@typescript-eslint/parser`)
- No Babel-specific syntax is being linted that isn't covered by TypeScript parser
- Removing it simplifies the dependency tree

**Alternatives Considered**:
- Replace with `@babel/eslint-parser` (rejected: not needed for TypeScript projects)
- Keep as-is (rejected: deprecated, potential ESLint 9 incompatibility)

---

### 5. eslint-config-prettier Compatibility

**Decision**: Keep `eslint-config-prettier`, upgrade if needed

**Rationale**:
- Current version 10.1.8 should support ESLint 9 flat config
- Plugin's purpose (disable conflicting rules) remains valid
- Verify compatibility during upgrade; update if issues arise

**Migration Notes**:
- Import and spread in flat config array instead of `extends`

---

## Dependency Upgrade Order

Based on compatibility constraints, dependencies must be upgraded in this order:

| Order | Package | Current | Target | Notes |
|-------|---------|---------|--------|-------|
| 1 | `eslint-plugin-node` | 11.1.0 | REMOVE | Deprecated, replace with eslint-plugin-n |
| 2 | `eslint-plugin-n` | N/A | 17.x | New package, replacement for eslint-plugin-node |
| 3 | `babel-eslint` | 10.1.0 | REMOVE | Deprecated, not needed for TypeScript |
| 4 | `@typescript-eslint/parser` | 5.62.0 | 8.x | ESLint 9 compatible |
| 5 | `@typescript-eslint/eslint-plugin` | 5.62.0 | 8.x | ESLint 9 compatible |
| 6 | `eslint-config-prettier` | 10.1.8 | Latest | Verify flat config support |
| 7 | `eslint` | 8.57.0 | 9.x | Core upgrade after plugins ready |
| 8 | Config migration | N/A | N/A | Convert .eslintrc.* to eslint.config.js |

**Critical Path**: Steps 1-6 prepare the ecosystem; step 7 is the actual ESLint upgrade; step 8 must follow immediately after step 7.

---

## Configuration Migration Strategy

### Current Files to Migrate

1. **Root**: `.eslintrc.js` → `eslint.config.js`
2. **Packages**: `packages/*/.eslintrc.json` → Consolidated into root or per-package flat configs

### Migration Approach

1. Use ESLint's migration tool: `npx @eslint/migrate-config .eslintrc.js`
2. Review generated `eslint.config.js` for accuracy
3. Manually adjust for:
   - Dynamic `devDependencies` import in current config
   - Package-level config inheritance
   - NX monorepo integration

### Flat Config Structure (Target)

```javascript
// eslint.config.js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nodePlugin from 'eslint-plugin-n';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  nodePlugin.configs['flat/recommended-script'],
  prettier,
  {
    // Custom rules
  }
];
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Plugin incompatibility discovered mid-upgrade | Medium | High | One commit per upgrade enables easy rollback |
| Flat config produces different lint results | Medium | Medium | Run lint before/after migration, compare output |
| NX integration issues with flat config | Low | Medium | Test with `nx run-many -t lint` at each step |
| Package-level configs don't inherit correctly | Medium | Medium | Test each package individually after migration |

---

## References

- [ESLint 9 Migration Guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0)
- [ESLint Configuration Migrator](https://eslint.org/blog/2024/05/eslint-configuration-migrator)
- [typescript-eslint Dependency Versions](https://typescript-eslint.io/users/dependency-versions)
- [eslint-plugin-n Documentation](https://www.npmjs.com/package/eslint-plugin-n)
