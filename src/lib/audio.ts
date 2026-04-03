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

/** Reset module state — for testing only. */
export function _resetForTest(): void {
  cleanup()
  audioCtx = null
}
