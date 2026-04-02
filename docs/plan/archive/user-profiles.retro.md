## Phase retrospective — user-profiles

**Metrics:** 15 tasks (6 investigate, 6 implement, 3 review), 0 fail, 0 rework. Rework rate: 0%. Investigate ratio: 50%. Health: Healthy (build phase). Significant post-review rework from operator feedback (3 usability gaps fixed after review-complete).

**Phase type:** CSS/JS-only (no server changes).

**Build-log failure classes:**
- None. Zero failures during the build phase.

**Review-sourced failure classes:**
- `abstraction-bypass` — first-seen (1 concern: ProfileScreen constructed localStorage key inline `math-practice:map-progress:${id}` instead of calling `clearMapProgress(profileId)` from mapProgress.ts, duplicating key format knowledge. Fixed by importing and using the API.)
- `schema-code-drift` — **pattern (2nd occurrence)** (1 concern: stale "(planned for user-profiles phase)" annotations in ARCHITECTURE.md — spec-author wrote forward-looking annotations during spec writing that weren't cleaned up when the phase shipped. Previous: number-sense retro — 5 stale "(planned for number-sense phase)" tags in same file.) **Fix proposed.**

**Operator feedback failure classes (post-review):**
- `spec-ambiguity` — **pattern (4th occurrence, new facet: user journey completeness)** (operator flagged 3 missing features essential for user-readiness: (1) no profile identity indicator on map/quiz screens — children can't tell whose profile is active; (2) no way to return to profile selection from the map — no profile switching; (3) no profile editing or deletion. Root cause: spec described the profile selection entry point but not the ongoing experience — what happens after entering a profile. Previous: foundation — division range overshoot; adventure-map — 90% threshold unreachable; number-sense — missing interaction models for rounding/number-challenge. Prior fixes addressed discrete thresholds and interaction models but not user journey completeness.) **Fix proposed.**

**Compounding fixes proposed:**
- [LEARNINGS.md] Add entry: spec-author should not add "(planned for X phase)" annotations to ARCHITECTURE.md — the per-phase spec file documents planned work; architecture doc should only be updated by reconciliation after the phase ships. Reason: `schema-code-drift` in number-sense (5 stale tags) and user-profiles (same pattern in same file).
- [LEARNINGS.md] Add entry: specs must consider the full user journey, not just feature entry points — for any new screen or navigation flow, spec should address: (a) how does the user know their current context/identity, (b) how do they navigate away or back, (c) how do they modify or undo. Reason: `spec-ambiguity` across 4 phases, with the user-profiles facet exposing a gap in user journey thinking that prior fixes (design rationale, investigate-first, interaction models) don't cover.

**Notes:**
- The 0% rework metric reflects build-phase only. The operator-driven post-review additions (profile indicator, switching, editing/deletion) were substantial — ~280 lines of new code across 7 files.
- The `schema-code-drift` pattern is structurally identical across both occurrences: spec-author annotates ARCHITECTURE.md with "(planned for X phase)", reconciliation doesn't strip the annotations, reviewer catches them. The fix prevents the annotations from being written in the first place.
- The `spec-ambiguity` 4th occurrence represents a new facet not addressed by prior fixes. Prior fixes tackled: numeric constraint precision (foundation), discrete threshold validation (adventure-map), and interaction model documentation (number-sense). The user-profiles occurrence is about user journey completeness — thinking beyond the feature entry point to the full lifecycle.
