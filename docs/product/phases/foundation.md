# Phase: foundation

Status: draft

## Stories

### US-MP1 — Project scaffolding, test infrastructure, and GitHub Pages deployment

As a **developer**, I want a working React + Vite + TypeScript project with testing and GitHub Pages deployment configured, so that all subsequent features have a runnable, publicly accessible foundation.

**Acceptance criteria**:
- `npm run dev` starts the Vite dev server without errors
- `npm run build` produces a static production bundle in `dist/` without TypeScript errors
- `vite.config.ts` sets `base` to `/math-practice/`
- `npm test` runs Vitest and reports results
- At least one passing smoke test exists
- `.github/workflows/deploy.yml` builds and deploys to GitHub Pages on push to `main`

**User guidance:** N/A — internal change

**Design rationale:** Vite + React + TypeScript is the standard lightweight SPA stack; Vitest integrates natively with Vite's transform pipeline. GitHub Pages serves static `dist/` output with zero infrastructure cost.

### US-MP2 — Math problem generator

As a **child**, I want the app to generate math problems for the operations I've chosen, so that I practice the skills I need.

**Acceptance criteria**:
- Generator produces problems for addition, subtraction, multiplication, and division
- Each problem has exactly one correct answer (division produces integer results only)
- Number range is configurable (min, max)
- Operation set is configurable (any subset of the four operations)

**User guidance:**
- Discovery: Operation selection checkboxes on the start/config screen before a session begins
- Manual section: README.md "How to play" section
- Key steps: (1) On the start screen, check/uncheck operations to practice. (2) Press "Start" to begin generating problems with the selected operations.

**Design rationale:** Pure function generator (no UI coupling) so it can be unit-tested independently and the adaptive engine can call it with adjusted ranges.

### US-MP3 — Quiz UI

As a **child**, I want to see a math problem, type my answer, and get immediate feedback, so that I know whether I got it right.

**Acceptance criteria**:
- A problem is displayed with an input field and a submit button
- On submit, the UI shows "Correct" or "Incorrect" with the right answer
- After feedback, the next problem loads automatically or via a "Next" button
- Session displays a running score (e.g., "7 / 10 correct")
- Session score persists in `localStorage` — refreshing the page mid-session restores the current score and problem count

**User guidance:**
- Discovery: Main screen after pressing "Start" on the config screen
- Manual section: README.md "How to play" section
- Key steps: (1) Read the displayed problem. (2) Type the answer in the input field and press Enter or the Submit button. (3) See feedback, then continue to the next problem.

**Design rationale:** N/A — straightforward quiz interaction pattern.

### US-MP4 — Adaptive difficulty engine

As a **child**, I want the difficulty to adjust automatically based on how I'm doing, so that problems stay challenging but not frustrating.

**Acceptance criteria**:
- After 3 consecutive correct answers, the number range increases by a defined step
- After 3 consecutive incorrect answers, the number range decreases by a defined step
- The range never goes below a configured floor (e.g., 1-10) or above a ceiling (e.g., 1-100)
- Current difficulty level is visible to the child (e.g., "Level 2" or "Numbers up to 50")
- Current difficulty state (range, streak counters) persists in `localStorage` — refreshing mid-session resumes at the same difficulty

**User guidance:**
- Discovery: Difficulty indicator displayed on the quiz screen during a session
- Manual section: README.md "Adaptive difficulty" section
- Key steps: (1) Answer problems — the difficulty adjusts automatically. (2) Watch the difficulty indicator to see your current level.

**Design rationale:** Streak-based adjustment (3 right/wrong) is the simplest adaptive model that still provides meaningful feedback loops — avoids the complexity of Elo or Bayesian models for a v1.

## Done-when (observable)

### US-MP1 — Scaffolding
- [ ] `npm run dev` starts the Vite dev server and exits without errors (verified by `npm run dev -- --strictPort &` + curl localhost) [US-MP1]
- [ ] `npm run build` produces `dist/index.html` with zero TypeScript errors [US-MP1]
- [ ] `vite.config.ts` contains `base: '/math-practice/'` [US-MP1]
- [ ] `npm test` exits 0 with at least 1 passing test [US-MP1]
- [ ] `.github/workflows/deploy.yml` exists with steps: checkout, install, build, deploy to GitHub Pages [US-MP1]

### US-MP2 — Problem generator
- [ ] A pure function `generateProblem` is exported from `src/lib/generator.ts` (or equivalent module) [US-MP2]
- [ ] Unit tests verify all 4 operations produce valid problems (test file exists, `npm test` passes) [US-MP2]
- [ ] Division problems always produce integer results — test asserts `answer % 1 === 0` for 20+ generated division problems [US-MP2]
- [ ] Generator accepts `{ min, max }` range config — test verifies operands fall within the specified range [US-MP2]
- [ ] Generator accepts an operations subset — test verifies only selected operations appear in generated problems [US-MP2]

### US-MP3 — Quiz UI
- [ ] Quiz screen renders: a problem display, a numeric input field, and a submit button [US-MP3]
- [ ] Submitting a correct answer shows "Correct" feedback [US-MP3]
- [ ] Submitting an incorrect answer shows "Incorrect" feedback and displays the correct answer [US-MP3]
- [ ] After feedback, the next problem loads (via auto-advance or "Next" button) [US-MP3]
- [ ] Running score is displayed in the format "N / M correct" (or equivalent) [US-MP3]
- [ ] Session score is written to `localStorage` — test or manual verification that refreshing mid-session restores score and problem count [US-MP3]

### US-MP4 — Adaptive difficulty
- [ ] After 3 consecutive correct answers, the number range increases by a defined step — unit test verifies [US-MP4]
- [ ] After 3 consecutive incorrect answers, the number range decreases by a defined step — unit test verifies [US-MP4]
- [ ] Range never goes below the configured floor (e.g., 1-10) — unit test verifies [US-MP4]
- [ ] Range never goes above the configured ceiling (e.g., 1-100) — unit test verifies [US-MP4]
- [ ] Current difficulty level is visible on the quiz screen (e.g., "Level 2" or "Numbers up to 50") [US-MP4]
- [ ] Difficulty state (range, streak counters) is written to `localStorage` — refreshing mid-session resumes at the same difficulty [US-MP4]

### Structural
- [ ] AGENTS.md reflects project structure, modules, directory layout, run/test commands, and behavior rules introduced in this phase [phase]

### User documentation
- [ ] README.md contains a "How to play" section documenting: operation selection, quiz interaction, and adaptive difficulty [phase]

### Auto-added safety criteria
- [ ] Answer input validates that the entered value is numeric before comparison (non-numeric input does not crash or produce NaN comparisons) [US-MP3]
- [ ] User-provided answer text is rendered via React JSX, not `dangerouslySetInnerHTML` — grep confirms zero occurrences of `dangerouslySetInnerHTML` in the codebase [US-MP3]

## Golden principles (phase-relevant)
- (No golden principles defined in AGENTS.md yet — the foundation phase will establish them)

## AGENTS.md impact (for Phase Reconciliation Gate)
- **Directory layout**: new `src/` tree (components, lib, hooks or equivalent)
- **File ownership**: generator module, adaptive engine module, React components
- **Run/test commands**: `npm run dev`, `npm run build`, `npm test`
- **Behavior rules**: adaptive difficulty parameters (streak threshold, range step, floor, ceiling)
- **Data model**: localStorage keys and shape

## User documentation
- No user guide exists yet. README.md "How to play" section to be created during this phase.
