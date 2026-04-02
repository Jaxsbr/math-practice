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
