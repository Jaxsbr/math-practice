import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadMapProgress,
  saveMapProgress,
  clearMapProgress,
  isNodeUnlocked,
  isNodeCompleted,
  recordChallengeResult,
  getFrontierNodeId,
  getNodeProgress,
} from './mapProgress'

describe('mapProgress', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('loadMapProgress', () => {
    it('returns default progress with 4 starter nodes', () => {
      const progress = loadMapProgress()
      expect(Object.keys(progress)).toEqual(['A1', 'S1', 'M1', 'D1'])
      for (const key of Object.keys(progress)) {
        expect(progress[key]).toEqual({ stars: 0, completed: false })
      }
    })

    it('loads saved progress from localStorage', () => {
      const saved = { A1: { stars: 3, completed: true }, S1: { stars: 0, completed: false } }
      localStorage.setItem('math-practice:map-progress', JSON.stringify(saved))
      const progress = loadMapProgress()
      expect(progress).toEqual(saved)
    })

    it('returns default on corrupted localStorage', () => {
      localStorage.setItem('math-practice:map-progress', '{invalid')
      const progress = loadMapProgress()
      expect(Object.keys(progress)).toEqual(['A1', 'S1', 'M1', 'D1'])
    })
  })

  describe('saveMapProgress / clearMapProgress', () => {
    it('round-trips through localStorage', () => {
      const data = { A1: { stars: 2, completed: true } }
      saveMapProgress(data)
      expect(loadMapProgress()).toEqual(data)
    })

    it('clearMapProgress removes saved data', () => {
      saveMapProgress({ A1: { stars: 2, completed: true } })
      clearMapProgress()
      const progress = loadMapProgress()
      expect(Object.keys(progress)).toEqual(['A1', 'S1', 'M1', 'D1'])
    })
  })

  describe('isNodeUnlocked', () => {
    it('returns true for nodes present in progress', () => {
      const progress = { A1: { stars: 0, completed: false } }
      expect(isNodeUnlocked('A1', progress)).toBe(true)
    })

    it('returns false for nodes not in progress', () => {
      const progress = { A1: { stars: 0, completed: false } }
      expect(isNodeUnlocked('A2', progress)).toBe(false)
    })
  })

  describe('isNodeCompleted', () => {
    it('returns true for completed nodes with stars', () => {
      const progress = { A1: { stars: 2, completed: true } }
      expect(isNodeCompleted('A1', progress)).toBe(true)
    })

    it('returns false for unlocked but incomplete nodes', () => {
      const progress = { A1: { stars: 0, completed: false } }
      expect(isNodeCompleted('A1', progress)).toBe(false)
    })

    it('returns false for absent nodes', () => {
      expect(isNodeCompleted('A1', {})).toBe(false)
    })
  })

  describe('recordChallengeResult', () => {
    it('marks node as completed with stars', () => {
      const progress = { A1: { stars: 0, completed: false } }
      const next = recordChallengeResult('A1', 2, progress)
      expect(next.A1).toEqual({ stars: 2, completed: true })
    })

    it('keeps higher star rating on replay', () => {
      const progress = { A1: { stars: 3, completed: true } }
      const next = recordChallengeResult('A1', 1, progress)
      expect(next.A1.stars).toBe(3)
    })

    it('upgrades star rating on better replay', () => {
      const progress = { A1: { stars: 1, completed: true } }
      const next = recordChallengeResult('A1', 3, progress)
      expect(next.A1.stars).toBe(3)
    })

    it('unlocks next node when prerequisites met (single path)', () => {
      const progress = { A1: { stars: 0, completed: false } }
      const next = recordChallengeResult('A1', 2, progress)
      expect(next.A2).toEqual({ stars: 0, completed: false })
    })

    it('does not unlock convergence node until both prerequisites met', () => {
      // Complete A2 only — C1 needs both A2 and S2
      const progress = {
        A1: { stars: 2, completed: true },
        S1: { stars: 2, completed: true },
        A2: { stars: 0, completed: false },
        S2: { stars: 0, completed: false },
      }
      const afterA2 = recordChallengeResult('A2', 2, progress)
      expect(afterA2.C1).toBeUndefined() // S2 not complete yet

      // Now complete S2 — C1 should unlock
      const afterS2 = recordChallengeResult('S2', 1, afterA2)
      expect(afterS2.C1).toEqual({ stars: 0, completed: false })
    })

    it('convergence completion unlocks nodes on both paths', () => {
      const progress = {
        A1: { stars: 2, completed: true },
        A2: { stars: 2, completed: true },
        S1: { stars: 2, completed: true },
        S2: { stars: 2, completed: true },
        C1: { stars: 0, completed: false },
      }
      const next = recordChallengeResult('C1', 2, progress)
      expect(next.A3).toEqual({ stars: 0, completed: false })
      expect(next.S3).toEqual({ stars: 0, completed: false })
    })

    it('does not re-unlock already unlocked nodes', () => {
      const progress = {
        A1: { stars: 3, completed: true },
        A2: { stars: 1, completed: true },
      }
      const next = recordChallengeResult('A1', 2, progress)
      // A2 was already unlocked with 1 star — should not be reset
      expect(next.A2).toEqual({ stars: 1, completed: true })
    })

    it('returns a new object (immutable)', () => {
      const progress = { A1: { stars: 0, completed: false } }
      const next = recordChallengeResult('A1', 2, progress)
      expect(next).not.toBe(progress)
    })
  })

  describe('getFrontierNodeId', () => {
    it('returns the first unlocked incomplete node on a path', () => {
      const progress = { A1: { stars: 0, completed: false } }
      expect(getFrontierNodeId('A', progress)).toBe('A1')
    })

    it('returns furthest unlocked incomplete node', () => {
      const progress = {
        A1: { stars: 2, completed: true },
        A2: { stars: 0, completed: false },
      }
      expect(getFrontierNodeId('A', progress)).toBe('A2')
    })

    it('returns null when all path nodes are completed', () => {
      const progress = {
        A1: { stars: 3, completed: true },
        A2: { stars: 3, completed: true },
        A3: { stars: 3, completed: true },
        A4: { stars: 3, completed: true },
        A5: { stars: 3, completed: true },
      }
      expect(getFrontierNodeId('A', progress)).toBeNull()
    })

    it('returns null for path with no unlocked nodes', () => {
      expect(getFrontierNodeId('A', {})).toBeNull()
    })
  })

  describe('getNodeProgress', () => {
    it('returns progress for existing node', () => {
      const progress = { A1: { stars: 2, completed: true } }
      expect(getNodeProgress('A1', progress)).toEqual({ stars: 2, completed: true })
    })

    it('returns default for absent node', () => {
      expect(getNodeProgress('A1', {})).toEqual({ stars: 0, completed: false })
    })
  })
})
