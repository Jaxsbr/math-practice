import { describe, it, expect } from 'vitest'
import { generateRoundingProblem } from './roundingGenerator'

describe('roundingGenerator', () => {
  it('rounds to nearest 10 correctly', () => {
    for (let i = 0; i < 20; i++) {
      const problem = generateRoundingProblem(10, 99, 10)
      expect(problem.operation).toBe('rounding')
      expect(problem.answer).toBe(Math.round(problem.operand1 / 10) * 10)
      expect(problem.display).toContain('Round')
      expect(problem.display).toContain('to the nearest 10')
    }
  })

  it('rounds to nearest 100 correctly', () => {
    for (let i = 0; i < 20; i++) {
      const problem = generateRoundingProblem(100, 999, 100)
      expect(problem.answer).toBe(Math.round(problem.operand1 / 100) * 100)
      expect(problem.display).toContain('to the nearest 100')
    }
  })

  it('rounds to nearest 1000 correctly', () => {
    for (let i = 0; i < 20; i++) {
      const problem = generateRoundingProblem(1000, 9999, 1000)
      expect(problem.answer).toBe(Math.round(problem.operand1 / 1000) * 1000)
    }
  })

  it('rounds to nearest 10000 correctly', () => {
    for (let i = 0; i < 20; i++) {
      const problem = generateRoundingProblem(10000, 99999, 10000)
      expect(problem.answer).toBe(Math.round(problem.operand1 / 10000) * 10000)
    }
  })

  it('applies ≥5 rounds up rule', () => {
    for (let i = 0; i < 100; i++) {
      const problem = generateRoundingProblem(10, 99, 10)
      const remainder = problem.operand1 % 10
      if (remainder >= 5) {
        expect(problem.answer).toBe(problem.operand1 - remainder + 10)
      } else {
        expect(problem.answer).toBe(problem.operand1 - remainder)
      }
    }
  })

  it('never produces trivial problems over 100 samples', () => {
    for (let i = 0; i < 100; i++) {
      const problem = generateRoundingProblem(10, 99, 10)
      expect(problem.operand1 % 10).not.toBe(0)
    }
  })

  it('infers rounding target when not specified', () => {
    for (let i = 0; i < 20; i++) {
      const problem = generateRoundingProblem(10, 99)
      expect(problem.operand2).toBe(10)
    }
    for (let i = 0; i < 20; i++) {
      const problem = generateRoundingProblem(100, 999)
      expect(problem.operand2).toBe(100)
    }
  })
})
