import { describe, it, expect } from 'vitest'
import { CHALLENGE_NODES, getNode, getStarterNodes, PROBLEMS_PER_CHALLENGE } from './challenges'

describe('CHALLENGE_NODES', () => {
  it('has 22 total nodes (4 paths x 5 + 2 convergence)', () => {
    expect(CHALLENGE_NODES).toHaveLength(22)
  })

  it('has exactly 5 nodes per single-operation path', () => {
    for (const prefix of ['A', 'S', 'M', 'D']) {
      const pathNodes = CHALLENGE_NODES.filter(n => n.id.startsWith(prefix) && n.type === 'single')
      expect(pathNodes).toHaveLength(5)
    }
  })

  it('has exactly 2 convergence nodes', () => {
    const convergence = CHALLENGE_NODES.filter(n => n.type === 'convergence')
    expect(convergence).toHaveLength(2)
  })

  it('convergence nodes have multiple operation types', () => {
    const convergence = CHALLENGE_NODES.filter(n => n.type === 'convergence')
    for (const node of convergence) {
      expect(node.operations.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('every node has a unique id', () => {
    const ids = CHALLENGE_NODES.map(n => n.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every node has a unique name', () => {
    const names = CHALLENGE_NODES.map(n => n.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('progressive difficulty — each path node has increasing max', () => {
    for (const prefix of ['A', 'S', 'M', 'D']) {
      const pathNodes = CHALLENGE_NODES
        .filter(n => n.id.startsWith(prefix) && n.type === 'single')
        .sort((a, b) => a.row - b.row)
      for (let i = 1; i < pathNodes.length; i++) {
        expect(pathNodes[i].max).toBeGreaterThan(pathNodes[i - 1].max)
      }
    }
  })

  it('difficulty progression matches spec: 10, 20, 30, 40, 50', () => {
    for (const prefix of ['A', 'S', 'M', 'D']) {
      const maxes = CHALLENGE_NODES
        .filter(n => n.id.startsWith(prefix) && n.type === 'single')
        .sort((a, b) => a.row - b.row)
        .map(n => n.max)
      expect(maxes).toEqual([10, 20, 30, 40, 50])
    }
  })

  it('convergence nodes use max of adjacent path difficulties', () => {
    const c1 = getNode('C1')
    const a2 = getNode('A2')
    const s2 = getNode('S2')
    expect(c1.max).toBe(Math.max(a2.max, s2.max))

    const c2 = getNode('C2')
    const m2 = getNode('M2')
    const d2 = getNode('D2')
    expect(c2.max).toBe(Math.max(m2.max, d2.max))
  })

  it('all prerequisite references are valid node IDs', () => {
    const ids = new Set(CHALLENGE_NODES.map(n => n.id))
    for (const node of CHALLENGE_NODES) {
      for (const preId of node.prerequisites) {
        expect(ids.has(preId), `${node.id} references unknown prerequisite ${preId}`).toBe(true)
      }
      for (const unlockId of node.unlocks) {
        expect(ids.has(unlockId), `${node.id} references unknown unlock ${unlockId}`).toBe(true)
      }
    }
  })
})

describe('getStarterNodes', () => {
  it('returns nodes with no prerequisites', () => {
    const starters = getStarterNodes()
    expect(starters.length).toBe(4) // A1, S1, M1, D1
    for (const node of starters) {
      expect(node.prerequisites).toEqual([])
    }
  })
})

describe('getNode', () => {
  it('returns the correct node by ID', () => {
    const a1 = getNode('A1')
    expect(a1.name).toBe('Pebble Path')
    expect(a1.operations).toEqual(['addition'])
  })

  it('throws for unknown node ID', () => {
    expect(() => getNode('X99')).toThrow('Unknown challenge node: X99')
  })
})

describe('PROBLEMS_PER_CHALLENGE', () => {
  it('is 5', () => {
    expect(PROBLEMS_PER_CHALLENGE).toBe(5)
  })
})
