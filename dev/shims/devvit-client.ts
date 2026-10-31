/**
 * Browser stand-in for `@devvit/web/client`, used only by the sandbox preview
 * harness. Inside Reddit these calls are handled by the Devvit web view host;
 * here they fall back to ordinary navigation.
 */

export const context = {
  username: 'stankville_dev',
  postId: 't3_stankville_dev',
};

export const navigateTo = (url: string): void => {
  window.location.assign(url);
};

export const requestExpandedMode = (): void => {
  window.location.assign('/src/client/game.html');
};

export const showToast = (text: string): void => {
  console.log('[devvit toast]', text);
};
