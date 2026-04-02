import { describe, it, expect } from 'vitest'
import { updateDifficulty, FLOOR_MAX, CEILING_MAX } from './adaptive'
import type { DifficultyState } from '../types'

function applyCorrectStreak(state: DifficultyState, count: number): DifficultyState {
  let s = state
  for (let i = 0; i < count; i++) {
    s = updateDifficulty(s, true)
  }
  return s
}

function applyIncorrectStreak(state: DifficultyState, count: number): DifficultyState {
  let s = state
  for (let i = 0; i < count; i++) {
    s = updateDifficulty(s, false)
  }
  return s
}

describe('adaptive difficulty', () => {
  const initial: DifficultyState = { min: 1, max: 10, streak: 0, level: 1 }

  it('increases range after 3 consecutive correct answers', () => {
    const result = applyCorrectStreak(initial, 3)
    expect(result.max).toBe(20)
    expect(result.level).toBe(2)
    expect(result.streak).toBe(0)
  })

  it('decreases range after 3 consecutive incorrect answers', () => {
    const state: DifficultyState = { min: 1, max: 30, streak: 0, level: 3 }
    const result = applyIncorrectStreak(state, 3)
    expect(result.max).toBe(20)
    expect(result.level).toBe(2)
    expect(result.streak).toBe(0)
  })

  it('never goes below the floor', () => {
    const result = applyIncorrectStreak(initial, 3)
    expect(result.max).toBe(FLOOR_MAX)
    expect(result.level).toBe(1)
  })

  it('never goes above the ceiling', () => {
    const state: DifficultyState = { min: 1, max: CEILING_MAX, streak: 0, level: 10 }
    const result = applyCorrectStreak(state, 3)
    expect(result.max).toBe(CEILING_MAX)
    expect(result.level).toBe(10)
  })

  it('resets streak on direction change', () => {
    let state = updateDifficulty(initial, true)
    expect(state.streak).toBe(1)
    state = updateDifficulty(state, true)
    expect(state.streak).toBe(2)
    state = updateDifficulty(state, false)
    expect(state.streak).toBe(-1)
  })

  it('handles multiple level-ups', () => {
    let state = initial
    state = applyCorrectStreak(state, 3) // level 2, max 20
    state = applyCorrectStreak(state, 3) // level 3, max 30
    state = applyCorrectStreak(state, 3) // level 4, max 40
    expect(state.max).toBe(40)
    expect(state.level).toBe(4)
  })
})
