import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { pageDefinitions } from './src/data/routes';
export default defineConfig(({ mode }) => ({
  // This one value is intentionally public. Never define API credentials here.
  define: { 'import.meta.env.PUBLIC_CONTACT_EMAIL': JSON.stringify(loadEnv(mode, process.cwd(), '').CONTACT_EMAIL || ''), 'import.meta.env.PUBLIC_SITE_URL': JSON.stringify(loadEnv(mode, process.cwd(), '').SITE_URL || 'https://consultixtech.com') },
  plugins: [react(), tailwindcss(), {
    name: 'prerender-preview-routes',
    configurePreviewServer(server) {
      // Vite's SPA preview otherwise returns homepage HTML for extensionless routes.
      // Match Cloudflare's directory-index behavior when checking pre-render hydration.
      server.middlewares.use((req, _res, next) => {
        const url = new URL(req.url || '/', 'http://localhost');
        const pathname = url.pathname.replace(/\/$/, '') || '/';
        if (pathname !== '/' && pageDefinitions.some(p => p.path === pathname)) req.url = `${pathname}/index.html${url.search}`;
        next();
      });
    },
  }],
  server: { proxy: { '/api': 'http://127.0.0.1:8788' } },
  build: { sourcemap: false, rollupOptions: { output: { manualChunks: { react: ['react', 'react-dom', 'react-router-dom'], motion: ['motion/react'] } } } },
}));
