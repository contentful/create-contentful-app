# Adopt Nx Release for versioning and publishing, replacing Lerna

## Status

Accepted

## Context

This monorepo holds four packages under `packages/`, all of which publish to npm: the three
scoped packages `@contentful/create-contentful-app`, `@contentful/app-scripts`, and
`@contentful/react-apps-toolkit`, plus the unscoped `create-contentful-app` wrapper that
`npx create-contentful-app` resolves through. Each package versions independently.

Before this decision the toolchain used **both** Lerna and Nx, with responsibilities split
between them:

| Concern | Tool |
|---------|------|
| Dependency linking | `lerna bootstrap` |
| Cross-package task running | `lerna run <script>` |
| Versioning + changelogs | `lerna version --conventional-commits` |
| Publishing | `lerna publish from-git` |
| Build caching | Nx |

Both were declared in the root `package.json` — Lerna pinned at `6.6.2`, Nx at `22.3.3`. Nx
was therefore already a hard dependency of the build, but was doing only a fraction of the
work it was capable of.

Two concrete problems motivated consolidating:

1. **Release auth friction.** The release workflow rewrote `.npmrc` at runtime, which
   interfered with Lerna's own registry authentication. `539c226d` ("chore: remove `.npmrc`
   editing as it interferes with lerna", #2876) removed that step a week before the
   migration, moving auth into per-package configuration instead.
2. **Registry migration.** The root `package.json` carried
   `publishConfig.registry: https://npm.pkg.github.com/`, pinning publishes to GitHub
   Packages. Moving the published packages to npmjs with OIDC trusted publishing and
   provenance attestation required control over the publish invocation that the Lerna
   configuration did not cleanly give.

The alternative to consolidating on Nx was to keep the split and upgrade Lerna. That was
rejected: it would have meant maintaining two overlapping tools, and `lerna bootstrap` — the
linking mechanism this repo depended on — had already been superseded by native package
manager workspaces.

## Decision

Drop Lerna entirely and move versioning, publishing, and task running onto Nx, with npm
workspaces handling dependency linking.

Implemented in `96d92d99` ("chore: switch to nx", #2883, whose commit body reads
"chore: remove lerna") and completed by `1d4c1e16` ("chore: enable publishing", #2886).

What changed:

| Concern | Before | After |
|---------|--------|-------|
| Dependency linking | `lerna bootstrap` | npm `workspaces: ["packages/*"]` |
| Task running | `lerna run <script>` | `nx run-many -t <target>` |
| Versioning | `lerna version --conventional-commits` | `nx release --skip-publish` |
| Publishing | `lerna publish from-git` | `nx release publish` |
| Registry | GitHub Packages via `publishConfig` | npmjs via OIDC trusted publishing |
| Per-package config | `package.json` only | `project.json` per package |

Release configuration moved into `nx.json` under a `release` key: `projectsRelationship:
"independent"`, `version.conventionalCommits: true`, and `changelog.projectChangelogs: true`
preserve the independent-versioning and conventional-commit behaviour the repo already
relied on.

The release workflow also split what Lerna did in one step into three discrete ones —
prepare (version, changelog, tag locally), push tags, then publish. Failures are now
attributable to a specific phase rather than to a single opaque command.

## Consequences

### What this enables

- One tool owns the graph. Build caching, task orchestration, versioning, and publishing all
  read the same project graph, so a package's dependents are computed once rather than
  inferred separately by two tools.
- Publishing to npmjs with provenance. `NPM_CONFIG_PROVENANCE` and OIDC trusted publishing
  give consumers a verifiable link from a published tarball back to the workflow run that
  built it.
- Per-phase release failures. A version failure no longer looks identical to a publish
  failure.

### Trade-offs accepted

- **npm version floor.** OIDC trusted publishing for the unscoped package needs
  npm >= 11.5.1, but Node 22 ships npm 10.x. The release workflow pins `npm@11.18.0`
  explicitly — deliberately not `npm@latest`, since npm 12+ tightens Node engine
  requirements. This pin needs revisiting whenever the workflow's Node version moves.
- **Nx-specific release semantics.** Release behaviour is now governed by `nx.json` plus the
  `@nx/js` plugin's defaults rather than by Lerna flags. Those defaults are not always the
  safe choice for this repo — see below.
- **Node floor raised.** `engines.node` moved from `>=18` to `>=20`.

### Problems this decision surfaced

Two post-adoption corrections are worth recording, because both trace directly to Nx release
semantics rather than to any change in this repo's own code:

- **Lockfile-wide version propagation.** `@nx/js` defaults
  `projectsAffectedByDependencyUpdates` to `"all"`, which treats any change to the root
  `package-lock.json` as affecting every project in the workspace. Under independent,
  conventional-commit versioning, a single lockfile-touching commit was therefore attributed
  to all packages — so a breaking change in one package could major-bump unrelated,
  unmodified packages. `963d050c` (#3091) set it to `"auto"`, scoping dependency-update
  detection to packages whose own manifest or source actually changed.
- **Unpublishable version reference.** A release on 2026-05-13 bumped the unscoped
  `create-contentful-app` wrapper to depend on `@contentful/create-contentful-app@3.0.0`,
  which was never published to npm. Three of the four affected packages were rolled back by
  dist-tag retag; the wrapper was missed. Because `npx create-contentful-app` resolves
  through that wrapper, every consumer failed with `ETARGET` until `5a7c046a` (#3085) pinned
  it back to a published version.

The general lesson: under independent versioning, verify that cross-package dependency
ranges reference versions that actually exist on the registry before publishing.

### Follow-up work

- `lerna.json` is still committed at the repository root despite Lerna being removed from
  `package.json`. It is dead configuration and should be deleted.
- `.github/workflows/release.yaml` retains a "Print lerna debug log" step and a run-summary
  string referring to Lerna, neither of which can fire any more.
- `.eslintrc.js` carries a comment stating that devDependencies are "hoisted by lerna";
  hoisting is now npm workspaces' behaviour.
