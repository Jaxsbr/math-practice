## Phase goal

Add a profile system so multiple children can share one device with independent adventure map progress. Includes profile selection/creation screen, per-profile progress isolation with legacy migration, and profile reset with confirmation.

### Design direction

Adventure character selection — consistent with the existing parchment/adventure aesthetic. The 4 avatars are cartoon animals with large, expressive cartoony eyes (e.g., owl, fox, bunny, bear). The selection screen feels like "choosing your adventurer" before entering the map. Playful scale/bounce animations on hover and select. Profile cards show the animal avatar prominently with the child's name underneath. The overall vibe is warm, inviting, and immediately fun for a 6–12 year old.

### Stories in scope
- US-09 — Profile selection and creation screen
- US-10 — Per-profile progress isolation
- US-11 — Profile reset with confirmation

### Done-when (observable)

#### US-09 — Profile selection and creation screen
- [x] `src/components/ProfileScreen.tsx` exists and renders as the app entry point when no profile is active [US-09]
- [x] `src/components/ProfileScreen.css` exists with adventure-themed styling: parchment background consistent with MapScreen, animal avatar cards with large cartoony eyes [US-09]
- [x] Profile creation flow: child taps "New Adventurer" → picks from exactly 4 animal avatars (rendered as emoji or CSS/SVG illustrations) → enters a name (1–12 characters, non-empty after trim) → profile is saved [US-09]
- [x] Profile selection: existing profiles display as cards showing the animal avatar and name; tapping a card selects that profile and navigates to the map [US-09]
- [x] Maximum 4 profiles enforced — "New Adventurer" button is hidden or disabled when 4 profiles exist [US-09]
- [x] Last-used profile is visually highlighted (e.g., subtle glow or "Last played" badge) on the selection screen [US-09]
- [x] `src/lib/profiles.ts` exists and exports: `Profile` type (id, name, avatarId, createdAt, lastPlayedAt), `loadProfiles`, `saveProfile`, `deleteProfile`, `getLastActiveProfileId` [US-09]
- [x] Profile data persists in localStorage under `math-practice:profiles` key [US-09]
- [x] `App.tsx` renders `ProfileScreen` as the initial view; selecting a profile transitions to the map screen [US-09]
- [x] Selecting a profile or creating a new one updates `lastPlayedAt` on that profile [US-09]
- [x] Test: creating a profile with an empty or whitespace-only name is rejected (profile not saved, inline validation message shown) [US-09]

#### US-10 — Per-profile progress isolation
- [x] Map progress localStorage key is scoped per profile: `math-practice:map-progress:<profileId>` [US-10]
- [x] `loadMapProgress` and `saveMapProgress` accept a `profileId` parameter and read/write the scoped key [US-10]
- [x] Selecting a different profile on the profile screen loads that profile's map progress (not the previous profile's) [US-10]
- [x] A new profile starts with default map progress (all starter nodes unlocked, zero stars) [US-10]
- [x] Migration: on first load, if `math-practice:map-progress` (legacy unscoped key) exists and no profiles exist, auto-create a "Player 1" profile with the first avatar and migrate the legacy progress to `math-practice:map-progress:<player1Id>` [US-10]
- [x] After migration, the legacy `math-practice:map-progress` key is removed from localStorage [US-10]
- [x] Test: two profiles have independent progress — completing a node on profile A does not affect profile B's progress [US-10]

#### US-11 — Profile reset with confirmation
- [x] A reset button (e.g., small icon or text link) is accessible on the profile selection screen for each existing profile [US-11]
- [x] Tapping reset shows a confirmation dialog with the profile name and a clear warning (e.g., "Reset Luna's adventure? All stars and progress will be lost!") [US-11]
- [x] Confirming reset clears all map progress for that profile (resets to default starter-node state) but preserves the profile itself (name, avatar) [US-11]
- [x] Cancelling the confirmation dialog returns to the profile screen with no changes [US-11]
- [x] After reset, the profile card on the selection screen reflects zero progress (no star count or completion indicators if shown) [US-11]
- [x] Test: after reset, `loadMapProgress(profileId)` returns default progress (starter nodes unlocked, zero stars, no completions) [US-11]

#### Auto-added safety criteria
- [x] Profile name input renders via JSX textContent (not innerHTML) — no XSS vector from child-entered names [US-09]
- [x] Profile name is trimmed and length-validated (1–12 chars) before save — empty or oversized input rejected [US-09]

#### Phase-level
- [x] `AGENTS.md` reflects the profile system: new components (ProfileScreen), new lib module (profiles.ts), updated persistence model (per-profile scoped keys), updated app flow (profile → map → quiz → results) [phase]

### Golden principles (phase-relevant)
- No `dangerouslySetInnerHTML` — all user text rendered via JSX
- Map progress persists in localStorage under scoped key per profile
- Answer input validates before comparison (non-numeric silently ignored)
