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

- **Lerna 6 + Nx** — Nx caches build outputs; Lerna handles versioning and publishing
- **Independent versioning** — each package has its own semver
- **Node ≥ 18** — CI tests on Node 18 and 20
- **CircleCI** — lint-and-test → test-built-app (real scaffold + build + test) → release

## CI / Release

```
Every branch:
  lint-and-test (Node 18 + 20)
  test-built-app (scaffold a real app → npm run build + test)
  test-built-app-actions-functions (scaffold with --action --function flags)

master branch (after all tests pass):
  lerna version --conventional-commits  →  lerna publish from-git
```

Canary releases publish from the `canary` branch with `X.Y.Z-alpha.N` format under the `canary` dist-tag.

## Key Dependencies

| Package | Role |
|---------|------|
| `degit` | Template cloning (tarball mode, no cache) |
| `commander` | CLI argument parsing |
| `inquirer` | Interactive prompts |
| `validate-npm-package-name` | App name validation |
| `analytics-node` | Telemetry (disable with `DISABLE_ANALYTICS=true`) |
