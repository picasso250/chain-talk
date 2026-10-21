// Single-tab anonymous experience analytics for talka.io99.xyz.
const events = new Set(['page_view','page_exit','topic_open','topic_close','connect_click','wallet_select','connect_success','connect_error','no_wallet','topic_attempt','topic_confirmed','topic_error','reply_attempt','reply_confirmed','reply_error']);
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/journey') return env.ASSETS.fetch(request);
    if (request.method !== 'POST') return new Response('Method not allowed',{status:405});
    if (request.headers.get('Origin') !== url.origin || request.headers.get('Content-Type')?.split(';')[0].trim() !== 'application/json') return new Response('Forbidden',{status:403});
    let data;
    try { const raw=await request.text(); if(raw.length>512) return new Response('Too large',{status:413}); data=JSON.parse(raw); }
    catch { return new Response('Invalid JSON',{status:400}); }
    if (!data || Object.keys(data).sort().join(',') !== 'event,session,step' ||
        typeof data.session !== 'string' || !/^[0-9a-f-]{36}$/.test(data.session) ||
        !events.has(data.event) || !Number.isInteger(data.step) || data.step < 1 || data.step > 1000)
      return new Response('Invalid event',{status:400});
    if (!env.JOURNEY) return new Response('Analytics unavailable',{status:503});
    env.JOURNEY.writeDataPoint({blobs:[data.session,data.event],doubles:[data.step],indexes:[data.session]});
    return new Response(null,{status:204,headers:{'Cache-Control':'no-store'}});
  }
};
