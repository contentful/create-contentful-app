# Contributing to create-contentful-app

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20 (`.nvmrc`: `v22`) |
| npm | ≥ 8 |

## Setup

```bash
git clone https://github.com/contentful/create-contentful-app.git
cd create-contentful-app
npm ci
```

## Running Tests

```bash
npm test   # nx run-many -t test — runs Mocha tests across all packages
```

Tests use **Mocha + Chai + Sinon**. Test files are in `packages/<pkg>/test/`.

The CI suite also runs integration tests that scaffold a real app and run its full build + test cycle — these run in GitHub Actions only, across a Node and OS matrix.

## Building

```bash
npm run build   # nx run-many -t build
```

## Linting

```bash
npm run lint   # nx run-many -t lint
```

Prettier runs automatically on staged files via `lint-staged` (Husky pre-commit hook). Don't skip it.

## Testing the CLI Locally

```bash
cd packages/contentful--create-contentful-app
node bin/create-contentful-app.js my-test-app
```

Or link globally:
```bash
npm link
create-contentful-app my-test-app
```

## Code Conventions

- **TypeScript** throughout
- **Conventional Commits** — `feat:`, `fix:`, `chore:`, `docs:`
- **No `any`** in TypeScript
- When adding a new base template, add it to `IGNORED_EXAMPLES` in `src/constants.ts` if it should not appear in the interactive example picker

## Releasing

Releases are automated via `nx release` on the `main` branch, driven by conventional commits.
Do not manually bump versions. See
[ADR 2026-01-20](./docs/ADRs/2026-01-20-adopt-nx-release-replace-lerna.md) for why Nx Release
replaced Lerna.

**Canary**: merge to the `canary` branch → publishes `X.Y.Z-alpha.N` under the `canary` dist-tag.

## Branch Strategy

- **`main`** — production; triggers release on merge
- **`canary`** — prerelease; publishes canary versions
- **Feature branches** — PR against `main`

## Troubleshooting

**CLI doesn't pick up local changes**
Run `npm run build` in the package, then `npm link` to test globally.

**Scaffold integration test fails in CI**
The test scaffolds a real app and runs its build + tests — verify that the template in `contentful/apps` is building successfully.
