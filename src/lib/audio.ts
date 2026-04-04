const MUTE_KEY = 'math-practice:audio-muted'

export type SoundType =
  | 'correct'
  | 'incorrect'
  | 'star1'
  | 'star2'
  | 'star3'
  | 'celebration'
  | 'nodeComplete'

interface SoundConfig {
  waveform: OscillatorType
  frequency: number
  duration: number
  volume: number
}

const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
  correct:      { waveform: 'sine',     frequency: 800,  duration: 0.3,  volume: 0.4 },
  incorrect:    { waveform: 'sine',     frequency: 220,  duration: 0.4,  volume: 0.25 },
  star1:        { waveform: 'sine',     frequency: 523,  duration: 0.35, volume: 0.35 },
  star2:        { waveform: 'sine',     frequency: 659,  duration: 0.35, volume: 0.35 },
  star3:        { waveform: 'sine',     frequency: 784,  duration: 0.35, volume: 0.35 },
  celebration:  { waveform: 'triangle', frequency: 1047, duration: 0.6,  volume: 0.3 },
  nodeComplete: { waveform: 'sine',     frequency: 700,  duration: 0.25, volume: 0.35 },
}

let audioCtx: AudioContext | null = null
const activeTimeouts: ReturnType<typeof setTimeout>[] = []
const activeOscillators: OscillatorNode[] = []

export function initAudioContext(): void {
  if (!audioCtx && typeof AudioContext !== 'undefined') {
    audioCtx = new AudioContext()
  }
}

export function getAudioContext(): AudioContext | null {
  return audioCtx
}

export function isMuted(): boolean {
  return localStorage.getItem(MUTE_KEY) === 'true'
}

export function setMuted(muted: boolean): void {
  localStorage.setItem(MUTE_KEY, String(muted))
}

export function playSound(type: SoundType): void {
  if (isMuted() || !audioCtx) return

  const config = SOUND_CONFIGS[type]
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()

  osc.type = config.waveform
  osc.frequency.value = config.frequency

  osc.connect(gain)
  gain.connect(audioCtx.destination)

  const now = audioCtx.currentTime
  gain.gain.setValueAtTime(config.volume, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + config.duration)

  osc.start(now)
  osc.stop(now + config.duration)

  activeOscillators.push(osc)
  osc.onended = () => {
    const idx = activeOscillators.indexOf(osc)
    if (idx >= 0) activeOscillators.splice(idx, 1)
    osc.disconnect()
    gain.disconnect()
  }
}

export function scheduleTimeout(fn: () => void, ms: number): ReturnType<typeof setTimeout> {
  const id = setTimeout(() => {
    const idx = activeTimeouts.indexOf(id)
    if (idx >= 0) activeTimeouts.splice(idx, 1)
    fn()
  }, ms)
  activeTimeouts.push(id)
  return id
}

export function cleanup(): void {
  for (const id of activeTimeouts) clearTimeout(id)
  activeTimeouts.length = 0

  for (const osc of activeOscillators) {
    try { osc.stop() } catch { /* already stopped */ }
    osc.disconnect()
  }
  activeOscillators.length = 0
}

// ── Ambient soundscape ──

export type AmbientScene = 'map' | 'quiz'

const AMBIENT_GAINS: Record<AmbientScene, number> = {
  map: 0.08,
  quiz: 0.03,
}

const CROSSFADE_MS = 500

let ambientSource: AudioBufferSourceNode | null = null
let ambientGain: GainNode | null = null
let ambientFilter: BiquadFilterNode | null = null
let currentScene: AmbientScene | null = null

function createNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const sampleRate = ctx.sampleRate
  const length = sampleRate * 2 // 2 seconds of noise, looped
  const buffer = ctx.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1
  }
  return buffer
}

export function startAmbient(scene: AmbientScene): void {
  if (!audioCtx) return

  const targetGain = isMuted() ? 0 : AMBIENT_GAINS[scene]

  if (ambientSource && ambientGain && ambientFilter) {
    // Cross-fade to new scene gain and filter
    const now = audioCtx.currentTime
    ambientGain.gain.cancelScheduledValues(now)
    ambientGain.gain.setValueAtTime(ambientGain.gain.value, now)
    ambientGain.gain.linearRampToValueAtTime(targetGain, now + CROSSFADE_MS / 1000)
    ambientFilter.frequency.setValueAtTime(ambientFilter.frequency.value, now)
    ambientFilter.frequency.linearRampToValueAtTime(scene === 'map' ? 800 : 400, now + CROSSFADE_MS / 1000)
    currentScene = scene
    return
  }

  // Create new ambient chain
  const noiseBuffer = createNoiseBuffer(audioCtx)
  ambientSource = audioCtx.createBufferSource()
  ambientSource.buffer = noiseBuffer
  ambientSource.loop = true

  ambientFilter = audioCtx.createBiquadFilter()
  ambientFilter.type = 'lowpass'
  ambientFilter.frequency.value = scene === 'map' ? 800 : 400

  ambientGain = audioCtx.createGain()
  ambientGain.gain.value = 0

  ambientSource.connect(ambientFilter)
  ambientFilter.connect(ambientGain)
  ambientGain.connect(audioCtx.destination)

  ambientSource.start()

  // Fade in
  const now = audioCtx.currentTime
  ambientGain.gain.setValueAtTime(0, now)
  ambientGain.gain.linearRampToValueAtTime(targetGain, now + CROSSFADE_MS / 1000)

  currentScene = scene
}

export function stopAmbient(): void {
  if (!ambientSource || !ambientGain || !audioCtx) return

  const now = audioCtx.currentTime
  ambientGain.gain.cancelScheduledValues(now)
  ambientGain.gain.setValueAtTime(ambientGain.gain.value, now)
  ambientGain.gain.linearRampToValueAtTime(0, now + CROSSFADE_MS / 1000)

  const src = ambientSource
  const gain = ambientGain
  const filter = ambientFilter
  const id = setTimeout(() => {
    try { src.stop() } catch { /* already stopped */ }
    src.disconnect()
    gain.disconnect()
    filter?.disconnect()
    const idx = activeTimeouts.indexOf(id)
    if (idx >= 0) activeTimeouts.splice(idx, 1)
  }, CROSSFADE_MS + 50)
  activeTimeouts.push(id)

  ambientSource = null
  ambientGain = null
  ambientFilter = null
  currentScene = null
}

export function updateAmbientMute(muted: boolean): void {
  if (!ambientGain || !audioCtx || !currentScene) return
  const now = audioCtx.currentTime
  const targetGain = muted ? 0 : AMBIENT_GAINS[currentScene]
  ambientGain.gain.cancelScheduledValues(now)
  ambientGain.gain.setValueAtTime(ambientGain.gain.value, now)
  ambientGain.gain.linearRampToValueAtTime(targetGain, now + 0.1)
}

export function getAmbientGainValue(): number {
  return ambientGain?.gain.value ?? 0
}

/** Reset module state — for testing only. */
export function _resetForTest(): void {
  stopAmbient()
  cleanup()
  audioCtx = null
}
