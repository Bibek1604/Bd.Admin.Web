import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorBoundary from './ErrorBoundary'
import { isChunkLoadError } from '../utils/chunkLoadError'

const Boom = ({ error }: { error: Error }) => { throw error }

describe('ErrorBoundary', () => {
  test('a render error shows a recoverable message instead of a blank screen', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ErrorBoundary><Boom error={new Error('x is undefined')} /></ErrorBoundary>)
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
    expect(screen.queryByText('x is undefined')).toBeNull() // no internals shown
  })

  test('a stale lazy chunk after a deploy asks for a reload', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ErrorBoundary>
        <Boom error={new TypeError('Failed to fetch dynamically imported module: /assets/AgentsPage-1a2b.js')} />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('A new version is available')
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull()
  })

  test('"Try again" re-renders the children', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    let fail = true
    const Flaky = () => { if (fail) throw new Error('once'); return <p>recovered</p> }
    render(<ErrorBoundary><Flaky /></ErrorBoundary>)
    fail = false
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(screen.getByText('recovered')).toBeInTheDocument()
  })

  test.each([
    ['Failed to fetch dynamically imported module: /a.js', true],
    ['Importing a module script failed.', true],
    ['Cannot read properties of undefined', false],
  ])('isChunkLoadError(%j) → %s', (message, expected) => {
    expect(isChunkLoadError(new Error(message))).toBe(expected)
  })
})
