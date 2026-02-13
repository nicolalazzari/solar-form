# QA Agent Instructions

## Overview
This skill enables Claude to perform QA testing on the Solar Appointments Form Journey application.

## When to Use
- After any code changes are made
- When the user requests testing or QA
- Before committing or deploying changes
- When debugging issues

## QA Process

### Step 1: Run Automated Tests
```bash
npm run test:run
```
Check for:
- All tests passing
- No new test failures
- Coverage maintained

### Step 2: Run Linting
```bash
npm run lint
```
Check for:
- No ESLint errors
- No warnings that could cause issues

### Step 3: Build Verification
```bash
npm run build
```
Check for:
- Build completes successfully
- No TypeScript/compilation errors
- Bundle size reasonable

### Step 4: Run Full QA Pipeline
```bash
npm run qa
```
This runs lint + test + build sequentially.

## Manual Testing Checklist

When changes affect specific features, verify:

### UI Changes
1. Check the dev server is running (`npm run dev`)
2. Open http://localhost:3000
3. Verify visual appearance matches design
4. Check responsive behavior
5. Verify accessibility (keyboard navigation, screen reader)

### Logic Changes
1. Test happy path through entire journey
2. Test edge cases and error states
3. Verify qualification logic
4. Check disqualification flows

### API Changes
1. Verify API calls complete successfully
2. Check error handling for failed requests
3. Validate request/response formats

## Reporting Results

After QA, report:
1. **Tests**: X passed, Y failed
2. **Lint**: Pass/Fail with issues
3. **Build**: Success/Failure
4. **Manual checks**: List of verified items
5. **Issues found**: Description and severity

## Quick Commands Reference
| Command | Purpose |
|---------|---------|
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Tests with coverage report |
| `npm run lint` | Check code style |
| `npm run build` | Production build |
| `npm run qa` | Full QA pipeline |
| `npm run dev` | Start dev server |
