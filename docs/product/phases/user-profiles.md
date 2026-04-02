# Phase: user-profiles

Status: draft

## Design direction

Adventure character selection — consistent with the existing parchment/adventure aesthetic. The 4 avatars are cartoon animals with large, expressive cartoony eyes (e.g., owl, fox, bunny, bear). The selection screen feels like "choosing your adventurer" before entering the map. Playful scale/bounce animations on hover and select. Profile cards show the animal avatar prominently with the child's name underneath. The overall vibe is warm, inviting, and immediately fun for a 6–12 year old.

## Stories

### US-09 — Profile selection and creation screen

As a child, I want to see a fun screen where I can pick my adventurer or create a new one when the app starts, so that I have my own identity and my progress is separate from my siblings.

**Acceptance criteria:**
- ProfileScreen is the app entry point when no profile is active
- Profile creation: tap "New Adventurer" → pick from 4 animal avatars → enter a name (1–12 chars) → profile saved
- Existing profiles shown as cards with animal avatar and name; tapping selects and enters the map
- Maximum 4 profiles (matches avatar count)
- Last-used profile is visually highlighted
- Empty/whitespace-only names rejected with inline validation

**User guidance:**
- Discovery: ProfileScreen is the first thing shown on app load — no navigation needed
- Manual section: new page: "Choosing Your Adventurer"
- Key steps: Open the app → see your profile card (or "New Adventurer" if first time) → tap your card to resume, or create a new adventurer with an animal avatar and name

**Design rationale:** Capping profiles at 4 (matching avatar count) keeps the selection screen uncluttered and avoids a scrolling list — each profile maps to one unique animal, making profiles instantly recognizable for young children who may not read fluently yet.

**Interaction model:** Profile creation is a two-step inline flow on the same screen (not a separate route): (1) tap "New Adventurer" to reveal the avatar picker — 4 animal cards in a row, tap to select with a bounce animation; (2) a name input appears below the selected avatar, with a "Go!" button. Selecting a profile is a single tap on the profile card — no confirmation step needed (low-stakes action, easy to switch back).

### US-10 — Per-profile progress isolation

As a child, I want my adventure map progress saved under my own profile, so that my sibling's play doesn't overwrite my stars and unlocks.

**Acceptance criteria:**
- Map progress localStorage key scoped per profile: `math-practice:map-progress:<profileId>`
- `loadMapProgress` and `saveMapProgress` accept a `profileId` parameter
- Selecting a different profile loads that profile's independent progress
- New profiles start with default map progress (starter nodes unlocked, zero stars)
- Migration: legacy `math-practice:map-progress` auto-migrates to a "Player 1" profile on first load
- After migration, legacy key is removed

**User guidance:**
- Discovery: Transparent — child simply selects their profile and sees their own map
- Manual section: "Choosing Your Adventurer > Switching Profiles"
- Key steps: Tap a different profile card on the start screen → the map loads with that profile's stars and progress

**Design rationale:** Scoping the existing localStorage key with a profile ID suffix is the simplest migration path — all existing mapProgress functions continue to work, just with a scoped key. Auto-migrating the legacy key prevents data loss for existing single-player users.

### US-11 — Profile reset with confirmation

As a child (or parent), I want to reset a profile's adventure progress with a confirmation step, so that I can start fresh without accidentally losing my stars.

**Acceptance criteria:**
- Reset button accessible on the profile selection screen for each profile
- Confirmation dialog shows profile name and clear warning
- Confirming clears all map progress (resets to default starter-node state) but preserves profile (name, avatar)
- Cancelling returns to profile screen with no changes
- After reset, profile card reflects zero progress

**User guidance:**
- Discovery: Small reset icon or text link on each profile card on the start screen
- Manual section: "Choosing Your Adventurer > Resetting Progress"
- Key steps: Tap the reset icon on a profile card → read the warning ("Reset Luna's adventure? All stars will be lost!") → confirm to reset or cancel to keep

**Design rationale:** Preserving the profile identity (name + avatar) on reset means the child doesn't have to re-pick their animal — they just get a fresh map. The confirmation dialog is essential because young children tap impulsively; the warning uses the profile name to make the consequence concrete.

## Done-when (observable)

