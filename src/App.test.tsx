import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the profile selection screen by default', () => {
    render(<App />)
    expect(screen.getByText('Choose Your Adventurer')).toBeInTheDocument()
  })

  it('shows New Adventurer button when no profiles exist', () => {
    render(<App />)
    expect(screen.getByText(/New Adventurer/)).toBeInTheDocument()
  })

  it('transitions to map after creating a profile', () => {
    render(<App />)
    // Start creation
    fireEvent.click(screen.getByText(/New Adventurer/))
    // Pick first avatar (owl)
    const avatarButtons = screen.getAllByRole('button').filter(b => b.classList.contains('avatar-option'))
    fireEvent.click(avatarButtons[0])
    // Enter name and submit
    const nameInput = screen.getByPlaceholderText('Your name')
    fireEvent.change(nameInput, { target: { value: 'Luna' } })
    fireEvent.click(screen.getByText('Go!'))
    // Should now see the adventure map
    expect(screen.getByText('Math Adventure')).toBeInTheDocument()
  })
})
