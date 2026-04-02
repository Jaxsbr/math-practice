import { useState, useEffect, useRef, useCallback } from 'react'
import type { ChallengeNode, MapProgress, Problem } from '../types'
import { generateProblem } from '../lib/generator'
import { getMilestoneGeneratorConfig } from '../lib/mapProgress'

interface QuizScreenProps {
  node: ChallengeNode
  problemCount: number
  progress: MapProgress
  onComplete: (correct: number, total: number, elapsedSeconds: number) => void
  onAbandon: () => void
}

/** Generate a problem that hasn't been seen in this challenge session */
function createUniqueProblem(
  node: ChallengeNode,
  progress: MapProgress,
  seenDisplays: Set<string>,
): Problem {
  for (let attempt = 0; attempt < 20; attempt++) {
    const p = generateProblem(getMilestoneGeneratorConfig(node, progress))
    if (!seenDisplays.has(p.display)) {
      seenDisplays.add(p.display)
      return p
    }
  }
  // Fallback: accept duplicate after 20 attempts
  const p = generateProblem(getMilestoneGeneratorConfig(node, progress))
  seenDisplays.add(p.display)
  return p
}

/* ── Rounding: number line + boundary choice ── */

function formatNumber(n: number): string {
  return n.toLocaleString('en-NZ')
}

function RoundingView({ problem, onSelect, selectedAnswer }: {
  problem: Problem
  onSelect: (answer: number) => void
  selectedAnswer: number | null
}) {
  const number = problem.operand1
  const target = problem.operand2
  const lower = Math.floor(number / target) * target
  const upper = lower + target
  const position = (number - lower) / (upper - lower)
  const correctAnswer = problem.answer

  const decidingPos = Math.round(Math.log10(target)) - 1
  const numStr = String(number)
  const splitIdx = numStr.length - 1 - decidingPos

  return (
    <div className="rounding-view">
      <p className="rounding-title">Round to the nearest {formatNumber(target)}</p>

      <p className="rounding-number">
        <span>{numStr.slice(0, splitIdx)}</span>
        <span className="deciding-digit">{numStr[splitIdx]}</span>
        <span>{numStr.slice(splitIdx + 1)}</span>
      </p>

      <div className="number-line">
        <div className="number-line-bar" />
        <div className="number-line-marker" style={{ left: `${position * 100}%` }}>
          <span className="marker-arrow">{'\u25bc'}</span>
        </div>
        <span className="boundary-label left">{formatNumber(lower)}</span>
        <span className="boundary-label right">{formatNumber(upper)}</span>
      </div>

      <div className="boundary-buttons">
        <button
          className={`boundary-btn${selectedAnswer === lower ? (correctAnswer === lower ? ' correct' : ' incorrect') : ''}`}
          onClick={() => onSelect(lower)}
          disabled={selectedAnswer !== null}
        >
          {formatNumber(lower)}
        </button>
        <button
          className={`boundary-btn${selectedAnswer === upper ? (correctAnswer === upper ? ' correct' : ' incorrect') : ''}`}
          onClick={() => onSelect(upper)}
          disabled={selectedAnswer !== null}
        >
          {formatNumber(upper)}
        </button>
      </div>

      {selectedAnswer !== null && selectedAnswer !== correctAnswer && (
        <p className="rounding-hint">
          The {'\u2018'}<span className="deciding-digit">{numStr[splitIdx]}</span>{'\u2019'} digit is {parseInt(numStr[splitIdx]) >= 5 ? '\u2265' : '<'} 5 {'\u2014'} round {parseInt(numStr[splitIdx]) >= 5 ? 'up' : 'down'}
        </p>
      )}
    </div>
  )
}

/* ── Number challenge: digit stars (tappable for construct) + question ── */

