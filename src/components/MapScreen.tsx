import { useMemo, memo } from 'react'
import type { ChallengeNode, MapProgress } from '../types'
import { CHALLENGE_NODES } from '../lib/challenges'
import { isNodeUnlocked, isNodeCompleted, getFrontierNodeId } from '../lib/mapProgress'
import './MapScreen.css'

interface MapScreenProps {
  progress: MapProgress
  onSelectChallenge: (node: ChallengeNode) => void
}

const PATH_COLORS: Record<string, string> = {
  addition: '#22c55e',
  subtraction: '#3b82f6',
  multiplication: '#f97316',
  division: '#a855f7',
}

const PATH_LABELS: Record<string, string> = {
  addition: '+',
  subtraction: '\u2212',
  multiplication: '\u00d7',
  division: '\u00f7',
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

/** Map grid: 4 columns, 6 rows, convergence nodes centered between their paths */
const GRID_COLS = 4
const COL_WIDTH = 160
const ROW_HEIGHT = 120
const MAP_PADDING = 60

function nodePosition(node: ChallengeNode) {
  const x = MAP_PADDING + node.col * COL_WIDTH + COL_WIDTH / 2
  const y = MAP_PADDING + node.row * ROW_HEIGHT + ROW_HEIGHT / 2
  return { x, y }
}

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

  return (
    <svg className="map-paths" width={GRID_COLS * COL_WIDTH + MAP_PADDING * 2} height={6 * ROW_HEIGHT + MAP_PADDING * 2}>
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

export function MapScreen({ progress, onSelectChallenge }: MapScreenProps) {
  const frontiers = useMemo(() => {
    const set = new Set<string>()
    for (const prefix of ['A', 'S', 'M', 'D']) {
      const fid = getFrontierNodeId(prefix, progress)
      if (fid) set.add(fid)
    }
    return set
  }, [progress])

  const mapWidth = GRID_COLS * COL_WIDTH + MAP_PADDING * 2
  const mapHeight = 6 * ROW_HEIGHT + MAP_PADDING * 2

  return (
    <div className="map-screen">
      <h1 className="map-title">Math Adventure</h1>
      <div className="map-legend">
        {Object.entries(PATH_LABELS).map(([op, symbol]) => (
          <span key={op} className="legend-item" style={{ color: PATH_COLORS[op] }}>
            <span className="legend-dot" style={{ background: PATH_COLORS[op] }} />
            {symbol} {op}
          </span>
        ))}
      </div>
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
          if (completed) stateClass = 'completed'
          else if (unlocked) stateClass = 'unlocked'

          return (
            <button
              key={node.id}
              className={`map-node ${stateClass} ${node.type} ${isFrontier ? 'frontier' : ''}`}
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
                    ? node.operations.map(op => PATH_LABELS[op]).join('')
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
  )
}
