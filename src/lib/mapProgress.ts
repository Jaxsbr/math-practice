import type { ChallengeNode, GeneratorConfig, MapProgress, NodeProgress, Operation } from '../types'
import { CHALLENGE_NODES, getStarterNodes } from './challenges'

const MAP_PROGRESS_KEY_PREFIX = 'math-practice:map-progress'
const LEGACY_MAP_PROGRESS_KEY = 'math-practice:map-progress'

function getProgressKey(profileId: string): string {
  return `${MAP_PROGRESS_KEY_PREFIX}:${profileId}`
}

/** Load map progress from localStorage, scoped to a profile */
export function loadMapProgress(profileId: string): MapProgress {
  try {
    const raw = localStorage.getItem(getProgressKey(profileId))
    if (raw) return JSON.parse(raw) as MapProgress
  } catch { /* corrupted data — return default */ }
  return buildDefaultProgress()
}

/** Save map progress to localStorage, scoped to a profile */
export function saveMapProgress(progress: MapProgress, profileId: string): void {
  localStorage.setItem(getProgressKey(profileId), JSON.stringify(progress))
}

/** Clear map progress for a profile */
export function clearMapProgress(profileId: string): void {
  localStorage.removeItem(getProgressKey(profileId))
}

/** Migrate legacy unscoped map progress to a profile's scoped key. Returns the migrated progress or null if no legacy data. */
export function migrateLegacyProgress(profileId: string): MapProgress | null {
  try {
    const raw = localStorage.getItem(LEGACY_MAP_PROGRESS_KEY)
    if (!raw) return null
    const progress = JSON.parse(raw) as MapProgress
    saveMapProgress(progress, profileId)
    localStorage.removeItem(LEGACY_MAP_PROGRESS_KEY)
    return progress
  } catch {
    return null
  }
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

/**
 * Get the operations a milestone should generate problems for.
 * Returns only operations from prerequisite lanes the player has completed.
 * For non-milestone nodes, returns the node's operations as-is.
 */
export function getMilestoneOperations(node: ChallengeNode, progress: MapProgress): Operation[] {
  if (node.type !== 'milestone') return node.operations

  const completedOps: Operation[] = []
  for (const preId of node.prerequisites) {
    if (isNodeCompleted(preId, progress)) {
      const preNode = CHALLENGE_NODES.find(n => n.id === preId)
      if (preNode) completedOps.push(...preNode.operations)
    }
  }
  return completedOps.length > 0 ? completedOps : node.operations
}

/**
 * Build a GeneratorConfig for a milestone node.
 * Picks a random completed operation and uses the prerequisite lane's ranges
 * (not the milestone's own arithmetic-calibrated min/max).
 * For non-milestone nodes, returns config from the node directly.
 */
export function getMilestoneGeneratorConfig(
  node: ChallengeNode,
  progress: MapProgress,
): GeneratorConfig {
  if (node.type !== 'milestone') {
    return {
      operations: node.operations,
      min: node.min,
      max: node.max,
      roundingTarget: node.roundingTarget,
      questionTypes: node.questionTypes,
    }
  }

  const ops = getMilestoneOperations(node, progress)
  const op = ops[Math.floor(Math.random() * ops.length)]

  // Find the prerequisite node for this operation to get its ranges
  const preNode = node.prerequisites
    .map(id => CHALLENGE_NODES.find(n => n.id === id))
    .find(n => n && n.operations[0] === op)

  if (preNode) {
    return {
      operations: [op],
      min: preNode.min,
      max: preNode.max,
      roundingTarget: preNode.roundingTarget,
      questionTypes: preNode.questionTypes,
    }
  }

  return { operations: ops, min: node.min, max: node.max }
}
