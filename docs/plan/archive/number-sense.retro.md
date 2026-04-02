## Phase retrospective — number-sense

**Metrics:** 15 tasks (12 build + 3 review), 6 investigate, 6 implement, 0 fail, 0 rework. Rework rate: 0%. Investigate ratio: 50%. Health: Healthy.

**Phase type:** CSS/JS-only (no server changes). Investigate-first recommended but not mandatory. Agent elected 50% investigate ratio — each implement task was preceded by a Branch B investigation.

**Build-log failure classes:**
- None. Zero failures during the build phase.

**Review-sourced failure classes:**
- `type-annotation-drift` — first-seen (1 critical: `operationSymbols` typed as `Record<Operation, string>` required all 6 operation keys but only had 4 arithmetic entries. Not a runtime bug — rounding and number-challenge are dispatched before reaching the lookup — but fails strict TypeScript compilation. Fixed by narrowing to `{ [key: string]: string }`.)
- `cross-cutting-break` — first-seen (1 concern: milestone nodes MS1/MS2 used arithmetic-calibrated `min: 1, max: 20` / `min: 1, max: 50`. When milestone draws rounding problems, `generateRoundingProblem(1, 20)` produces degenerate questions. Fixed by adding `getMilestoneGeneratorConfig()` that uses the prerequisite lane's own min/max/roundingTarget/questionTypes.)
- `schema-code-drift` — first-seen (1 concern: 5 instances of "(planned for number-sense phase)" remained in `ARCHITECTURE.md` after the features shipped. Fixed by removing the stale tags.)

**Compounding fixes proposed:**
- None. All failure classes are first-seen and none is data-loss or security. If `type-annotation-drift` recurs (extending a union without updating all Record<Union> usages), a quality check will be proposed. If `cross-cutting-break` recurs (adding operations that break existing config assumptions), a spec-author gate will be proposed requiring per-operation range analysis for shared configs.

**Notes:**
- Clean phase — zero build failures across 12 build tasks and 33 new tests.
- The `type-annotation-drift` critical was caught by review-pr, not by the verify command (`npx tsc --noEmit`). This suggests the default tsconfig may not enforce the strict check that would have flagged it. Noted for monitoring.
- Token usage was dominated by review-pr (~80k tokens for a 16-file diff). The build tasks averaged ~4k tokens each.
