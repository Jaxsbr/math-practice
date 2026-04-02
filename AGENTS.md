# Math Practice

## Purpose
An interactive math tutoring tool for children with adaptive difficulty. Deployed as a static site on GitHub Pages.

## Tech stack
- React 18+ with TypeScript
- Vite (build + dev server)
- Vitest + Testing Library (tests)
- GitHub Pages (deployment)
- Browser localStorage (persistence)

## Directory layout
```
src/
  components/
    ConfigScreen.tsx    — Operation selection + start button
    QuizScreen.tsx      — Problem display, answer input, feedback, score, difficulty
  lib/
    generator.ts        — Pure function: generateProblem(config) → Problem
    adaptive.ts         — Streak-based difficulty adjuster
    storage.ts          — localStorage abstraction (session + difficulty state)
  types.ts              — Shared types: Problem, Operation, Config, SessionState, DifficultyState
  App.tsx               — Root component — routes between config and quiz screens
  main.tsx              — Entry point
docs/
  product/              — PRD and per-phase specs
  architecture/         — Architecture doc
  plan/                 — Build loop state, logs, archive
```

## Run commands
- `npm run dev` — start Vite dev server
- `npm run build` — TypeScript compile + production build to `dist/`
- `npm test` — run Vitest
- `npm run lint` — run ESLint

## Behavior rules
- Division problems always produce integer results (operand1 = operand2 * answer)
- Subtraction results are always >= 0 (operand2 <= operand1)
- Adaptive difficulty: 3 consecutive correct → range increases by 10; 3 incorrect → decreases by 10
- Floor: max=10, Ceiling: max=100
- Session and difficulty state persist in localStorage under `math-practice:session` and `math-practice:difficulty`
- Answer input validates numeric before comparison (non-numeric silently ignored)
- No `dangerouslySetInnerHTML` — all user text rendered via JSX

## Quality checks
- no-silent-pass
- no-bare-except
- error-path-coverage
- agents-consistency
