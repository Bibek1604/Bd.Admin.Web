import { describe, test, expect, vi } from 'vitest'
import axios from 'axios'
import { requestNewAccessToken } from './sessionRefresh'

describe('requestNewAccessToken', () => {
  test('concurrent callers share ONE refresh request (rotation treats a second use as replay)', async () => {
    let resolve!: (v: unknown) => void
    const post = vi.spyOn(axios, 'post').mockImplementation(() => new Promise((r) => { resolve = r }) as never)
    const calls = Promise.all([requestNewAccessToken(), requestNewAccessToken(), requestNewAccessToken()])
    resolve({ data: { accessToken: 'fresh' } })
    expect(await calls).toEqual(['fresh', 'fresh', 'fresh'])
    expect(post).toHaveBeenCalledTimes(1)
    expect(post.mock.calls[0][0]).toBe('http://api.test/api/auth/refresh')
    expect(post.mock.calls[0][2]).toMatchObject({ withCredentials: true })
  })

  test('the next refresh after one completes is a new request', async () => {
    const post = vi.spyOn(axios, 'post').mockResolvedValue({ data: { token: 't' } })
    await requestNewAccessToken()
    await requestNewAccessToken()
    expect(post).toHaveBeenCalledTimes(2)
  })

  test('an empty token is a failure, and the slot is released', async () => {
    const post = vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: {} })
    await expect(requestNewAccessToken()).rejects.toThrow(/Empty access token/)
    post.mockResolvedValueOnce({ data: { accessToken: 'ok' } })
    await expect(requestNewAccessToken()).resolves.toBe('ok')
  })
})
