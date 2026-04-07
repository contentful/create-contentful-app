<!--
Sync Impact Report
==================
Version change: N/A → 1.0.0 (initial creation)

Added sections:
- Core Principles (5 principles)
- Development Workflow
- Release Process
- Governance

Templates status:
- plan-template.md: ✅ Compatible (Constitution Check section exists)
- spec-template.md: ✅ Compatible (requirements align with principles)
- tasks-template.md: ✅ Compatible (test-first workflow supported)

Follow-up TODOs: None
==================
-->

# Create Contentful App Constitution

## Core Principles

### I. Developer Experience First

The primary measure of success is developer productivity and satisfaction when building Contentful apps.

- CLI commands MUST provide clear, actionable error messages with suggested fixes
- Interactive prompts MUST have sensible defaults that work for common use cases
- All commands MUST support both interactive and non-interactive (CI/CD) modes
- Documentation MUST include working examples for every public API
- Breaking changes MUST be communicated clearly with migration guides

**Rationale**: Developers choose tooling based on how quickly they can be productive. Poor DX leads to abandonment.

### II. Package Independence

Each package in the monorepo MUST be independently useful, testable, and publishable.

- Packages MUST NOT have circular dependencies
- Each package MUST have its own README, tests, and changelog
- Package APIs MUST be designed for standalone consumption
- Shared utilities MUST be extracted to dedicated packages rather than duplicated
- Package boundaries MUST align with distinct use cases (CLI, scripts, React toolkit)

**Rationale**: Independent packages enable selective adoption and reduce coupling that complicates maintenance.

### III. Semantic Versioning (NON-NEGOTIABLE)

Version numbers communicate compatibility guarantees to consumers. Breaking this trust damages the ecosystem.

- MAJOR: Breaking changes to public APIs or CLI interfaces
- MINOR: New features that are backward compatible
- PATCH: Bug fixes and documentation improvements
- Canary releases (`-alpha.N`) MAY contain breaking changes without major bumps
- The `latest` tag MUST always point to stable, production-ready code

**Rationale**: Contentful app developers depend on predictable upgrade paths. Surprise breaking changes cause production incidents.

### IV. Test Coverage

All packages MUST maintain test coverage that prevents regressions in critical paths.

- New features MUST include tests demonstrating the feature works
- Bug fixes MUST include tests that would have caught the bug
- CLI commands MUST have integration tests verifying end-to-end behavior
- Tests MUST run in CI before any merge to mainline branches
- Flaky tests MUST be fixed or quarantined immediately

**Rationale**: A CLI tool that breaks silently erodes trust faster than one that never worked.

### V. Contentful API Alignment

This toolkit exists to simplify Contentful app development, not to abstract it away.

- CLI behavior MUST align with Contentful's App Framework documentation
- When Contentful APIs change, this toolkit MUST update promptly
- Error messages MUST reference relevant Contentful documentation when appropriate
- Features MUST NOT introduce patterns that conflict with Contentful best practices
- Template apps MUST demonstrate idiomatic Contentful app patterns

**Rationale**: Developers using this toolkit will also read Contentful docs. Inconsistency creates confusion.

## Development Workflow

All contributors MUST follow these practices:

- **Branching**: Feature branches off `main`; `canary` branch for pre-release testing
- **Commits**: Conventional commits format (`feat:`, `fix:`, `docs:`, `chore:`, `BREAKING CHANGE:`)
- **Pull Requests**: All changes require PR review before merge
- **CI Checks**: Lint, type-check, and test MUST pass before merge
- **Local Testing**: Use `npm link` workflow documented in README for local verification

## Release Process

Publishing follows an automated pipeline with manual oversight:

- **Stable releases**: Merge to `main` triggers automatic publish to `latest` tag
- **Canary releases**: Merge to `canary` triggers automatic publish to `canary` tag
- **Manual releases**: Available via `npm run publish` for exceptional circumstances
- **Version bumps**: Managed by `nx release` based on conventional commits
- **Changelogs**: Auto-generated from commit messages; manual editing permitted for clarity

## Governance

This constitution represents the foundational agreements for the Create Contentful App project.

- **Supremacy**: This constitution supersedes conflicting practices in other documentation
- **Amendments**: Changes require documented justification and team review
- **Version tracking**: Constitution versions follow semantic versioning
- **Compliance**: All PRs SHOULD be checked against relevant principles
- **Exceptions**: Principle violations MUST be documented with rationale in PR description
- **Runtime guidance**: See `README.md` and package-specific documentation for implementation details

**Version**: 1.0.0 | **Ratified**: 2026-02-12 | **Last Amended**: 2026-02-12
