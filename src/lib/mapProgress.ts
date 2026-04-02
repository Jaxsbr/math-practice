import type { MapProgress, NodeProgress } from '../types'
import { CHALLENGE_NODES, getStarterNodes } from './challenges'

const MAP_PROGRESS_KEY = 'math-practice:map-progress'

/** Load map progress from localStorage, or return default (starter nodes unlocked) */
export function loadMapProgress(): MapProgress {
  try {
    const raw = localStorage.getItem(MAP_PROGRESS_KEY)
    if (raw) return JSON.parse(raw) as MapProgress
  } catch { /* corrupted data — return default */ }
  return buildDefaultProgress()
}

/** Save map progress to localStorage */
export function saveMapProgress(progress: MapProgress): void {
  localStorage.setItem(MAP_PROGRESS_KEY, JSON.stringify(progress))
}

/** Clear map progress */
export function clearMapProgress(): void {
  localStorage.removeItem(MAP_PROGRESS_KEY)
}

/** Build default progress: starter nodes unlocked (0 stars, not completed) */
function buildDefaultProgress(): MapProgress {
  const progress: MapProgress = {}
  for (const node of getStarterNodes()) {
    progress[node.id] = { stars: 0, completed: false }
  }
  return progress
}

/** Check if a node is unlocked (present in progress, regardless of completion) */
export function isNodeUnlocked(nodeId: string, progress: MapProgress): boolean {
  return nodeId in progress
}

/** Check if a node is completed (present in progress AND has ≥1 star) */
export function isNodeCompleted(nodeId: string, progress: MapProgress): boolean {
  const p = progress[nodeId]
  return p !== undefined && p.completed && p.stars >= 1
}

/**
 * Record a challenge result: update stars (keep higher), mark completed,
 * and unlock successor nodes if prerequisites are met.
 * Returns a new progress object (immutable update).
 */
export function recordChallengeResult(
  nodeId: string,
  stars: number,
  progress: MapProgress,
): MapProgress {
  const next = { ...progress }

  // Update this node — keep the higher star rating
  const existing = next[nodeId] ?? { stars: 0, completed: false }
  next[nodeId] = {
    stars: Math.max(existing.stars, stars),
    completed: true,
  }

  // Unlock successor nodes whose prerequisites are now all met
  const node = CHALLENGE_NODES.find(n => n.id === nodeId)
  if (node) {
    for (const unlockId of node.unlocks) {
      if (unlockId in next) continue // already unlocked
      const unlockNode = CHALLENGE_NODES.find(n => n.id === unlockId)
      if (!unlockNode) continue
      const completedCount = unlockNode.prerequisites.filter(
        preId => isNodeCompleted(preId, next),
      ).length
      const prereqsMet = unlockNode.requiredCount
        ? completedCount >= unlockNode.requiredCount
        : completedCount === unlockNode.prerequisites.length
      if (prereqsMet) {
        next[unlockId] = { stars: 0, completed: false }
      }
    }
  }

  return next
}

/** Get the frontier node ID for a path (furthest unlocked but incomplete) */
export function getFrontierNodeId(
  pathPrefix: string,
  progress: MapProgress,
): string | null {
  const pathNodes = CHALLENGE_NODES
    .filter(n => n.id.startsWith(pathPrefix) && n.type === 'single')
    .sort((a, b) => a.row - b.row)

  let frontier: string | null = null
  for (const node of pathNodes) {
    if (isNodeUnlocked(node.id, progress) && !isNodeCompleted(node.id, progress)) {
      frontier = node.id
    }
  }
  return frontier
}

/** Get the node's progress or a default */
export function getNodeProgress(nodeId: string, progress: MapProgress): NodeProgress {
  return progress[nodeId] ?? { stars: 0, completed: false }
}
