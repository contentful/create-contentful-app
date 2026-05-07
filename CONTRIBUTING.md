# Contributing to create-contentful-app

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 (`.nvmrc`: `lts/*`) |
| npm | ≥ 8 |

## Setup

```bash
git clone https://github.com/contentful/create-contentful-app.git
cd create-contentful-app
npm ci
```

## Running Tests

```bash
npm test   # lerna run test — runs Mocha tests across all packages
```

Tests use **Mocha + Chai + Sinon**. Test files are in `packages/<pkg>/test/`.

The CI suite also runs integration tests that scaffold a real app and run its full build + test cycle — these run in CircleCI only.

## Building

```bash
npm run build   # lerna run build
```

## Linting

```bash
npm run lint   # lerna run lint
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

Releases are automated via semantic-release on the `master` branch. Do not manually bump versions.

**Canary**: merge to the `canary` branch → publishes `X.Y.Z-alpha.N` under the `canary` dist-tag.

## Branch Strategy

- **`master`** — production; triggers release on merge
- **`canary`** — prerelease; publishes canary versions
- **Feature branches** — PR against `master`

## Troubleshooting

**CLI doesn't pick up local changes**
Run `npm run build` in the package, then `npm link` to test globally.

**Scaffold integration test fails in CI**
The test scaffolds a real app and runs its build + tests — verify that the template in `contentful/apps` is building successfully.
