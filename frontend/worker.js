// Cloudflare Worker with Assets - static files are served automatically from ./dist
// This worker handles SPA fallback for client-side routing
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Assets are served automatically; this is just a passthrough
    return env.ASSETS.fetch(request);
  }
};
