import type { SessionState, DifficultyState } from '../types'

const SESSION_KEY = 'math-practice:session'
const DIFFICULTY_KEY = 'math-practice:difficulty'

export function loadSession(): SessionState {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (raw) return JSON.parse(raw) as SessionState
  } catch { /* corrupted data — return default */ }
  return { correct: 0, total: 0 }
}

export function saveSession(state: SessionState): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(state))
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}

export function loadDifficulty(): DifficultyState {
  try {
    const raw = localStorage.getItem(DIFFICULTY_KEY)
    if (raw) return JSON.parse(raw) as DifficultyState
  } catch { /* corrupted data — return default */ }
  return { min: 1, max: 10, streak: 0, level: 1 }
}

export function saveDifficulty(state: DifficultyState): void {
  localStorage.setItem(DIFFICULTY_KEY, JSON.stringify(state))
}

export function clearDifficulty(): void {
  localStorage.removeItem(DIFFICULTY_KEY)
}
