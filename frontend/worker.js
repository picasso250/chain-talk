// Cloudflare Worker with Assets - static files are served automatically from ./dist
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  }
};
