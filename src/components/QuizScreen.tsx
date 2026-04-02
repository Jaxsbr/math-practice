import { useState, useEffect, useRef, useCallback } from 'react'
import type { ChallengeNode, Problem } from '../types'
import { generateProblem } from '../lib/generator'

interface QuizScreenProps {
  node: ChallengeNode
  problemCount: number
  onComplete: (correct: number, total: number, elapsedSeconds: number) => void
  onAbandon: () => void
}

function createProblem(node: ChallengeNode): Problem {
  return generateProblem({
    operations: node.operations,
    min: node.min,
    max: node.max,
    roundingTarget: node.roundingTarget,
    questionTypes: node.questionTypes,
  })
}

export function QuizScreen({ node, problemCount, onComplete, onAbandon }: QuizScreenProps) {
  const [problemIndex, setProblemIndex] = useState(0)
  const [problem, setProblem] = useState<Problem>(() => createProblem(node))
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<{ correct: boolean; correctAnswer: number } | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Thinking-time tracking: only count time while the child is solving (no feedback shown)
  const thinkingTimeRef = useRef(0)        // accumulated thinking seconds
  const problemStartRef = useRef(0)        // when current problem's thinking started
  const [displayTime, setDisplayTime] = useState(0)

  // Timer — ticks every second, but only accumulates when not in feedback state
  useEffect(() => {
    if (feedback) return // paused during feedback
    problemStartRef.current = Date.now()
    const interval = setInterval(() => {
      const current = thinkingTimeRef.current + (Date.now() - problemStartRef.current) / 1000
      setDisplayTime(Math.floor(current))
    }, 1000)
    return () => clearInterval(interval)
  }, [feedback])

  // Focus input after feedback clears
  useEffect(() => {
    if (!feedback) {
      inputRef.current?.focus()
    }
  }, [feedback, problem])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (feedback) return

    const numAnswer = Number(answer)
    if (answer.trim() === '' || isNaN(numAnswer)) return

    const correct = numAnswer === problem.answer
    if (correct) setCorrectCount(prev => prev + 1)

    // Freeze thinking time for this problem
    thinkingTimeRef.current += (Date.now() - problemStartRef.current) / 1000

    setFeedback({ correct, correctAnswer: problem.answer })
  }, [answer, feedback, problem.answer])

  const handleNext = useCallback(() => {
    const nextIndex = problemIndex + 1
    if (nextIndex >= problemCount) {
      onComplete(correctCount, problemCount, Math.floor(thinkingTimeRef.current))
      return
    }
    setProblemIndex(nextIndex)
    setProblem(createProblem(node))
    setAnswer('')
    setFeedback(null)
  }, [problemIndex, problemCount, correctCount, onComplete, node])

  const progressPct = ((problemIndex + (feedback ? 1 : 0)) / problemCount) * 100

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

      <div className="problem-display">
        <span className="problem-text">{problem.display.endsWith('?') ? problem.display : `${problem.display} = ?`}</span>
      </div>

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
          <p>{feedback.correct ? 'Correct!' : `The answer is ${feedback.correctAnswer}`}</p>
          <button className="next-button" onClick={handleNext} autoFocus>
            {problemIndex + 1 >= problemCount ? 'See Results' : 'Next'}
          </button>
        </div>
      )}
    </div>
  )
}
