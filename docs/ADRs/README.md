# Architecture Decision Records

Each ADR records a single architectural decision, the context that forced it, and the
consequences the repo now lives with. They are historical records — an accepted ADR is not
edited to reflect later changes. When a decision is reversed, add a new ADR and mark the old
one `Superseded by`.

| Date | Status | Title |
|---|---|---|
| [2026-01-20](./2026-01-20-adopt-nx-release-replace-lerna.md) | Accepted | Adopt Nx Release for versioning and publishing, replacing Lerna |

## Conventions

- **Filename** — `YYYY-MM-DD-short-title.md`. The date is the date of the decision, taken
  from the commit, PR, or discussion that made it — not the date the ADR was written. The
  filename is the canonical identifier; there is no separate sequential numbering.
- **Sections** — `Status`, `Context`, `Decision`, `Consequences`.
- **Status** — one of `Accepted`, `Deprecated`, or
  `Superseded by [YYYY-MM-DD-title](./YYYY-MM-DD-title.md)`.
- **One decision per record.** Corrections and follow-ups that flow from a decision belong in
  that decision's `Consequences`, not in new ADRs.
- **Cite evidence.** Reference commits and pull requests in this repository so a reader can
  verify the reasoning. Verify commit hashes against `git log` before writing them — this
  repository is public, so cite only publicly visible sources.
