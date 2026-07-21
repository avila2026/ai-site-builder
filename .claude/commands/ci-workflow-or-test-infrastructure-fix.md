---
name: ci-workflow-or-test-infrastructure-fix
description: Workflow command scaffold for ci-workflow-or-test-infrastructure-fix in ai-site-builder.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /ci-workflow-or-test-infrastructure-fix

Use this workflow when working on **ci-workflow-or-test-infrastructure-fix** in `ai-site-builder`.

## Goal

Fixes or updates the CI workflow or test infrastructure to resolve issues with running tests, configuration, or environment handling.

## Common Files

- `.github/workflows/*.yml`
- `jest.config.js`
- `jest.config.ts`
- `src/app/api/*/route.test.ts`
- `src/lib/**/*.test.ts`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Edit .github/workflows/*.yml to fix CI commands or environment
- Update jest.config.js/.ts for compatibility or test thresholds
- Adjust test files to fix environment leaks or TypeScript errors

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.