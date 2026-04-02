## Phase goal

Deliver the foundation of the math-practice app: a React + Vite + TypeScript project deployed to GitHub Pages, with a configurable math problem generator, quiz UI with localStorage persistence, and an adaptive difficulty engine that auto-adjusts number ranges based on answer streaks.

### Stories in scope
- US-MP1 — Project scaffolding, test infrastructure, and GitHub Pages deployment
- US-MP2 — Math problem generator
- US-MP3 — Quiz UI
- US-MP4 — Adaptive difficulty engine

### Done-when (observable)

#### US-MP1 — Scaffolding
- [x] `npm run dev` starts the Vite dev server and exits without errors (verified by `npm run dev -- --strictPort &` + curl localhost) [US-MP1]
- [x] `npm run build` produces `dist/index.html` with zero TypeScript errors [US-MP1]
- [x] `vite.config.ts` contains `base: '/math-practice/'` [US-MP1]
- [x] `npm test` exits 0 with at least 1 passing test [US-MP1]
- [x] `.github/workflows/deploy.yml` exists with steps: checkout, install, build, deploy to GitHub Pages [US-MP1]

#### US-MP2 — Problem generator
- [x] A pure function `generateProblem` is exported from `src/lib/generator.ts` (or equivalent module) [US-MP2]
- [x] Unit tests verify all 4 operations produce valid problems (test file exists, `npm test` passes) [US-MP2]
- [x] Division problems always produce integer results — test asserts `answer % 1 === 0` for 20+ generated division problems [US-MP2]
- [x] Generator accepts `{ min, max }` range config — test verifies operands fall within the specified range [US-MP2]
- [x] Generator accepts an operations subset — test verifies only selected operations appear in generated problems [US-MP2]

#### US-MP3 — Quiz UI
- [x] Quiz screen renders: a problem display, a numeric input field, and a submit button [US-MP3]
- [x] Submitting a correct answer shows "Correct" feedback [US-MP3]
- [x] Submitting an incorrect answer shows "Incorrect" feedback and displays the correct answer [US-MP3]
- [x] After feedback, the next problem loads (via auto-advance or "Next" button) [US-MP3]
- [x] Running score is displayed in the format "N / M correct" (or equivalent) [US-MP3]
- [x] Session score is written to `localStorage` — test or manual verification that refreshing mid-session restores score and problem count [US-MP3]

#### US-MP4 — Adaptive difficulty
- [x] After 3 consecutive correct answers, the number range increases by a defined step — unit test verifies [US-MP4]
- [x] After 3 consecutive incorrect answers, the number range decreases by a defined step — unit test verifies [US-MP4]
- [x] Range never goes below the configured floor (e.g., 1-10) — unit test verifies [US-MP4]
- [x] Range never goes above the configured ceiling (e.g., 1-100) — unit test verifies [US-MP4]
- [x] Current difficulty level is visible on the quiz screen (e.g., "Level 2" or "Numbers up to 50") [US-MP4]
- [x] Difficulty state (range, streak counters) is written to `localStorage` — refreshing mid-session resumes at the same difficulty [US-MP4]

#### Structural
- [ ] AGENTS.md reflects project structure, modules, directory layout, run/test commands, and behavior rules introduced in this phase [phase]

#### User documentation
- [ ] README.md contains a "How to play" section documenting: operation selection, quiz interaction, and adaptive difficulty [phase]

#### Auto-added safety criteria
- [x] Answer input validates that the entered value is numeric before comparison (non-numeric input does not crash or produce NaN comparisons) [US-MP3]
- [x] User-provided answer text is rendered via React JSX, not `dangerouslySetInnerHTML` — grep confirms zero occurrences of `dangerouslySetInnerHTML` in the codebase [US-MP3]

### Golden principles (phase-relevant)
- (No golden principles defined in AGENTS.md yet — the foundation phase will establish them)
