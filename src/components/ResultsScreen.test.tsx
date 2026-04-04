import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ResultsScreen } from './ResultsScreen'
import type { ChallengeNode, ChallengeResult } from '../types'

// Mock audio module
vi.mock('../lib/audio', () => ({
  playSound: vi.fn(),
  scheduleTimeout: (fn: () => void, ms: number) => setTimeout(fn, ms),
  cleanup: vi.fn(),
}))

const testNode: ChallengeNode = {
  id: 'A1',
  name: 'Pebble Path',
  type: 'single',
  operations: ['addition'],
  min: 1,
  max: 10,
  col: 0,
  row: 0,
  prerequisites: [],
  unlocks: ['A2'],
  timeTarget: 30,
}

describe('ResultsScreen star reveal', () => {
  it('renders 3 .star-reveal elements with distinct animation-delay values for a 3-star result', () => {
    const result: ChallengeResult = { correct: 5, total: 5, elapsedSeconds: 10, stars: 3 }
    const { container } = render(
      <ResultsScreen node={testNode} result={result} onBackToMap={() => {}} />,
    )

    const starElements = container.querySelectorAll('.star-reveal')
    expect(starElements).toHaveLength(3)

    const delays = Array.from(starElements).map(el =>
      (el as HTMLElement).style.animationDelay,
    )
    // All delays should be different
    const uniqueDelays = new Set(delays)
    expect(uniqueDelays.size).toBe(3)
  })

  it('disables Back to Map button initially', () => {
    const result: ChallengeResult = { correct: 5, total: 5, elapsedSeconds: 10, stars: 3 }
    const { container } = render(
      <ResultsScreen node={testNode} result={result} onBackToMap={() => {}} />,
    )

    const button = container.querySelector('.back-to-map-button') as HTMLButtonElement
    expect(button.disabled).toBe(true)
  })
})
