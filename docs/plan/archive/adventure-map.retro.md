## Phase retrospective — adventure-map

**Metrics:** 7 tasks, 1 investigate, 0 fail, 0 rework. Rework rate: 0%. Investigate ratio: 25%. Health: Healthy.

**Phase type:** CSS/JS-only (no server changes). Investigate-first recommended but not mandatory.

**Build-log failure classes:**
- None. Zero failures during the build phase.

**Review-sourced failure classes:**
- `dead-code` — first-seen (1 finding: `correctCount + (feedback?.correct ? 0 : 0)` is a no-op — both ternary branches return 0. Fixed: simplified to `correctCount` directly.)
- `spec-ambiguity` — pattern (1 finding: spec says "≥90% accuracy for 3 stars" but with 5 problems the achievable values are 0/20/40/60/80/100%, making 90% unreachable — effectively requires 100%. Challenged as intentional design. Previous: foundation retro — division operand1 = operand2 × answer can exceed configured max range because spec said "number range is configurable" without constraining the displayed operand.)

**Operator feedback (post-review):**
- Timer counted wall-clock time including feedback reading — unfair to star rating. Fixed: timer now pauses during feedback, only counts thinking time.

**Compounding fixes proposed:**
- [spec-author gate] Add a **discrete-threshold validation** rule to spec-author's done-when observability gate: when a done-when criterion specifies a numeric threshold (percentage, range, count), require the spec to list the achievable values given discrete parameters in scope and confirm the threshold is reachable. Reason: `spec-ambiguity` in foundation (division range overshoot) and adventure-map (90% unreachable at 5 problems) — both cases involve numeric constraints that are technically correct in isolation but impossible or misleading when combined with other discrete parameters.
