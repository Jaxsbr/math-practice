import type { ChallengeNode } from '../types'

/**
 * Map layout — 4 paths (addition, subtraction, multiplication, division)
 * winding across a grid with convergence points where paths cross.
 *
 * Grid layout (simplified):
 *
 *   Row 0:  A1        S1        M1        D1
 *   Row 1:  A2        S2        M2        D2
 *   Row 2:      C1(A+S)    C2(M+D)
 *   Row 3:  A3        S3        M3        D3
 *   Row 4:  A4        S4        M4        D4
 *   Row 5:  A5        S5        M5        D5
 */

const PROBLEMS_PER_CHALLENGE = 5

// Time targets scale with difficulty — harder challenges get more time
const timeTargetForMax = (max: number): number => Math.max(30, 20 + max)

export const CHALLENGE_NODES: ChallengeNode[] = [
  // ── Addition path ──
  { id: 'A1', name: 'Pebble Path',       type: 'single', operations: ['addition'], min: 1, max: 10, col: 0, row: 0, prerequisites: [],     unlocks: ['A2'],  timeTarget: timeTargetForMax(10) },
  { id: 'A2', name: 'Stepping Stones',   type: 'single', operations: ['addition'], min: 1, max: 20, col: 0, row: 1, prerequisites: ['A1'], unlocks: ['C1'],  timeTarget: timeTargetForMax(20) },
  { id: 'A3', name: 'River Bridge',      type: 'single', operations: ['addition'], min: 1, max: 30, col: 0, row: 3, prerequisites: ['C1'], unlocks: ['A4'],  timeTarget: timeTargetForMax(30) },
  { id: 'A4', name: 'Cloud Climb',       type: 'single', operations: ['addition'], min: 1, max: 40, col: 0, row: 4, prerequisites: ['A3'], unlocks: ['A5'],  timeTarget: timeTargetForMax(40) },
  { id: 'A5', name: 'Summit Plus',       type: 'single', operations: ['addition'], min: 1, max: 50, col: 0, row: 5, prerequisites: ['A4'], unlocks: [],      timeTarget: timeTargetForMax(50) },

  // ── Subtraction path ──
  { id: 'S1', name: 'Leaf Fall',         type: 'single', operations: ['subtraction'], min: 1, max: 10, col: 1, row: 0, prerequisites: [],     unlocks: ['S2'],  timeTarget: timeTargetForMax(10) },
  { id: 'S2', name: 'Hollow Log',        type: 'single', operations: ['subtraction'], min: 1, max: 20, col: 1, row: 1, prerequisites: ['S1'], unlocks: ['C1'],  timeTarget: timeTargetForMax(20) },
  { id: 'S3', name: 'Quicksand Skip',    type: 'single', operations: ['subtraction'], min: 1, max: 30, col: 1, row: 3, prerequisites: ['C1'], unlocks: ['S4'],  timeTarget: timeTargetForMax(30) },
  { id: 'S4', name: 'Waterfall Leap',    type: 'single', operations: ['subtraction'], min: 1, max: 40, col: 1, row: 4, prerequisites: ['S3'], unlocks: ['S5'],  timeTarget: timeTargetForMax(40) },
  { id: 'S5', name: 'Minus Mountain',    type: 'single', operations: ['subtraction'], min: 1, max: 50, col: 1, row: 5, prerequisites: ['S4'], unlocks: [],      timeTarget: timeTargetForMax(50) },

  // ── Multiplication path ──
  { id: 'M1', name: 'Mushroom Ring',     type: 'single', operations: ['multiplication'], min: 1, max: 10, col: 2, row: 0, prerequisites: [],     unlocks: ['M2'],  timeTarget: timeTargetForMax(10) },
  { id: 'M2', name: 'Spider Web',        type: 'single', operations: ['multiplication'], min: 1, max: 20, col: 2, row: 1, prerequisites: ['M1'], unlocks: ['C2'],  timeTarget: timeTargetForMax(20) },
  { id: 'M3', name: 'Crystal Cave',      type: 'single', operations: ['multiplication'], min: 1, max: 30, col: 2, row: 3, prerequisites: ['C2'], unlocks: ['M4'],  timeTarget: timeTargetForMax(30) },
  { id: 'M4', name: 'Lava Hop',          type: 'single', operations: ['multiplication'], min: 1, max: 40, col: 2, row: 4, prerequisites: ['M3'], unlocks: ['M5'],  timeTarget: timeTargetForMax(40) },
  { id: 'M5', name: 'Times Tower',       type: 'single', operations: ['multiplication'], min: 1, max: 50, col: 2, row: 5, prerequisites: ['M4'], unlocks: [],      timeTarget: timeTargetForMax(50) },

  // ── Division path ──
  { id: 'D1', name: 'Berry Split',       type: 'single', operations: ['division'], min: 1, max: 10, col: 3, row: 0, prerequisites: [],     unlocks: ['D2'],  timeTarget: timeTargetForMax(10) },
  { id: 'D2', name: 'Ant Trail',         type: 'single', operations: ['division'], min: 1, max: 20, col: 3, row: 1, prerequisites: ['D1'], unlocks: ['C2'],  timeTarget: timeTargetForMax(20) },
  { id: 'D3', name: 'Vine Swing',        type: 'single', operations: ['division'], min: 1, max: 30, col: 3, row: 3, prerequisites: ['C2'], unlocks: ['D4'],  timeTarget: timeTargetForMax(30) },
  { id: 'D4', name: 'Treasure Dig',      type: 'single', operations: ['division'], min: 1, max: 40, col: 3, row: 4, prerequisites: ['D3'], unlocks: ['D5'],  timeTarget: timeTargetForMax(40) },
  { id: 'D5', name: 'Divide Peak',       type: 'single', operations: ['division'], min: 1, max: 50, col: 3, row: 5, prerequisites: ['D4'], unlocks: [],      timeTarget: timeTargetForMax(50) },

  // ── Convergence nodes ──
  { id: 'C1', name: 'Crossroads Camp',   type: 'convergence', operations: ['addition', 'subtraction'],       min: 1, max: 20, col: 0.5, row: 2, prerequisites: ['A2', 'S2'], unlocks: ['A3', 'S3'], timeTarget: timeTargetForMax(20) },
  { id: 'C2', name: 'Dragon\'s Crossing', type: 'convergence', operations: ['multiplication', 'division'], min: 1, max: 20, col: 2.5, row: 2, prerequisites: ['M2', 'D2'], unlocks: ['M3', 'D3'], timeTarget: timeTargetForMax(20) },
]

/** Lookup a node by ID */
export function getNode(id: string): ChallengeNode {
  const node = CHALLENGE_NODES.find(n => n.id === id)
  if (!node) throw new Error(`Unknown challenge node: ${id}`)
  return node
}

/** Get all nodes that have no prerequisites (initially unlocked) */
export function getStarterNodes(): ChallengeNode[] {
  return CHALLENGE_NODES.filter(n => n.prerequisites.length === 0)
}

/** Number of problems per challenge */
export { PROBLEMS_PER_CHALLENGE }
