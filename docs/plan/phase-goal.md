## Phase goal

Add sound effects, animations, and ambient soundscape to create a magical, immersive reward experience. Web Audio API synthesis for all sounds (no audio files), CSS keyframe animations for visual feedback, and an enchanted forest aesthetic consistent with the parchment/adventure theme.

### Design direction

Nature/adventure — enchanted forest clearing. Warm chimes for correct answers, gentle low tones for incorrect, ascending bell-like tones for star reveals, bright chirp-like bursts for node completion. Ambient is soft filtered noise evoking a distant forest stream. Animations use CSS keyframes: sparkle particles via pseudo-elements, pulse/glow effects, gentle shakes. Color palette stays warm (golds, greens, earth tones). Nothing jarring or arcade-like — the vibe is a magical clearing in the woods where learning feels like discovery.

### Stories in scope
- US-12 — Sound engine and mute control
- US-13 — Quiz answer feedback sounds and animations
- US-14 — Star award celebration
- US-15 — Map node completion and unlock animations
- US-16 — Ambient soundscape

### Done-when (observable)

#### US-12 — Sound engine and mute control
- [x] `src/lib/audio.ts` exists and exports: `SoundType` type/enum, `playSound(type: SoundType)`, `setMuted(muted: boolean)`, `isMuted(): boolean`, `initAudioContext()` [US-12]
- [x] All sounds are generated via Web Audio API oscillators and gain nodes — no `.mp3`, `.ogg`, or `.wav` files in the repository [US-12]
- [x] `initAudioContext()` is called from a user-gesture event handler (click/tap) — `AudioContext` is not created at module load or component mount [US-12]
- [x] Mute state persists in localStorage under `math-practice:audio-muted` key (global, not per-profile) [US-12]
- [x] A mute/unmute toggle button (speaker icon) is visible in the header area of MapScreen and QuizScreen [US-12]
- [x] Test: calling `playSound` when muted does not create or start any `OscillatorNode` — verified via spy/mock on `AudioContext.createOscillator` [US-12]
- [x] Async cleanup: any `setTimeout` callbacks used for sound envelope sequencing are cancelled on component unmount; `OscillatorNode.stop()` is called for any playing nodes on cleanup [US-12]

#### US-13 — Quiz answer feedback sounds and animations
- [x] Submitting a correct answer plays a short bright chime sound via Web Audio API immediately on submission [US-13]
- [x] Submitting a correct answer triggers a green pulse/flash CSS keyframe animation on the answer feedback area [US-13]
- [x] Submitting an incorrect answer plays a short gentle low tone via Web Audio API immediately on submission [US-13]
- [x] Submitting an incorrect answer triggers a subtle horizontal shake CSS keyframe animation on the answer feedback area [US-13]
- [x] No external animation library is added to `package.json` — all animations are CSS keyframes [US-13]
- [x] Test: Playwright — submitting a correct answer produces an element with `[data-feedback="correct"]` attribute; incorrect produces `[data-feedback="incorrect"]` [US-13]
- [x] Async cleanup: feedback animation CSS classes are removed after animation completes via `animationend` event listener; listener is cleaned up on component unmount [US-13]

#### US-14 — Star award celebration
- [x] ResultsScreen reveals earned stars with cascading animation — stars appear one by one with ~300ms staggered delay between each [US-14]
- [x] Each star reveal is accompanied by a chime sound with ascending pitch (each star's chime is higher than the previous) [US-14]
- [x] A 3-star result triggers a bonus celebration effect (golden sparkle burst via CSS pseudo-elements or additional keyframe) after all three stars have revealed [US-14]
- [x] Star reveal animations use CSS keyframes with distinct `animation-delay` values per star — no external animation library [US-14]
- [x] Test: ResultsScreen rendered with 3 stars produces 3 elements with `.star-reveal` class, each with a different `animation-delay` CSS property value [US-14]

#### US-15 — Map node completion and unlock animations
- [x] Completed nodes on MapScreen have a `.node-completed` CSS class with a subtle idle glow animation (pulsing box-shadow or border-color keyframe) [US-15]
- [x] When returning from a just-completed challenge, the completed node plays a one-time burst animation (`.node-just-completed` class) visually distinct from the idle glow [US-15]
- [x] Unlocked-but-not-yet-attempted nodes have a `.node-unlocked` CSS class with a gentle attention-drawing pulse animation [US-15]
- [x] Node completion triggers a short bright sound effect via Web Audio API [US-15]
- [x] Test: a node with `completed: true` in map progress renders with `.node-completed` class that has an active CSS animation; an unlocked but incomplete node renders with `.node-unlocked` class [US-15]
- [x] Async cleanup: the `.node-just-completed` one-time burst class is removed after animation completes via `animationend` listener; listener is cleaned up if the node unmounts [US-15]

#### US-16 — Ambient soundscape
- [ ] MapScreen plays a continuous ambient nature loop via Web Audio API (filtered noise or low-frequency oscillator blend) when audio is initialized and not muted [US-16]
- [ ] QuizScreen plays a softer, simpler ambient (lower gain value than MapScreen ambient) [US-16]
- [ ] Transitioning between MapScreen and QuizScreen cross-fades ambient sound (gain ramps over ~500ms) — no abrupt audio cuts [US-16]
- [ ] Ambient playback respects the mute toggle — muting sets ambient gain to 0; unmuting ramps gain back up [US-16]
- [ ] Ambient does not start until `initAudioContext()` has been called (no attempt to create nodes before user gesture) [US-16]
- [ ] Test: when MapScreen is mounted and audio is not muted, the ambient gain node's value is greater than 0; when muted, gain is 0 [US-16]
- [ ] Async cleanup: ambient oscillator/noise source nodes are stopped and `disconnect()`-ed on component unmount — no audio continues playing after navigating away from the screen [US-16]

#### Phase-level
- [ ] `AGENTS.md` reflects the audio/animation system: new lib module (`audio.ts`), mute toggle behavior rule, browser autoplay policy handling, animation CSS class conventions (`.node-completed`, `.node-unlocked`, `.node-just-completed`, `[data-feedback]`), async cleanup rules for Web Audio nodes [phase]
- [ ] No external audio files (`.mp3`, `.ogg`, `.wav`) or animation libraries are added to the project — all effects use Web Audio API + CSS keyframes [phase]

### Golden principles (phase-relevant)
- No `dangerouslySetInnerHTML` — all user text rendered via JSX
- Map progress persists in localStorage under scoped key per profile
- Async cleanup: Web Audio nodes stopped and disconnected on unmount; CSS animation classes cleaned up after completion
