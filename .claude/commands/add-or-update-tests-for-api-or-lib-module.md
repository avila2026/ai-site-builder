---
name: add-or-update-tests-for-api-or-lib-module
description: Workflow command scaffold for add-or-update-tests-for-api-or-lib-module in ai-site-builder.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-tests-for-api-or-lib-module

Use this workflow when working on **add-or-update-tests-for-api-or-lib-module** in `ai-site-builder`.

## Goal

Adds or updates Jest test files for API routes or library modules, often after implementation or refactoring.

## Common Files

- `src/app/api/*/route.test.ts`
- `src/lib/**/*.test.ts`
- `jest.config.js`
- `jest.config.ts`
- `package.json`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update .test.ts files corresponding to API route or lib module
- Modify jest.config.js or jest.config.ts if new modules need to be included or thresholds adjusted
- Update package.json if new test dependencies or scripts are needed
- Run tests and adjust as needed for coverage or CI

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.