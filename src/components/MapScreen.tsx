import { useMemo, useState, useEffect, useRef, memo } from 'react'
import type { ChallengeNode, MapProgress } from '../types'
import type { Profile } from '../lib/profiles'
import { CHALLENGE_NODES } from '../lib/challenges'
import { isNodeUnlocked, isNodeCompleted, getFrontierNodeId } from '../lib/mapProgress'
import { isMuted, setMuted, playSound, updateAmbientMute } from '../lib/audio'
import './MapScreen.css'

const AVATARS = ['🦉', '🦊', '🐰', '🐻']

interface MapScreenProps {
  progress: MapProgress
  activeProfile: Profile | null
  justCompletedNodeId: string | null
  onSelectChallenge: (node: ChallengeNode) => void
  onSwitchProfile: () => void
}

const PATH_COLORS: Record<string, string> = {
  addition: '#22c55e',
  subtraction: '#3b82f6',
  multiplication: '#f97316',
  division: '#a855f7',
  rounding: '#ef4444',
  'number-challenge': '#06b6d4',
}

const PATH_LABELS: Record<string, string> = {
  addition: '+',
  subtraction: '\u2212',
  multiplication: '\u00d7',
  division: '\u00f7',
  rounding: '\u2248',
  'number-challenge': '#',
}

function Stars({ count }: { count: number }) {
  return (
    <span className="node-stars" aria-label={`${count} stars`}>
      {[1, 2, 3].map(i => (
        <span key={i} className={`star ${i <= count ? 'earned' : 'empty'}`}>
          {'\u2605'}
        </span>
      ))}
    </span>
  )
}

// Derive grid dimensions from data — no hardcoded column count
const singleNodes = CHALLENGE_NODES.filter(n => n.type === 'single')
const GRID_COLS = new Set(singleNodes.map(n => n.col)).size
const MAX_ROW = Math.max(...CHALLENGE_NODES.map(n => n.row))

const COL_WIDTH = 120
const ROW_HEIGHT = 110
const MAP_PADDING = 50

function nodePosition(node: ChallengeNode) {
  if (node.type === 'milestone') {
    // Center milestones across all columns
    const totalWidth = GRID_COLS * COL_WIDTH
    return {
      x: MAP_PADDING + totalWidth / 2,
      y: MAP_PADDING + node.row * ROW_HEIGHT + ROW_HEIGHT / 2,
    }
  }
  return {
    x: MAP_PADDING + node.col * COL_WIDTH + COL_WIDTH / 2,
    y: MAP_PADDING + node.row * ROW_HEIGHT + ROW_HEIGHT / 2,
  }
}

// Derive lane prefixes from data
const LANE_PREFIXES = [...new Set(singleNodes.map(n => n.id.charAt(0)))].sort(
  (a, b) => {
    const colA = singleNodes.find(n => n.id.startsWith(a))!.col
    const colB = singleNodes.find(n => n.id.startsWith(b))!.col
    return colA - colB
  },
)

const PathLines = memo(function PathLines({ progress }: { progress: MapProgress }) {
  const lines: { x1: number; y1: number; x2: number; y2: number; color: string; active: boolean }[] = []

  for (const node of CHALLENGE_NODES) {
    const from = nodePosition(node)
    for (const unlockId of node.unlocks) {
      const target = CHALLENGE_NODES.find(n => n.id === unlockId)
      if (!target) continue
      const to = nodePosition(target)
      const color = node.type === 'milestone'
        ? '#d4a017'
        : PATH_COLORS[node.operations[0]] ?? '#888'
      const active = isNodeCompleted(node.id, progress)
      lines.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y, color, active })
    }
  }

  const mapWidth = GRID_COLS * COL_WIDTH + MAP_PADDING * 2
  const mapHeight = (MAX_ROW + 1) * ROW_HEIGHT + MAP_PADDING * 2

  return (
    <svg className="map-paths" width={mapWidth} height={mapHeight}>
      {lines.map((line, i) => (
        <line
          key={i}
          x1={line.x1} y1={line.y1}
          x2={line.x2} y2={line.y2}
          stroke={line.active ? line.color : '#555'}
          strokeWidth={line.active ? 4 : 3}
          strokeDasharray={line.active ? 'none' : '8 6'}
          strokeLinecap="round"
          opacity={line.active ? 1 : 0.4}
        />
      ))}
    </svg>
  )
})

