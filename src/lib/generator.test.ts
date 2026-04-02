import { describe, it, expect } from 'vitest'
import { generateProblem } from './generator'
import type { GeneratorConfig, Operation } from '../types'

describe('generateProblem', () => {
  const allOperations: Operation[] = ['addition', 'subtraction', 'multiplication', 'division']

  it('generates addition problems', () => {
    const config: GeneratorConfig = { operations: ['addition'], min: 1, max: 10 }
    for (let i = 0; i < 20; i++) {
      const problem = generateProblem(config)
      expect(problem.operation).toBe('addition')
      expect(problem.answer).toBe(problem.operand1 + problem.operand2)
      expect(problem.display).toContain('+')
    }
  })

  it('generates subtraction problems', () => {
    const config: GeneratorConfig = { operations: ['subtraction'], min: 1, max: 10 }
    for (let i = 0; i < 20; i++) {
      const problem = generateProblem(config)
      expect(problem.operation).toBe('subtraction')
      expect(problem.answer).toBe(problem.operand1 - problem.operand2)
      expect(problem.answer).toBeGreaterThanOrEqual(0)
    }
  })

  it('generates multiplication problems', () => {
    const config: GeneratorConfig = { operations: ['multiplication'], min: 1, max: 10 }
    for (let i = 0; i < 20; i++) {
      const problem = generateProblem(config)
      expect(problem.operation).toBe('multiplication')
      expect(problem.answer).toBe(problem.operand1 * problem.operand2)
    }
  })

  it('generates division problems with integer results', () => {
    const config: GeneratorConfig = { operations: ['division'], min: 1, max: 10 }
    for (let i = 0; i < 30; i++) {
      const problem = generateProblem(config)
      expect(problem.operation).toBe('division')
      expect(problem.answer % 1).toBe(0)
      expect(problem.operand1 / problem.operand2).toBe(problem.answer)
    }
  })

  it('respects configurable number range', () => {
    const config: GeneratorConfig = { operations: ['addition'], min: 5, max: 15 }
    for (let i = 0; i < 20; i++) {
      const problem = generateProblem(config)
      expect(problem.operand1).toBeGreaterThanOrEqual(5)
      expect(problem.operand1).toBeLessThanOrEqual(15)
      expect(problem.operand2).toBeGreaterThanOrEqual(5)
      expect(problem.operand2).toBeLessThanOrEqual(15)
    }
  })

  it('respects configurable operation subset', () => {
    const subset: Operation[] = ['addition', 'multiplication']
    const config: GeneratorConfig = { operations: subset, min: 1, max: 10 }
    for (let i = 0; i < 50; i++) {
      const problem = generateProblem(config)
      expect(subset).toContain(problem.operation)
    }
  })

  it('produces all 4 operations when all are selected', () => {
    const config: GeneratorConfig = { operations: allOperations, min: 1, max: 10 }
    const seen = new Set<Operation>()
    for (let i = 0; i < 200; i++) {
      seen.add(generateProblem(config).operation)
    }
    expect(seen.size).toBe(4)
  })

  it('throws when no operations are provided', () => {
    const config: GeneratorConfig = { operations: [], min: 1, max: 10 }
    expect(() => generateProblem(config)).toThrow('At least one operation must be selected')
  })
})
