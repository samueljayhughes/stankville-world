You are writing a Devvit web application that will be executed on Reddit.com.

## Tech Stack

- **Frontend**: React 19, Tailwind CSS 4, Vite
- **Backend**: Node.js v22 serverless environment (Devvit), Hono, TRPC
- **Communication**: tRPC v11 for end-to-end type safety

## Layout & Architecture

- `/src/server`: **Backend Code**. This runs in a secure, serverless environment.
  - `trpc.ts`: Defines the API router and procedures.
  - `index.ts`: Main server entry point (Hono app).
  - Access `redis`, `reddit`, and `context` here via `@devvit/web/server`.
- `/src/client`: **Frontend Code**. This is executed inside of an iFrame on reddit.com
  - To add an entrypoint, create a HTML file and add to the mapping inside of `devvit.json`
  - Entrypoints:
    - `game.html`: The main React entry point (Expanded View).
    - `splash.html`: The initial React entry point (Inline View). This will be shown in the reddit.com feed. Please keep it fast and keep heavy dependencies inside of `game.html`
- `/src/shared`: **Shared Code**. Code to share between the client and server

## Frontend

### Rules

- Instead of `window.location` or `window.assign`, use `navigateTo` from `@devvit/web/client`

### Limitations

- `window.alert`: Use `showToast` or `showForm` from `@devvit/web/client`
- File downloads: Use clipboard API with `showToast` to confirm
- Geolocation, camera, microphone, and notifications web APIs: No alternatives
- Inline script tags inside of `html` files: Use a script tag and separate js/ts file

## Commands

- `npm run type-check`: Check typescript types
- `npm run lint`: Check the linter
- `npm run test -- my-file-name`: Run tests isolated to a file

## Code Style

- Prefer type aliases over interfaces when writing typescript
- Prefer named exports over default exports
- Never cast typescript types

## Global Rules

- You may find code that references blocks or `@devvit/public-api` while building a feature. Do NOT use this code as this project is configured to use Devvit web only.
- Whenever you add an endpoint for a new menu item action, ensure that you've added the corresponding mapping to `devvit.json` so that it is properly registered

Docs: https://developers.reddit.com/docs/llms.txt.

## Running the app locally (Base44 sandbox preview)

The real app only runs on Reddit: `npm run dev` is `devvit playtest`, which needs
a Reddit login, a tunnel to Reddit and Devvit's plugin host (that host is what
provides `context` and `redis`). None of that exists in a sandbox, so the
preview runs the same source through a small harness in `dev/`:

```
docker compose -f docker-compose.base44.yml up -d      # dev server on :3000
```

- `dev/vite.config.mjs` is the preview config: Vite dev server with
  `root` = repo root, serving the real entrypoints at
  `/src/client/game.html` (also `/` and `/game.html`) and `/src/client/splash.html`.
  The app's own `vite.config.ts` and `devvit.json` (used by `npm run build` /
  `devvit upload`) are untouched.
- `dev/local-api-plugin.mjs` serves the real Hono routes from
  `src/server/routes/api.ts` on the same origin under `/api/*`, loading them via
  Vite's SSR pipeline on each request — edits under `src/server` apply without a
  restart.
- `dev/shims/` replaces only `@devvit/web/server` (`context`, `redis`),
  `@devvit/redis` and `@devvit/web/client` with local stand-ins. Game logic,
  registries and systems are the real ones.
- Quirks: the preview is one fixed dev player/post
  (`t2_stankville_dev` / `t3_stankville_dev`), and state lives in an in-memory
  map, so it resets when the container restarts. Menu items, forms, triggers and
  anything else needing the Reddit API are not reachable from the preview.
- Verify a change by loading `/` and playing through EXPLORE → SMASH; health is
  `GET /api/init` and it must return 200 JSON.
- `npm run build` and `npm run type-check` must both pass. `npm run lint` still
  reports pre-existing `no-explicit-any` errors outside the preview harness
  (client `game.tsx`, `GameEngine.ts`, `api.ts`, `shared/types.ts`), so
  `npm run deploy` is blocked by lint only.
