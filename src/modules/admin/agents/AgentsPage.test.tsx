import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

const remove = vi.fn()
vi.mock('./useAgents', () => ({
  useAgents: () => ({
    agents: [{ id: 'ag1', first_name: 'Sita', last_name: 'Rai', username: 'sita', email: 's@x.com', is_active: true }],
    loading: false, error: null, refresh: vi.fn(), create: vi.fn(), update: vi.fn(), remove,
  }),
}))
vi.mock('../../../components/ui/ConfirmDialog', () => ({ useConfirm: () => () => Promise.resolve(true) }))

import AgentsPage from './AgentsPage'

describe('AgentsPage delete', () => {
  test('a refused delete is shown to the admin (it used to be an unhandled rejection)', async () => {
    remove.mockRejectedValue({ response: { status: 409, data: { message: 'This agent still has 12 clients.' } } })
    render(<MemoryRouter><AgentsPage /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: 'Delete agent' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('This agent still has 12 clients.')
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.queryByRole('alert')).toBeNull()
  })

  test('a successful delete shows no error', async () => {
    remove.mockResolvedValue(undefined)
    render(<MemoryRouter><AgentsPage /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: 'Delete agent' }))
    await vi.waitFor(() => expect(remove).toHaveBeenCalledWith('ag1'))
    expect(screen.queryByRole('alert')).toBeNull()
  })
})
