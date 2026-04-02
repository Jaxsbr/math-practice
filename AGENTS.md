# Math Practice

## Purpose
An interactive math tutoring tool for children with gamified adventure map progression. Four operation paths with challenges, star scoring, and convergence points. Deployed as a static site on GitHub Pages.

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
    MapScreen.tsx       — Adventure map with 4 operation paths, challenge nodes, convergence points
    MapScreen.css       — Map styling: parchment background, node states, path lines, animations
    QuizScreen.tsx      — Challenge-mode quiz: fixed problem count, timer, abandon button
    ResultsScreen.tsx   — Post-challenge results: star display, accuracy, time stats
    ConfigScreen.tsx    — (legacy, unused) Operation selection + start button
  lib/
    challenges.ts       — Challenge definitions: 22 nodes (4 paths × 5 + 2 convergence), difficulty configs
    scoring.ts          — Star scoring: accuracy + time → 1-3 stars
    mapProgress.ts      — Map progress: localStorage persistence, unlock gating, frontier detection
    generator.ts        — Pure function: generateProblem(config) → Problem
    adaptive.ts         — Streak-based difficulty adjuster (legacy, unused in map mode)
    storage.ts          — localStorage abstraction (session + difficulty state)
  types.ts              — Shared types: Problem, Operation, ChallengeNode, MapProgress, ChallengeResult
  App.tsx               — Root component — map → quiz → results flow
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
- Answer input validates numeric before comparison (non-numeric silently ignored)
- No `dangerouslySetInnerHTML` — all user text rendered via JSX

### Adventure map rules
- 4 operation paths: addition, subtraction, multiplication, division — each with 5 challenge nodes
- 2 convergence nodes where paths cross: C1 (addition + subtraction), C2 (multiplication + division)
- Progressive difficulty per path: max ranges 10 → 20 → 30 → 40 → 50
- Star scoring: 3 stars = ≥90% accuracy + within time target, 2 stars = ≥70%, 1 star = completed
- Unlock gating: ≥1 star on a node unlocks the next; convergence requires both adjacent paths
- Completing a convergence node unlocks the next node on BOTH paths
- Replay: revisiting keeps the higher star rating
- Map progress persists in localStorage under `math-practice:map-progress`
- Each challenge presents exactly 5 problems
- Time targets scale with difficulty: `max(30, 20 + node.max)` seconds

## Quality checks
- no-silent-pass
- no-bare-except
- error-path-coverage
- agents-consistency
