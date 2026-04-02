import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the adventure map by default', () => {
    render(<App />)
    expect(screen.getByText('Math Adventure')).toBeInTheDocument()
  })

  it('shows starter challenge nodes as unlocked', () => {
    render(<App />)
    // Starter nodes should be clickable (not disabled)
    expect(screen.getByTitle('Pebble Path')).not.toBeDisabled()
    expect(screen.getByTitle('Leaf Fall')).not.toBeDisabled()
    expect(screen.getByTitle('Mushroom Ring')).not.toBeDisabled()
    expect(screen.getByTitle('Berry Split')).not.toBeDisabled()
  })

  it('shows locked nodes as disabled', () => {
    render(<App />)
    // Multiple nodes should be locked initially
    const locked = screen.getAllByTitle('Locked')
    expect(locked.length).toBeGreaterThan(0)
    for (const el of locked) {
      expect(el).toBeDisabled()
    }
  })
})
