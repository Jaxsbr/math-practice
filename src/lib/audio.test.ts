import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  initAudioContext,
  getAudioContext,
  playSound,
  setMuted,
  isMuted,
  cleanup,
  scheduleTimeout,
  startAmbient,
  stopAmbient,
  updateAmbientMute,
  _resetForTest,
} from './audio'
import type { SoundType } from './audio'

// Minimal AudioContext mock
function createMockGainNode() {
  return {
    gain: {
      value: 0,
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(function (this: { value: number }, v: number) { this.value = v }),
      cancelScheduledValues: vi.fn(),
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }
}

function createMockAudioContext() {
  const mockOscillator = {
    type: 'sine' as OscillatorType,
    frequency: { value: 0 },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    disconnect: vi.fn(),
    onended: null as (() => void) | null,
  }

  const mockBufferSource = {
    buffer: null as AudioBuffer | null,
    loop: false,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    disconnect: vi.fn(),
  }

  const mockFilter = {
    type: 'lowpass' as BiquadFilterType,
    frequency: {
      value: 0,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }

  const mockBuffer = {
    getChannelData: vi.fn(() => new Float32Array(44100 * 2)),
  }

  const ctx = {
    currentTime: 0,
    sampleRate: 44100,
    destination: {},
    createOscillator: vi.fn(() => ({ ...mockOscillator })),
    createGain: vi.fn(() => createMockGainNode()),
    createBufferSource: vi.fn(() => ({ ...mockBufferSource })),
    createBiquadFilter: vi.fn(() => ({ ...mockFilter, frequency: { ...mockFilter.frequency } })),
    createBuffer: vi.fn(() => ({ ...mockBuffer })),
  }

  return ctx
}

describe('audio', () => {
  let mockCtx: ReturnType<typeof createMockAudioContext>

  beforeEach(() => {
    localStorage.clear()
    _resetForTest()

    mockCtx = createMockAudioContext()
    vi.stubGlobal('AudioContext', function MockAudioContext() {
      return mockCtx
    })
  })

  describe('initAudioContext', () => {
    it('creates AudioContext on first call', () => {
      initAudioContext()
      expect(getAudioContext()).not.toBeNull()
    })

    it('does not create a second AudioContext on repeated calls', () => {
      initAudioContext()
      const first = getAudioContext()
      initAudioContext()
      expect(getAudioContext()).toBe(first)
    })
  })

  describe('mute control', () => {
    it('defaults to not muted', () => {
      expect(isMuted()).toBe(false)
    })

    it('persists mute state in localStorage', () => {
      setMuted(true)
      expect(localStorage.getItem('math-practice:audio-muted')).toBe('true')
      expect(isMuted()).toBe(true)
    })

    it('persists unmute state', () => {
      setMuted(true)
      setMuted(false)
      expect(isMuted()).toBe(false)
    })
  })

  describe('playSound', () => {
    it('creates oscillator and gain node when not muted', () => {
      initAudioContext()
      playSound('correct')
      expect(mockCtx.createOscillator).toHaveBeenCalledOnce()
      expect(mockCtx.createGain).toHaveBeenCalledOnce()
    })

    it('does not create oscillator when muted', () => {
      initAudioContext()
      setMuted(true)
      playSound('correct')
      expect(mockCtx.createOscillator).not.toHaveBeenCalled()
    })

    it('does not create oscillator when AudioContext not initialized', () => {
      playSound('correct')
      // No error thrown, no oscillator created
      expect(mockCtx.createOscillator).not.toHaveBeenCalled()
    })

    it('plays all sound types without error', () => {
      initAudioContext()
      const types: SoundType[] = [
        'correct', 'incorrect', 'star1', 'star2', 'star3', 'celebration', 'nodeComplete',
      ]
      for (const type of types) {
        expect(() => playSound(type)).not.toThrow()
      }
    })
  })

  describe('cleanup', () => {
    it('stops active oscillators', () => {
      initAudioContext()
      playSound('correct')
      const osc = mockCtx.createOscillator.mock.results[0].value
      cleanup()
      expect(osc.stop).toHaveBeenCalled()
      expect(osc.disconnect).toHaveBeenCalled()
    })

    it('clears scheduled timeouts', () => {
      vi.useFakeTimers()
      const fn = vi.fn()
      scheduleTimeout(fn, 1000)
      cleanup()
      vi.advanceTimersByTime(1500)
      expect(fn).not.toHaveBeenCalled()
      vi.useRealTimers()
    })
  })

  describe('scheduleTimeout', () => {
    it('executes callback after delay', async () => {
      vi.useFakeTimers()
      const fn = vi.fn()
      scheduleTimeout(fn, 100)
      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledOnce()
      vi.useRealTimers()
    })

    it('is cancelled by cleanup', () => {
      vi.useFakeTimers()
      const fn = vi.fn()
      scheduleTimeout(fn, 100)
      cleanup()
      vi.advanceTimersByTime(200)
      expect(fn).not.toHaveBeenCalled()
      vi.useRealTimers()
    })
  })

  describe('ambient', () => {
    it('creates buffer source, filter, and gain when starting ambient', () => {
      initAudioContext()
      startAmbient('map')
      expect(mockCtx.createBufferSource).toHaveBeenCalledOnce()
      expect(mockCtx.createBiquadFilter).toHaveBeenCalledOnce()
      // createGain called for ambient gain node
      expect(mockCtx.createGain).toHaveBeenCalled()
    })

    it('ambient gain is greater than 0 when not muted', () => {
      initAudioContext()
      startAmbient('map')
      // linearRampToValueAtTime sets the target gain
      const gainNode = mockCtx.createGain.mock.results[0].value
      expect(gainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
      )
      const targetGain = gainNode.gain.linearRampToValueAtTime.mock.calls[0][0]
      expect(targetGain).toBeGreaterThan(0)
    })

    it('ambient gain target is 0 when muted', () => {
      initAudioContext()
      setMuted(true)
      startAmbient('map')
      const gainNode = mockCtx.createGain.mock.results[0].value
      const targetGain = gainNode.gain.linearRampToValueAtTime.mock.calls[0][0]
      expect(targetGain).toBe(0)
    })

    it('quiz scene has lower gain than map scene', () => {
      initAudioContext()
      startAmbient('map')
      const mapGainNode = mockCtx.createGain.mock.results[0].value
      const mapTarget = mapGainNode.gain.linearRampToValueAtTime.mock.calls[0][0]

      _resetForTest()
      mockCtx = createMockAudioContext()
      vi.stubGlobal('AudioContext', function MockAudioContext() {
        return mockCtx
      })

      initAudioContext()
      startAmbient('quiz')
      const quizGainNode = mockCtx.createGain.mock.results[0].value
      const quizTarget = quizGainNode.gain.linearRampToValueAtTime.mock.calls[0][0]

      expect(quizTarget).toBeLessThan(mapTarget)
    })

    it('does not start ambient before AudioContext is initialized', () => {
      startAmbient('map')
      expect(mockCtx.createBufferSource).not.toHaveBeenCalled()
    })

    it('stopAmbient stops the source after fade-out', () => {
      vi.useFakeTimers()
      initAudioContext()
      startAmbient('map')
      const src = mockCtx.createBufferSource.mock.results[0].value
      stopAmbient()
      vi.advanceTimersByTime(600)
      expect(src.stop).toHaveBeenCalled()
      expect(src.disconnect).toHaveBeenCalled()
      vi.useRealTimers()
    })

    it('updateAmbientMute sets gain to 0 when muting', () => {
      initAudioContext()
      startAmbient('map')
      const gainNode = mockCtx.createGain.mock.results[0].value
      updateAmbientMute(true)
      // Last call to linearRampToValueAtTime should target 0
      const calls = gainNode.gain.linearRampToValueAtTime.mock.calls
      const lastTarget = calls[calls.length - 1][0]
      expect(lastTarget).toBe(0)
    })
  })
})
