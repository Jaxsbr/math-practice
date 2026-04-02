# Math Practice

## Purpose
An interactive math tutoring tool for children with gamified adventure map progression. Six operation paths with challenges, star scoring, milestone convergence, and responsive layout. Deployed as a static site on GitHub Pages.

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
    MapScreen.tsx       — Adventure map with 6 operation paths, milestone bands, data-driven layout
    MapScreen.css       — Map styling: parchment background, node states, path lines, milestone bands, animations
    QuizScreen.tsx      — Challenge-mode quiz: fixed problem count, timer, abandon button, variable-length question display
    ResultsScreen.tsx   — Post-challenge results: star display, accuracy, time stats
    ConfigScreen.tsx    — (legacy, unused) Operation selection + start button
  lib/
    challenges.ts       — Challenge definitions: 32 nodes (6 paths × 5 + 2 milestones), difficulty configs, MILESTONE_REQUIRED
    scoring.ts          — Star scoring: accuracy + time → 1-3 stars
    mapProgress.ts      — Map progress: localStorage persistence, unlock gating, N-of-M milestone gating, milestone operations filter
    generator.ts        — Problem dispatch: routes to arithmetic, rounding, or number-challenge generators
    roundingGenerator.ts — Rounding problem generator: number + target → rounded value, non-trivial guard
    numberChallengeGenerator.ts — Number-sense generator: 5 question formats (place-id, construct, constrained, composition, decomposition)
    adaptive.ts         — Streak-based difficulty adjuster (legacy, unused in map mode)
    storage.ts          — localStorage abstraction (session + difficulty state)
  types.ts              — Shared types: Problem, Operation (6 types), GeneratorConfig, ChallengeNode (with requiredCount), MapProgress
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
- Rounding problems never produce trivial answers (numbers already divisible by the rounding target)
- Number-challenge problems always have exactly one correct numeric answer
- Answer input validates numeric before comparison (non-numeric silently ignored)
- No `dangerouslySetInnerHTML` — all user text rendered via JSX

### Adventure map rules
- 6 operation paths: addition, subtraction, multiplication, division, rounding, number challenge — each with 5 challenge nodes
- 2 milestone nodes (MS1, MS2) replace pair-convergence — N-of-M gating via `requiredCount`
- `MILESTONE_REQUIRED = 4`: milestones unlock when 4 of 6 prerequisite tier nodes are completed
- Tier-3 nodes require both own tier-2 node AND MS1 in prerequisites
- Milestone challenges draw problems only from operation types the player has completed at that tier
- Progressive difficulty: arithmetic paths use max ranges 10 → 20 → 30 → 40 → 50; rounding uses digit-count progression; number-challenge uses question-type progression
- Star scoring: 3 stars = ≥90% accuracy + within time target, 2 stars = ≥70%, 1 star = completed
- Unlock gating: ≥1 star on a node unlocks the next; milestones require N-of-M
- Replay: revisiting keeps the higher star rating
- Map progress persists in localStorage under `math-practice:map-progress`
- Each challenge presents exactly 5 problems
- Map layout derives column count from CHALLENGE_NODES data (data-driven, not hardcoded)
- Responsive: horizontal scroll at narrow viewports (min 375px)

### Node inventory (32 nodes)
- Addition: A1-A5 (Pebble Path → Summit Plus)
- Subtraction: S1-S5 (Leaf Fall → Minus Mountain)
- Multiplication: M1-M5 (Mushroom Ring → Times Tower)
- Division: D1-D5 (Berry Split → Divide Peak)
- Rounding: R1-R5 (Rounding Rock → Summit Round) — R1-R4 have fixed roundingTarget; R5 mixed
- Number Challenge: N1-N5 (Digit Den → Master Mountain) — N1-N3 have specific questionTypes; N4-N5 use all types
- Milestones: MS1 (Adventurer's Rest, tier 2→3), MS2 (Dragon's Summit, tier 5→complete)

## Quality checks
- no-silent-pass
- no-bare-except
- error-path-coverage
- agents-consistency
