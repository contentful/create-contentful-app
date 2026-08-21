# Architecture — create-contentful-app

## Overview

Three packages that together form the complete Contentful app developer experience: a project scaffolding CLI, a build/deploy scripts CLI used inside scaffolded apps, and a React hooks library.

## Package Map

```
@contentful/create-contentful-app   (CLI — npx create-contentful-app)
        │
        │  Clones templates from
        ▼
github.com/contentful/apps/examples/{template-name}
        │
        │  Scaffolded app depends on
        ▼
@contentful/app-scripts              (contentful-app-scripts build/deploy commands)
@contentful/react-apps-toolkit       (useSDK, useAutoResizer, useFieldValue, useCMA)
```

## create-contentful-app CLI Flow

1. User runs `npx create-contentful-app my-app [flags]`
2. CLI validates app name (must be a valid npm package name)
3. Interactive template selection — or flags: `--typescript` (default), `--javascript`, `--nextjs`, `--vite-react`, `--vue`
4. `degit` clones the template from `contentful/apps/examples/{template-name}` (tarball, no git history)
5. Lock files removed from clone
6. `package.json` name updated to match app folder name
7. If `--action`: clones action template, merges `contentful-app-manifest.json`, moves `build-actions.js`, injects `build:actions` script
8. If `--function`: clones function template, merges manifest, moves `build-functions.js`, injects `build:functions` script
9. `npm install` (or `yarn install`) runs
10. User instructed to run `npm run create-app-definition` then `npm start`

## Available Templates

| Template | Source in apps repo |
|----------|---------------------|
| `typescript` (default) | `examples/typescript` |
| `javascript` | `examples/javascript` |
| `vite-react` | `examples/vite-react` |
| `nextjs` | `examples/nextjs` |
| `vue` | `examples/vue` |

Custom templates: `--source <github-path>` or `--example <name>` for community examples.

## app-scripts

Provides the `contentful-app-scripts` CLI used in generated apps' `package.json`:

| Command | What it does |
|---------|-------------|
| `create-app-definition` | Creates/updates the App Definition in Contentful via CMA |
| `build` | Wraps Vite build with Contentful-specific config |
| `build-functions --ci` | Builds App Functions for deployment |
| `deploy` | Uploads built app to Contentful hosting |

## react-apps-toolkit

React hooks all apps should use:

| Hook | Purpose |
|------|---------|
| `useSDK<T>()` | Returns the typed App SDK for the current location |
| `useAutoResizer()` | Calls `sdk.window.startAutoResizer()` on mount |
| `useFieldValue(fieldId)` | Reactive field value with setter |
| `useCMA()` | Returns a CMA client instance |

## Monorepo Setup

- **Nx** — owns build caching, task running (`nx run-many`), versioning, and publishing. Lerna
  was removed in favour of Nx Release; see
  [ADR 2026-01-20](./docs/ADRs/2026-01-20-adopt-nx-release-replace-lerna.md).
- **npm workspaces** — `workspaces: ["packages/*"]` handles dependency linking
- **Independent versioning** — each package has its own semver, driven by conventional commits
- **Node ≥ 20** — `engines.node` is `>=20`; `.nvmrc` pins `v22`
- **GitHub Actions** — a CI workflow gates every push and PR; a separate release workflow runs
  after CI succeeds on `main` or `canary`

## CI / Release

```
CI (.github/workflows/ci.yaml) — every push and PR to main or canary:
  matrix: Node 20.20 / 22.23 / 24.18  ×  ubuntu-latest / windows-latest
    install-and-build
    lint-and-test
    test-app       (scaffold a real app → build + test)
    test-functions (scaffold with app functions → build)
  ci-status        (single aggregate status check over the matrix)

Release (.github/workflows/release.yaml) — after CI succeeds on main or canary:
  nx release --skip-publish   (version, changelog, tag)
  git push --follow-tags
  nx release publish          (npmjs, OIDC trusted publishing with provenance)
```

Canary releases publish from the `canary` branch with `X.Y.Z-alpha.N` format under the `canary` dist-tag.

## Key Dependencies

| Package | Role |
|---------|------|
| `degit` | Template cloning (tarball mode, no cache) |
| `commander` | CLI argument parsing |
| `inquirer` | Interactive prompts |
| `validate-npm-package-name` | App name validation |
| `analytics-node` | Telemetry |
