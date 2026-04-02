## Phase goal

Extend the adventure map with two new problem lanes (rounding and number challenge), replace the pair-convergence nodes (C1, C2) with a milestone convergence system (N-of-M gating), and scale the map layout to 6 lanes with responsive horizontal scrolling.

### Design direction

Keep current parchment/adventure style. New lanes use the same visual language — adventure-themed node names, consistent star/lock iconography. Each lane gets a distinct colour to aid recognition across the wider 6-lane map.

### Stories in scope
- US-05 — Rounding problem lane
- US-06 — Number challenge problem lane
- US-07 — Milestone convergence system
- US-08 — Scalable map layout

### Done-when (observable)

#### US-05 — Rounding lane
- [x] `'rounding'` is a member of the Operation type union in `src/types.ts` [US-05]
- [x] `generateProblem` with rounding config returns a Problem where `display` matches "Round N to the nearest Y" and `answer` is the correct rounded value (digit ≥5 rounds up) [US-05]
- [x] Test: rounding generator never produces trivial problems (numbers already divisible by the rounding target) over 100 generated samples [US-05]
- [x] `CHALLENGE_NODES` contains R1–R5 with progressive rounding configs: R1 (2-digit, nearest 10), R2 (3-digit, nearest 100), R3 (4-digit, nearest 1000), R4 (5-digit, nearest 10,000), R5 (mixed targets); R1 has no prerequisites [US-05]
- [x] Test suite for rounding generator passes with ≥5 test cases covering nearest 10, 100, 1000, 10000, and the ≥5-rounds-up rule [US-05]

#### US-06 — Number challenge lane
- [x] `'number-challenge'` is a member of the Operation type union in `src/types.ts` [US-06]
- [x] Generator produces at least 5 distinct question formats: place identification ("What digit is in the Xs place of N?"), number construction ("Arrange digits to make the largest number"), construction with constraints ("Smallest 3-digit even number from ..."), place value composition ("X hundreds + Y tens + Z ones = ?"), decomposition ("How many tens in N?") — each format covered by test [US-06]
- [x] Every generated number-challenge problem has exactly one correct numeric answer (test verifies across 100 samples per question type) [US-06]
- [x] `CHALLENGE_NODES` contains N1–N5 with progressive configs: N1 (2-digit), N2 (3-digit construction), N3 (3-digit with odd/even constraints), N4 (4-digit mixed), N5 (3–5 digit all types); N1 has no prerequisites [US-06]
- [x] Test suite for number-challenge generator passes with ≥8 test cases covering all 5 question types and edge cases [US-06]

#### US-07 — Milestone convergence system
- [x] `CHALLENGE_NODES` contains milestone nodes MS1 and MS2; C1 and C2 no longer exist in the node list [US-07]
- [x] `ChallengeNode` type includes an optional `requiredCount` field; unlock logic requires only `requiredCount` of the listed prerequisites to be met (N-of-M gating) [US-07]
- [x] MS1 prerequisites list all 6 tier-2 node IDs (A2, S2, M2, D2, R2, N2) with `requiredCount` set to a shared exported constant `MILESTONE_REQUIRED`; MS2 lists all 6 tier-5 node IDs with same constant [US-07]
- [x] Tier-3 nodes (A3, S3, M3, D3, R3, N3) each require both their own tier-2 node AND MS1 in their prerequisites array [US-07]
- [x] Milestone problem generation draws only from operation types the player has completed at that tier (test: complete only addition + rounding tier-2 → milestone generates only addition and rounding problems) [US-07]
- [x] Test suite for milestone unlock logic passes with ≥4 test cases (below threshold, at threshold, above threshold, zero completed) [US-07]

#### US-08 — Scalable map layout
- [x] MapScreen renders 6 lane columns with a visible label or icon for each lane [US-08]
- [x] Milestone bands render as full-width horizontal elements spanning all lane columns at their designated grid rows [US-08]
- [x] Each lane has a distinct visual identifier (unique CSS class or colour) — no two lanes share the same identifier [US-08]
- [x] MapScreen derives column count from `CHALLENGE_NODES` data — grep for hardcoded column count `6` in MapScreen.tsx returns 0 matches [US-08]
- [x] All nodes are reachable at 375px viewport width via horizontal scroll or responsive scaling (CSS sets `min-width` or `overflow-x: auto` on the map container) [US-08]

#### Phase-level
- [x] `AGENTS.md` reflects rounding and number-challenge operations, milestone convergence rules, and updated node inventory [phase]
- [x] README.md documents the 6 lanes (addition, subtraction, multiplication, division, rounding, number challenge) and the milestone convergence system [phase]

### Golden principles (phase-relevant)
- All generated problems have clean, unambiguous numeric answers
- Answer input validates numeric before comparison (non-numeric silently ignored)
- No `dangerouslySetInnerHTML` — all user text rendered via JSX
- Star scoring and time targets apply uniformly to all challenge types
- Map progress persists in localStorage under `math-practice:map-progress`
