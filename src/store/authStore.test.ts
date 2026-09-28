import { describe, test, expect, vi, beforeEach } from 'vitest'

/**
 * Startup session restore. A reload with an expired access token used to wipe
 * it and show the login screen although the 7-day bd_rt cookie was still good.
 */

const refresh = vi.fn()
vi.mock('../api/sessionRefresh', () => ({ requestNewAccessToken: () => refresh() }))

/** base64url JWT with the given exp (seconds). */
const jwt = (payload: Record<string, unknown>) =>
  `h.${btoa(JSON.stringify(payload)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')}.s`
const now = () => Math.floor(Date.now() / 1000)

/** The store reads localStorage when its module loads, so load it fresh. */
const loadStore = async () => {
  vi.resetModules()
  return (await import('./authStore')).useAuthStore
}

beforeEach(() => { refresh.mockReset() })

describe('auth store startup', () => {
  test('a valid token signs straight in, no refresh', async () => {
    localStorage.setItem('adminToken', jwt({ id: 'a1', exp: now() + 600 }))
    sessionStorage.setItem('adminUser', JSON.stringify({ id: 'a1', email: 'a@x.com' }))
    const store = await loadStore()
    expect(store.getState().isAuthenticated).toBe(true)
    expect(store.getState().isRestoring).toBe(false)
  })

  test('an expired token is kept pending, then restored from the refresh cookie', async () => {
    localStorage.setItem('adminToken', jwt({ id: 'a1', exp: now() - 60 }))
    sessionStorage.setItem('adminUser', JSON.stringify({ id: 'a1', email: 'a@x.com' }))
    const store = await loadStore()

    // Before the fix: token wiped, isAuthenticated false → login screen.
    expect(store.getState().isRestoring).toBe(true)
    expect(store.getState().isAuthenticated).toBe(false)

    const fresh = jwt({ id: 'a1', email: 'a@x.com', role: 'ADMIN', exp: now() + 900 })
    refresh.mockResolvedValue(fresh)
    await store.getState().restoreSession()

    expect(refresh).toHaveBeenCalledTimes(1)
    expect(store.getState()).toMatchObject({ isAuthenticated: true, isRestoring: false, token: fresh })
    expect(store.getState().user).toMatchObject({ email: 'a@x.com' })
    expect(localStorage.getItem('adminToken')).toBe(fresh)
  })

  test('with no stored user (new tab), the identity comes from the new token', async () => {
    localStorage.setItem('adminToken', jwt({ id: 'a1', exp: now() - 60 }))
    const store = await loadStore()
    refresh.mockResolvedValue(jwt({ id: 'a1', email: 'a@x.com', role: 'SUPER_ADMIN', exp: now() + 900 }))
    await store.getState().restoreSession()
    expect(store.getState().user).toEqual({ id: 'a1', email: 'a@x.com', role: 'SUPER_ADMIN' })
  })

  test('a refused refresh clears everything and falls back to the login screen', async () => {
    localStorage.setItem('adminToken', jwt({ id: 'a1', exp: now() - 60 }))
    sessionStorage.setItem('adminUser', '{"id":"a1"}')
    const store = await loadStore()
    refresh.mockRejectedValue({ response: { status: 401 } })
    await store.getState().restoreSession()
    expect(store.getState()).toMatchObject({ isAuthenticated: false, isRestoring: false, token: null })
    expect(localStorage.getItem('adminToken')).toBeNull()
    expect(sessionStorage.getItem('adminUser')).toBeNull()
  })

  test('no stored token at all (signed out) does not try to restore', async () => {
    const store = await loadStore()
    expect(store.getState().isRestoring).toBe(false)
    expect(refresh).not.toHaveBeenCalled()
  })
})
