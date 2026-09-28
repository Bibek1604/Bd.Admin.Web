import { describe, test, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

vi.mock('./bulkEnrollmentService', () => ({
  bulkEnrollmentService: {
    validate: vi.fn(),
    commit: vi.fn(),
    downloadTemplate: vi.fn(),
    downloadErrorReport: vi.fn(),
  },
}))

import { bulkEnrollmentService } from './bulkEnrollmentService'
import { importFileProblem, useBulkEnrollment } from './useBulkEnrollment'

const svc = vi.mocked(bulkEnrollmentService)
const fileA = new File(['a'], 'book-a.xlsx')
const fileB = new File(['b'], 'book-b.xlsx')
const result = (mode: 'preview' | 'commit') => ({ mode, totals: { total: 2, successful: 2 } }) as never

/** Pick agent + file A and run validation, ending in the 'previewed' step. */
const previewed = async () => {
  const hook = renderHook(() => useBulkEnrollment())
  act(() => { hook.result.current.setAgentId('agent-1') })
  act(() => { hook.result.current.setFile(fileA) })
  await act(() => hook.result.current.validate())
  expect(hook.result.current.step).toBe('previewed')
  return hook
}

beforeEach(() => {
  svc.validate.mockResolvedValue(result('preview'))
  svc.commit.mockResolvedValue(result('commit'))
})

describe('bulk enrollment only ever imports what was previewed', () => {
  test('happy path: preview then import commits the previewed file for the previewed agent', async () => {
    const { result: r } = await previewed()
    await act(() => r.current.confirmImport())
    expect(svc.commit).toHaveBeenCalledWith(fileA, 'agent-1')
    expect(r.current.step).toBe('completed')
  })

  test('choosing another FILE after preview drops the preview, and import does nothing', async () => {
    const { result: r } = await previewed()
    act(() => { r.current.setFile(fileB) })
    expect(r.current.step).toBe('idle')
    expect(r.current.previewResult).toBeNull()

    await act(() => r.current.confirmImport())
    // Before the fix: commit(fileB, 'agent-1') — a file nobody reviewed.
    expect(svc.commit).not.toHaveBeenCalled()
  })

  test('choosing another AGENT after preview drops the preview, and import does nothing', async () => {
    const { result: r } = await previewed()
    act(() => { r.current.setAgentId('agent-2') })
    expect(r.current.step).toBe('idle')
    await act(() => r.current.confirmImport())
    expect(svc.commit).not.toHaveBeenCalled()
  })

  test('after re-validating the new file, import commits the new file', async () => {
    const { result: r } = await previewed()
    act(() => { r.current.setFile(fileB) })
    await act(() => r.current.validate())
    await act(() => r.current.confirmImport())
    expect(svc.commit).toHaveBeenCalledWith(fileB, 'agent-1')
  })

  test('a gateway timeout during import is terminal ("unknown"), never back to Import', async () => {
    const { result: r } = await previewed()
    svc.commit.mockRejectedValue({ response: { status: 504, data: '<html/>' } })
    await act(() => r.current.confirmImport())
    expect(r.current.step).toBe('unknown')
  })

  test('a 4xx during import returns to the reviewed preview', async () => {
    const { result: r } = await previewed()
    svc.commit.mockRejectedValue({ response: { status: 400, data: { message: 'Rejected' } } })
    await act(() => r.current.confirmImport())
    expect(r.current.step).toBe('previewed')
    expect(r.current.error).toBe('Rejected')
  })

  test('validation without an agent or file explains what is missing', async () => {
    const { result: r } = renderHook(() => useBulkEnrollment())
    await act(() => r.current.validate())
    expect(r.current.error).toMatch(/Select the agent/)
    act(() => { r.current.setAgentId('agent-1') })
    await act(() => r.current.validate())
    expect(r.current.error).toMatch(/Choose an/)
    expect(svc.validate).not.toHaveBeenCalled()
  })
})

describe('bulk import file checks happen before any upload', () => {
  const file = (name: string, bytes: number) => new File([new Uint8Array(bytes)], name)

  test.each([
    ['clients.xlsx', 100, null],
    ['clients.XLS', 100, null],
    ['clients.csv', 100, null],
    ['clients.pdf', 100, /Only .xlsx, .xls or .csv/],
    ['clients.xlsx.exe', 100, /Only .xlsx, .xls or .csv/],
    ['empty.csv', 0, /empty/],
    ['big.xlsx', 15 * 1024 * 1024 + 1, /larger than 15MB/],
  ])('%s (%i bytes)', (name, bytes, expected) => {
    const problem = importFileProblem(file(name, bytes))
    if (expected === null) expect(problem).toBeNull()
    else expect(problem).toMatch(expected)
  })

  test('picking a refused file shows why, keeps no file, and never calls the server', async () => {
    const { result: r } = renderHook(() => useBulkEnrollment())
    act(() => { r.current.setAgentId('agent-1') })
    act(() => { r.current.setFile(file('scan.pdf', 100)) })
    expect(r.current.error).toMatch(/Only .xlsx/)
    expect(r.current.file).toBeNull()
    await act(() => r.current.validate())
    expect(svc.validate).not.toHaveBeenCalled()
  })
})
