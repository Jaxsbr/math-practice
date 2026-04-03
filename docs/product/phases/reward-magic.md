# Phase: reward-magic

Status: draft

## Design direction

**Nature/adventure — enchanted forest clearing.** Consistent with the existing parchment/adventure aesthetic. All sounds are Web Audio API–synthesized: warm chimes for correct answers, gentle low tones for incorrect, ascending bell-like tones for star reveals, bright chirp-like bursts for node completion. Ambient is soft filtered noise evoking a distant forest stream. Animations use CSS keyframes: sparkle particles via pseudo-elements, pulse/glow effects, gentle shakes. Color palette stays warm (golds, greens, earth tones). Nothing jarring or arcade-like — the vibe is a magical clearing in the woods where learning feels like discovery.

## Stories

### US-12 — Sound engine and mute control

As a child, I want to hear fun sounds when I answer questions and earn stars, so that practice feels alive and rewarding.

**Acceptance criteria:**
- A central audio module manages all sound playback via the Web Audio API
- Sounds are synthesized (oscillators + gain envelopes) — no external audio files
- AudioContext is created on the first user gesture (tap/click), not at module load, to satisfy browser autoplay policy
- A mute/unmute toggle is visible on the MapScreen and QuizScreen
- Mute state persists in localStorage (global, not per-profile — it's a device preference)
- When muted, no oscillators are created or started

**User guidance:**
- Discovery: Speaker icon button in the top-right corner of MapScreen and QuizScreen
- Manual section: N/A — self-documenting UI (speaker icon toggles sound on/off)
- Key steps: Tap the speaker icon to mute → icon changes to muted state → tap again to unmute

**Design rationale:** Global (not per-profile) mute because it's a device/environment preference — a parent who wants quiet wants it quiet for all profiles. Web Audio API synthesis over audio files keeps the bundle at zero extra bytes and avoids loading latency.

**Interaction model:** Same as existing button patterns (single tap toggle). Speaker icon with two visual states (sound-on / sound-off). No confirmation needed — toggling is instant and reversible.

### US-13 — Quiz answer feedback sounds and animations

As a child, I want to see and hear something exciting when I get an answer right (and something gentle when I get it wrong), so that each answer feels like it matters.

**Acceptance criteria:**
- Correct answer triggers a bright chime sound and a green pulse/flash animation
- Incorrect answer triggers a gentle low tone and a subtle horizontal shake animation
- Feedback plays immediately on answer submission, before advancing to the next problem
- Animations use CSS keyframes — no external animation library
- Animation classes are cleaned up after each animation completes (no stale state between problems)

**User guidance:**
- Discovery: Automatic — feedback plays on every answer submission during a challenge
- Manual section: N/A — self-documenting (feedback is instantaneous and obvious)
- Key steps: Type an answer → press Enter or tap Submit → see and hear the feedback → next problem appears

**Design rationale:** Pairing sound with animation creates multi-sensory reinforcement. Keeping the incorrect feedback gentle (soft tone + subtle shake rather than harsh buzzer + red flash) avoids discouraging children — the goal is "try again" not "you failed."

**Interaction model:** Same input flow as QuizScreen currently — child enters answer and submits. The new feedback layer is passive (no additional interaction required). The animation plays over ~400ms, then the next problem appears.

### US-14 — Star award celebration

As a child, I want my earned stars to appear one by one with sparkle and sound after a challenge, so that the reward moment feels special and worth working for.

**Acceptance criteria:**
- Stars on ResultsScreen are revealed with a cascading staggered animation (one by one, not all at once)
- Each star appearance is accompanied by an ascending chime (pitch rises per star)
- A 3-star result triggers a bonus celebration effect (extra sparkle/golden burst) after all stars reveal
- Animations use CSS keyframes with staggered `animation-delay`
- The celebration sequence completes before the "Back to Map" button becomes active

**User guidance:**
- Discovery: Automatic — celebration plays after every completed challenge on the results screen
- Manual section: N/A — self-documenting (celebration is passive, child watches then taps "Back to Map")
- Key steps: Finish last problem → results screen appears → stars cascade in one by one with sound → (if 3 stars) bonus sparkle → tap "Back to Map"

**Design rationale:** Staggered reveal builds anticipation — each star is a mini-moment. Ascending pitch reinforces "more stars = better." The 3-star bonus celebration creates a peak reward that children will chase, driving replay of earlier nodes for higher scores.

**Interaction model:** Passive viewing — child watches the celebration, then taps "Back to Map." No new interaction pattern; same as current ResultsScreen but with a timed reveal sequence before the button activates.

### US-15 — Map node completion and unlock animations

As a child, I want to see my completed map nodes glow and new nodes light up when they unlock, so that my progress feels visible and magical.

**Acceptance criteria:**
- Completed nodes display a subtle idle glow animation (soft pulsing border or shadow)
- When returning from a challenge, the just-completed node plays a one-time burst animation (sparkle expand) distinct from the idle glow
- Newly unlocked nodes (available but not yet attempted) pulse gently to draw attention
- Node completion triggers a short, bright sound effect
- Animations use CSS keyframes — no external animation library

**User guidance:**
- Discovery: Automatic — animations appear on the adventure map as the child progresses
- Manual section: N/A — self-documenting (visual map feedback)
- Key steps: Complete a challenge → return to map → see the completed node sparkle and glow → notice newly unlocked nodes pulsing

**Design rationale:** Three distinct visual states (idle glow for completed, burst for just-completed, pulse for newly unlocked) give the map a living, responsive feel. The just-completed burst provides immediate "I did that!" feedback; the unlock pulse creates "what's next?" curiosity.

**Interaction model:** Passive — animations play automatically on state changes. Same tap-to-enter-challenge interaction as current MapScreen.

### US-16 — Ambient soundscape

As a child, I want soft background sounds while I explore the map and do challenges, so that the app feels like an immersive adventure world.

**Acceptance criteria:**
- MapScreen plays a continuous ambient nature loop (filtered noise blend creating soft forest/wind atmosphere)
- QuizScreen plays a softer, simpler ambient (lower volume, less layered)
- Ambient cross-fades between screens (fade-out/fade-in over ~500ms) — no abrupt cuts
- Ambient respects the mute toggle
- Ambient does not start until AudioContext has been initialized by user gesture (depends on US-12)

**User guidance:**
- Discovery: Automatic — ambient plays as soon as audio is initialized and not muted
- Manual section: N/A — self-documenting (ambient is background, controlled by the same mute toggle from US-12)
- Key steps: Select a profile → hear soft forest ambiance on the map → enter a challenge → ambient shifts to a quieter tone → return to map → forest ambiance resumes

**Design rationale:** Ambient creates the "enchanted forest" atmosphere without demanding attention. Two layers (map = richer, quiz = minimal) prevent distraction during problem-solving while maintaining immersion. Cross-fade prevents jarring transitions that break the spell.

**Interaction model:** Passive — no interaction required. Ambient is controlled solely by the existing mute toggle (US-12).

## Done-when (observable)

### US-12 — Sound engine and mute control
- [ ] `src/lib/audio.ts` exists and exports: `SoundType` type/enum, `playSound(type: SoundType)`, `setMuted(muted: boolean)`, `isMuted(): boolean`, `initAudioContext()` [US-12]
- [ ] All sounds are generated via Web Audio API oscillators and gain nodes — no `.mp3`, `.ogg`, or `.wav` files in the repository [US-12]
- [ ] `initAudioContext()` is called from a user-gesture event handler (click/tap) — `AudioContext` is not created at module load or component mount [US-12]
- [ ] Mute state persists in localStorage under `math-practice:audio-muted` key (global, not per-profile) [US-12]
- [ ] A mute/unmute toggle button (speaker icon) is visible in the header area of MapScreen and QuizScreen [US-12]
- [ ] Test: calling `playSound` when muted does not create or start any `OscillatorNode` — verified via spy/mock on `AudioContext.createOscillator` [US-12]
- [ ] Async cleanup: any `setTimeout` callbacks used for sound envelope sequencing are cancelled on component unmount; `OscillatorNode.stop()` is called for any playing nodes on cleanup [US-12]

### US-13 — Quiz answer feedback sounds and animations
- [ ] Submitting a correct answer plays a short bright chime via Web Audio API immediately on submission [US-13]
- [ ] Submitting a correct answer triggers a green pulse/flash CSS keyframe animation on the answer feedback area [US-13]
- [ ] Submitting an incorrect answer plays a short gentle low tone via Web Audio API immediately on submission [US-13]
- [ ] Submitting an incorrect answer triggers a subtle horizontal shake CSS keyframe animation on the answer feedback area [US-13]
- [ ] No external animation library is added to `package.json` — all animations are CSS keyframes [US-13]
- [ ] Test: Playwright — submitting a correct answer produces an element with `[data-feedback="correct"]` attribute; incorrect produces `[data-feedback="incorrect"]` [US-13]
- [ ] Async cleanup: feedback animation CSS classes are removed after animation completes via `animationend` event listener; listener is cleaned up on component unmount [US-13]

### US-14 — Star award celebration
- [ ] ResultsScreen reveals earned stars with cascading animation — stars appear one by one with ~300ms staggered delay between each [US-14]
- [ ] Each star reveal is accompanied by a chime sound with ascending pitch (each star's chime is higher than the previous) [US-14]
- [ ] A 3-star result triggers a bonus celebration effect (golden sparkle burst via CSS pseudo-elements or additional keyframe) after all three stars have revealed [US-14]
- [ ] Star reveal animations use CSS keyframes with distinct `animation-delay` values per star — no external animation library [US-14]
- [ ] Test: ResultsScreen rendered with 3 stars produces 3 elements with `.star-reveal` class, each with a different `animation-delay` CSS property value [US-14]

### US-15 — Map node completion and unlock animations
- [ ] Completed nodes on MapScreen have a `.node-completed` CSS class with a subtle idle glow animation (pulsing box-shadow or border-color keyframe) [US-15]
- [ ] When returning from a just-completed challenge, the completed node plays a one-time burst animation (`.node-just-completed` class) visually distinct from the idle glow [US-15]
- [ ] Unlocked-but-not-yet-attempted nodes have a `.node-unlocked` CSS class with a gentle attention-drawing pulse animation [US-15]
- [ ] Node completion triggers a short bright sound effect via Web Audio API [US-15]
- [ ] Test: a node with `completed: true` in map progress renders with `.node-completed` class that has an active CSS animation; an unlocked but incomplete node renders with `.node-unlocked` class [US-15]
- [ ] Async cleanup: the `.node-just-completed` one-time burst class is removed after animation completes via `animationend` listener; listener is cleaned up if the node unmounts [US-15]

### US-16 — Ambient soundscape
- [ ] MapScreen plays a continuous ambient nature loop via Web Audio API (filtered noise or low-frequency oscillator blend) when audio is initialized and not muted [US-16]
- [ ] QuizScreen plays a softer, simpler ambient (lower gain value than MapScreen ambient) [US-16]
- [ ] Transitioning between MapScreen and QuizScreen cross-fades ambient sound (gain ramps over ~500ms) — no abrupt audio cuts [US-16]
- [ ] Ambient playback respects the mute toggle — muting sets ambient gain to 0; unmuting ramps gain back up [US-16]
- [ ] Ambient does not start until `initAudioContext()` has been called (no attempt to create nodes before user gesture) [US-16]
- [ ] Test: when MapScreen is mounted and audio is not muted, the ambient gain node's value is greater than 0; when muted, gain is 0 [US-16]
- [ ] Async cleanup: ambient oscillator/noise source nodes are stopped and `disconnect()`-ed on component unmount — no audio continues playing after navigating away from the screen [US-16]

### Phase-level
- [ ] `AGENTS.md` reflects the audio/animation system: new lib module (`audio.ts`), mute toggle behavior rule, browser autoplay policy handling, animation CSS class conventions (`.node-completed`, `.node-unlocked`, `.node-just-completed`, `[data-feedback]`), async cleanup rules for Web Audio nodes [phase]
- [ ] No external audio files (`.mp3`, `.ogg`, `.wav`) or animation libraries are added to the project — all effects use Web Audio API + CSS keyframes [phase]

## Golden principles (phase-relevant)
- No `dangerouslySetInnerHTML` — all user text rendered via JSX
- Map progress persists in localStorage under scoped key per profile
- Async cleanup: Web Audio nodes stopped and disconnected on unmount; CSS animation classes cleaned up after completion

## AGENTS.md impact
- **Directory layout**: add `src/lib/audio.ts`
- **Behavior rules**: add audio system rules (Web Audio API only, browser autoplay policy, mute toggle persistence, async cleanup for audio nodes), add animation conventions (CSS class names for node states, feedback attributes)
- **Persistence model**: add `math-practice:audio-muted` localStorage key

## User documentation
No user manual exists (noted in user-profiles phase). All features in this phase are self-documenting UI elements: mute toggle is a speaker icon, audio/animation feedback is automatic and passive. Target audience is children ages 6–12 who don't read documentation. Skip user guide creation — justified by self-documenting UI for non-reading audience.
