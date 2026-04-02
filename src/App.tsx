import { useState } from 'react'
import type { Operation } from './types'
import { ConfigScreen } from './components/ConfigScreen'
import { QuizScreen } from './components/QuizScreen'
import { clearSession, clearDifficulty } from './lib/storage'
import './App.css'

function App() {
  const [operations, setOperations] = useState<Operation[] | null>(null)

  function handleStart(ops: Operation[]) {
    setOperations(ops)
  }

  function handleEnd() {
    clearSession()
    clearDifficulty()
    setOperations(null)
  }

  if (operations) {
    return <QuizScreen operations={operations} onEnd={handleEnd} />
  }

  return <ConfigScreen onStart={handleStart} />
}

export default App
