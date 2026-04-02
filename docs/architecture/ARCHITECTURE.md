# Architecture — Math Practice

## Overview

Client-only single-page application. No backend. Static files served from GitHub Pages.

## Tech stack

- **Runtime**: Browser (ES2020+)
- **Framework**: React 18+ with TypeScript
- **Build**: Vite
- **Testing**: Vitest
- **Deployment**: GitHub Pages via GitHub Actions
- **Persistence**: Browser localStorage

## Module structure (planned for `foundation` phase)

```
src/
  lib/
    generator.ts       — Pure function: generateProblem(config) → Problem
    adaptive.ts        — Streak tracker + range adjuster, reads/writes localStorage
    storage.ts         — localStorage abstraction (session state, difficulty state)
  components/
    App.tsx            — Root component, routes between config and quiz screens
    ConfigScreen.tsx   — Operation checkboxes, start button
    QuizScreen.tsx     — Problem display, answer input, feedback, score, difficulty indicator
  types.ts             — Shared types: Problem, Config, SessionState, DifficultyState
  main.tsx             — Entry point
```

## Data flow

```
ConfigScreen → user selects operations → Config
Config + DifficultyState → generator.ts → Problem
Problem + user answer → QuizScreen → feedback + score update
Score update → adaptive.ts → DifficultyState adjustment
DifficultyState + SessionState → storage.ts → localStorage
```

## Persistence model

Two localStorage keys:
- `math-practice:session` — `{ correct: number, total: number, currentProblem: Problem | null }`
- `math-practice:difficulty` — `{ min: number, max: number, streak: number, level: number }`

## Deployment

GitHub Actions workflow on push to `main`:
1. Checkout → install → `npm run build`
2. Deploy `dist/` to `gh-pages` branch
3. GitHub Pages serves from `gh-pages` branch at `/<repo-name>/`
