import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('./bulkNotificationsService', () => ({
  bulkNotificationsService: { createBulkNotification: vi.fn() },
}))
vi.mock('../../admin/agents/agentsService', () => ({ default: { getAgents: vi.fn().mockResolvedValue([]) } }))

import CreateNotificationModal from './CreateNotificationModal'

describe('CreateNotificationModal', () => {
  test('an error from a previous attempt is gone when the dialog is reopened', async () => {
    const onClose = vi.fn()
    const { rerender } = render(<CreateNotificationModal isOpen onClose={onClose} onSuccess={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect(await screen.findByText('Please fix the highlighted fields.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalled()
    rerender(<CreateNotificationModal isOpen={false} onClose={onClose} onSuccess={vi.fn()} />)
    rerender(<CreateNotificationModal isOpen onClose={onClose} onSuccess={vi.fn()} />)

    // Before the fix the old message greeted the admin on reopen.
    expect(screen.queryByText('Please fix the highlighted fields.')).toBeNull()
  })
})
