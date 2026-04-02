# Phase: adventure-map

Status: shipped

## Design direction

Playful adventure — bright colors, cartoon-style treasure map aesthetic, fun animations at challenge completion and node unlocks.

## Stories

### US-01 — Adventure map with operation paths [Shipped]

As a child, I want to see an adventure map with four paths I can explore, so that I know where I am in my math journey and what challenges lie ahead.

**Acceptance criteria:**
- Map displays 4 visually distinct winding paths, one per operation (addition, subtraction, multiplication, division)
- Each path has 5 challenge nodes with unique themed names
- Nodes show their state: locked (greyed out), unlocked (glowing/inviting), completed (displaying earned stars)
- First challenge on each path is unlocked by default
- Map is the app entry point — replaces ConfigScreen entirely
- Path layout includes convergence points where 2 paths cross
- Challenge progress (completion state, stars earned) persists in localStorage
- On app load, map restores previously saved progress

**User guidance:**
- Discovery: The map IS the home screen — shown immediately on app load
- Manual section: new page: "Adventure Map"
- Key steps: Open the app → see the adventure map with four paths → tap any glowing (unlocked) challenge node to begin

**Design rationale:** A spatial map (vs. a list or menu) creates spatial memory and a sense of journey — children remember "I'm at the volcano on the addition path" rather than "I'm on level 3."

### US-02 — Challenge quiz with star scoring [Shipped]

As a child, I want to play a challenge by solving problems and earn stars based on how well I do, so that I feel rewarded for accuracy and speed.

**Acceptance criteria:**
- Tapping an unlocked node starts a quiz round with a fixed number of problems (5 per challenge)
- Problems are generated for the challenge's operation type and difficulty level
- A visible timer counts elapsed time during the challenge
- After all problems are answered, a results screen shows: correct count, time taken, stars earned (1–3)
- Star thresholds: 3 stars = ≥90% accuracy AND within time target; 2 stars = ≥70% accuracy; 1 star = completed
- Results screen has a "Back to Map" button that saves stars and returns to the map
- Child can abandon a challenge mid-way (back/quit button) without saving progress

**User guidance:**
- Discovery: Tap any glowing challenge node on the map
- Manual section: "Adventure Map > Playing a Challenge"
- Key steps: Tap a challenge → solve 5 problems one by one → see results with star rating → return to map

**Design rationale:** Fixed problem count (vs. endless) gives children a clear finish line per sitting. Star scoring on accuracy + speed rewards mastery while still granting 1 star for completion, preventing discouragement.

### US-03 — Progressive difficulty and unlock gating [Shipped]

As a child, I want each challenge to be harder than the last and unlock when I complete the previous one, so that I'm always progressing.

**Acceptance criteria:**
- Each successive challenge node on a path uses a wider number range (e.g., node 1: max 10, node 2: max 20, … node 5: max 50)
- Completing a challenge with ≥1 star unlocks the next challenge on that path
- Previously completed challenges can be revisited to improve star rating
- Map visually indicates the "frontier" — the furthest unlocked-but-incomplete challenge on each path
- Challenge difficulty parameters are defined in a data structure (not hardcoded per component)

**User guidance:**
- Discovery: After completing a challenge, the next node on the path animates to "unlocked"
- Manual section: "Adventure Map > Progression"
- Key steps: Complete a challenge with at least 1 star → next node on the path lights up → tap to continue the journey

**Design rationale:** Linear unlock with ≥1 star keeps progression simple and avoids frustrating gates. Revisit-to-improve gives optional mastery depth without blocking forward progress.

### US-04 — Convergence challenges with mixed operations [Shipped]

As a child, I want to encounter special challenges where paths cross that test me on multiple operation types, so that the map feels connected and I practice combining my skills.

**Acceptance criteria:**
- Map has convergence points where 2 paths visually meet
- Convergence challenges contain problems from both crossing operation types (e.g., addition + subtraction)
- Convergence nodes unlock when the preceding challenge on BOTH adjacent paths is completed (≥1 star each)
- Convergence challenges use the higher difficulty of the two adjacent path challenges
- Completing a convergence challenge counts as progression on both paths
- At least 2 convergence points exist on the map
- Convergence nodes are visually distinct from single-operation nodes (e.g., larger, different shape)

