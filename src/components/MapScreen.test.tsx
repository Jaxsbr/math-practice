import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MapScreen } from './MapScreen'
import type { MapProgress } from '../types'

// Mock audio module
vi.mock('../lib/audio', () => ({
  isMuted: () => false,
  setMuted: vi.fn(),
  playSound: vi.fn(),
}))

describe('MapScreen node animation classes', () => {
  it('renders completed node with .node-completed class', () => {
    const progress: MapProgress = {
      A1: { stars: 2, completed: true },
    }

    const { container } = render(
      <MapScreen
        progress={progress}
        activeProfile={null}
        justCompletedNodeId={null}
        onSelectChallenge={() => {}}
        onSwitchProfile={() => {}}
      />,
    )

    const completedNode = container.querySelector('.map-node.node-completed')
    expect(completedNode).not.toBeNull()
  })

  it('renders unlocked but incomplete node with .node-unlocked class', () => {
    // A1 is a starter node — must be in progress with 0 stars to be unlocked
    const progress: MapProgress = {
      A1: { stars: 0, completed: false },
    }

    const { container } = render(
      <MapScreen
        progress={progress}
        activeProfile={null}
        justCompletedNodeId={null}
        onSelectChallenge={() => {}}
        onSwitchProfile={() => {}}
      />,
    )

    const unlockedNode = container.querySelector('.map-node.node-unlocked')
    expect(unlockedNode).not.toBeNull()
  })
})
