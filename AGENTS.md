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
    ProfileScreen.tsx   — Profile selection and creation: 4 animal avatars, name input, profile cards, reset with confirmation
    ProfileScreen.css   — Profile styling: parchment background, avatar picker, creation panel, confirmation dialog
    MapScreen.tsx       — Adventure map with 6 operation paths, milestone bands, data-driven layout
    MapScreen.css       — Map styling: parchment background, node states, path lines, milestone bands, animations
    QuizScreen.tsx      — Challenge-mode quiz: fixed problem count, timer, abandon button, variable-length question display
    ResultsScreen.tsx   — Post-challenge results: star display, accuracy, time stats
    ConfigScreen.tsx    — (legacy, unused) Operation selection + start button
  lib/
    audio.ts            — Sound engine: Web Audio API synthesis, mute control, ambient soundscape management, async cleanup
    profiles.ts         — Profile CRUD: create/load/save/delete profiles, name validation, localStorage persistence
    challenges.ts       — Challenge definitions: 32 nodes (6 paths × 5 + 2 milestones), difficulty configs, MILESTONE_REQUIRED
    scoring.ts          — Star scoring: accuracy + time → 1-3 stars
    mapProgress.ts      — Map progress: per-profile localStorage persistence, unlock gating, N-of-M milestone gating, milestone operations filter, legacy migration
    generator.ts        — Problem dispatch: routes to arithmetic, rounding, or number-challenge generators
    roundingGenerator.ts — Rounding problem generator: number + target → rounded value, non-trivial guard
    numberChallengeGenerator.ts — Number-sense generator: 5 question formats (place-id, construct, constrained, composition, decomposition)
    adaptive.ts         — Streak-based difficulty adjuster (legacy, unused in map mode)
    storage.ts          — localStorage abstraction (session + difficulty state)
  types.ts              — Shared types: Problem, Operation (6 types), GeneratorConfig, ChallengeNode (with requiredCount), MapProgress
  App.tsx               — Root component — profile → map → quiz → results flow
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

### Profile system rules
- Maximum 4 profiles (matches 4 animal avatars — owl, fox, bunny, bear)
- Profile names: 1–12 characters after trim, whitespace-only rejected
- Last-used profile highlighted with "Last played" badge
- Active profile avatar+name shown on map screen (clickable → returns to profile selection) and quiz screen (display only)
- Profiles can be edited (name, avatar), reset (clears progress, keeps profile), or deleted (removes profile + progress)
- Map progress scoped per profile: `math-practice:map-progress:<profileId>`
- Profile data persists in `math-practice:profiles` localStorage key
- Legacy migration: if `math-practice:map-progress` (unscoped) exists and no profiles exist, auto-create "Player 1" with first avatar and migrate progress
- App flow: ProfileScreen → MapScreen → QuizScreen → ResultsScreen (avatar badge on map allows returning to ProfileScreen)

### Audio and animation rules
- All sounds synthesized via Web Audio API oscillators and gain envelopes — no external audio files (`.mp3`, `.ogg`, `.wav`)
- All animations use CSS keyframes — no external animation libraries
- `AudioContext` is created on the first user gesture (click/tap) via `initAudioContext()` in App.tsx — satisfies browser autoplay policy
- Mute state persists in localStorage under `math-practice:audio-muted` key (global, not per-profile — device preference)
- Mute toggle (speaker icon) visible in header area of MapScreen and QuizScreen
- Sound types: `correct` (bright chime), `incorrect` (gentle low tone), `star1`/`star2`/`star3` (ascending chimes), `celebration` (3-star bonus), `nodeComplete` (burst)
- Ambient soundscape: filtered noise via `AudioBufferSourceNode` + `BiquadFilterNode`, two scene levels (map: 0.08 gain, quiz: 0.03 gain), cross-fade on screen transition (~500ms gain ramp)
- Ambient managed centrally in App.tsx based on current screen — starts on map/quiz, stops on profile
- Animation CSS classes: `.node-completed` (idle glow), `.node-unlocked` (gentle pulse), `.node-just-completed` (one-time burst), `.feedback-correct` (green pulse), `.feedback-incorrect` (horizontal shake), `.star-reveal` (cascading pop)
- Data attribute: `[data-feedback="correct"|"incorrect"]` on feedback elements for test targeting
- Async cleanup: `OscillatorNode.stop()` and `disconnect()` on cleanup; `setTimeout` callbacks cleared; `animationend` listeners cleaned up on unmount; ambient nodes stopped and disconnected when leaving game screens

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