**User guidance:**
- Discovery: Special larger node where two paths cross — visually distinct from regular nodes
- Manual section: "Adventure Map > Convergence Challenges"
- Key steps: Complete challenges on two paths up to a crossing point → convergence node unlocks → solve mixed-operation problems → both paths advance

**Design rationale:** Convergence is the key mechanic that makes this an interconnected map rather than 4 separate level lists. It rewards breadth and creates moments where skills combine.

## Done-when (observable)

- [ ] `src/components/MapScreen.tsx` exists and renders 4 visually distinct operation paths with challenge nodes [US-01]
- [ ] Each path has exactly 5 challenge nodes with unique themed names defined in a data structure [US-01]
- [ ] Challenge nodes render in one of three visual states: locked (greyed), unlocked (glowing), completed (with star count) [US-01]
- [ ] The first challenge on each path is unlocked by default when no saved progress exists [US-01]
- [ ] `App.tsx` renders `MapScreen` as the entry point — `ConfigScreen` is no longer used or imported [US-01]
- [ ] Map progress (per-node completion state and star count) is saved to localStorage under a `math-practice:map-progress` key [US-01]
- [ ] On app load, `MapScreen` restores saved progress from localStorage and renders correct node states [US-01]
- [ ] Tapping an unlocked challenge node navigates to a quiz round with exactly 5 problems of the challenge's operation type [US-02]
- [ ] A visible timer displays elapsed seconds during the challenge quiz [US-02]
- [ ] After answering all 5 problems, a results screen displays: correct count, time taken, and stars earned (1–3) [US-02]
- [ ] Star scoring: 3 stars requires ≥90% accuracy AND completion within time target; 2 stars requires ≥70% accuracy; 1 star for any completion [US-02]
- [ ] Results screen has a "Back to Map" button that persists the star result and returns to the map [US-02]
- [ ] An abandon/quit button is available during the challenge that returns to the map without saving progress [US-02]
- [ ] Challenge difficulty parameters are defined in a data structure (e.g., array or map of node configs with min/max ranges) — not hardcoded per component [US-03]
- [ ] Each successive node on a path uses a wider number range (node 1: max 10, node 2: max 20, node 3: max 30, node 4: max 40, node 5: max 50) [US-03]
- [ ] Completing a challenge with ≥1 star unlocks the next challenge on that path [US-03]
- [ ] Previously completed challenges can be tapped to replay; the higher star rating is kept [US-03]
- [ ] The map visually highlights the frontier node (furthest unlocked-but-incomplete) on each path [US-03]
- [ ] At least 2 convergence points exist on the map where 2 paths visually cross [US-04]
- [ ] Convergence challenge nodes are visually distinct from single-operation nodes (different size or shape) [US-04]
- [ ] Convergence challenges generate problems from both crossing operation types (verified: problem set contains both operation types) [US-04]
- [ ] Convergence nodes are locked until the preceding challenge on BOTH adjacent paths has ≥1 star [US-04]
- [ ] Convergence challenges use the higher max value of the two adjacent path challenges as their difficulty [US-04]
- [ ] Completing a convergence challenge unlocks the next node on both adjacent paths [US-04]
- [ ] `AGENTS.md` reflects new modules/components introduced in this phase (MapScreen, challenge data model, star scoring) [phase]
- [ ] Vitest test suite passes — tests cover star scoring thresholds, challenge unlock logic, convergence unlock logic, and difficulty progression [phase]

## AGENTS.md sections affected
- Directory layout (new components: MapScreen, results screen; new lib modules: challenge data, scoring, map progress)
- Behavior rules (star scoring thresholds, unlock gating, convergence mechanics, progressive difficulty)
- File ownership map (new files)

## User documentation
No user guide exists yet. The build-loop should create `docs/manual/adventure-map.md` during this phase covering: map navigation, playing challenges, star scoring, progression, and convergence challenges.

## Golden principles (phase-relevant)
- Division problems always produce integer results (operand1 = operand2 * answer)
- Subtraction results are always >= 0 (operand2 <= operand1)
- No `dangerouslySetInnerHTML` — all user text rendered via JSX
- Answer input validates numeric before comparison

## Notes
- The existing `adaptive.ts` (streak-based difficulty) is not used in map mode — difficulty is fixed per challenge node. The module remains in the codebase for potential future reuse.
- `ConfigScreen` is removed as the app entry point. The map is the sole experience.
