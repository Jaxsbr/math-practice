import { describe, it, expect } from 'vitest'
import { CHALLENGE_NODES, getNode, getStarterNodes, PROBLEMS_PER_CHALLENGE, MILESTONE_REQUIRED } from './challenges'

describe('CHALLENGE_NODES', () => {
  it('has 32 total nodes (6 paths x 5 + 2 milestones)', () => {
    expect(CHALLENGE_NODES).toHaveLength(32)
  })

  it('has exactly 5 nodes per single-operation path', () => {
    for (const prefix of ['A', 'S', 'M', 'D', 'R', 'N']) {
      const pathNodes = CHALLENGE_NODES.filter(n => n.id.startsWith(prefix) && n.type === 'single')
      expect(pathNodes, `Path ${prefix} should have 5 nodes`).toHaveLength(5)
    }
  })

  it('has exactly 2 milestone nodes (MS1, MS2)', () => {
    const milestones = CHALLENGE_NODES.filter(n => n.type === 'milestone')
    expect(milestones).toHaveLength(2)
    expect(milestones.map(m => m.id).sort()).toEqual(['MS1', 'MS2'])
  })

  it('C1 and C2 convergence nodes no longer exist', () => {
    const ids = CHALLENGE_NODES.map(n => n.id)
    expect(ids).not.toContain('C1')
    expect(ids).not.toContain('C2')
  })

  it('every node has a unique id', () => {
    const ids = CHALLENGE_NODES.map(n => n.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every node has a unique name', () => {
    const names = CHALLENGE_NODES.map(n => n.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('progressive difficulty — arithmetic paths have increasing max', () => {
    for (const prefix of ['A', 'S', 'M', 'D']) {
      const pathNodes = CHALLENGE_NODES
        .filter(n => n.id.startsWith(prefix) && n.type === 'single')
        .sort((a, b) => a.row - b.row)
      for (let i = 1; i < pathNodes.length; i++) {
        expect(pathNodes[i].max).toBeGreaterThan(pathNodes[i - 1].max)
      }
    }
  })

  it('arithmetic difficulty matches spec: 10, 20, 30, 40, 50', () => {
    for (const prefix of ['A', 'S', 'M', 'D']) {
      const maxes = CHALLENGE_NODES
        .filter(n => n.id.startsWith(prefix) && n.type === 'single')
        .sort((a, b) => a.row - b.row)
        .map(n => n.max)
      expect(maxes).toEqual([10, 20, 30, 40, 50])
    }
  })

  it('rounding nodes have progressive rounding targets', () => {
    const rNodes = CHALLENGE_NODES
      .filter(n => n.id.startsWith('R') && n.type === 'single')
      .sort((a, b) => a.row - b.row)
    expect(rNodes[0].roundingTarget).toBe(10)
    expect(rNodes[1].roundingTarget).toBe(100)
    expect(rNodes[2].roundingTarget).toBe(1000)
    expect(rNodes[3].roundingTarget).toBe(10000)
    expect(rNodes[4].roundingTarget).toBeUndefined() // R5 mixed
  })

  it('number-challenge nodes have appropriate question types', () => {
    const n1 = getNode('N1')
    expect(n1.questionTypes).toEqual(['place-id', 'composition'])
    const n2 = getNode('N2')
    expect(n2.questionTypes).toEqual(['construct'])
    const n3 = getNode('N3')
    expect(n3.questionTypes).toEqual(['construct-constrained'])
    const n4 = getNode('N4')
    expect(n4.questionTypes).toBeUndefined() // all types
    const n5 = getNode('N5')
    expect(n5.questionTypes).toBeUndefined() // all types
  })

  it('MS1 prerequisites list all 6 tier-2 node IDs with requiredCount = MILESTONE_REQUIRED', () => {
    const ms1 = getNode('MS1')
    expect(ms1.prerequisites.sort()).toEqual(['A2', 'D2', 'M2', 'N2', 'R2', 'S2'])
    expect(ms1.requiredCount).toBe(MILESTONE_REQUIRED)
    expect(MILESTONE_REQUIRED).toBe(4)
  })

  it('MS2 prerequisites list all 6 tier-5 node IDs with requiredCount = MILESTONE_REQUIRED', () => {
    const ms2 = getNode('MS2')
    expect(ms2.prerequisites.sort()).toEqual(['A5', 'D5', 'M5', 'N5', 'R5', 'S5'])
    expect(ms2.requiredCount).toBe(MILESTONE_REQUIRED)
  })

  it('tier-3 nodes require both own tier-2 and MS1', () => {
    for (const prefix of ['A', 'S', 'M', 'D', 'R', 'N']) {
      const t3 = getNode(`${prefix}3`)
      expect(t3.prerequisites, `${prefix}3 should require ${prefix}2 and MS1`).toContain(`${prefix}2`)
      expect(t3.prerequisites, `${prefix}3 should require MS1`).toContain('MS1')
    }
  })

  it('R1 and N1 have no prerequisites (unlocked from start)', () => {
    expect(getNode('R1').prerequisites).toEqual([])
    expect(getNode('N1').prerequisites).toEqual([])
  })

  it('all prerequisite and unlock references are valid node IDs', () => {
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
  it('returns 6 nodes with no prerequisites (A1, S1, M1, D1, R1, N1)', () => {
    const starters = getStarterNodes()
    expect(starters).toHaveLength(6)
    const ids = starters.map(n => n.id).sort()
    expect(ids).toEqual(['A1', 'D1', 'M1', 'N1', 'R1', 'S1'])
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
