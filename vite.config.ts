import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { auditApiPlugin } from './server/apiPlugin';

export default defineConfig({
  plugins: [react(), auditApiPlugin()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: true
  }
});
