import type { DifficultyState } from '../types'

const STREAK_THRESHOLD = 3
const RANGE_STEP = 10
const FLOOR_MAX = 10
const CEILING_MAX = 100

export function updateDifficulty(state: DifficultyState, correct: boolean): DifficultyState {
  const newStreak = correct
    ? (state.streak >= 0 ? state.streak + 1 : 1)
    : (state.streak <= 0 ? state.streak - 1 : -1)

  const { min } = state
  let { max, level } = state

  if (newStreak >= STREAK_THRESHOLD) {
    // Increase difficulty
    const newMax = Math.min(max + RANGE_STEP, CEILING_MAX)
    if (newMax !== max) {
      max = newMax
      level = level + 1
    }
    return { min, max, streak: 0, level }
  }

  if (newStreak <= -STREAK_THRESHOLD) {
    // Decrease difficulty
    const newMax = Math.max(max - RANGE_STEP, FLOOR_MAX)
    if (newMax !== max) {
      max = newMax
      level = Math.max(level - 1, 1)
    }
    return { min, max, streak: 0, level }
  }

  return { min, max, streak: newStreak, level }
}

export { STREAK_THRESHOLD, RANGE_STEP, FLOOR_MAX, CEILING_MAX }
