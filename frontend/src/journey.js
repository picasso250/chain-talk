// One-tab, privacy-aware event sequence; no account, text, amount or transaction hashes.
const events = new Set([
  'page_view','page_exit','topic_click','topic_open','topic_close','connect_click','wallet_select',
  'connect_success','connect_error','no_wallet','topic_attempt','topic_confirmed',
  'topic_error','reply_attempt','reply_confirmed','reply_error'
]);
const storageKey = 'talka_journey_v1';
let state = null;
if (typeof window !== 'undefined' && navigator.globalPrivacyControl !== true && navigator.doNotTrack !== '1') {
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
    state = saved && /^[0-9a-f-]{36}$/.test(saved.id) && Date.now()-saved.updated < 30*60_000 && saved.step < 1000
      ? saved : {id:crypto.randomUUID(), step:0,updated:Date.now()};
  } catch { /* If storage is unavailable, avoid tracking. */ }
}
export function track(event, postId = null) {
  if (!state || !events.has(event)) return;
  const isTopicEvent = ['topic_click', 'topic_open', 'topic_close'].includes(event);
  if (isTopicEvent && !/^[1-9][0-9]{0,77}$/.test(String(postId))) return;
  if (!isTopicEvent && postId !== null) return;
  state.updated = Date.now(); state.step += 1;
  try { sessionStorage.setItem(storageKey, JSON.stringify(state)); } catch { return; }
  fetch('/api/journey', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({session:state.id,event,step:state.step,...(isTopicEvent ? {post_id:String(postId)} : {})}),
    credentials:'omit',keepalive:true,cache:'no-store'
  }).catch(()=>{});
}
if (state) {
  track('page_view');
  window.addEventListener('pagehide',()=>track('page_exit'),{once:true});
}
