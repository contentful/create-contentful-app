# Implementation Plan: ESLint 9 Major Version Upgrade

**Branch**: `001-eslint-upgrade` | **Date**: 2026-02-12 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-eslint-upgrade/spec.md`

## Summary

Upgrade ESLint from v8.57.0 to v9.x across the monorepo, including all related dependencies (typescript-eslint, eslint-plugin-n, eslint-config-prettier). The migration requires converting `.eslintrc.*` configuration files to the new flat config format (`eslint.config.js`). Each dependency upgrade will be committed individually only after build, lint, and tests pass ("green" state).

## Technical Context

**Language/Version**: TypeScript 4.9.5, Node.js >=18  
**Primary Dependencies**: ESLint 8.57.0 → 9.x, typescript-eslint 5.62.0 → 8.x, NX 22.3.3  
**Storage**: N/A (configuration files only)  
**Testing**: Mocha 11.7.5 (existing test suite must pass at each step)  
**Target Platform**: Node.js CLI tools (cross-platform)  
**Project Type**: npm monorepo with NX  
**Performance Goals**: N/A (maintenance task)  
**Constraints**: Each upgrade must pass `npm run build && npm run lint && npm run test`  
**Scale/Scope**: 4 packages, 3 ESLint config files to migrate

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Developer Experience First | ✅ PASS | Clear error messages preserved; migration guide in quickstart.md |
| II. Package Independence | ✅ PASS | Each package remains independently lintable |
| III. Semantic Versioning | ✅ PASS | This is a chore (no version bump required for internal tooling) |
| IV. Test Coverage | ✅ PASS | Existing tests validate upgrade success at each step |
| V. Contentful API Alignment | ✅ PASS | No impact on Contentful APIs |

**Development Workflow Compliance**:
- ✅ Conventional commits: Each commit will use `chore:` prefix
- ✅ CI Checks: Build, lint, test must pass before each commit

## Project Structure

### Documentation (this feature)

```text
specs/001-eslint-upgrade/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # ESLint 9 migration research
├── quickstart.md        # Step-by-step upgrade guide
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (files affected)

```text
# Root configuration
.eslintrc.js                    → DELETE (migrated to eslint.config.js)
eslint.config.js                → CREATE (new flat config)
package.json                    → MODIFY (dependency updates)

# Package configurations
packages/contentful--create-contentful-app/.eslintrc.json  → DELETE or MODIFY
packages/contentful--app-scripts/.eslintrc.json            → DELETE or MODIFY
```

**Structure Decision**: Monorepo with centralized ESLint configuration. Package-level configs will be evaluated for consolidation into root flat config with `files` patterns, or converted to individual flat configs if package-specific rules are needed.

## Dependency Upgrade Sequence

Each row represents one commit (green state required before committing):

| Step | Action | Verification Command |
|------|--------|---------------------|
| 1 | Remove `eslint-plugin-node`, add `eslint-plugin-n@17.x` | `npm run build && npm run lint && npm run test` |
| 2 | Remove `babel-eslint` | `npm run build && npm run lint && npm run test` |
| 3 | Upgrade `@typescript-eslint/parser` to 8.x | `npm run build && npm run lint && npm run test` |
| 4 | Upgrade `@typescript-eslint/eslint-plugin` to 8.x | `npm run build && npm run lint && npm run test` |
| 5 | Verify/upgrade `eslint-config-prettier` | `npm run build && npm run lint && npm run test` |
| 6 | Upgrade `eslint` to 9.x | `npm run build && npm run lint && npm run test` |
| 7 | Migrate configs to flat format | `npm run build && npm run lint && npm run test` |

**Note**: Steps 3-4 may need to be combined if typescript-eslint parser and plugin must match versions.

## Complexity Tracking

> No Constitution Check violations. Table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
