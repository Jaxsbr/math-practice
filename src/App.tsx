import { useState, useCallback, useEffect } from 'react'
import type { ChallengeNode, MapProgress, ChallengeResult } from './types'
import type { Profile } from './lib/profiles'
import { ProfileScreen } from './components/ProfileScreen'
import { MapScreen } from './components/MapScreen'
import { QuizScreen } from './components/QuizScreen'
import { ResultsScreen } from './components/ResultsScreen'
import { loadMapProgress, saveMapProgress, recordChallengeResult } from './lib/mapProgress'
import { PROBLEMS_PER_CHALLENGE } from './lib/challenges'
import { calculateStars } from './lib/scoring'
import { initAudioContext } from './lib/audio'
import './App.css'

type AppView =
  | { screen: 'profile' }
  | { screen: 'map' }
  | { screen: 'quiz'; node: ChallengeNode }
  | { screen: 'results'; node: ChallengeNode; result: ChallengeResult }

function App() {
  useEffect(() => {
    const handler = () => {
      initAudioContext()
      document.removeEventListener('click', handler)
      document.removeEventListener('touchstart', handler)
    }
    document.addEventListener('click', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('click', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [])

  const [view, setView] = useState<AppView>({ screen: 'profile' })
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null)
  const [progress, setProgress] = useState<MapProgress>({})

  const handleSelectProfile = useCallback((profile: Profile) => {
    setActiveProfile(profile)
    setProgress(loadMapProgress(profile.id))
    setView({ screen: 'map' })
  }, [])

  const handleSwitchProfile = useCallback(() => {
    setActiveProfile(null)
    setProgress({})
    setView({ screen: 'profile' })
  }, [])

  const handleSelectChallenge = useCallback((node: ChallengeNode) => {
    setView({ screen: 'quiz', node })
  }, [])

  const handleQuizComplete = useCallback((node: ChallengeNode, correct: number, total: number, elapsedSeconds: number) => {
    const result = calculateStars(correct, total, elapsedSeconds, node.timeTarget)
    setView({ screen: 'results', node, result })
  }, [])

  const handleBackToMap = useCallback((node?: ChallengeNode, result?: ChallengeResult) => {
    if (node && result && activeProfile) {
      const updated = recordChallengeResult(node.id, result.stars, progress)
      setProgress(updated)
      saveMapProgress(updated, activeProfile.id)
    }
    setView({ screen: 'map' })
  }, [progress, activeProfile])

  const handleAbandon = useCallback(() => {
    setView({ screen: 'map' })
  }, [])

  switch (view.screen) {
    case 'profile':
      return <ProfileScreen onSelectProfile={handleSelectProfile} />
    case 'quiz':
      return (
        <QuizScreen
          node={view.node}
          problemCount={PROBLEMS_PER_CHALLENGE}
          progress={progress}
          activeProfile={activeProfile}
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
          activeProfile={activeProfile}
          onSelectChallenge={handleSelectChallenge}
          onSwitchProfile={handleSwitchProfile}
        />
      )
  }
}

export default App
