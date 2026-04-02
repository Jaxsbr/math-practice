import type { GeneratorConfig, Operation, Problem } from '../types'

const operationSymbols: Record<Operation, string> = {
  addition: '+',
  subtraction: '-',
  multiplication: 'x',
  division: '/',
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateForOperation(operation: Operation, min: number, max: number): Problem {
  let operand1: number
  let operand2: number
  let answer: number

  switch (operation) {
    case 'addition':
      operand1 = randomInt(min, max)
      operand2 = randomInt(min, max)
      answer = operand1 + operand2
      break
    case 'subtraction':
      operand1 = randomInt(min, max)
      operand2 = randomInt(min, operand1)
      answer = operand1 - operand2
      break
    case 'multiplication':
      operand1 = randomInt(min, max)
      operand2 = randomInt(min, max)
      answer = operand1 * operand2
      break
    case 'division': {
      operand2 = randomInt(Math.max(min, 1), max)
      answer = randomInt(min, max)
      operand1 = operand2 * answer
      break
    }
  }

  const symbol = operationSymbols[operation]
  return {
    operand1,
    operand2,
    operation,
    answer,
    display: `${operand1} ${symbol} ${operand2}`,
  }
}

export function generateProblem(config: GeneratorConfig): Problem {
  const { operations, min, max } = config
  if (operations.length === 0) {
    throw new Error('At least one operation must be selected')
  }
  const operation = operations[randomInt(0, operations.length - 1)]
  return generateForOperation(operation, min, max)
}
