import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { QuizScreen } from './QuizScreen'
import type { ChallengeNode, MapProgress } from '../types'

// Mock audio module to avoid AudioContext in jsdom
vi.mock('../lib/audio', () => ({
  isMuted: () => false,
  setMuted: vi.fn(),
  playSound: vi.fn(),
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

const emptyProgress: MapProgress = {}

describe('QuizScreen feedback', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows data-feedback="correct" when answer is correct', () => {
    const onComplete = vi.fn()
    const onAbandon = vi.fn()

    render(
      <QuizScreen
        node={testNode}
        problemCount={5}
        progress={emptyProgress}
        activeProfile={null}
        onComplete={onComplete}
        onAbandon={onAbandon}
      />,
    )

    // Read the displayed problem to compute the correct answer
    const problemText = screen.getByText(/= \?/)
    const match = problemText.textContent?.match(/(\d+)\s*\+\s*(\d+)\s*=/)
    if (!match) throw new Error('Could not parse problem display')
    const correctAnswer = Number(match[1]) + Number(match[2])

    const input = screen.getByPlaceholderText('?')
    fireEvent.change(input, { target: { value: String(correctAnswer) } })
    fireEvent.click(screen.getByText('Go!'))

    expect(screen.getByText('Correct!')).toBeInTheDocument()
    const feedbackEl = document.querySelector('[data-feedback="correct"]')
    expect(feedbackEl).not.toBeNull()
  })

  it('shows data-feedback="incorrect" when answer is wrong', () => {
    const onComplete = vi.fn()
    const onAbandon = vi.fn()

    render(
      <QuizScreen
        node={testNode}
        problemCount={5}
        progress={emptyProgress}
        activeProfile={null}
        onComplete={onComplete}
        onAbandon={onAbandon}
      />,
    )

    // Submit a definitely wrong answer
    const input = screen.getByPlaceholderText('?')
    fireEvent.change(input, { target: { value: '999' } })
    fireEvent.click(screen.getByText('Go!'))

    const feedbackEl = document.querySelector('[data-feedback="incorrect"]')
    expect(feedbackEl).not.toBeNull()
  })
})
