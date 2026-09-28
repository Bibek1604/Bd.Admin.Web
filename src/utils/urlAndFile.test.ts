import { describe, test, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { sanitizeUrl, sanitizeTextInput } from './sanitization'
import { useSafeUrl } from '../hooks/useSafeContent'
import resolveImage from './resolveImage'
import { formatFileSize } from './fileValidation'

describe('sanitizeUrl / useSafeUrl', () => {
  test.each(['//evil.com', '//evil.com/path', '/\\evil.com', 'javascript:alert(1)', 'data:text/html,x', 'ftp://x'])(
    '%j is rejected',
    (url) => {
      expect(sanitizeUrl(url)).toBe('')
      expect(renderHook(() => useSafeUrl(url)).result.current).toBe('')
    },
  )

  test.each(['/agents', '/clients/bulk-enrollment?agentId=1', 'https://beemadiary.com', 'http://localhost:5173/x'])(
    '%j is allowed',
    (url) => {
      expect(sanitizeUrl(url)).toBe(url)
      expect(renderHook(() => useSafeUrl(url)).result.current).toBe(url)
    },
  )
})

describe('resolveImage', () => {
  test('complete browser URLs are left alone', () => {
    expect(resolveImage('data:image/png;base64,AAA')).toBe('data:image/png;base64,AAA')
    expect(resolveImage('blob:http://localhost/abc')).toBe('blob:http://localhost/abc')
    expect(resolveImage('https://cdn.x/y.png')).toBe('https://cdn.x/y.png')
  })

  test('server paths get the API base', () => {
    expect(resolveImage('/api/uploads/a.png')).toBe('http://api.test/api/uploads/a.png')
    expect(resolveImage('api/uploads/a.png')).toBe('http://api.test/api/uploads/a.png')
    expect(resolveImage('')).toBe('')
  })
})

describe('formatFileSize', () => {
  test.each([
    [0, '0 Bytes'],
    [-1, '0 Bytes'],
    [Number.NaN, '0 Bytes'],
    [512, '512 Bytes'],
    [1536, '1.5 KB'],
    [15 * 1024 ** 2, '15 MB'],
    [1024 ** 4, '1 TB'],
    [1024 ** 5, '1024 TB'],
  ])('%s → %s', (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected)
  })
})

describe('sanitizeTextInput', () => {
  test('is safe to run on every keystroke', () => {
    const typed = [...'Jonas= onclick=x & Co'].reduce((v, ch) => sanitizeTextInput(v + ch), '')
    expect(typed).toBe('Jonas= onclick=x & Co')
  })
})
