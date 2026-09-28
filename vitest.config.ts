import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// The business runs on Nepal time, and several date helpers are only wrong in a
// UTC+ zone — pin it so the suite is deterministic on any machine / CI runner.
process.env.TZ = 'Asia/Kathmandu'

// Kept separate from vite.config.ts so the production build config is untouched.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    env: { VITE_API_BASE_URL: 'http://api.test' },
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**', 'src/**/*.test.{ts,tsx}', 'src/main.tsx'],
      reporter: ['text-summary', 'json-summary'],
    },
  },
})
