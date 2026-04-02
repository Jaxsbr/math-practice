# Phase: number-sense

Status: shipped

## Design direction

Keep current parchment/adventure style. New lanes use the same visual language — adventure-themed node names, consistent star/lock iconography. Each lane gets a distinct colour to aid recognition across the wider 6-lane map.

## Stories

### US-05 — Rounding problem lane [Shipped]

As a child, I want a rounding lane on the adventure map, so that I can practise rounding numbers to the nearest 10, 100, 1000, and 10,000 with progressive difficulty.

**Acceptance criteria:**
- Rounding is a new operation type supported by the generator — produces a number and a rounding target, answer is the correctly rounded value (≥5 rounds up)
- 5 challenge nodes on the map: R1 (nearest 10, 2-digit numbers), R2 (nearest 100, 3-digit numbers), R3 (nearest 1000, 4-digit numbers), R4 (nearest 10,000, 5-digit numbers), R5 (mixed rounding targets)
- Generated numbers always have a non-zero digit in the rounding position (e.g., rounding 300 to the nearest 100 is trivial — avoid it)
- QuizScreen displays the question as text (e.g., "Round 2670 to the nearest 1000") and accepts a numeric answer
- Star scoring and time targets apply to rounding challenges the same as arithmetic

**User guidance:**
- Discovery: Rounding lane appears as a new path on the adventure map, unlocked from the start at R1
- Manual section: new page: "Rounding Lane"
- Key steps: Tap R1 on the map → answer 5 rounding questions → earn stars → progress to R2

**Design rationale:** Each node increases both the number magnitude and rounding target together (2-digit/nearest-10 → 5-digit/nearest-10,000), mirroring the Twinkl worksheet progression and keeping cognitive load in step with number size.

### US-06 — Number challenge problem lane [Shipped]

As a child, I want a number challenge lane on the adventure map, so that I can build place value intuition and number sense through varied question types.

**Acceptance criteria:**
- Number challenge is a new operation type — generates varied place-value and number-sense questions with numeric answers
- Question types include: place identification ("What digit is in the hundreds place of 4562?"), number construction ("Arrange 3, 7, 1 to make the largest number"), construction with constraints ("Smallest 3-digit even number from 4, 1, 8?"), place value composition ("5 hundreds + 3 tens + 7 ones = ?"), decomposition ("How many tens in 450?")
- 5 challenge nodes: N1 (2-digit place ID + composition), N2 (3-digit construction), N3 (3-digit construction with odd/even constraints), N4 (4-digit mixed question types), N5 (all question types, 3–5 digit numbers)
- Every generated problem has exactly one correct numeric answer
- QuizScreen displays variable-length question text and accepts a numeric answer

**User guidance:**
- Discovery: Number challenge lane appears as a new path on the adventure map, unlocked from the start at N1
- Manual section: new page: "Number Challenge Lane"
- Key steps: Tap N1 on the map → answer 5 number-sense questions → earn stars → progress to N2

**Design rationale:** Question type variety within a single lane keeps the child engaged and tests multiple facets of number sense rather than drilling one mechanic. Progressive node difficulty scales digit count, not question complexity, so children build familiarity with small numbers before handling larger ones.

### US-07 — Milestone convergence system [Shipped]

As a child, I want milestone challenges that mix problem types from across all lanes, so that I'm rewarded for breadth and tested on combined skills.

**Acceptance criteria:**
- Milestone nodes replace the existing pair-convergence nodes (C1, C2)
- Milestone 1 sits between tier 2 and tier 3; Milestone 2 sits after tier 5
- Milestone 1 requires completion (≥1 star) on any 4 of 6 tier-2 nodes; Milestone 2 requires any 4 of 6 tier-5 nodes
- The N-of-M threshold is defined in a single config constant (not hardcoded per milestone)
- A milestone challenge generates problems by drawing randomly from the operation types of the child's completed lanes at that tier
- Passing a milestone unlocks tier 3+ nodes (Milestone 1) or marks the map as fully complete (Milestone 2)
- Milestone progress persists in localStorage alongside per-node progress

**User guidance:**
- Discovery: Milestone bands appear as a wide horizontal bar spanning the map between tier 2 and tier 3, and after tier 5; they glow/pulse when unlockable
- Manual section: new page: "Milestone Challenges"
- Key steps: Complete any 4 lanes' tier-2 nodes → Milestone 1 unlocks → tap to play a mixed challenge → passing unlocks all tier-3 nodes

**Design rationale:** N-of-M gating (rather than requiring all lanes) lets children skip lanes they find hard while still requiring breadth. Drawing problems only from completed lanes means the milestone is always fair — it never tests skills the child hasn't practised. The configurable threshold future-proofs for additional lanes.

### US-08 — Scalable map layout [Shipped]

As a child, I want the adventure map to clearly show all 6 lanes and milestones, so that I can see my progress across all paths at a glance.

**Acceptance criteria:**
- MapScreen renders 6 lane columns (addition, subtraction, multiplication, division, rounding, number challenge) with distinct path labels/icons
- Milestone bands render as a full-width horizontal element between tier 2/3 and after tier 5
- Map is horizontally scrollable or responsively scaled so all 6 lanes are accessible on narrow viewports (min: 375px width)
- Each lane column uses a distinct colour or icon so lanes are visually distinguishable
- Node states (locked, unlocked, 1/2/3 stars) display correctly for all 6 lanes and milestones
- The map layout derives column count from the challenge node data (not hardcoded to 6) so future lanes require no layout code changes

