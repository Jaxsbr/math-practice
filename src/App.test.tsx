import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the config screen by default', () => {
    render(<App />)
    expect(screen.getByText('Math Practice')).toBeInTheDocument()
    expect(screen.getByText('Start')).toBeInTheDocument()
  })

  it('shows operation checkboxes', () => {
    render(<App />)
    expect(screen.getByLabelText(/Addition/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Subtraction/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Multiplication/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Division/)).toBeInTheDocument()
  })
})
