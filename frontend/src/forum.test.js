import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Interface } from 'ethers';
import { loadTopics, confirmedEvent, mergeTopics } from './forum.js';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from './constants.js';
const topic = { id: '1', timestamp: '10', replies: [], transactionHash: '0xabc' };
test('confirmed topic survives stale indexing, then deduplicates', () => {
  const local = { ...topic, confirmedLocally: true };
  assert.deepEqual(mergeTopics([], [local]), [local]);
  assert.deepEqual(mergeTopics([topic], [local]), [topic]);
});
test('confirmed reply survives stale indexing and merges once', () => {
  const reply = { id: '2', timestamp: '11', confirmedLocally: true };
  const local = { ...topic, replies: [reply] };
  assert.equal(mergeTopics([topic], [local])[0].replies.length, 1);
  const indexed = { ...topic, replies: [{ id: '2', timestamp: '11' }] };
  assert.deepEqual(mergeTopics([indexed], [local]), [indexed]);
});
test('receipts provide real IDs, content and transaction hash for both events', () => {
  const iface = new Interface(CONTRACT_ABI);
  const author = '0x0000000000000000000000000000000000000001';
  for (const [name, values] of [['TopicCreated', [3n, author, 42n, 'hello']], ['ReplyCreated', [4n, 3n, author, 43n, 'reply']]]) {
    const log = iface.encodeEventLog(iface.getEvent(name), values);
    const record = confirmedEvent({ hash: '0xrealhash', logs: [{ ...log, address: CONTRACT_ADDRESS }] }, iface, name);
    assert.equal(record.transactionHash, '0xrealhash');
    assert.equal(record.id, name === 'TopicCreated' ? '3' : '4');
    assert.equal(record.content, name === 'TopicCreated' ? 'hello' : 'reply');
  }
});
test('HTTP and GraphQL failures reject instead of returning empty topics', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ ok: false, status: 503 });
    await assert.rejects(loadTopics(), /HTTP 503/);
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ errors: [{ message: 'index unavailable' }], data: { topics: [] } }) });
    await assert.rejects(loadTopics(), /Invalid/);
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ data: { topics: [] } }) });
    assert.deepEqual(await loadTopics(), []);
  } finally { globalThis.fetch = original; }
});
