import { describe, test, expect } from 'vitest'
import { extractMessage, extractFieldErrors, isOutcomeUnknown, isGatewayError, isTimeoutError } from './formErrors'

const httpError = (status: number, data: unknown) => ({ response: { status, data }, message: `Request failed with status code ${status}` })

describe('extractMessage', () => {
  test('a Joi "Validation failed" shows the specific messages, not the headline', () => {
    const err = httpError(400, {
      message: 'Validation failed',
      errors: [{ field: 'contact_email', message: 'Contact email must be a valid email address' }],
    })
    // Before the fix: 'Validation failed' — the admin could not tell what was wrong.
    expect(extractMessage(err)).toBe('Contact email must be a valid email address')
  })

  test('legacy string errors are shown too, at most three', () => {
    const err = httpError(400, { message: 'Validation failed', errors: ['a is required', 'b is required', 'c', 'd'] })
    expect(extractMessage(err)).toBe('a is required b is required c')
  })

  test('any other message is shown as-is', () => {
    expect(extractMessage(httpError(409, { message: 'An agent with this email already exists', errors: [{ field: 'email', message: 'x' }] })))
      .toBe('An agent with this email already exists')
  })

  test('a 5xx gets a searchable reference', () => {
    expect(extractMessage(httpError(500, { message: 'Something went wrong', code: 500, requestId: 'req-9' })))
      .toBe('Something went wrong (reference: req-9)')
  })

  test.each([502, 504])('a proxy %i says the work may still be running', (status) => {
    expect(extractMessage(httpError(status, '<html>504</html>'))).toMatch(/may still be running/)
  })

  test('a browser timeout never shows raw axios text', () => {
    const msg = extractMessage({ code: 'ECONNABORTED', message: 'timeout of 30000ms exceeded' })
    expect(msg).not.toMatch(/30000ms/)
    expect(msg).toMatch(/may still have gone through/)
  })

  test('no response at all is a connection problem', () => {
    expect(extractMessage({ message: 'Network Error' })).toMatch(/Could not reach the server/)
  })

  test('an unknown body falls back to the caller-provided text', () => {
    expect(extractMessage(httpError(418, 'teapot'), 'Import failed.')).toBe('Import failed.')
  })
})

describe('extractFieldErrors', () => {
  test('maps field-tagged errors (now sent by the Joi middleware) to inputs', () => {
    expect(extractFieldErrors(httpError(400, { errors: [{ field: 'name', message: 'Name is required' }, 'untagged'] })))
      .toEqual({ name: 'Name is required' })
  })

  test('non-array errors yield an empty map', () => {
    expect(extractFieldErrors(httpError(400, { errors: 'x' }))).toEqual({})
    expect(extractFieldErrors(undefined)).toEqual({})
  })
})

describe('outcome classification', () => {
  test('503 with our envelope is safe to retry; without it, it is the proxy', () => {
    expect(isGatewayError(httpError(503, { success: false, message: 'Busy' }))).toBe(false)
    expect(isGatewayError(httpError(503, 'Service Unavailable'))).toBe(true)
  })

  test('outcome is unknown after a timeout or a gateway error, known after a 400', () => {
    expect(isOutcomeUnknown({ code: 'ECONNABORTED', message: 'timeout' })).toBe(true)
    expect(isOutcomeUnknown(httpError(504, ''))).toBe(true)
    expect(isOutcomeUnknown(httpError(400, { message: 'bad' }))).toBe(false)
    expect(isTimeoutError(httpError(504, ''))).toBe(false)
  })
})
