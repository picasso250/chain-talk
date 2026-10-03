import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Interface } from 'ethers';
import { loadPosts, confirmedEvent, mergePosts, discussionTopics } from './forum.js';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from './constants.js';
const post = (id, replyTo = '0') => ({ id, replyTo, timestamp: '10', content: 'hello' });
test('nested replies stay under their root, with no number precision loss', () => {
  const data = [post('9007199254740994','9007199254740993'),post('2','1'),post('1'),post('9007199254740993','2'),post('3')];
  const topics = discussionTopics(data);
  assert.deepEqual(topics.map(t => t.id), ['3','1']);
  assert.deepEqual(topics[1].replies.map(r => r.id), ['2','9007199254740993','9007199254740994']);
  assert.equal(data[0].id,'9007199254740994');
});
test('confirmed nested replies survive stale indexing and deduplicate', () => {
  const local = { ...post('3','2'), confirmedLocally:true };
  const current = [post('1'),post('2','1'),local];
  assert.equal(mergePosts(current.slice(0,2),current).length,3);
  const indexed = current.map(({confirmedLocally,...p}) => p);
  assert.deepEqual(mergePosts(indexed,current),indexed);
});
test('receipt preserves parent, author, content and hash', () => {
  const iface = new Interface(CONTRACT_ABI);
  const author='0x0000000000000000000000000000000000000001';
  const log=iface.encodeEventLog(iface.getEvent('Posted'),[3n,2n,author,42n,'nested']);
  const record=confirmedEvent({hash:'0xreal',logs:[{...log,address:CONTRACT_ADDRESS}]},iface);
  assert.deepEqual(record,{id:'3',replyTo:'2',author,timestamp:'42',content:'nested',transactionHash:'0xreal',confirmedLocally:true});
});
test('query errors reject; pagination includes all posts', async () => {
  const original=globalThis.fetch;
  try {
    globalThis.fetch=async()=>({ok:false,status:503});
    await assert.rejects(loadPosts(),/HTTP 503/);
    globalThis.fetch=async()=>({ok:true,json:async()=>({errors:[{message:'bad'}]})});
    await assert.rejects(loadPosts(),/Invalid/);
    let calls=0;
    globalThis.fetch=async(url,options)=> {
      const after=JSON.parse(options.body).variables.after;
      assert.equal(after,calls===0?'':'999');
      return {ok:true,json:async()=>({data:{posts:calls++===0?Array.from({length:1000},(_,i)=>post(String(i))):[post('last')]}})};
    };
    assert.equal((await loadPosts()).length,1001);
  } finally {globalThis.fetch=original;}
});
