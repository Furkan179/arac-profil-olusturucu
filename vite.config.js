import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  // Env dosyası yapılandırması
  envDir: './',
  envPrefix: 'VITE_'
})
