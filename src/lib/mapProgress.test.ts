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
  getMilestoneOperations,
} from './mapProgress'
import { getNode } from './challenges'

describe('mapProgress', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('loadMapProgress', () => {
    it('returns default progress with 6 starter nodes', () => {
      const progress = loadMapProgress()
      const keys = Object.keys(progress).sort()
      expect(keys).toEqual(['A1', 'D1', 'M1', 'N1', 'R1', 'S1'])
      for (const key of keys) {
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
      expect(Object.keys(progress).sort()).toEqual(['A1', 'D1', 'M1', 'N1', 'R1', 'S1'])
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
      expect(Object.keys(progress).sort()).toEqual(['A1', 'D1', 'M1', 'N1', 'R1', 'S1'])
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

    it('does not re-unlock already unlocked nodes', () => {
      const progress = {
        A1: { stars: 3, completed: true },
        A2: { stars: 1, completed: true },
      }
      const next = recordChallengeResult('A1', 2, progress)
      expect(next.A2).toEqual({ stars: 1, completed: true })
    })

    it('returns a new object (immutable)', () => {
      const progress = { A1: { stars: 0, completed: false } }
      const next = recordChallengeResult('A1', 2, progress)
      expect(next).not.toBe(progress)
    })
  })

  describe('milestone unlock (N-of-M gating)', () => {
    function buildTier2Progress(completedPrefixes: string[]) {
      const progress: Record<string, { stars: number; completed: boolean }> = {}
      for (const prefix of ['A', 'S', 'M', 'D', 'R', 'N']) {
        progress[`${prefix}1`] = { stars: 2, completed: true }
        progress[`${prefix}2`] = { stars: 0, completed: false }
      }
      for (const prefix of completedPrefixes) {
        progress[`${prefix}2`] = { stars: 2, completed: true }
      }
      return progress
    }

    it('does not unlock MS1 with zero tier-2 completions', () => {
      const progress = buildTier2Progress([])
      // Complete A2 (1 of 6) — not enough
      const next = recordChallengeResult('A2', 2, progress)
      expect(next.MS1).toBeUndefined()
    })

    it('does not unlock MS1 below threshold (3 of 6)', () => {
      const progress = buildTier2Progress(['A', 'S', 'M'])
      // 3 already done, complete D2 (4th) to verify at-threshold works
      // But first test: with only 3 + completing D2 we get 4 which IS threshold
      // Test below threshold: complete something that doesn't change count
      const next = recordChallengeResult('A2', 3, progress) // A2 already completed, just replay
      expect(next.MS1).toBeUndefined()
    })

    it('unlocks MS1 at threshold (4 of 6 tier-2 nodes)', () => {
      const progress = buildTier2Progress(['A', 'S', 'M'])
      // Complete D2 — now 4 of 6 = MILESTONE_REQUIRED
      const next = recordChallengeResult('D2', 2, progress)
      expect(next.MS1).toEqual({ stars: 0, completed: false })
    })

    it('unlocks MS1 above threshold (5 of 6 tier-2 nodes)', () => {
      const progress = buildTier2Progress(['A', 'S', 'M', 'D'])
      // Complete R2 — now 5 of 6, above threshold
      const next = recordChallengeResult('R2', 2, progress)
      expect(next.MS1).toEqual({ stars: 0, completed: false })
    })

    it('completing MS1 unlocks tier-3 nodes whose tier-2 is also completed', () => {
      const progress = buildTier2Progress(['A', 'S', 'M', 'D'])
      // First unlock MS1
      const withMS1 = recordChallengeResult('R2', 2, progress)
      expect(withMS1.MS1).toBeDefined()

      // Complete MS1 — should unlock A3, S3, M3, D3, R3 (if R2 completed)
      const afterMS1 = recordChallengeResult('MS1', 2, withMS1)
      expect(afterMS1.A3).toEqual({ stars: 0, completed: false })
      expect(afterMS1.S3).toEqual({ stars: 0, completed: false })
      expect(afterMS1.M3).toEqual({ stars: 0, completed: false })
      expect(afterMS1.D3).toEqual({ stars: 0, completed: false })
      expect(afterMS1.R3).toEqual({ stars: 0, completed: false })
      // N2 was not completed — N3 requires [N2, MS1], so N3 should NOT unlock
      expect(afterMS1.N3).toBeUndefined()
    })

    it('tier-3 unlocks when tier-2 is completed after MS1', () => {
      const progress = buildTier2Progress(['A', 'S', 'M', 'D'])
      const withMS1 = recordChallengeResult('R2', 2, progress)
      const afterMS1 = recordChallengeResult('MS1', 2, withMS1)
      // N3 was not unlocked because N2 wasn't complete
      expect(afterMS1.N3).toBeUndefined()

      // Now complete N2 — N3 should unlock (MS1 is already completed)
      const afterN2 = recordChallengeResult('N2', 2, afterMS1)
      expect(afterN2.N3).toEqual({ stars: 0, completed: false })
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

  describe('getMilestoneOperations', () => {
    it('returns only operations from completed prerequisite lanes', () => {
      const ms1 = getNode('MS1')
      const progress = {
        A1: { stars: 2, completed: true },
        A2: { stars: 2, completed: true },
        R1: { stars: 2, completed: true },
        R2: { stars: 2, completed: true },
        // Other tier-2 nodes not completed
      }
      const ops = getMilestoneOperations(ms1, progress)
      expect(ops.sort()).toEqual(['addition', 'rounding'])
    })

    it('returns all operations when all prerequisites completed', () => {
      const ms1 = getNode('MS1')
      const progress: Record<string, { stars: number; completed: boolean }> = {}
      for (const prefix of ['A', 'S', 'M', 'D', 'R', 'N']) {
        progress[`${prefix}2`] = { stars: 2, completed: true }
      }
      const ops = getMilestoneOperations(ms1, progress)
      expect(ops.sort()).toEqual([
        'addition', 'division', 'multiplication', 'number-challenge', 'rounding', 'subtraction',
      ])
    })

    it('falls back to all operations when no prerequisites completed', () => {
      const ms1 = getNode('MS1')
      const ops = getMilestoneOperations(ms1, {})
      expect(ops).toEqual(ms1.operations)
    })

    it('returns node operations as-is for non-milestone nodes', () => {
      const a1 = getNode('A1')
      const ops = getMilestoneOperations(a1, {})
      expect(ops).toEqual(['addition'])
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
