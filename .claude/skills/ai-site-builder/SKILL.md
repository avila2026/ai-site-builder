```markdown
# ai-site-builder Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill covers the core development patterns, coding conventions, and workflows for the `ai-site-builder` repository. The project is a TypeScript codebase built with Next.js, following conventional commit messages, a consistent code style, and robust testing practices using Jest. This guide will help you contribute effectively by outlining naming conventions, import/export styles, and step-by-step workflows for adding tests and maintaining CI infrastructure.

## Coding Conventions

### File Naming

- Use **camelCase** for file and directory names.
  - Example: `siteBuilder.ts`, `userProfile.tsx`
- Test files follow the pattern: `*.test.ts`
  - Example: `route.test.ts`, `utils.test.ts`

### Import Style

- Use **alias imports** for internal modules.
  - Example:
    ```typescript
    import { fetchData } from '@/lib/apiClient';
    import UserCard from '@/components/userCard';
    ```

### Export Style

- **Mixed**: Both named and default exports are used.
  - Example:
    ```typescript
    // Named export
    export function buildSite(config: SiteConfig) { ... }

    // Default export
    export default SiteBuilder;
    ```

### Commit Messages

- Follow **conventional commit** format.
- Prefixes: `fix`, `feat`, `merge`, `test`
- Example:
  ```
  feat: add support for custom domains in site builder
  fix: correct typo in siteBuilder.ts
  test: add tests for api/user/route
  ```

## Workflows

### Add or Update Tests for API or Lib Module

**Trigger:** When you implement or change an API route or library module and want to ensure/test its behavior.  
**Command:** `/add-tests`

1. **Create or update test files**  
   - For API routes:  
     `src/app/api/<route>/route.test.ts`
   - For library modules:  
     `src/lib/<module>/<file>.test.ts`
   - Example:
     ```typescript
     // src/lib/utils/formatDate.test.ts
     import { formatDate } from './formatDate';

     test('formats date as YYYY-MM-DD', () => {
       expect(formatDate(new Date('2023-01-01'))).toBe('2023-01-01');
     });
     ```
2. **Modify Jest configuration if needed**  
   - Update `jest.config.js` or `jest.config.ts` to include new modules or adjust coverage thresholds.
   - Example:
     ```js
     // jest.config.js
     module.exports = {
       collectCoverageFrom: ['src/lib/**/*.ts', 'src/app/api/**/*.ts'],
     };
     ```
3. **Update dependencies/scripts**  
   - If new test dependencies are needed, update `package.json`.
   - Example:
     ```json
     "devDependencies": {
       "jest": "^29.0.0",
       "ts-jest": "^29.0.0"
     }
     ```
4. **Run tests and adjust as needed**  
   - Run: `npm test` or `yarn test`
   - Ensure all tests pass and coverage is sufficient.

---

### CI Workflow or Test Infrastructure Fix

**Trigger:** When CI fails or test infrastructure needs adjustments for compatibility or isolation.  
**Command:** `/fix-ci`

1. **Edit GitHub Actions workflow files**  
   - Update `.github/workflows/*.yml` to fix CI commands, environment variables, or steps.
   - Example:
     ```yaml
     # .github/workflows/ci.yml
     - name: Run tests
       run: npm test
     ```
2. **Update Jest configuration**  
   - Adjust `jest.config.js` or `jest.config.ts` for compatibility or to fix test thresholds.
3. **Adjust test files**  
   - Fix environment leaks, TypeScript errors, or flaky tests in `src/app/api/*/route.test.ts` or `src/lib/**/*.test.ts`.
4. **Commit and push changes**  
   - Use a conventional commit message, e.g.:
     ```
     fix: update CI workflow to use Node 18
     ```

---

## Testing Patterns

- **Framework:** Jest
- **Test file pattern:** `*.test.ts`
- **Location:**  
  - API route tests: `src/app/api/<route>/route.test.ts`
  - Library tests: `src/lib/<module>/<file>.test.ts`
- **Example test:**
  ```typescript
  // src/lib/math/add.test.ts
  import { add } from './add';

  test('adds two numbers', () => {
    expect(add(2, 3)).toBe(5);
  });
  ```
- **Run all tests:**  
  ```
  npm test
  ```

## Commands

| Command      | Purpose                                                        |
|--------------|----------------------------------------------------------------|
| /add-tests   | Add or update Jest tests for API routes or library modules     |
| /fix-ci      | Fix or update CI workflow and test infrastructure              |
```
