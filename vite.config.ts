import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

const repoName = 'qrgen'

const normalizeBase = (value: string) => value.replace(/^\/+/, '').replace(/\/+$/, '')

export default defineConfig(({ mode }) => {
  const baseTarget = process.env.VITE_BASE_PATH ?? repoName
  const base = mode === 'development' ? '/' : `/${normalizeBase(baseTarget)}/`

  return {
    plugins: [react()],
    base,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  }
})
