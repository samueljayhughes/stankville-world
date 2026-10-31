import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { localApiPlugin } from './local-api-plugin.mjs';

/**
 * Sandbox preview config for Reddit's Devvit app.
 *
 * The app normally runs on Reddit (`devvit playtest`), which needs a Reddit
 * login, a tunnel and the Devvit plugin host. In the Base44 sandbox we serve
 * the real client entrypoints from `src/client` and the real Hono routes from
 * `src/server`, with `@devvit/web` swapped for the in-memory shims in
 * `dev/shims`. This file is only used by the preview harness; the app's own
 * vite.config.ts (and therefore `npm run build` / `devvit upload`) is untouched.
 */

const devDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(devDir, '..');
const shim = (name) => path.join(devDir, 'shims', name);

const allowedHosts = ['localhost', '127.0.0.1'];
if (process.env.BASE44_SANDBOX_HOST_DOMAIN) {
  allowedHosts.push(`.${process.env.BASE44_SANDBOX_HOST_DOMAIN}`);
}

const entryRedirects = {
  '/': '/src/client/game.html',
  '/game.html': '/src/client/game.html',
  '/splash.html': '/src/client/splash.html',
};

function entrypoints() {
  return {
    name: 'stankville-entrypoints',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = (req.url ?? '/').split('?')[0] ?? '/';
        const target = entryRedirects[pathname];
        if (!target) {
          next();
          return;
        }
        res.statusCode = 302;
        res.setHeader('location', target);
        res.end();
      });
    },
  };
}

export default defineConfig({
  root: repoRoot,
  // 'mpa' so Vite serves the existing html entrypoints from src/client
  // (devvit.json maps them; there is no root index.html).
  appType: 'mpa',
  plugins: [react(), tailwind(), entrypoints(), localApiPlugin()],
  resolve: {
    alias: [
      {
        find: /^@devvit\/web\/server$/,
        replacement: shim('devvit-web-server.ts'),
      },
      { find: /^@devvit\/redis$/, replacement: shim('redis-memory.ts') },
      {
        find: /^@devvit\/web\/client$/,
        replacement: shim('devvit-client.ts'),
      },
    ],
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts,
    watch: {
      // Bind mounts often miss native file events.
      usePolling: process.env.BASE44_PREVIEW_MODE === '1',
    },
  },
});
