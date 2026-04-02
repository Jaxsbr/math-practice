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
    generator.ts       — Pure function: generateProblem(config) → Problem — dispatches to operation-specific generators
    roundingGenerator.ts — Rounding problem generator: number + target → rounded value, non-trivial guard
    numberChallengeGenerator.ts — Number-sense problem generator: 5 formats (place ID, construction, constrained, composition, decomposition)
    adaptive.ts        — Streak tracker + range adjuster (foundation phase, unused in map mode)
    storage.ts         — localStorage abstraction (session state, difficulty state, map progress)
    challenges.ts      — Challenge definitions: 6 lane paths, milestone nodes, difficulty configs
    scoring.ts         — Star scoring logic: accuracy + time → 1-3 stars
    mapProgress.ts     — Map progress read/write: per-node completion, star counts, unlock state, N-of-M milestone gating
  components/
    App.tsx            — Root component, routes between map and quiz screens
    MapScreen.tsx      — Adventure map with 6 operation paths, milestone convergence bands, data-driven layout
    QuizScreen.tsx     — Problem display, answer input, feedback — handles variable-length question text
    ResultsScreen.tsx  — Post-challenge results: score, time, star rating
  types.ts             — Shared types: Problem, Operation (6 types), GeneratorConfig, ChallengeNode (with requiredCount), MapProgress
  main.tsx             — Entry point
```

## Data flow

```
MapScreen → child taps unlocked node → Challenge config
Challenge config → generator.ts → Problem (×5 per challenge)
  generator.ts dispatches to operation-specific logic:
    addition/subtraction/multiplication/division → arithmetic generator
    rounding → roundingGenerator.ts
    number-challenge → numberChallengeGenerator.ts
Problem + user answer → QuizScreen → feedback + answer tracking
All answers + elapsed time → scoring.ts → star rating (1-3)
Star rating → ResultsScreen → "Back to Map"
Star rating → mapProgress.ts → unlock next node → localStorage
MapScreen ← mapProgress.ts ← localStorage (on load)
```

### Milestone convergence flow
```
Any 4 of 6 tier-2 nodes completed (N-of-M check via requiredCount)
  → Milestone 1 unlocked
  → challenge draws from completed lanes' operation types only
  → completion unlocks all tier-3 nodes
Same pattern at tier 5 → Milestone 2 (final boss)
```

## Persistence model

Three localStorage keys:
- `math-practice:session` — `{ correct: number, total: number }` (legacy, used during active quiz)
- `math-practice:difficulty` — `{ min: number, max: number, streak: number, level: number }` (legacy, unused in map mode)
- `math-practice:map-progress` — `{ nodes: Record<nodeId, { stars: number, completed: boolean }> }` — covers all 6 lanes (A/S/M/D/R/N nodes) and milestone nodes (MS1, MS2)

## Deployment

GitHub Actions workflow on push to `main`:
1. Checkout → install → `npm run build`
2. Deploy `dist/` to `gh-pages` branch
3. GitHub Pages serves from `gh-pages` branch at `/<repo-name>/`
