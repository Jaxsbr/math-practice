import type { ChallengeResult } from '../types'

/**
 * Calculate stars earned for a challenge.
 *
 * - 3 stars: ≥90% accuracy AND completed within time target
 * - 2 stars: ≥70% accuracy
 * - 1 star:  completed (any accuracy)
 */
export function calculateStars(
  correct: number,
  total: number,
  elapsedSeconds: number,
  timeTarget: number,
): ChallengeResult {
  const accuracy = total > 0 ? correct / total : 0
  let stars: number

  if (accuracy >= 0.9 && elapsedSeconds <= timeTarget) {
    stars = 3
  } else if (accuracy >= 0.7) {
    stars = 2
  } else {
    stars = 1
  }

  return { correct, total, elapsedSeconds, stars }
}
