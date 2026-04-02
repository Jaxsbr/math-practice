import { useState, useCallback } from 'react'
import type { ChallengeNode, MapProgress, ChallengeResult } from './types'
import { MapScreen } from './components/MapScreen'
import { QuizScreen } from './components/QuizScreen'
import { ResultsScreen } from './components/ResultsScreen'
import { loadMapProgress, saveMapProgress, recordChallengeResult } from './lib/mapProgress'
import { PROBLEMS_PER_CHALLENGE } from './lib/challenges'
import { calculateStars } from './lib/scoring'
import './App.css'

type AppView =
  | { screen: 'map' }
  | { screen: 'quiz'; node: ChallengeNode }
  | { screen: 'results'; node: ChallengeNode; result: ChallengeResult }

function App() {
  const [view, setView] = useState<AppView>({ screen: 'map' })
  const [progress, setProgress] = useState<MapProgress>(loadMapProgress)

  const handleSelectChallenge = useCallback((node: ChallengeNode) => {
    setView({ screen: 'quiz', node })
  }, [])

  const handleQuizComplete = useCallback((node: ChallengeNode, correct: number, total: number, elapsedSeconds: number) => {
    const result = calculateStars(correct, total, elapsedSeconds, node.timeTarget)
    setView({ screen: 'results', node, result })
  }, [])

  const handleBackToMap = useCallback((node?: ChallengeNode, result?: ChallengeResult) => {
    if (node && result) {
      const updated = recordChallengeResult(node.id, result.stars, progress)
      setProgress(updated)
      saveMapProgress(updated)
    }
    setView({ screen: 'map' })
  }, [progress])

  const handleAbandon = useCallback(() => {
    setView({ screen: 'map' })
  }, [])

  switch (view.screen) {
    case 'quiz':
      return (
        <QuizScreen
          node={view.node}
          problemCount={PROBLEMS_PER_CHALLENGE}
          progress={progress}
          onComplete={(correct, total, elapsed) => handleQuizComplete(view.node, correct, total, elapsed)}
          onAbandon={handleAbandon}
        />
      )
    case 'results':
      return (
        <ResultsScreen
          node={view.node}
          result={view.result}
          onBackToMap={() => handleBackToMap(view.node, view.result)}
        />
      )
    case 'map':
    default:
      return (
        <MapScreen
          progress={progress}
          onSelectChallenge={handleSelectChallenge}
        />
      )
  }
}

export default App
