import { describe, test, expect } from 'vitest'
import { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import api from './axiosInstance'

/** Make the instance answer with `status`/`data` without any network. */
const answer = (status: number, data: unknown) => {
  api.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    throw new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_RESPONSE', config, null, {
      status, statusText: '', headers: {}, config, data,
    })
  }
}
const failWith = async () => (await api.get('/x').catch((e) => e)) as { errorMessage?: string }

describe('axiosInstance errorMessage', () => {
  test('a non-JSON body (nginx 413 page) never surfaces raw axios text', async () => {
    answer(413, '<html><body>413 Request Entity Too Large</body></html>')
    const err = await failWith()
    expect(err.errorMessage).toBeTruthy()
    expect(err.errorMessage).not.toMatch(/status code/)
  })

  test('an errors[] of OBJECTS yields their text, never "[object Object]"', async () => {
    answer(400, { message: 'Validation failed', errors: [{ field: 'email', message: 'Email is invalid' }] })
    const err = await failWith()
    expect(err.errorMessage).toBe('Email is invalid')
  })

  test('a normal backend message is passed through', async () => {
    answer(409, { success: false, message: 'A company with this name already exists.' })
    expect((await failWith()).errorMessage).toBe('A company with this name already exists.')
  })

  test('no response at all gets connection advice, not "Network Error"', async () => {
    api.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
      throw new AxiosError('Network Error', 'ERR_NETWORK', config)
    }
    const err = await failWith()
    expect(err.errorMessage).toMatch(/Could not reach the server/)
  })
})
