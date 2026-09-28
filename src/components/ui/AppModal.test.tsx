import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AppModal from './AppModal'

const open = (loading: boolean) => {
  const onClose = vi.fn()
  render(
    <AppModal isOpen mode="edit" title="Edit agent" onClose={onClose} loading={loading} onSubmit={(e) => e.preventDefault()}>
      <input aria-label="Name" />
    </AppModal>,
  )
  return onClose
}
const backdrop = () => document.querySelector('div[aria-hidden="true"].absolute') as HTMLElement

describe('AppModal while a submit is running', () => {
  test('Esc, backdrop, X and Cancel do NOT close it', () => {
    const onClose = open(true)
    fireEvent.keyDown(window, { key: 'Escape' })
    fireEvent.click(backdrop())
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).not.toHaveBeenCalled()
  })

  test('when idle, Esc, backdrop, X and Cancel each close it', () => {
    const onClose = open(false)
    fireEvent.keyDown(window, { key: 'Escape' })
    fireEvent.click(backdrop())
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledTimes(4)
  })
})
