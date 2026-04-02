import type { Problem } from '../types'

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** Infer rounding target from number's digit count: 2-digit → 10, 3-digit → 100, etc. */
function inferRoundingTarget(n: number): number {
  const digits = Math.floor(Math.log10(Math.abs(n))) + 1
  return Math.pow(10, digits - 1)
}

/**
 * Generate a rounding problem.
 * Ensures the number is not already a multiple of the rounding target (non-trivial).
 */
export function generateRoundingProblem(min: number, max: number, roundingTarget?: number): Problem {
  for (let attempt = 0; attempt < 100; attempt++) {
    const num = randomInt(min, max)
    const target = roundingTarget ?? inferRoundingTarget(num)

    // Skip trivial problems where the number is already a multiple of the target
    if (num % target === 0) continue

    const answer = Math.round(num / target) * target

    return {
      operand1: num,
      operand2: target,
      operation: 'rounding',
      answer,
      display: `Round ${num} to the nearest ${target}`,
    }
  }

  // Fallback: force a non-trivial number by offsetting from min
  const target = roundingTarget ?? 10
  const num = min % target === 0 ? min + 1 : min
  const answer = Math.round(num / target) * target
  return {
    operand1: num,
    operand2: target,
    operation: 'rounding',
    answer,
    display: `Round ${num} to the nearest ${target}`,
  }
}
