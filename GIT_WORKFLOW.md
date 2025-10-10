# Git Workflow Guide - Vallea Max

## Branch Naming Convention

Use these prefixes for your branches:

- `feature/` - New features or functionality
- `fix/` - Bug fixes
- `refactor/` - Code improvements without changing functionality
- `docs/` - Documentation updates
- `chore/` - Maintenance tasks (dependencies, configs, etc.)

**Examples:**
```bash
feature/property-search
fix/sidebar-navigation
refactor/property-types
docs/api-endpoints
chore/update-dependencies
```

## Daily Workflow

Choose your workflow based on whether you're working solo or with collaborators:

### Option A: Solo Workflow (Local Branches Only) - Recommended for Now

Branches stay local, only main goes to GitHub. Simpler and cleaner.

#### 1. Starting a New Task

```bash
# Make sure you're on main and it's up to date
git checkout main
git pull origin main

# Create and switch to a new branch
git checkout -b feature/your-feature-name
```

#### 2. Working on Your Feature

```bash
# Make changes to your code...

# Check what changed
git status
git diff

# Stage your changes
git add .
# Or stage specific files
git add path/to/file.ts

# Commit with a descriptive message
git commit -m "feat: add property search functionality"
```

#### 3. Finishing Your Feature

```bash
# Make sure all changes are committed
git status

# Switch back to main
git checkout main

# Merge your feature
git merge feature/your-feature-name

# Push to remote (only main goes to GitHub)
git push origin main

# Delete the feature branch (cleanup)
git branch -d feature/your-feature-name
```

**Result:** Your feature is on GitHub in main, but the branch itself never appeared there.

---

### Option B: Collaborative Workflow (Push Branches to GitHub)

Use this when working with others or creating Pull Requests. Branches are visible on GitHub.

#### 1. Starting a New Task

```bash
# Make sure you're on main and it's up to date
git checkout main
git pull origin main

# Create and switch to a new branch
git checkout -b feature/your-feature-name
```

#### 2. Working on Your Feature

```bash
# Make changes to your code...

# Check what changed
git status
git diff

# Stage your changes
git add .
# Or stage specific files
git add path/to/file.ts

# Commit with a descriptive message
git commit -m "feat: add property search functionality"

# Push branch to GitHub (makes it visible to collaborators)
git push -u origin feature/your-feature-name
```

#### 3. Finishing Your Feature

**Option 3a: Merge locally**
```bash
# Switch back to main
git checkout main

# Merge your feature
git merge feature/your-feature-name

# Push main to remote
git push origin main

# Delete the feature branch (both local and remote)
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

**Option 3b: Create Pull Request on GitHub**
```bash
# After pushing your branch, go to GitHub
# Click "Compare & pull request"
# Review changes, add description
# Click "Create pull request"
# Click "Merge pull request"
# Then locally:
git checkout main
git pull origin main
git branch -d feature/your-feature-name
```

**Result:** Branch was visible on GitHub during development, then merged and deleted.

## Commit Message Convention

Follow this format for clear commit history:

```
<type>: <short description>

[optional longer description]
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation
- `chore:` - Maintenance
- `style:` - Formatting, missing semicolons, etc.

**Examples:**
```bash
git commit -m "feat: add property filtering by price range"
git commit -m "fix: resolve TypeScript error in property types"
git commit -m "refactor: improve property service error handling"
git commit -m "docs: update README with setup instructions"
git commit -m "chore: update Supabase types"
```

## Handling Multiple Tasks

If you need to switch between tasks:

```bash
# Save current work
git add .
git commit -m "feat: partial implementation of feature X"

# Switch to main
git checkout main

# Start new urgent task
git checkout -b fix/urgent-bug

# Work on urgent bug...
git add .
git commit -m "fix: resolve critical sidebar issue"

# Merge and finish
git checkout main
git merge fix/urgent-bug
git push origin main
git branch -d fix/urgent-bug

# Go back to your original feature
git checkout feature/feature-x
# Continue working...
```

## When Things Go Wrong

### Accidentally merged too early
If you merged to main but want to continue working on the branch:
```bash
# Undo the merge (must be on main)
git reset --hard HEAD~1

# Switch back to your feature branch
git checkout feature/your-feature-name

# Continue working...
```
**Important:** Only do this if you haven't pushed to GitHub yet!

### Undo last commit (keep changes)
```bash
git reset --soft HEAD~1
```

### Discard all uncommitted changes
```bash
git checkout .
```

### See what changed in last commit
```bash
git show
```

### View commit history
```bash
git log --oneline
```

## Best Practices for Vallea Max

1. **Always start from main**
   - `git checkout main` before creating new branches

2. **Commit frequently**
   - Small, logical commits are better than large ones
   - Each commit should represent one logical change

3. **Keep main stable**
   - Only merge working, tested code
   - Main should always be deployable

4. **Clean up branches**
   - Delete branches after merging
   - Don't let old branches pile up

5. **Write good commit messages**
   - Be descriptive but concise
   - Future you will thank present you

6. **Test before merging**
   - Run `npm run build` to check for errors
   - Test the functionality works as expected

## Quick Reference

```bash
# Start new feature
git checkout main
git checkout -b feature/name

# Save work
git add .
git commit -m "type: description"

# Finish feature
git checkout main
git merge feature/name
git push origin main
git branch -d feature/name

# Check status anytime
git status
git log --oneline
```

## Current Project Context

Your project uses:
- **TypeScript** - Type checking is important
- **Next.js** - Make sure builds succeed
- **Supabase** - Database changes need careful testing
- **i18n** - Remember to update both `en.json` and `fr.json`

Before merging to main, always:
1. ✅ Check TypeScript errors: `npm run build`
2. ✅ Test the feature works
3. ✅ Update translations if needed
4. ✅ Commit with proper message format