### US-09 — Profile selection and creation screen
- [ ] `src/components/ProfileScreen.tsx` exists and renders as the app entry point when no profile is active [US-09]
- [ ] `src/components/ProfileScreen.css` exists with adventure-themed styling: parchment background consistent with MapScreen, animal avatar cards with large cartoony eyes [US-09]
- [ ] Profile creation flow: child taps "New Adventurer" → picks from exactly 4 animal avatars (rendered as emoji or CSS/SVG illustrations) → enters a name (1–12 characters, non-empty after trim) → profile is saved [US-09]
- [ ] Profile selection: existing profiles display as cards showing the animal avatar and name; tapping a card selects that profile and navigates to the map [US-09]
- [ ] Maximum 4 profiles enforced — "New Adventurer" button is hidden or disabled when 4 profiles exist [US-09]
- [ ] Last-used profile is visually highlighted (e.g., subtle glow or "Last played" badge) on the selection screen [US-09]
- [ ] `src/lib/profiles.ts` exists and exports: `Profile` type (id, name, avatarId, createdAt, lastPlayedAt), `loadProfiles`, `saveProfile`, `deleteProfile`, `getLastActiveProfileId` [US-09]
- [ ] Profile data persists in localStorage under `math-practice:profiles` key [US-09]
- [ ] `App.tsx` renders `ProfileScreen` as the initial view; selecting a profile transitions to the map screen [US-09]
- [ ] Selecting a profile or creating a new one updates `lastPlayedAt` on that profile [US-09]
- [ ] Test: creating a profile with an empty or whitespace-only name is rejected (profile not saved, inline validation message shown) [US-09]

### US-10 — Per-profile progress isolation
- [ ] Map progress localStorage key is scoped per profile: `math-practice:map-progress:<profileId>` [US-10]
- [ ] `loadMapProgress` and `saveMapProgress` accept a `profileId` parameter and read/write the scoped key [US-10]
- [ ] Selecting a different profile on the profile screen loads that profile's map progress (not the previous profile's) [US-10]
- [ ] A new profile starts with default map progress (all starter nodes unlocked, zero stars) [US-10]
- [ ] Migration: on first load, if `math-practice:map-progress` (legacy unscoped key) exists and no profiles exist, auto-create a "Player 1" profile with the first avatar and migrate the legacy progress to `math-practice:map-progress:<player1Id>` [US-10]
- [ ] After migration, the legacy `math-practice:map-progress` key is removed from localStorage [US-10]
- [ ] Test: two profiles have independent progress — completing a node on profile A does not affect profile B's progress [US-10]

### US-11 — Profile reset with confirmation
- [ ] A reset button (e.g., small icon or text link) is accessible on the profile selection screen for each existing profile [US-11]
- [ ] Tapping reset shows a confirmation dialog with the profile name and a clear warning (e.g., "Reset Luna's adventure? All stars and progress will be lost!") [US-11]
- [ ] Confirming reset clears all map progress for that profile (resets to default starter-node state) but preserves the profile itself (name, avatar) [US-11]
- [ ] Cancelling the confirmation dialog returns to the profile screen with no changes [US-11]
- [ ] After reset, the profile card on the selection screen reflects zero progress (no star count or completion indicators if shown) [US-11]
- [ ] Test: after reset, `loadMapProgress(profileId)` returns default progress (starter nodes unlocked, zero stars, no completions) [US-11]

### Auto-added safety criteria
- [ ] Profile name input renders via JSX textContent (not innerHTML) — no XSS vector from child-entered names [US-09]
- [ ] Profile name is trimmed and length-validated (1–12 chars) before save — empty or oversized input rejected [US-09]

### Phase-level
- [ ] `AGENTS.md` reflects the profile system: new components (ProfileScreen), new lib module (profiles.ts), updated persistence model (per-profile scoped keys), updated app flow (profile → map → quiz → results) [phase]

## Golden principles (phase-relevant)
- No `dangerouslySetInnerHTML` — all user text rendered via JSX
- Map progress persists in localStorage under scoped key per profile
- Answer input validates before comparison (non-numeric silently ignored)

## AGENTS.md impact
- **Directory layout**: add `ProfileScreen.tsx`, `ProfileScreen.css`, `profiles.ts`
- **Behavior rules**: add profile system rules (max 4 profiles, per-profile progress scoping, migration from legacy key)
- **Data flow**: update to show profile → map → quiz → results flow
- **Persistence model**: add `math-practice:profiles` key, update `math-practice:map-progress` to per-profile scoped keys

## User documentation
No user manual exists. The profile selection screen is self-documenting for children. README.md will be updated with profile system description (parent/developer audience).
