import { Buffer } from 'node:buffer';

/**
 * Serves the app's own Hono API (`src/server/routes/api.ts`) from the Vite dev
 * server, so the preview is single-origin and needs no proxy.
 *
 * The real route modules are loaded through Vite's SSR pipeline on every
 * request, so edits under `src/server` are picked up without a restart.
 * `@devvit/web/server` and `@devvit/redis` are aliased to the in-memory shims
 * in `dev/shims`, which is what makes the routes runnable outside Reddit.
 */
export function localApiPlugin() {
  return {
    name: 'stankville-local-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url ?? '/';
        if (!rawUrl.startsWith('/api/')) {
          next();
          return;
        }

        try {
          const { Hono } = await import('hono');
          const apiModule = await server.ssrLoadModule(
            '/src/server/routes/api.ts'
          );

          const app = new Hono();
          app.route('/api', apiModule.api);

          const method = (req.method ?? 'GET').toUpperCase();
          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (Array.isArray(value)) {
              for (const item of value) headers.append(key, item);
            } else if (typeof value === 'string') {
              headers.set(key, value);
            }
          }

          let body;
          if (method !== 'GET' && method !== 'HEAD') {
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            const buffer = Buffer.concat(chunks);
            if (buffer.length > 0) body = buffer;
          }

          const url = new URL(
            rawUrl,
            `http://${req.headers.host ?? 'localhost:3000'}`
          );
          const response = await app.request(url, { method, headers, body });

          res.statusCode = response.status;
          response.headers.forEach((value, key) => {
            if (key.toLowerCase() !== 'content-length') {
              res.setHeader(key, value);
            }
          });
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (error) {
          console.error('[local-api] request failed:', error);
          res.statusCode = 500;
          res.setHeader('content-type', 'application/json');
          res.end(
            JSON.stringify({
              status: 'error',
              message: error instanceof Error ? error.message : String(error),
            })
          );
        }
      });
    },
  };
}
