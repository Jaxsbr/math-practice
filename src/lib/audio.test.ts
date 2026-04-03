import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  initAudioContext,
  getAudioContext,
  playSound,
  setMuted,
  isMuted,
  cleanup,
  scheduleTimeout,
  _resetForTest,
} from './audio'
import type { SoundType } from './audio'

// Minimal AudioContext mock
function createMockAudioContext() {
  const mockGainNode = {
    gain: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }

  const mockOscillator = {
    type: 'sine' as OscillatorType,
    frequency: { value: 0 },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    disconnect: vi.fn(),
    onended: null as (() => void) | null,
  }

  const ctx = {
    currentTime: 0,
    destination: {},
    createOscillator: vi.fn(() => ({ ...mockOscillator })),
    createGain: vi.fn(() => ({
      ...mockGainNode,
      gain: { ...mockGainNode.gain },
    })),
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
})
