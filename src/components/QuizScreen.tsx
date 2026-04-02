import { useState, useEffect, useRef } from 'react'
import type { Operation, Problem, SessionState, DifficultyState } from '../types'
import { generateProblem } from '../lib/generator'
import { updateDifficulty } from '../lib/adaptive'
import { loadSession, saveSession, loadDifficulty, saveDifficulty } from '../lib/storage'

interface QuizScreenProps {
  operations: Operation[]
  onEnd: () => void
}

function createProblem(operations: Operation[], difficulty: DifficultyState): Problem {
  return generateProblem({ operations, min: difficulty.min, max: difficulty.max })
}

export function QuizScreen({ operations, onEnd }: QuizScreenProps) {
  const [session, setSession] = useState<SessionState>(loadSession)
  const [difficulty, setDifficulty] = useState<DifficultyState>(loadDifficulty)
  const [problem, setProblem] = useState<Problem>(() => createProblem(operations, loadDifficulty()))
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<{ correct: boolean; correctAnswer: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!feedback) {
      inputRef.current?.focus()
    }
  }, [feedback, problem])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (feedback) return

    const numAnswer = Number(answer)
    if (answer.trim() === '' || isNaN(numAnswer)) return

    const correct = numAnswer === problem.answer
    const newSession: SessionState = {
      correct: session.correct + (correct ? 1 : 0),
      total: session.total + 1,
    }
    const newDifficulty = updateDifficulty(difficulty, correct)

    setSession(newSession)
    setDifficulty(newDifficulty)
    setFeedback({ correct, correctAnswer: problem.answer })

    saveSession(newSession)
    saveDifficulty(newDifficulty)
  }

  function handleNext() {
    setProblem(createProblem(operations, difficulty))
    setAnswer('')
    setFeedback(null)
  }

  return (
    <div className="quiz-screen">
      <div className="quiz-header">
        <span className="score">{session.correct} / {session.total} correct</span>
        <span className="difficulty-indicator">Level {difficulty.level} (up to {difficulty.max})</span>
        <button className="end-button" onClick={onEnd}>End Session</button>
      </div>

      <div className="problem-display">
        <span className="problem-text">{problem.display} = ?</span>
      </div>

      {!feedback ? (
        <form onSubmit={handleSubmit} className="answer-form">
          <input
            ref={inputRef}
            type="number"
            className="answer-input"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Your answer"
            autoFocus
          />
          <button type="submit" className="submit-button">Submit</button>
        </form>
      ) : (
        <div className={`feedback ${feedback.correct ? 'correct' : 'incorrect'}`}>
          <p>{feedback.correct ? 'Correct!' : `Incorrect. The answer is ${feedback.correctAnswer}.`}</p>
          <button className="next-button" onClick={handleNext} autoFocus>Next</button>
        </div>
      )}
    </div>
  )
}
