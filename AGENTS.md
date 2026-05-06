# Agent Guide — create-contentful-app

## What This Repo Does
Scaffolding toolkit for Contentful apps. Three published packages:
- `@contentful/create-contentful-app` — CLI that bootstraps new apps from templates (`npx create-contentful-app`)
- `@contentful/app-scripts` — CLI for recurring app operations (build, deploy, create-app-definition) used inside every scaffolded app
- `@contentful/react-apps-toolkit` — React hooks for app development (`useSDK`, `useAutoResizer`, `useFieldValue`, `useCMA`)

## Ownership
`@contentful/team-marketplace` (full, co-owned with `@contentful/team-extensibility` and `@contentful/team-developer-experience`)

## Structure

```
packages/
├── contentful--create-contentful-app/   # CLI (npx create-contentful-app)
├── contentful--app-scripts/             # Build/deploy scripts used in generated apps
├── contentful--react-apps-toolkit/      # React hooks (useSDK, useAutoResizer, etc.)
└── create-contentful-app/               # Legacy alternate entry
```

## Sharp Edges & Invariants

- **Templates live in `contentful/apps`** — the CLI clones templates from `github.com/contentful/apps/examples/{template-name}` via `degit`. Renaming a template here requires coordinating a change in the `apps` repo.
- **Ignored example folders are hardcoded** — `javascript`, `typescript`, `vue`, `vite-react`, `nextjs`, `hosted-app-action-templates`, and `function-templates` are excluded from the dynamic example listing in `src/constants.ts`. Update this list when adding new base templates.
- **`contentful-app-manifest.json` is never removed after cloning** — it's in `IGNORED_CLONED_FILES`. When using `--action` or `--function` flags, the manifest is merged (not replaced) into the scaffolded app root.
- **`--action` and `--function` flags run a merge step** — both `build-actions.js` / `build-functions.js` are moved to root and `build:actions` / `build:functions` scripts are injected into the generated `package.json`.
- **`useSDK()` and `useAutoResizer()`** from `@contentful/react-apps-toolkit` are the canonical React hooks for all 56 apps in the `apps` monorepo. Changes to hook signatures are breaking.
- **Lerna 6 + Nx** — each package versions independently. Use `lerna run <script>` for cross-package operations.

## Never / Always

- **Never** rename template folders in the `apps` repo without updating `src/constants.ts` here.
- **Never** manually bump package versions — releases are automated via semantic-release on `master`.
- **Always** test the CLI end-to-end after changes — CI scaffolds a real app and runs its full build + test cycle.
- **Always** check `@contentful/react-apps-toolkit` for breaking changes before bumping — all apps in the monorepo depend on it.
