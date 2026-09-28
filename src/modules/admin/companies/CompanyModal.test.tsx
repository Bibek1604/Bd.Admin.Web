import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CompanyModal from './CompanyModal'
import type { Company } from './companyService'

const companyA = { id: 'a', name: 'Alpha Insurance', email: 'a@alpha.com', status: 'ACTIVE' } as Company
const companyB = { id: 'b', name: 'Beta Insurance', email: 'b@beta.com', status: 'ACTIVE' } as Company
const logo = () => new File([new Uint8Array(10)], 'logo.png', { type: 'image/png' })

describe('CompanyModal', () => {
  test('a logo picked for one company and cancelled is NOT uploaded to the next one', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()
    const { rerender } = render(
      <CompanyModal isOpen mode="edit" company={companyA} onSubmit={onSubmit} onClose={onClose} />,
    )

    fireEvent.change(screen.getByLabelText('Upload company logo'), { target: { files: [logo()] } })

    // Cancel A (the modal stays mounted), then edit B and save.
    rerender(<CompanyModal isOpen={false} mode="edit" company={companyA} onSubmit={onSubmit} onClose={onClose} />)
    rerender(<CompanyModal isOpen mode="edit" company={companyB} onSubmit={onSubmit} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const payload = onSubmit.mock.calls[0][0]
    expect(payload.name).toBe('Beta Insurance')
    expect(payload).not.toHaveProperty('image')
  })

  test('a logo picked for THIS company is uploaded with it', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<CompanyModal isOpen mode="edit" company={companyA} onSubmit={onSubmit} onClose={vi.fn()} />)
    fireEvent.change(screen.getByLabelText('Upload company logo'), { target: { files: [logo()] } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit.mock.calls[0][0].image).toBeInstanceOf(File)
  })

  test('a non-image logo is refused before anything is sent', async () => {
    const onSubmit = vi.fn()
    render(<CompanyModal isOpen mode="edit" company={companyA} onSubmit={onSubmit} onClose={vi.fn()} />)
    fireEvent.change(screen.getByLabelText('Upload company logo'), {
      target: { files: [new File(['<svg/>'], 'x.svg', { type: 'image/svg+xml' })] },
    })
    // The error is revealed once the form is submitted (fields become "touched").
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(await screen.findByText(/Only JPG, PNG, and WebP/)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  test('a server field error is shown instead of closing', async () => {
    const onSubmit = vi.fn().mockRejectedValue({
      response: { data: { message: 'Validation failed', errors: [{ field: 'name', message: 'A company with this name already exists' }] } },
    })
    const onClose = vi.fn()
    render(<CompanyModal isOpen mode="edit" company={companyA} onSubmit={onSubmit} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(await screen.findByText('A company with this name already exists')).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
  })

  test('typed text is kept verbatim — "Jonas=" used to become "J"', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<CompanyModal isOpen mode="edit" company={companyA} onSubmit={onSubmit} onClose={vi.fn()} />)
    const name = screen.getByDisplayValue('Alpha Insurance')
    fireEvent.change(name, { target: { value: 'Jonas= & Sons' } })
    expect(name).toHaveValue('Jonas= & Sons')
    fireEvent.change(name, { target: { value: 'Jonas= & Sons <b>' } })
    expect(name).toHaveValue('Jonas= & Sons b') // angle brackets still dropped
  })

  test('clearing phone and address on edit actually clears them', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const withContact = { ...companyA, phone_number: '9812345678', address: 'Kathmandu' } as Company
    render(<CompanyModal isOpen mode="edit" company={withContact} onSubmit={onSubmit} onClose={vi.fn()} />)
    fireEvent.change(screen.getByDisplayValue('9812345678'), { target: { value: '' } })
    fireEvent.change(screen.getByDisplayValue('Kathmandu'), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    // Before the fix: undefined → companyService skipped the field → old value kept.
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ phone_number: '', address: '' })
  })

  test('creating without phone/address leaves them out (unchanged behaviour)', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<CompanyModal isOpen mode="create" company={null} onSubmit={onSubmit} onClose={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('e.g. Nepal Life Insurance'), { target: { value: 'Gamma Life' } })
    fireEvent.change(screen.getByPlaceholderText('contact@company.com'), { target: { value: 'hi@gamma.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create company' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit.mock.calls[0][0].phone_number).toBeUndefined()
    expect(onSubmit.mock.calls[0][0].address).toBeUndefined()
  })
})
