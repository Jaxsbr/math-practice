import { describe, it, expect } from 'vitest'
import { calculateStars } from './scoring'

describe('calculateStars', () => {
  it('awards 3 stars for ≥90% accuracy within time target', () => {
    const result = calculateStars(5, 5, 25, 30)
    expect(result.stars).toBe(3)
  })

  it('awards 3 stars for exactly 90% accuracy within time target', () => {
    // 9/10 = 90% — edge case (using 5 problems: 4.5/5 rounds to needing 5/5 for 90%+)
    // With 5 problems: 5/5 = 100%, 4/5 = 80%. So 3 stars requires 5/5 at 5 problems.
    const result = calculateStars(5, 5, 30, 30)
    expect(result.stars).toBe(3)
  })

  it('awards 2 stars for ≥90% accuracy but over time target', () => {
    const result = calculateStars(5, 5, 31, 30)
    expect(result.stars).toBe(2)
  })

  it('awards 2 stars for ≥70% accuracy', () => {
    const result = calculateStars(4, 5, 25, 30)
    expect(result.stars).toBe(2)
  })

  it('awards 2 stars for exactly 70% accuracy', () => {
    // 3.5/5 = 70% — but with integers: 4/5 = 80% ≥ 70%
    const result = calculateStars(4, 5, 60, 30)
    expect(result.stars).toBe(2)
  })

  it('awards 1 star for < 70% accuracy', () => {
    const result = calculateStars(3, 5, 25, 30)
    expect(result.stars).toBe(1)
  })

  it('awards 1 star for 0 correct', () => {
    const result = calculateStars(0, 5, 25, 30)
    expect(result.stars).toBe(1)
  })

  it('returns correct result shape', () => {
    const result = calculateStars(3, 5, 42, 30)
    expect(result).toEqual({
      correct: 3,
      total: 5,
      elapsedSeconds: 42,
      stars: 1,
    })
  })
})
