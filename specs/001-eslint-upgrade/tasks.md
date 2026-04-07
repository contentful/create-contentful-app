# Tasks: ESLint 9 Major Version Upgrade

**Input**: Design documents from `/specs/001-eslint-upgrade/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, quickstart.md ✅

**Tests**: Not explicitly requested - using existing test suite as verification gate.

**Organization**: Tasks organized by user story to enable incremental delivery. Each dependency upgrade is a separate task with its own commit.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Baseline Verification)

**Purpose**: Verify starting state is green before making any changes

- [ ] T001 Verify baseline green state by running `npm run build && npm run lint && npm run test`
- [ ] T002 Capture current lint output for comparison: `npm run lint 2>&1 > lint-baseline.txt`

**Checkpoint**: Baseline verified - proceed only if all checks pass

---

## Phase 2: User Story 2 - Related Dependency Analysis (Priority: P2)

**Goal**: Verify all ESLint-related dependencies are identified with target versions and upgrade order

**Independent Test**: Review research.md dependency table and confirm all packages in package.json are accounted for

### Implementation for User Story 2

- [ ] T003 [US2] Verify dependency list in research.md matches package.json in `/package.json`
- [ ] T004 [US2] Confirm eslint-plugin-node replacement (eslint-plugin-n@17.x) is correct
- [ ] T005 [US2] Confirm typescript-eslint target versions (8.x) are ESLint 9 compatible
- [ ] T006 [US2] Confirm babel-eslint can be safely removed (not used by TypeScript)

**Checkpoint**: Dependency analysis verified - upgrade sequence confirmed

---

## Phase 3: User Story 1 - Incremental Dependency Upgrade (Priority: P1) 🎯 MVP

**Goal**: Upgrade each dependency individually with green verification and commit

**Independent Test**: Each task ends with `npm run build && npm run lint && npm run test` passing, then commit

### Step 1: Replace eslint-plugin-node with eslint-plugin-n

- [ ] T007 [US1] Uninstall eslint-plugin-node: `npm uninstall eslint-plugin-node`
- [ ] T008 [US1] Install eslint-plugin-n: `npm install -D eslint-plugin-n@^17`
- [ ] T009 [US1] Update rule references in `.eslintrc.js`: change `node/` to `n/`
- [ ] T010 [US1] Update rule references in `packages/contentful--create-contentful-app/.eslintrc.json`
- [ ] T011 [US1] Update rule references in `packages/contentful--app-scripts/.eslintrc.json`
- [ ] T012 [US1] Verify green state and commit: `chore: replace eslint-plugin-node with eslint-plugin-n`

### Step 2: Remove babel-eslint

- [ ] T013 [US1] Uninstall babel-eslint: `npm uninstall babel-eslint`
- [ ] T014 [US1] Verify green state and commit: `chore: remove deprecated babel-eslint`

### Step 3: Upgrade typescript-eslint packages

- [ ] T015 [US1] Upgrade both packages: `npm install -D @typescript-eslint/parser@^8 @typescript-eslint/eslint-plugin@^8`
- [ ] T016 [US1] Verify green state and commit: `chore: upgrade typescript-eslint to v8`

### Step 4: Verify eslint-config-prettier

- [ ] T017 [US1] Check eslint-config-prettier compatibility: `npm ls eslint-config-prettier`
- [ ] T018 [US1] Upgrade if needed: `npm install -D eslint-config-prettier@latest`
- [ ] T019 [US1] Verify green state and commit (if changed): `chore: verify eslint-config-prettier compatibility`

### Step 5: Upgrade ESLint core

- [ ] T020 [US1] Upgrade ESLint: `npm install -D eslint@^9`
- [ ] T021 [US1] Note: Lint may fail until config is migrated - proceed to Phase 4 immediately

**Checkpoint**: All dependencies upgraded - config migration required for green state

---

## Phase 4: User Story 3 - ESLint Configuration Migration (Priority: P3)

**Goal**: Migrate configuration files to flat config format required by ESLint 9

**Independent Test**: Run lint before/after migration and compare output to baseline

### Implementation for User Story 3

- [ ] T022 [US3] Run ESLint migration tool: `npx @eslint/migrate-config .eslintrc.js`
- [ ] T023 [US3] Review generated `eslint.config.mjs` for accuracy
- [ ] T024 [US3] Rename to `eslint.config.js` if using CommonJS (check package.json type field)
- [ ] T025 [US3] Update plugin imports to use flat config syntax in `eslint.config.js`
- [ ] T026 [US3] Add package-level file patterns for `packages/contentful--create-contentful-app/`
- [ ] T027 [US3] Add package-level file patterns for `packages/contentful--app-scripts/`
- [ ] T028 [US3] Remove old config: `rm .eslintrc.js`
- [ ] T029 [US3] Remove package config: `rm packages/contentful--create-contentful-app/.eslintrc.json`
- [ ] T030 [US3] Remove package config: `rm packages/contentful--app-scripts/.eslintrc.json`
- [ ] T031 [US3] Verify green state: `npm run build && npm run lint && npm run test`
- [ ] T032 [US3] Compare lint output to baseline: `npm run lint 2>&1 > lint-after.txt && diff lint-baseline.txt lint-after.txt`
- [ ] T033 [US3] Commit config migration: `chore: migrate to ESLint 9 flat config`

**Checkpoint**: Configuration migration complete - all packages linting successfully

---

## Phase 5: Polish & Validation

**Purpose**: Final verification and cleanup

- [ ] T034 Run full verification: `npm run build && npm run lint && npm run test`
- [ ] T035 Verify git history shows one commit per upgrade: `git log --oneline`
- [ ] T036 Clean up baseline files: `rm lint-baseline.txt lint-after.txt`
- [ ] T037 [P] Update any documentation referencing old ESLint config format

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - must start here
- **Phase 2 (US2)**: Depends on Phase 1 - verifies plan before execution
- **Phase 3 (US1)**: Depends on Phase 2 - executes upgrades in order
- **Phase 4 (US3)**: Depends on Phase 3 T020-T021 - config migration after ESLint 9 installed
- **Phase 5 (Polish)**: Depends on Phase 4 - final validation

### User Story Dependencies

- **US2 (Dependency Analysis)**: Prerequisite for US1 - must complete first
- **US1 (Incremental Upgrade)**: Core workflow - each step must be green before commit
- **US3 (Config Migration)**: Depends on US1 completion - cannot migrate until ESLint 9 installed

### Within User Story 1 (Critical Path)

Tasks within US1 are SEQUENTIAL - each step must complete with green state before proceeding:

```text
T007-T012 (eslint-plugin-n) → T013-T014 (babel-eslint) → T015-T016 (typescript-eslint) → T017-T019 (prettier) → T020-T021 (ESLint 9)
```

### Parallel Opportunities

- T003-T006 (US2 verification tasks) can run in parallel
- T009-T011 (rule reference updates) can run in parallel
- T026-T027 (package file patterns) can run in parallel
- T028-T030 (config file removal) can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (baseline)
2. Complete Phase 2: US2 (verify plan)
3. Complete Phase 3: US1 Steps 1-5 (incremental upgrades)
4. **STOP if needed**: Each commit is a safe rollback point
5. Continue to Phase 4: US3 (config migration)

### Incremental Delivery

Each commit in US1 represents a deployable state:
1. After T012: eslint-plugin-n working ✓
2. After T014: babel-eslint removed ✓
3. After T016: typescript-eslint v8 working ✓
4. After T019: eslint-config-prettier verified ✓
5. After T021: ESLint 9 installed (config migration pending)
6. After T033: Full migration complete ✓

### Rollback Strategy

If any step fails:
1. `git revert HEAD` to undo the last commit
2. `npm install` to restore previous state
3. Investigate failure before retrying

---

## Notes

- **Green = Build + Lint + Test**: All three must pass before committing
- **One commit per upgrade**: Enables precise bisection if issues arise later
- **Sequential execution**: US1 tasks cannot be parallelized due to npm state dependencies
- **Baseline comparison**: T032 ensures lint behavior is preserved after migration
- Refer to `quickstart.md` for detailed commands and troubleshooting
