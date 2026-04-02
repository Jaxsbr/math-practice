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

function createProblem(node: ChallengeNode, progress: MapProgress): Problem {
  return generateProblem(getMilestoneGeneratorConfig(node, progress))
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

  // Highlight the deciding digit (the digit one place below the rounding target)
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

/* ── Number challenge: digit stars + question ── */

function NumberChallengeView({ problem }: { problem: Problem }) {
  // Extract digits from "from X, Y, Z" patterns (construct/constrained questions)
  const fromMatch = problem.display.match(/from ([\d, ]+)\?/)
  const digits = fromMatch ? fromMatch[1].split(', ').map(Number) : null

  // For non-construct questions, show the key number prominently
  const displayQuestion = digits
    ? problem.display.replace(/from [\d, ]+/, '').replace(/\?\s*$/, '?').replace('  ', ' ')
    : problem.display

  return (
    <div className="number-challenge-view">
      {digits ? (
        <div className="digit-stars">
          {digits.map((d, i) => (
            <span key={i} className="digit-star">{d}</span>
          ))}
        </div>
      ) : (
        <div className="challenge-number">
          <span>{formatNumber(problem.operand1)}</span>
        </div>
      )}
      <p className="challenge-question">{displayQuestion}</p>
    </div>
  )
}

/* ── Main quiz screen ── */

export function QuizScreen({ node, problemCount, progress, onComplete, onAbandon }: QuizScreenProps) {
  const [problemIndex, setProblemIndex] = useState(0)
  const [problem, setProblem] = useState<Problem>(() => createProblem(node, progress))
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

  useEffect(() => {
    if (!feedback && problem.operation !== 'rounding') {
      inputRef.current?.focus()
    }
  }, [feedback, problem])

  // Submit for text-input modes (arithmetic, number-challenge)
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (feedback) return
    const numAnswer = Number(answer)
    if (answer.trim() === '' || isNaN(numAnswer)) return
    const correct = numAnswer === problem.answer
    if (correct) setCorrectCount(prev => prev + 1)
    thinkingTimeRef.current += (Date.now() - problemStartRef.current) / 1000
    setFeedback({ correct, correctAnswer: problem.answer })
  }, [answer, feedback, problem.answer])

  // Direct answer for rounding boundary tap
  const handleBoundarySelect = useCallback((selected: number) => {
    if (feedback) return
    setRoundingSelection(selected)
    const correct = selected === problem.answer
    if (correct) setCorrectCount(prev => prev + 1)
    thinkingTimeRef.current += (Date.now() - problemStartRef.current) / 1000
    setFeedback({ correct, correctAnswer: problem.answer })
  }, [feedback, problem.answer])

  const handleNext = useCallback(() => {
    const nextIndex = problemIndex + 1
    if (nextIndex >= problemCount) {
      onComplete(correctCount, problemCount, Math.floor(thinkingTimeRef.current))
      return
    }
    setProblemIndex(nextIndex)
    setProblem(createProblem(node, progress))
    setAnswer('')
    setFeedback(null)
    setRoundingSelection(null)
  }, [problemIndex, problemCount, correctCount, onComplete, node, progress])

  const progressPct = ((problemIndex + (feedback ? 1 : 0)) / problemCount) * 100
  const isRounding = problem.operation === 'rounding'
  const isNumberChallenge = problem.operation === 'number-challenge'

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
      ) : (
        <>
          {/* ── Number challenge mode: digit stars + question + input ── */}
          {isNumberChallenge ? (
            <NumberChallengeView problem={problem} />
          ) : (
            /* ── Arithmetic mode: operand symbol operand = ? ── */
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