function DigitBuilderView({ problem, onAnswer, feedback }: {
  problem: Problem
  onAnswer: (answer: number) => void
  feedback: { correct: boolean; correctAnswer: number } | null
}) {
  const fromMatch = problem.display.match(/from ([\d, ]+)\?/)!
  const digits = fromMatch[1].split(', ').map(Number)
  const displayQuestion = problem.display.replace(/from [\d, ]+/, '').replace(/\?\s*$/, '?').replace('  ', ' ')

  const [selected, setSelected] = useState<number[]>([])
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set())

  const handleTapDigit = (digit: number, index: number) => {
    if (feedback || usedIndices.has(index)) return
    const next = [...selected, digit]
    const nextUsed = new Set(usedIndices)
    nextUsed.add(index)
    setSelected(next)
    setUsedIndices(nextUsed)

    // Auto-submit when all digits placed
    if (next.length === digits.length) {
      const builtNumber = parseInt(next.join(''))
      onAnswer(builtNumber)
    }
  }

  const handleClear = () => {
    if (feedback) return
    setSelected([])
    setUsedIndices(new Set())
  }

  const builtDisplay = selected.length > 0 ? selected.join('') : '\u00a0'

  return (
    <div className="number-challenge-view">
      <p className="challenge-question">{displayQuestion}</p>

      <div className="digit-stars">
        {digits.map((d, i) => (
          <button
            key={i}
            className={`digit-star tappable${usedIndices.has(i) ? ' used' : ''}`}
            onClick={() => handleTapDigit(d, i)}
            disabled={!!feedback || usedIndices.has(i)}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="built-answer">
        <span className="built-digits">{builtDisplay}</span>
        {!feedback && selected.length > 0 && (
          <button className="clear-btn" onClick={handleClear}>Clear</button>
        )}
      </div>
    </div>
  )
}

function NumberChallengeInputView({ problem }: { problem: Problem }) {
  // Composition questions ("What is X tens + Y ones?") must NOT show the number
  // because operand1 IS the answer. Place-id and decomposition show the source number.
  const isComposition = problem.display.includes(' + ')

  return (
    <div className="number-challenge-view">
      {!isComposition && (
        <div className="challenge-number">
          <span>{formatNumber(problem.operand1)}</span>
        </div>
      )}
      <p className="challenge-question">{problem.display}</p>
    </div>
  )
}

/* ── Main quiz screen ── */

export function QuizScreen({ node, problemCount, progress, onComplete, onAbandon }: QuizScreenProps) {
  const [seenDisplays] = useState(() => new Set<string>())
  const [problemIndex, setProblemIndex] = useState(0)
  const [problem, setProblem] = useState<Problem>(() => createUniqueProblem(node, progress, seenDisplays))
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<{ correct: boolean; correctAnswer: number } | null>(null)
  const [roundingSelection, setRoundingSelection] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const thinkingTimeRef = useRef(0)
  const problemStartRef = useRef(0)
  const [displayTime, setDisplayTime] = useState(0)

  useEffect(() => {
    if (feedback) return
    problemStartRef.current = Date.now()
    const interval = setInterval(() => {
      const current = thinkingTimeRef.current + (Date.now() - problemStartRef.current) / 1000
      setDisplayTime(Math.floor(current))
    }, 1000)
    return () => clearInterval(interval)
  }, [feedback])

  // Focus input for text-input modes
  const needsTextInput = problem.operation !== 'rounding' && !isDigitBuilder(problem)
  useEffect(() => {
    if (!feedback && needsTextInput) {
      inputRef.current?.focus()
    }
  }, [feedback, problem, needsTextInput])

  const submitAnswer = useCallback((numAnswer: number) => {
    if (feedback) return
    const correct = numAnswer === problem.answer
    if (correct) setCorrectCount(prev => prev + 1)
    thinkingTimeRef.current += (Date.now() - problemStartRef.current) / 1000
    setFeedback({ correct, correctAnswer: problem.answer })
  }, [feedback, problem.answer])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (feedback) return
    const numAnswer = Number(answer)
    if (answer.trim() === '' || isNaN(numAnswer)) return
    submitAnswer(numAnswer)
  }, [answer, feedback, submitAnswer])

  const handleBoundarySelect = useCallback((selected: number) => {
    if (feedback) return
    setRoundingSelection(selected)
    submitAnswer(selected)
  }, [feedback, submitAnswer])

  const handleNext = useCallback(() => {
    const nextIndex = problemIndex + 1
    if (nextIndex >= problemCount) {
      onComplete(correctCount, problemCount, Math.floor(thinkingTimeRef.current))
      return
    }
    setProblemIndex(nextIndex)
    setProblem(createUniqueProblem(node, progress, seenDisplays))
    setAnswer('')
    setFeedback(null)
    setRoundingSelection(null)
  }, [problemIndex, problemCount, correctCount, onComplete, node, progress, seenDisplays])

  const progressPct = ((problemIndex + (feedback ? 1 : 0)) / problemCount) * 100
  const isRounding = problem.operation === 'rounding'
  const digitBuilder = isDigitBuilder(problem)

  return (
    <div className="quiz-screen challenge-mode">
      <div className="quiz-header">
        <span className="challenge-name">{node.name}</span>
        <span className={`timer ${feedback ? 'paused' : ''}`}>{'\u23f1'} {displayTime}s</span>
        <span className="progress-count">{problemIndex + 1} / {problemCount}</span>
        <button className="abandon-button" onClick={onAbandon}>Quit</button>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {/* ── Rounding mode: number line + boundary choice ── */}
      {isRounding ? (
        <>
          <RoundingView
            problem={problem}
            onSelect={handleBoundarySelect}
            selectedAnswer={roundingSelection}
          />
          {feedback && (
            <div className={`feedback ${feedback.correct ? 'correct' : 'incorrect'}`}>
              <p>{feedback.correct ? 'Correct!' : 'Not quite!'}</p>
              <button className="next-button" onClick={handleNext} autoFocus>
                {problemIndex + 1 >= problemCount ? 'See Results' : 'Next'}
              </button>
            </div>
          )}
        </>

      /* ── Digit builder mode: tap stars to build answer ── */
      ) : digitBuilder ? (
        <>
          <DigitBuilderView
            key={problem.display}
            problem={problem}
            onAnswer={submitAnswer}
            feedback={feedback}
          />
          {feedback && (
            <div className={`feedback ${feedback.correct ? 'correct' : 'incorrect'}`}>
              <p>{feedback.correct ? 'Correct!' : `The answer is ${formatNumber(feedback.correctAnswer)}`}</p>
              <button className="next-button" onClick={handleNext} autoFocus>
                {problemIndex + 1 >= problemCount ? 'See Results' : 'Next'}
              </button>
            </div>
          )}
        </>

      /* ── Text input mode: arithmetic + other number-challenge ── */
      ) : (
        <>
          {problem.operation === 'number-challenge' ? (
            <NumberChallengeInputView problem={problem} />
          ) : (
            <div className="problem-display">
              <span className="problem-text">{problem.display} = ?</span>
            </div>
          )}

          {!feedback ? (
            <form onSubmit={handleSubmit} className="answer-form">
              <input
                ref={inputRef}
                type="number"
                className="answer-input"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="?"
                autoFocus
              />
              <button type="submit" className="submit-button">Go!</button>
            </form>
          ) : (
            <div className={`feedback ${feedback.correct ? 'correct' : 'incorrect'}`}>
              <p>{feedback.correct ? 'Correct!' : `The answer is ${formatNumber(feedback.correctAnswer)}`}</p>
              <button className="next-button" onClick={handleNext} autoFocus>
                {problemIndex + 1 >= problemCount ? 'See Results' : 'Next'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/** Construct/constrained questions use tappable digit builder */
function isDigitBuilder(problem: Problem): boolean {
  return problem.operation === 'number-challenge' && /from [\d, ]+\?/.test(problem.display)
}
