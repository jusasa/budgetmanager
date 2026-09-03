import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_DEBUG_PORT': JSON.stringify('5174')
  },
  server: {
    host: '127.0.0.1', // 서버 컴퓨터(로컬호스트) 전용 바인딩
    port: 5174,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4001',
        changeOrigin: true
      }
    }
  }
});