**User guidance:**
- Discovery: The adventure map is the landing screen — all 6 lanes are visible immediately
- Manual section: update existing "Adventure Map" page with new lane descriptions and milestone explanation
- Key steps: Open the app → see 6 lanes on the map → scroll horizontally if needed on mobile → tap any unlocked node to start

**Design rationale:** Deriving layout from data (rather than hardcoding columns) means adding a 7th or 8th lane in future only requires adding node definitions — no MapScreen code changes. This is the key scalability win.

## Done-when (observable)

### US-05 — Rounding lane
- [ ] `'rounding'` is a member of the Operation type union in `src/types.ts` [US-05]
- [ ] `generateProblem` with rounding config returns a Problem where `display` matches "Round N to the nearest Y" and `answer` is the correct rounded value (digit ≥5 rounds up) [US-05]
- [ ] Test: rounding generator never produces trivial problems (numbers already divisible by the rounding target) over 100 generated samples [US-05]
- [ ] `CHALLENGE_NODES` contains R1–R5 with progressive rounding configs: R1 (2-digit, nearest 10), R2 (3-digit, nearest 100), R3 (4-digit, nearest 1000), R4 (5-digit, nearest 10,000), R5 (mixed targets); R1 has no prerequisites [US-05]
- [ ] Test suite for rounding generator passes with ≥5 test cases covering nearest 10, 100, 1000, 10000, and the ≥5-rounds-up rule [US-05]

### US-06 — Number challenge lane
- [ ] `'number-challenge'` is a member of the Operation type union in `src/types.ts` [US-06]
- [ ] Generator produces at least 5 distinct question formats: place identification ("What digit is in the Xs place of N?"), number construction ("Arrange digits to make the largest number"), construction with constraints ("Smallest 3-digit even number from ..."), place value composition ("X hundreds + Y tens + Z ones = ?"), decomposition ("How many tens in N?") — each format covered by test [US-06]
- [ ] Every generated number-challenge problem has exactly one correct numeric answer (test verifies across 100 samples per question type) [US-06]
- [ ] `CHALLENGE_NODES` contains N1–N5 with progressive configs: N1 (2-digit), N2 (3-digit construction), N3 (3-digit with odd/even constraints), N4 (4-digit mixed), N5 (3–5 digit all types); N1 has no prerequisites [US-06]
- [ ] Test suite for number-challenge generator passes with ≥8 test cases covering all 5 question types and edge cases [US-06]

### US-07 — Milestone convergence system
- [ ] `CHALLENGE_NODES` contains milestone nodes MS1 and MS2; C1 and C2 no longer exist in the node list [US-07]
- [ ] `ChallengeNode` type includes an optional `requiredCount` field; unlock logic requires only `requiredCount` of the listed prerequisites to be met (N-of-M gating) [US-07]
- [ ] MS1 prerequisites list all 6 tier-2 node IDs (A2, S2, M2, D2, R2, N2) with `requiredCount` set to a shared exported constant `MILESTONE_REQUIRED`; MS2 lists all 6 tier-5 node IDs with same constant [US-07]
- [ ] Tier-3 nodes (A3, S3, M3, D3, R3, N3) each require both their own tier-2 node AND MS1 in their prerequisites array [US-07]
- [ ] Milestone problem generation draws only from operation types the player has completed at that tier (test: complete only addition + rounding tier-2 → milestone generates only addition and rounding problems) [US-07]
- [ ] Test suite for milestone unlock logic passes with ≥4 test cases (below threshold, at threshold, above threshold, zero completed) [US-07]

### US-08 — Scalable map layout
- [ ] MapScreen renders 6 lane columns with a visible label or icon for each lane [US-08]
- [ ] Milestone bands render as full-width horizontal elements spanning all lane columns at their designated grid rows [US-08]
- [ ] Each lane has a distinct visual identifier (unique CSS class or colour) — no two lanes share the same identifier [US-08]
- [ ] MapScreen derives column count from `CHALLENGE_NODES` data — grep for hardcoded column count `6` in MapScreen.tsx returns 0 matches [US-08]
- [ ] All nodes are reachable at 375px viewport width via horizontal scroll or responsive scaling (CSS sets `min-width` or `overflow-x: auto` on the map container) [US-08]

### Phase-level
- [ ] `AGENTS.md` reflects rounding and number-challenge operations, milestone convergence rules, and updated node inventory [phase]
- [ ] README.md documents the 6 lanes (addition, subtraction, multiplication, division, rounding, number challenge) and the milestone convergence system [phase]

## Golden principles (phase-relevant)
- All generated problems have clean, unambiguous numeric answers
- Answer input validates numeric before comparison (non-numeric silently ignored)
- No `dangerouslySetInnerHTML` — all user text rendered via JSX
- Star scoring and time targets apply uniformly to all challenge types
- Map progress persists in localStorage under `math-practice:map-progress`

## AGENTS.md impact
- **Behavior rules > Adventure map rules**: add rounding and number-challenge operation descriptions, milestone convergence rules (N-of-M gating), remove pair-convergence references (C1, C2)
- **Directory layout**: add any new generator modules (e.g., `roundingGenerator.ts`, `numberChallengeGenerator.ts`)
- **File ownership map**: new files for rounding/number-challenge generators

## User documentation
No user manual exists for this project. The adventure map UI is self-documenting for children. README.md will be updated with feature descriptions for the new lanes and milestone system (covers parent/developer audience).
