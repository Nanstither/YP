// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import path from 'path'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       '/api': { 
//         target: 'https://pm9.web.edu', 
//         changeOrigin: true,
//         configure: (proxy) => {
//           proxy.on('proxyReq', (proxyReq) => {
//             proxyReq.setHeader('Accept', 'application/json');
//           })
//         }
//       },
//     }
//   },
//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, './src'),
//     },
//   },
// })

// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss(),],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://pm9.web.edu',
        changeOrigin: true,
        secure: false,
        headers: {
        'Accept': 'application/json',
      },
        rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
      },
    },
  },
})