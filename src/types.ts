export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division'

export interface Problem {
  operand1: number
  operand2: number
  operation: Operation
  answer: number
  display: string
}

export interface GeneratorConfig {
  operations: Operation[]
  min: number
  max: number
}

export interface SessionState {
  correct: number
  total: number
}

export interface DifficultyState {
  min: number
  max: number
  streak: number
  level: number
}

// Adventure map types

export type NodeType = 'single' | 'convergence'

export interface ChallengeNode {
  id: string
  name: string
  type: NodeType
  operations: Operation[]
  min: number
  max: number
  /** Grid position for map layout (col 0-based, row 0-based) */
  col: number
  row: number
  /** IDs of nodes that must be completed (≥1 star) to unlock this node */
  prerequisites: string[]
  /** IDs of nodes this unlocks when completed */
  unlocks: string[]
  /** Time target in seconds for 3-star rating */
  timeTarget: number
}

export interface NodeProgress {
  stars: number
  completed: boolean
}

export type MapProgress = Record<string, NodeProgress>

export interface ChallengeResult {
  correct: number
  total: number
  elapsedSeconds: number
  stars: number
}
