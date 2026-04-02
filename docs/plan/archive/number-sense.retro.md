## Phase retrospective — number-sense

**Metrics:** 15 tasks (12 build + 3 review), 6 investigate, 6 implement, 0 fail, 0 rework. Rework rate: 0%. Investigate ratio: 50%. Health: Healthy (build phase). Significant post-review rework from operator feedback (4 fix commits after review-complete).

**Phase type:** CSS/JS-only (no server changes).

**Build-log failure classes:**
- None. Zero failures during the build phase.

**Review-sourced failure classes:**
- `type-annotation-drift` — first-seen (1 critical: `operationSymbols` typed as `Record<Operation, string>` required all 6 operation keys but only had 4 arithmetic entries. Fixed by narrowing to `{ [key: string]: string }`.)
- `cross-cutting-break` — first-seen (1 concern: milestone nodes used arithmetic-calibrated min/max ranges, producing degenerate rounding/number-challenge problems. Fixed by adding `getMilestoneGeneratorConfig()` with per-operation range lookup.)
- `schema-code-drift` — first-seen (1 concern: 5 stale "(planned for number-sense phase)" tags in `ARCHITECTURE.md`. Fixed by removing.)

**Operator feedback failure classes (post-review):**
- `spec-ambiguity` — **pattern (3rd occurrence)** (operator flagged that rounding and number-challenge lanes used identical text-input quiz format as arithmetic — all 6 lanes felt the same. Root cause: spec described logic but not the visual interaction model. Original Twinkl worksheets use number lines for rounding and tappable digit stars for number challenges, but the spec didn't reference them. Fixed with 4 post-review commits: number line UI, digit star builder, contrast fix, deduplication. Previous: foundation — division range overshoot; adventure-map — 90% threshold unreachable with 5 problems.) **Fix proposed.**
- `answer-leakage` — first-seen (composition question "What is 6 tens + 9 ones?" displayed 69 as the large number, giving away the answer. Fixed by hiding number display for composition questions.)
- `duplicate-content` — first-seen (same problem could appear twice in a 5-problem challenge. Fixed by tracking seen displays and regenerating.)
- `contrast-violation` — first-seen (quiz text nearly invisible on dark-mode displays — dark text on transparent background. Fixed by adding explicit light background and forced dark text colors.)

**Compounding fixes proposed:**
- **[spec-author gate]** Add a **visual interaction reference** rule to spec-author: when a phase introduces a non-arithmetic question type (anything beyond `operand operator operand = ?`), the spec MUST include either (a) a reference screenshot/worksheet showing the intended interaction model, or (b) an explicit "Interaction model" section describing the visual layout and answer input mechanism (tappable choices, drag-and-drop, number line, etc.). Without this, the build agent defaults to the existing text-input pattern and all lanes feel identical. Reason: `spec-ambiguity` in foundation (numeric constraints not bounded), adventure-map (discrete thresholds unreachable), and number-sense (interaction model not specified) — three occurrences with different manifestations but the same root: the spec described WHAT to compute but not HOW the child interacts with it.

**Notes:**
- The 0% rework metric is misleading — it reflects the build phase only. The operator-driven post-review rework (4 commits: UI redesign, contrast, dedup, answer leakage) was substantial and wouldn't have been needed if the spec had captured the interaction model.
- The discrete-threshold validation fix (proposed in adventure-map retro) addresses numeric constraint ambiguity. The new visual interaction reference fix addresses a different facet of spec-ambiguity: missing UX design direction. Both should be applied.
