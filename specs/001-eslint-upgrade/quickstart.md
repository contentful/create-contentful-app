# Quickstart: ESLint 9 Upgrade

**Branch**: `001-eslint-upgrade`  
**Prerequisites**: Node.js >=18.18.0, npm, git

This guide walks through upgrading ESLint from v8.57.0 to v9.x with one commit per successful dependency upgrade.

---

## Pre-Flight Check

```bash
# Verify starting state is green
npm run build && npm run lint && npm run test
echo "If all pass, proceed. If not, fix first."
```

---

## Step 1: Replace eslint-plugin-node with eslint-plugin-n

```bash
# Remove deprecated plugin
npm uninstall eslint-plugin-node

# Install maintained fork
npm install -D eslint-plugin-n@^17

# Update config: change 'node/' to 'n/' in rule names
# In .eslintrc.js and packages/*/.eslintrc.json:
#   - "node/shebang" → "n/shebang"
#   - "plugin:node/recommended" → "plugin:n/recommended"

# Verify green state
npm run build && npm run lint && npm run test

# Commit if green
git add -A
git commit -m "chore: replace eslint-plugin-node with eslint-plugin-n

Migrated from unmaintained eslint-plugin-node to community-maintained
eslint-plugin-n. Rule names updated from node/* to n/*."
```

---

## Step 2: Remove babel-eslint

```bash
# Remove deprecated parser (not needed for TypeScript)
npm uninstall babel-eslint

# Verify green state
npm run build && npm run lint && npm run test

# Commit if green
git add -A
git commit -m "chore: remove deprecated babel-eslint

Package is deprecated and not needed - TypeScript files use
@typescript-eslint/parser instead."
```

---

## Step 3: Upgrade typescript-eslint packages

```bash
# Upgrade both packages together (they must match versions)
npm install -D @typescript-eslint/parser@^8 @typescript-eslint/eslint-plugin@^8

# Verify green state
npm run build && npm run lint && npm run test

# Commit if green
git add -A
git commit -m "chore: upgrade typescript-eslint to v8

Upgraded @typescript-eslint/parser and @typescript-eslint/eslint-plugin
to v8.x for ESLint 9 compatibility."
```

---

## Step 4: Verify eslint-config-prettier

```bash
# Check if current version supports flat config (v9.x+ should)
npm ls eslint-config-prettier

# If upgrade needed:
npm install -D eslint-config-prettier@latest

# Verify green state
npm run build && npm run lint && npm run test

# Commit if changed
git add -A
git commit -m "chore: verify eslint-config-prettier compatibility

Confirmed eslint-config-prettier works with ESLint 9 flat config."
```

---

## Step 5: Upgrade ESLint to v9

```bash
# Upgrade ESLint
npm install -D eslint@^9

# This may break linting until config is migrated!
# Proceed immediately to Step 6

# Verify green state (may fail until config migrated)
npm run build && npm run lint && npm run test
```

---

## Step 6: Migrate Configuration to Flat Config

```bash
# Use ESLint migration tool
npx @eslint/migrate-config .eslintrc.js

# This creates eslint.config.mjs - review and adjust:
# 1. Rename to eslint.config.js if using CommonJS
# 2. Update plugin imports
# 3. Handle package-level configs

# Remove old config files after migration
rm .eslintrc.js
rm packages/contentful--create-contentful-app/.eslintrc.json
rm packages/contentful--app-scripts/.eslintrc.json

# Verify green state
npm run build && npm run lint && npm run test

# Commit if green
git add -A
git commit -m "chore: migrate to ESLint 9 flat config

- Upgraded eslint to v9.x
- Converted .eslintrc.js to eslint.config.js (flat config)
- Removed package-level .eslintrc.json files
- Consolidated configuration in root flat config"
```

---

## Final Verification

```bash
# Run full verification
npm run build && npm run lint && npm run test

# Verify git history shows individual commits
git log --oneline -10
```

---

## Troubleshooting

### "ESLint couldn't find the config"

Ensure `eslint.config.js` exists at repo root and uses correct export:

```javascript
// ESM (eslint.config.mjs or type: module)
export default [ ... ];

// CommonJS (eslint.config.js without type: module)
module.exports = [ ... ];
```

### Plugin not found in flat config

Plugins must be imported and passed as objects:

```javascript
import tseslint from 'typescript-eslint';
import nodePlugin from 'eslint-plugin-n';

export default [
  ...tseslint.configs.recommended,
  {
    plugins: { n: nodePlugin }
  }
];
```

### Package-level rules not applied

Use `files` patterns in flat config:

```javascript
{
  files: ['packages/contentful--create-contentful-app/**/*.ts'],
  rules: { 'n/shebang': 'off' }
}
```

### Lint results differ from before

Run lint on a clean branch and compare:

```bash
git stash
npm run lint 2>&1 | tee lint-before.txt
git stash pop
npm run lint 2>&1 | tee lint-after.txt
diff lint-before.txt lint-after.txt
```

---

## Rollback

If issues arise after any commit, revert to the previous green state:

```bash
git revert HEAD
npm install
npm run build && npm run lint && npm run test
```

The incremental commit strategy ensures you can isolate exactly which change caused issues.
