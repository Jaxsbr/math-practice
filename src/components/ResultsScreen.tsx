import type { ChallengeNode, ChallengeResult } from '../types'

interface ResultsScreenProps {
  node: ChallengeNode
  result: ChallengeResult
  onBackToMap: () => void
}

function StarDisplay({ count }: { count: number }) {
  return (
    <div className="results-stars">
      {[1, 2, 3].map(i => (
        <span
          key={i}
          className={`result-star ${i <= count ? 'earned' : 'empty'}`}
          style={{ animationDelay: `${i * 0.2}s` }}
        >
          {'\u2b50'}
        </span>
      ))}
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

  return (
    <div className="results-screen">
      <h2 className="results-title">{node.name}</h2>
      <p className="results-message">{MESSAGES[result.stars]}</p>

      <StarDisplay count={result.stars} />

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

      <button className="back-to-map-button" onClick={onBackToMap}>
        Back to Map
      </button>
    </div>
  )
}
