import { useState } from 'react'
import type { Operation } from '../types'

const ALL_OPERATIONS: { value: Operation; label: string }[] = [
  { value: 'addition', label: 'Addition (+)' },
  { value: 'subtraction', label: 'Subtraction (-)' },
  { value: 'multiplication', label: 'Multiplication (x)' },
  { value: 'division', label: 'Division (/)' },
]

interface ConfigScreenProps {
  onStart: (operations: Operation[]) => void
}

export function ConfigScreen({ onStart }: ConfigScreenProps) {
  const [selected, setSelected] = useState<Set<Operation>>(
    new Set<Operation>(['addition', 'subtraction', 'multiplication', 'division'])
  )

  function toggle(op: Operation) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(op)) {
        next.delete(op)
      } else {
        next.add(op)
      }
      return next
    })
  }

  function handleStart() {
    if (selected.size > 0) {
      onStart(Array.from(selected))
    }
  }

  return (
    <div className="config-screen">
      <h1>Math Practice</h1>
      <p>Select the operations you want to practice:</p>
      <div className="operation-checkboxes">
        {ALL_OPERATIONS.map(({ value, label }) => (
          <label key={value} className="operation-checkbox">
            <input
              type="checkbox"
              checked={selected.has(value)}
              onChange={() => toggle(value)}
            />
            {label}
          </label>
        ))}
      </div>
      <button
        className="start-button"
        onClick={handleStart}
        disabled={selected.size === 0}
      >
        Start
      </button>
    </div>
  )
}
