import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const deleteCompany = vi.fn()
const refresh = vi.fn()
let loadError: string | null = null
vi.mock('./useCompanies', () => ({
  useCompanies: () => ({
    companies: [{ id: 'c1', name: 'Alpha Life', email: 'a@alpha.com', status: 'ACTIVE' }],
    loading: false, error: loadError, refresh, createCompany: vi.fn(), updateCompany: vi.fn(), deleteCompany,
  }),
  extractFieldErrors: () => ({}),
}))
vi.mock('../../../components/ui/ConfirmDialog', () => ({ useConfirm: () => () => Promise.resolve(true) }))

import CompaniesPage from './CompaniesPage'

describe('CompaniesPage', () => {
  test('a refused delete (company still has agents) is shown, not swallowed', async () => {
    loadError = null
    deleteCompany.mockRejectedValue({ response: { status: 409, data: { message: 'Reassign its 3 agents first.' } } })
    render(<CompaniesPage />)
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Reassign its 3 agents first.')
  })

  test('a failed load offers a retry', () => {
    loadError = 'Could not reach the server.'
    render(<CompaniesPage />)
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(refresh).toHaveBeenCalled()
  })
})
