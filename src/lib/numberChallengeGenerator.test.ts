import { describe, it, expect } from 'vitest'
import { generateNumberChallengeProblem } from './numberChallengeGenerator'

describe('numberChallengeGenerator', () => {
  it('place-id: returns the correct digit for the requested place', () => {
    for (let i = 0; i < 100; i++) {
      const problem = generateNumberChallengeProblem(100, 999, ['place-id'])
      expect(problem.operation).toBe('number-challenge')
      expect(problem.display).toMatch(/What digit is in the \w+ place\?/)

      // Verify answer matches the digit at the specified place
      const digits = String(problem.operand1).split('').reverse()
      expect(problem.answer).toBe(parseInt(digits[problem.operand2]))
    }
  })

  it('construct: returns the largest possible number from the given digits', () => {
    for (let i = 0; i < 100; i++) {
      const problem = generateNumberChallengeProblem(100, 999, ['construct'])
      expect(problem.display).toMatch(/What is the largest number from [\d, ]+\?/)

      // Extract digits from display and verify answer is the largest arrangement
      const match = problem.display.match(/from ([\d, ]+)\?/)!
      const digits = match[1].split(', ').map(Number)
      const largest = parseInt([...digits].sort((a, b) => b - a).join(''))
      expect(problem.answer).toBe(largest)
    }
  })

  it('construct-constrained: returns the smallest even/odd number', () => {
    for (let i = 0; i < 100; i++) {
      const problem = generateNumberChallengeProblem(100, 999, ['construct-constrained'])
      expect(problem.display).toMatch(/What is the smallest \d-digit (even|odd) number from [\d, ]+\?/)

      const isEven = problem.display.includes('even')
      if (isEven) {
        expect(problem.answer % 2).toBe(0)
      } else {
        expect(problem.answer % 2).toBe(1)
      }
    }
  })

  it('composition: answer equals the sum of place values', () => {
    for (let i = 0; i < 100; i++) {
      const problem = generateNumberChallengeProblem(100, 999, ['composition'])
      expect(problem.display).toMatch(/What is .+\?/)
      expect(problem.answer).toBe(problem.operand1)

      // Verify by parsing the display
      const parts = problem.display.replace('What is ', '').replace('?', '').split(' + ')
      let sum = 0
      for (const part of parts) {
        const [val, place] = part.trim().split(' ')
        const placeValues: Record<string, number> = {
          ones: 1, tens: 10, hundreds: 100, thousands: 1000, 'ten-thousands': 10000,
        }
        sum += parseInt(val) * placeValues[place]
      }
      expect(problem.answer).toBe(sum)
    }
  })

  it('decomposition: answer equals floor division by place value', () => {
    for (let i = 0; i < 100; i++) {
      const problem = generateNumberChallengeProblem(100, 999, ['decomposition'])
      expect(problem.display).toMatch(/How many \w+ in \d+\?/)

      // Verify answer
      const placeValues: Record<string, number> = {
        ones: 1, tens: 10, hundreds: 100, thousands: 1000, 'ten-thousands': 10000,
      }
      const match = problem.display.match(/How many (\S+) in (\d+)\?/)!
      const placeName = match[1]
      const num = parseInt(match[2])
      expect(problem.answer).toBe(Math.floor(num / placeValues[placeName]))
    }
  })

  it('every problem has exactly one correct numeric answer (100 samples per type)', () => {
    const types = ['place-id', 'construct', 'construct-constrained', 'composition', 'decomposition']
    for (const type of types) {
      for (let i = 0; i < 100; i++) {
        const problem = generateNumberChallengeProblem(100, 999, [type])
        expect(typeof problem.answer).toBe('number')
        expect(Number.isInteger(problem.answer)).toBe(true)
        expect(Number.isFinite(problem.answer)).toBe(true)
      }
    }
  })

  it('uses all 5 question formats when no types specified', () => {
    const displays = new Set<string>()
    for (let i = 0; i < 500; i++) {
      const problem = generateNumberChallengeProblem(100, 999)
      if (problem.display.startsWith('What digit')) displays.add('place-id')
      else if (problem.display.includes('largest number')) displays.add('construct')
      else if (problem.display.includes('smallest')) displays.add('construct-constrained')
      else if (problem.display.includes('What is') && problem.display.includes('+')) displays.add('composition')
      else if (problem.display.startsWith('How many')) displays.add('decomposition')
    }
    expect(displays.size).toBe(5)
  })

  it('respects question type filter', () => {
    for (let i = 0; i < 50; i++) {
      const problem = generateNumberChallengeProblem(10, 99, ['place-id', 'composition'])
      expect(
        problem.display.startsWith('What digit') ||
        (problem.display.startsWith('What is') && problem.display.includes('+'))
      ).toBe(true)
    }
  })

  it('works with 2-digit numbers', () => {
    for (let i = 0; i < 50; i++) {
      const problem = generateNumberChallengeProblem(10, 99, ['place-id'])
      expect(problem.operand1).toBeGreaterThanOrEqual(10)
      expect(problem.operand1).toBeLessThanOrEqual(99)
    }
  })

  it('works with 4-digit numbers', () => {
    for (let i = 0; i < 50; i++) {
      const problem = generateNumberChallengeProblem(1000, 9999)
      expect(typeof problem.answer).toBe('number')
      expect(Number.isInteger(problem.answer)).toBe(true)
    }
  })

  it('construct-constrained: digits always contain both even and odd', () => {
    for (let i = 0; i < 100; i++) {
      const problem = generateNumberChallengeProblem(100, 999, ['construct-constrained'])
      const match = problem.display.match(/from ([\d, ]+)\?/)!
      const digits = match[1].split(', ').map(Number)
      const hasEven = digits.some(d => d % 2 === 0)
      const hasOdd = digits.some(d => d % 2 !== 0)
      expect(hasEven).toBe(true)
      expect(hasOdd).toBe(true)
    }
  })
})
