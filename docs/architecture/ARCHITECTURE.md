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

## Module structure

```
src/
  lib/
    generator.ts       — Pure function: generateProblem(config) → Problem
    adaptive.ts        — Streak tracker + range adjuster (foundation phase, unused in map mode)
    storage.ts         — localStorage abstraction (session state, difficulty state, map progress)
    challenges.ts      — (planned for adventure-map phase) Challenge definitions data structure: paths, nodes, difficulty configs, convergence points
    scoring.ts         — (planned for adventure-map phase) Star scoring logic: accuracy + time → 1-3 stars
    mapProgress.ts     — (planned for adventure-map phase) Map progress read/write: per-node completion, star counts, unlock state
  components/
    App.tsx            — Root component, routes between map and quiz screens
    MapScreen.tsx      — (planned for adventure-map phase) Adventure map with 4 operation paths, challenge nodes, convergence points
    QuizScreen.tsx     — Problem display, answer input, feedback (adapted for challenge context in adventure-map phase)
    ResultsScreen.tsx  — (planned for adventure-map phase) Post-challenge results: score, time, star rating
  types.ts             — Shared types: Problem, Config, SessionState, DifficultyState, Challenge, MapProgress
  main.tsx             — Entry point
```

## Data flow

```
MapScreen → child taps unlocked node → Challenge config
Challenge config → generator.ts → Problem (×5 per challenge)
Problem + user answer → QuizScreen → feedback + answer tracking
All answers + elapsed time → scoring.ts → star rating (1-3)
Star rating → ResultsScreen → "Back to Map"
Star rating → mapProgress.ts → unlock next node → localStorage
MapScreen ← mapProgress.ts ← localStorage (on load)
```

### Convergence flow (planned for adventure-map phase)
```
Path A node N completed + Path B node M completed
  → convergence node unlocked
  → challenge draws from both operation types
  → completion advances both paths
```

## Persistence model

Three localStorage keys:
- `math-practice:session` — `{ correct: number, total: number }` (legacy, used during active quiz)
- `math-practice:difficulty` — `{ min: number, max: number, streak: number, level: number }` (legacy, unused in map mode)
- `math-practice:map-progress` — (planned for adventure-map phase) `{ nodes: Record<nodeId, { stars: number, completed: boolean }> }`

## Deployment

GitHub Actions workflow on push to `main`:
1. Checkout → install → `npm run build`
2. Deploy `dist/` to `gh-pages` branch
3. GitHub Pages serves from `gh-pages` branch at `/<repo-name>/`
