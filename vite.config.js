import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  if (mode === 'build') {
    return buildConfig
  }
  return {}
})

const buildConfig = ({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.jsx'),
      name: 'Kanji Canvas React Js',
      fileName: () => 'index.js',
      formats: ['cjs']
    },
    target: 'es2015',
    minify: 'esbuild',
    outDir: 'dist',
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React'
        }
      }
    }
  },
  plugins: [react()]
})