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
    profiles.ts        — Profile CRUD: create/load/delete profiles, per-profile progress scoping, legacy migration
    audio.ts           — Sound engine: Web Audio API synthesis, mute control, ambient management (planned for `reward-magic` phase)
  components/
    App.tsx            — Root component, routes between profile, map, quiz, and results screens
    ProfileScreen.tsx  — Profile selection and creation: 4 animal avatars, name input, profile cards
    ProfileScreen.css  — Profile styling: parchment background, avatar picker, creation panel, confirmation dialog
    MapScreen.tsx      — Adventure map with 6 operation paths, milestone convergence bands, data-driven layout
    QuizScreen.tsx     — Problem display, answer input, feedback — handles variable-length question text
    ResultsScreen.tsx  — Post-challenge results: score, time, star rating
  types.ts             — Shared types: Problem, Operation (6 types), GeneratorConfig, ChallengeNode (with requiredCount), MapProgress
  main.tsx             — Entry point
```

## Data flow

```
ProfileScreen → child selects profile → active profileId set
  → first visit: "New Adventurer" → pick avatar → enter name → profile saved
  → returning: tap profile card → profile loaded
  → last-used profile highlighted

ProfileScreen → profile selected → MapScreen (with per-profile progress)
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

### Audio data flow (planned for `reward-magic` phase)
```
User gesture (first click/tap) → initAudioContext() → AudioContext created
  → playSound(type) → create OscillatorNode + GainNode → envelope → auto-disconnect
  → ambient: filtered noise source → GainNode → cross-fade on screen transition
  → mute toggle → gain master node value 0/1 → persisted to localStorage
```

## Persistence model

localStorage keys:
- `math-practice:session` — `{ correct: number, total: number }` (legacy, used during active quiz)
- `math-practice:difficulty` — `{ min: number, max: number, streak: number, level: number }` (legacy, unused in map mode)
- `math-practice:profiles` — `Profile[]` where Profile = `{ id, name, avatarId, createdAt, lastPlayedAt }` — max 4 profiles
- `math-practice:map-progress:<profileId>` — `{ nodes: Record<nodeId, { stars: number, completed: boolean }> }` — per-profile scoped, covers all 6 lanes and milestones
- `math-practice:map-progress` — legacy unscoped key, auto-migrated to first profile on initial load
- `math-practice:audio-muted` — `boolean` — global mute state for Web Audio API sounds (planned for `reward-magic` phase)

## Deployment

GitHub Actions workflow on push to `main`:
1. Checkout → install → `npm run build`
2. Deploy `dist/` to `gh-pages` branch
3. GitHub Pages serves from `gh-pages` branch at `/<repo-name>/`
