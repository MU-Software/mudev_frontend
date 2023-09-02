import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@asset': path.resolve(__dirname, './src/asset'),
      '@network': path.resolve(__dirname, './src/network'),
      '@page': path.resolve(__dirname, './src/ui/page'),
      '@util': path.resolve(__dirname, './src/util'),
    },
  },
})
