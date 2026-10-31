/**
 * Local stand-in for `@devvit/web/server`, used only by the sandbox preview
 * harness (see dev/vite.config.mjs).
 *
 * Inside Reddit the real `context` is filled from the request's Devvit
 * metadata and `redis` talks to Reddit's plugin host. Neither exists on a plain
 * Node server, so the preview pins one dev player/post and keeps state in
 * memory. The real game systems and routes are used unchanged.
 */

export { redis } from './redis-memory';

const sandboxUser = process.env.STANKVILLE_DEV_USER_ID ?? 't2_stankville_dev';
const sandboxPost = process.env.STANKVILLE_DEV_POST_ID ?? 't3_stankville_dev';

export const context = {
  postId: sandboxPost,
  userId: sandboxUser,
  username: 'stankville_dev',
  subredditId: 't5_stankville_dev',
  subredditName: 'stankville_world_dev',
};