export function MapScreen({ progress, activeProfile, justCompletedNodeId, onSelectChallenge, onSwitchProfile }: MapScreenProps) {
  const [muted, setMutedState] = useState(isMuted())
  const burstRef = useRef<HTMLButtonElement>(null)
  const playedSoundForRef = useRef<string | null>(null)

  const toggleMute = () => {
    const next = !muted
    setMuted(next)
    setMutedState(next)
    updateAmbientMute(next)
  }

  // Play nodeComplete sound once when justCompletedNodeId changes
  useEffect(() => {
    if (justCompletedNodeId && justCompletedNodeId !== playedSoundForRef.current) {
      playedSoundForRef.current = justCompletedNodeId
      playSound('nodeComplete')
    }
  }, [justCompletedNodeId])

  const frontiers = useMemo(() => {
    const set = new Set<string>()
    for (const prefix of LANE_PREFIXES) {
      const fid = getFrontierNodeId(prefix, progress)
      if (fid) set.add(fid)
    }
    return set
  }, [progress])

  const mapWidth = GRID_COLS * COL_WIDTH + MAP_PADDING * 2
  const mapHeight = (MAX_ROW + 1) * ROW_HEIGHT + MAP_PADDING * 2

  return (
    <div className="map-screen">
      <div className="map-header-row">
        <h1 className="map-title">Math Adventure</h1>
        <div className="header-controls">
          <button
            className="mute-toggle"
            onClick={toggleMute}
            title={muted ? 'Unmute sounds' : 'Mute sounds'}
            aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {muted ? '\ud83d\udd07' : '\ud83d\udd0a'}
          </button>
          {activeProfile && (
            <button
              className="profile-badge"
              onClick={onSwitchProfile}
              title="Switch adventurer"
            >
              <span className="badge-avatar">{AVATARS[activeProfile.avatarId]}</span>
              <span className="badge-name">{activeProfile.name}</span>
            </button>
          )}
        </div>
      </div>
      <div className="map-legend">
        {LANE_PREFIXES.map(prefix => {
          const node = singleNodes.find(n => n.id.startsWith(prefix))!
          const op = node.operations[0]
          return (
            <span key={prefix} className="legend-item" style={{ color: PATH_COLORS[op] }}>
              <span className="legend-dot" style={{ background: PATH_COLORS[op] }} />
              {PATH_LABELS[op]} {op}
            </span>
          )
        })}
      </div>
      <div className="map-scroll-wrapper">
        <div className="map-container" style={{ width: mapWidth, height: mapHeight }}>
          <PathLines progress={progress} />
          {CHALLENGE_NODES.map(node => {
            const unlocked = isNodeUnlocked(node.id, progress)
            const completed = isNodeCompleted(node.id, progress)
            const isFrontier = frontiers.has(node.id)
            const pos = nodePosition(node)
            const nodeProgress = progress[node.id]
            const primaryColor = node.type === 'milestone'
              ? '#d4a017'
              : PATH_COLORS[node.operations[0]] ?? '#888'

            let stateClass = 'locked'
            if (completed) stateClass = 'completed node-completed'
            else if (unlocked) stateClass = 'unlocked node-unlocked'

            const isJustCompleted = justCompletedNodeId === node.id

            return (
              <button
                key={node.id}
                ref={isJustCompleted ? burstRef : undefined}
                className={`map-node ${stateClass} ${node.type} ${isFrontier ? 'frontier' : ''}${isJustCompleted ? ' node-just-completed' : ''}`}
                style={{
                  left: pos.x,
                  top: pos.y,
                  '--node-color': primaryColor,
                } as React.CSSProperties}
                disabled={!unlocked}
                onClick={() => unlocked && onSelectChallenge(node)}
                title={unlocked ? node.name : 'Locked'}
              >
                <span className="node-icon">
                  {!unlocked && '\ud83d\udd12'}
                  {unlocked && !completed && (
                    node.type === 'milestone'
                      ? '\u2694\ufe0f'
                      : PATH_LABELS[node.operations[0]]
                  )}
                  {completed && '\u2714'}
                </span>
                <span className="node-name">{node.name}</span>
                {completed && nodeProgress && <Stars count={nodeProgress.stars} />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
