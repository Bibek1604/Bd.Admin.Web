import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const getDashboardStats = vi.fn()
vi.mock('./dashboardService', () => ({ getDashboardStats: () => getDashboardStats() }))
// recharts needs layout APIs jsdom lacks; the chart is not what is under test.
vi.mock('recharts', () => {
  const Stub = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>
  return { BarChart: Stub, Bar: Stub, Cell: Stub, XAxis: Stub, YAxis: Stub, CartesianGrid: Stub, Tooltip: Stub, ResponsiveContainer: Stub }
})

import OverviewPage from './OverviewPage'

const stats = {
  summary: { total_members: 40, active_members: 30, inactive_members: 10, lapsed_policies: 2, overdue_premiums: 0, unread_alerts: 0 },
  total_users: 40, total_agents: 7, total_companies: 3, total_policies: 55, total_admins: 2,
}

describe('OverviewPage', () => {
  test('a failed load says so and offers a retry — no fake zeros', async () => {
    getDashboardStats.mockRejectedValueOnce({ message: 'Network Error' })
    render(<OverviewPage />)
    expect(await screen.findByText("Couldn't load the dashboard")).toBeInTheDocument()
    expect(screen.queryByText('Agents')).toBeNull() // no stat tiles showing 0

    getDashboardStats.mockResolvedValueOnce(stats)
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(await screen.findByText('Agents')).toBeInTheDocument()
    expect(screen.getAllByText('55').length).toBeGreaterThan(0)
  })

  test('shows a loading state until the totals arrive', () => {
    getDashboardStats.mockReturnValueOnce(new Promise(() => {}))
    render(<OverviewPage />)
    expect(screen.getByText('Loading totals…')).toBeInTheDocument()
  })
})
