import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@local/src': path.resolve(__dirname, './src'),
      '@local/ui': path.resolve(__dirname, './src/ui'),
      '@local/asset': path.resolve(__dirname, './src/asset'),
      '@local/const': path.resolve(__dirname, './src/const'),
      '@local/network': path.resolve(__dirname, './src/network'),
      '@local/page': path.resolve(__dirname, './src/ui/page'),
      '@local/util': path.resolve(__dirname, './src/util'),
    },
  },
})
