import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: This base path must match your GitHub repository name
  // If your repo is https://github.com/lzx-sdu/autopath, this should be '/autopath/'
  base: '/autopath/', 
})