## Phase goal

Replace the current config→quiz flow with an adventure map experience. Four winding operation paths (addition, subtraction, multiplication, division) each with 5 progressively harder challenge nodes. Convergence points where paths cross present mixed-operation challenges. Children earn 1–3 stars per challenge based on accuracy and speed; stars gate progression. All progress persists in localStorage.

### Design direction

Playful adventure — bright colors, cartoon-style treasure map aesthetic, fun animations at challenge completion and node unlocks.

### Stories in scope
- US-01 — Adventure map with operation paths
- US-02 — Challenge quiz with star scoring
- US-03 — Progressive difficulty and unlock gating
- US-04 — Convergence challenges with mixed operations

### Done-when (observable)

- [x] `src/components/MapScreen.tsx` exists and renders 4 visually distinct operation paths with challenge nodes [US-01]
- [x] Each path has exactly 5 challenge nodes with unique themed names defined in a data structure [US-01]
- [x] Challenge nodes render in one of three visual states: locked (greyed), unlocked (glowing), completed (with star count) [US-01]
- [x] The first challenge on each path is unlocked by default when no saved progress exists [US-01]
- [x] `App.tsx` renders `MapScreen` as the entry point — `ConfigScreen` is no longer used or imported [US-01]
- [x] Map progress (per-node completion state and star count) is saved to localStorage under a `math-practice:map-progress` key [US-01]
- [x] On app load, `MapScreen` restores saved progress from localStorage and renders correct node states [US-01]
- [x] Tapping an unlocked challenge node navigates to a quiz round with exactly 5 problems of the challenge's operation type [US-02]
- [x] A visible timer displays elapsed seconds during the challenge quiz [US-02]
- [x] After answering all 5 problems, a results screen displays: correct count, time taken, and stars earned (1–3) [US-02]
- [x] Star scoring: 3 stars requires ≥90% accuracy AND completion within time target; 2 stars requires ≥70% accuracy; 1 star for any completion [US-02]
- [x] Results screen has a "Back to Map" button that persists the star result and returns to the map [US-02]
- [x] An abandon/quit button is available during the challenge that returns to the map without saving progress [US-02]
- [x] Challenge difficulty parameters are defined in a data structure (e.g., array or map of node configs with min/max ranges) — not hardcoded per component [US-03]
- [x] Each successive node on a path uses a wider number range (node 1: max 10, node 2: max 20, node 3: max 30, node 4: max 40, node 5: max 50) [US-03]
- [x] Completing a challenge with ≥1 star unlocks the next challenge on that path [US-03]
- [x] Previously completed challenges can be tapped to replay; the higher star rating is kept [US-03]
- [x] The map visually highlights the frontier node (furthest unlocked-but-incomplete) on each path [US-03]
- [x] At least 2 convergence points exist on the map where 2 paths visually cross [US-04]
- [x] Convergence challenge nodes are visually distinct from single-operation nodes (different size or shape) [US-04]
- [x] Convergence challenges generate problems from both crossing operation types (verified: problem set contains both operation types) [US-04]
- [x] Convergence nodes are locked until the preceding challenge on BOTH adjacent paths has ≥1 star [US-04]
- [x] Convergence challenges use the higher max value of the two adjacent path challenges as their difficulty [US-04]
- [x] Completing a convergence challenge unlocks the next node on both adjacent paths [US-04]
- [ ] `AGENTS.md` reflects new modules/components introduced in this phase (MapScreen, challenge data model, star scoring) [phase]
- [ ] Vitest test suite passes — tests cover star scoring thresholds, challenge unlock logic, convergence unlock logic, and difficulty progression [phase]

### Golden principles (phase-relevant)
- Division problems always produce integer results (operand1 = operand2 * answer)
- Subtraction results are always >= 0 (operand2 <= operand1)
- No `dangerouslySetInnerHTML` — all user text rendered via JSX
- Answer input validates numeric before comparison
