import type { Problem } from '../types'

type QuestionType = 'place-id' | 'construct' | 'construct-constrained' | 'composition' | 'decomposition'

const ALL_TYPES: QuestionType[] = ['place-id', 'construct', 'construct-constrained', 'composition', 'decomposition']

const PLACE_NAMES = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands']

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getDigitCount(max: number): number {
  return String(max).length
}

function generatePlaceId(min: number, max: number): Problem {
  const num = randomInt(min, max)
  const digits = String(num).split('').reverse() // digits[0] = ones
  const placeIdx = randomInt(0, digits.length - 1)
  const answer = parseInt(digits[placeIdx])

  return {
    operand1: num,
    operand2: placeIdx,
    operation: 'number-challenge',
    answer,
    display: `What digit is in the ${PLACE_NAMES[placeIdx]} place of ${num}?`,
  }
}

function generateConstruct(min: number, max: number): Problem {
  const count = getDigitCount(max)
  const digits: number[] = Array.from({ length: count }, () => randomInt(1, 9))

  // Ensure at least 2 distinct digits
  if (new Set(digits).size === 1) {
    digits[0] = digits[0] === 9 ? 1 : digits[0] + 1
  }

  const sorted = [...digits].sort((a, b) => b - a)
  const answer = parseInt(sorted.join(''))

  return {
    operand1: answer,
    operand2: 0,
    operation: 'number-challenge',
    answer,
    display: `What is the largest number from ${digits.join(', ')}?`,
  }
}

function generateConstructConstrained(min: number, max: number): Problem {
  const count = getDigitCount(max)

  // Generate digits 1-9 with at least one even and one odd, ≥2 distinct
  let digits: number[]
  do {
    digits = Array.from({ length: count }, () => randomInt(1, 9))
  } while (
    digits.every(d => d % 2 === 0) ||
    digits.every(d => d % 2 !== 0) ||
    new Set(digits).size < 2
  )

  const wantEven = Math.random() < 0.5
  const constraint = wantEven ? 'even' : 'odd'
  const isLastValid = wantEven ? (d: number) => d % 2 === 0 : (d: number) => d % 2 !== 0

  // Find smallest number with last-digit constraint
  const candidates = digits.filter(isLastValid)
  let best: number | null = null

  for (const lastDigit of candidates) {
    const remaining = [...digits]
    remaining.splice(remaining.indexOf(lastDigit), 1)
    remaining.sort((a, b) => a - b)
    const num = parseInt([...remaining, lastDigit].join(''))
    if (best === null || num < best) best = num
  }

  return {
    operand1: best!,
    operand2: 0,
    operation: 'number-challenge',
    answer: best!,
    display: `What is the smallest ${count}-digit ${constraint} number from ${digits.join(', ')}?`,
  }
}

function generateComposition(min: number, max: number): Problem {
  const count = getDigitCount(max)
  const digits: number[] = []

  for (let i = 0; i < count; i++) {
    digits.push(i === 0 ? randomInt(1, 9) : randomInt(0, 9))
  }

  let answer = 0
  const parts: string[] = []
  for (let i = 0; i < digits.length; i++) {
    const placeIdx = count - 1 - i
    answer += digits[i] * Math.pow(10, placeIdx)
    parts.push(`${digits[i]} ${PLACE_NAMES[placeIdx]}`)
  }

  return {
    operand1: answer,
    operand2: 0,
    operation: 'number-challenge',
    answer,
    display: `What is ${parts.join(' + ')}?`,
  }
}

function generateDecomposition(min: number, max: number): Problem {
  const num = randomInt(min, max)
  const count = getDigitCount(max)
  // Pick a place from tens upward (ones decomposition is trivial)
  const placeIdx = randomInt(1, count - 1)
  const placeValue = Math.pow(10, placeIdx)
  const answer = Math.floor(num / placeValue)

  return {
    operand1: num,
    operand2: placeIdx,
    operation: 'number-challenge',
    answer,
    display: `How many ${PLACE_NAMES[placeIdx]} in ${num}?`,
  }
}

export function generateNumberChallengeProblem(min: number, max: number, types?: string[]): Problem {
  const allowedTypes = (types && types.length > 0 ? types : ALL_TYPES) as QuestionType[]
  const type = allowedTypes[randomInt(0, allowedTypes.length - 1)]

  switch (type) {
    case 'place-id': return generatePlaceId(min, max)
    case 'construct': return generateConstruct(min, max)
    case 'construct-constrained': return generateConstructConstrained(min, max)
    case 'composition': return generateComposition(min, max)
    case 'decomposition': return generateDecomposition(min, max)
  }
}
