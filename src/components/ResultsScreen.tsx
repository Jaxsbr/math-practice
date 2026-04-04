import { useState, useEffect, useRef, useCallback } from 'react'
import type { ChallengeNode, ChallengeResult } from '../types'
import { playSound, scheduleTimeout, cleanup as audioCleanup } from '../lib/audio'

interface ResultsScreenProps {
  node: ChallengeNode
  result: ChallengeResult
  onBackToMap: () => void
}

const STAR_DELAY = 300 // ms between each star reveal
const CELEBRATION_DELAY = 400 // ms after last star before bonus celebration

function StarDisplay({ count, onRevealComplete }: { count: number; onRevealComplete: () => void }) {
  const [revealedCount, setRevealedCount] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    const soundTypes = ['star1', 'star2', 'star3'] as const

    for (let i = 0; i < count; i++) {
      scheduleTimeout(() => {
        if (!mountedRef.current) return
        playSound(soundTypes[i])
        setRevealedCount(i + 1)
      }, (i + 1) * STAR_DELAY)
    }

    // After all stars revealed, trigger celebration if 3 stars
    const totalRevealTime = count * STAR_DELAY
    if (count === 3) {
      scheduleTimeout(() => {
        if (!mountedRef.current) return
        playSound('celebration')
        setShowCelebration(true)
      }, totalRevealTime + CELEBRATION_DELAY)
    }

    // Notify parent when sequence is complete
    const completionTime = count === 3
      ? totalRevealTime + CELEBRATION_DELAY + 600
      : totalRevealTime + 200
    scheduleTimeout(() => {
      if (!mountedRef.current) return
      onRevealComplete()
    }, completionTime)

    return () => {
      mountedRef.current = false
      audioCleanup()
    }
  }, [count, onRevealComplete])

  return (
    <div className={`results-stars${showCelebration ? ' celebration-active' : ''}`}>
      {[1, 2, 3].map(i => {
        const earned = i <= count
        const revealed = i <= revealedCount

        return (
          <span
            key={i}
            className={`result-star star-reveal ${earned && revealed ? 'earned revealed' : earned ? 'earned pending' : 'empty'}`}
            style={{ animationDelay: `${i * STAR_DELAY}ms` }}
          >
            {'\u2b50'}
          </span>
        )
      })}
    </div>
  )
}

const MESSAGES: Record<number, string> = {
  3: 'Amazing!',
  2: 'Great job!',
  1: 'Keep practicing!',
}

export function ResultsScreen({ node, result, onBackToMap }: ResultsScreenProps) {
  const accuracy = result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0
  const [revealDone, setRevealDone] = useState(false)
  const handleRevealComplete = useCallback(() => setRevealDone(true), [])

  return (
    <div className="results-screen">
      <h2 className="results-title">{node.name}</h2>
      <p className="results-message">{MESSAGES[result.stars]}</p>

      <StarDisplay count={result.stars} onRevealComplete={handleRevealComplete} />

      <div className="results-stats">
        <div className="stat">
          <span className="stat-value">{result.correct}/{result.total}</span>
          <span className="stat-label">Correct</span>
        </div>
        <div className="stat">
          <span className="stat-value">{accuracy}%</span>
          <span className="stat-label">Accuracy</span>
        </div>
        <div className="stat">
          <span className="stat-value">{result.elapsedSeconds}s</span>
          <span className="stat-label">Time</span>
        </div>
      </div>

      <button
        className="back-to-map-button"
        onClick={onBackToMap}
        disabled={!revealDone}
      >
        Back to Map
      </button>
    </div>
  )
}
