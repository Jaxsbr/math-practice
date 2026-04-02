import type { ChallengeNode } from '../types'

/**
 * Map layout — 6 lanes + 2 milestones
 *
 *   Row 0:  A1   S1   M1   D1   R1   N1    (tier 1 — all unlocked)
 *   Row 1:  A2   S2   M2   D2   R2   N2    (tier 2)
 *   Row 2:  =========  MS1  =========       (milestone 1 — 4 of 6 tier-2)
 *   Row 3:  A3   S3   M3   D3   R3   N3    (tier 3 — own tier-2 + MS1)
 *   Row 4:  A4   S4   M4   D4   R4   N4    (tier 4)
 *   Row 5:  A5   S5   M5   D5   R5   N5    (tier 5)
 *   Row 6:  =========  MS2  =========       (milestone 2 — 4 of 6 tier-5)
 */

const PROBLEMS_PER_CHALLENGE = 5

/** N-of-M threshold for milestone nodes: require this many of the listed prerequisites */
export const MILESTONE_REQUIRED = 4

// Arithmetic time targets scale with difficulty
const timeTargetForMax = (max: number): number => Math.max(30, 20 + max)

export const CHALLENGE_NODES: ChallengeNode[] = [
  // ── Addition path (col 0) ──
  { id: 'A1', name: 'Pebble Path',       type: 'single', operations: ['addition'], min: 1, max: 10, col: 0, row: 0, prerequisites: [],           unlocks: ['A2'],       timeTarget: timeTargetForMax(10) },
  { id: 'A2', name: 'Stepping Stones',   type: 'single', operations: ['addition'], min: 1, max: 20, col: 0, row: 1, prerequisites: ['A1'],       unlocks: ['MS1', 'A3'], timeTarget: timeTargetForMax(20) },
  { id: 'A3', name: 'River Bridge',      type: 'single', operations: ['addition'], min: 1, max: 30, col: 0, row: 3, prerequisites: ['A2', 'MS1'], unlocks: ['A4'],       timeTarget: timeTargetForMax(30) },
  { id: 'A4', name: 'Cloud Climb',       type: 'single', operations: ['addition'], min: 1, max: 40, col: 0, row: 4, prerequisites: ['A3'],       unlocks: ['A5'],       timeTarget: timeTargetForMax(40) },
  { id: 'A5', name: 'Summit Plus',       type: 'single', operations: ['addition'], min: 1, max: 50, col: 0, row: 5, prerequisites: ['A4'],       unlocks: ['MS2'],      timeTarget: timeTargetForMax(50) },

  // ── Subtraction path (col 1) ──
  { id: 'S1', name: 'Leaf Fall',         type: 'single', operations: ['subtraction'], min: 1, max: 10, col: 1, row: 0, prerequisites: [],           unlocks: ['S2'],       timeTarget: timeTargetForMax(10) },
  { id: 'S2', name: 'Hollow Log',        type: 'single', operations: ['subtraction'], min: 1, max: 20, col: 1, row: 1, prerequisites: ['S1'],       unlocks: ['MS1', 'S3'], timeTarget: timeTargetForMax(20) },
  { id: 'S3', name: 'Quicksand Skip',    type: 'single', operations: ['subtraction'], min: 1, max: 30, col: 1, row: 3, prerequisites: ['S2', 'MS1'], unlocks: ['S4'],       timeTarget: timeTargetForMax(30) },
  { id: 'S4', name: 'Waterfall Leap',    type: 'single', operations: ['subtraction'], min: 1, max: 40, col: 1, row: 4, prerequisites: ['S3'],       unlocks: ['S5'],       timeTarget: timeTargetForMax(40) },
  { id: 'S5', name: 'Minus Mountain',    type: 'single', operations: ['subtraction'], min: 1, max: 50, col: 1, row: 5, prerequisites: ['S4'],       unlocks: ['MS2'],      timeTarget: timeTargetForMax(50) },

  // ── Multiplication path (col 2) ──
  { id: 'M1', name: 'Mushroom Ring',     type: 'single', operations: ['multiplication'], min: 1, max: 10, col: 2, row: 0, prerequisites: [],           unlocks: ['M2'],       timeTarget: timeTargetForMax(10) },
  { id: 'M2', name: 'Spider Web',        type: 'single', operations: ['multiplication'], min: 1, max: 20, col: 2, row: 1, prerequisites: ['M1'],       unlocks: ['MS1', 'M3'], timeTarget: timeTargetForMax(20) },
  { id: 'M3', name: 'Crystal Cave',      type: 'single', operations: ['multiplication'], min: 1, max: 30, col: 2, row: 3, prerequisites: ['M2', 'MS1'], unlocks: ['M4'],       timeTarget: timeTargetForMax(30) },
  { id: 'M4', name: 'Lava Hop',          type: 'single', operations: ['multiplication'], min: 1, max: 40, col: 2, row: 4, prerequisites: ['M3'],       unlocks: ['M5'],       timeTarget: timeTargetForMax(40) },
  { id: 'M5', name: 'Times Tower',       type: 'single', operations: ['multiplication'], min: 1, max: 50, col: 2, row: 5, prerequisites: ['M4'],       unlocks: ['MS2'],      timeTarget: timeTargetForMax(50) },

  // ── Division path (col 3) ──
  { id: 'D1', name: 'Berry Split',       type: 'single', operations: ['division'], min: 1, max: 10, col: 3, row: 0, prerequisites: [],           unlocks: ['D2'],       timeTarget: timeTargetForMax(10) },
  { id: 'D2', name: 'Ant Trail',         type: 'single', operations: ['division'], min: 1, max: 20, col: 3, row: 1, prerequisites: ['D1'],       unlocks: ['MS1', 'D3'], timeTarget: timeTargetForMax(20) },
  { id: 'D3', name: 'Vine Swing',        type: 'single', operations: ['division'], min: 1, max: 30, col: 3, row: 3, prerequisites: ['D2', 'MS1'], unlocks: ['D4'],       timeTarget: timeTargetForMax(30) },
  { id: 'D4', name: 'Treasure Dig',      type: 'single', operations: ['division'], min: 1, max: 40, col: 3, row: 4, prerequisites: ['D3'],       unlocks: ['D5'],       timeTarget: timeTargetForMax(40) },
  { id: 'D5', name: 'Divide Peak',       type: 'single', operations: ['division'], min: 1, max: 50, col: 3, row: 5, prerequisites: ['D4'],       unlocks: ['MS2'],      timeTarget: timeTargetForMax(50) },

  // ── Rounding path (col 4) ──
  { id: 'R1', name: 'Rounding Rock',     type: 'single', operations: ['rounding'], min: 10,    max: 99,    col: 4, row: 0, prerequisites: [],           unlocks: ['R2'],       roundingTarget: 10,    timeTarget: 40 },
  { id: 'R2', name: 'Estimate Falls',    type: 'single', operations: ['rounding'], min: 100,   max: 999,   col: 4, row: 1, prerequisites: ['R1'],       unlocks: ['MS1', 'R3'], roundingTarget: 100,   timeTarget: 50 },
  { id: 'R3', name: 'Thousand Thicket',  type: 'single', operations: ['rounding'], min: 1000,  max: 9999,  col: 4, row: 3, prerequisites: ['R2', 'MS1'], unlocks: ['R4'],       roundingTarget: 1000,  timeTarget: 60 },
  { id: 'R4', name: 'Grand Canyon',      type: 'single', operations: ['rounding'], min: 10000, max: 99999, col: 4, row: 4, prerequisites: ['R3'],       unlocks: ['R5'],       roundingTarget: 10000, timeTarget: 75 },
  { id: 'R5', name: 'Summit Round',      type: 'single', operations: ['rounding'], min: 10,    max: 99999, col: 4, row: 5, prerequisites: ['R4'],       unlocks: ['MS2'],                             timeTarget: 90 },

  // ── Number Challenge path (col 5) ──
  { id: 'N1', name: 'Digit Den',         type: 'single', operations: ['number-challenge'], min: 10,   max: 99,    col: 5, row: 0, prerequisites: [],           unlocks: ['N2'],       questionTypes: ['place-id', 'composition'],       timeTarget: 60 },
  { id: 'N2', name: "Builder's Bridge",  type: 'single', operations: ['number-challenge'], min: 100,  max: 999,   col: 5, row: 1, prerequisites: ['N1'],       unlocks: ['MS1', 'N3'], questionTypes: ['construct'],                    timeTarget: 75 },
  { id: 'N3', name: 'Tricky Trail',      type: 'single', operations: ['number-challenge'], min: 100,  max: 999,   col: 5, row: 3, prerequisites: ['N2', 'MS1'], unlocks: ['N4'],       questionTypes: ['construct-constrained'],         timeTarget: 90 },
  { id: 'N4', name: 'Number Nexus',      type: 'single', operations: ['number-challenge'], min: 1000, max: 9999,  col: 5, row: 4, prerequisites: ['N3'],       unlocks: ['N5'],                                                        timeTarget: 90 },
  { id: 'N5', name: 'Master Mountain',   type: 'single', operations: ['number-challenge'], min: 100,  max: 99999, col: 5, row: 5, prerequisites: ['N4'],       unlocks: ['MS2'],                                                       timeTarget: 120 },

  // ── Milestone nodes ──
  { id: 'MS1', name: "Adventurer's Rest",  type: 'milestone', operations: ['addition', 'subtraction', 'multiplication', 'division', 'rounding', 'number-challenge'], min: 1, max: 20, col: 0, row: 2, prerequisites: ['A2', 'S2', 'M2', 'D2', 'R2', 'N2'], requiredCount: MILESTONE_REQUIRED, unlocks: ['A3', 'S3', 'M3', 'D3', 'R3', 'N3'], timeTarget: 60 },
  { id: 'MS2', name: "Dragon's Summit",    type: 'milestone', operations: ['addition', 'subtraction', 'multiplication', 'division', 'rounding', 'number-challenge'], min: 1, max: 50, col: 0, row: 6, prerequisites: ['A5', 'S5', 'M5', 'D5', 'R5', 'N5'], requiredCount: MILESTONE_REQUIRED, unlocks: [],                                      timeTarget: 90 },
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
