import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

// ---------------------------------------------------------------------------
// PWA: finalise public/sw.js in the build output. Injects the app id, a build
// id derived from this build's content (unchanged build => byte-identical
// worker => no pointless update prompt) and the list of hashed /assets/* files
// to precache. Fails the build if any placeholder is left behind.
// ---------------------------------------------------------------------------
function serviceWorkerPlugin(app: 'agent' | 'admin'): Plugin {
  let outDir = 'dist'
  let assets: string[] = []
  return {
    name: 'bd-service-worker',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    generateBundle(_options, bundle) {
      assets = Object.keys(bundle)
        .filter((f) => f.startsWith('assets/') && !f.endsWith('.map'))
        .sort()
        .map((f) => `/${f}`)
    },
    closeBundle() {
      const file = resolve(outDir, 'sw.js')
      if (!existsSync(file)) this.error('dist/sw.js missing: public/sw.js was not copied')
      const hash = createHash('sha256').update(app).update(JSON.stringify(assets))
      for (const extra of ['index.html', 'manifest.webmanifest', 'offline.html']) {
        const p = resolve(outDir, extra)
        if (existsSync(p)) hash.update(readFileSync(p))
      }
      const build = hash.digest('hex').slice(0, 12)
      const src = readFileSync(file, 'utf8')
        .replace(`'__BD_APP__'`, JSON.stringify(app))
        .replace(`'__BD_BUILD__'`, JSON.stringify(build))
        .replace('/* injected */ []', JSON.stringify(assets))
      if (src.includes(`'__BD_`) || src.includes('/* injected */')) this.error('sw.js placeholders were not replaced')
      writeFileSync(file, src)
    },
  }
}

export default defineConfig({
  plugins: [react(), serviceWorkerPlugin('admin')],
  server: {
    port: 5173,
    hmr: {
      host: 'localhost',
      port: 5173
    }
  }
})
