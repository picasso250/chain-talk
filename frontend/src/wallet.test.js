import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { discoverWallets, watchAccount, ensureNetwork } from './wallet.js';
import { TARGET_CHAIN_ID } from './constants.js';

test('discovery deduplicates broadcasts and stops after cleanup', () => {
  const target = new EventTarget();
  let updates = 0;
  const stop = discoverWallets(wallets => { updates++; assert.equal(wallets.length, 1); }, target);
  const announce = () => target.dispatchEvent(new CustomEvent('eip6963:announceProvider', { detail: { info: { uuid: 'one' }, provider: {} } }));
  announce(); announce(); stop(); announce();
  assert.equal(updates, 1);
});

test('account listeners detach from the old provider', () => {
  const a = new EventEmitter();
  const b = new EventEmitter();
  const seen = [];
  const stopA = watchAccount(a, account => seen.push(account));
  a.emit('accountsChanged', ['A']);
  stopA();
  const stopB = watchAccount(b, account => seen.push(account));
  a.emit('accountsChanged', ['stale']);
  b.emit('accountsChanged', ['B']);
  b.emit('accountsChanged', []);
  b.emit('disconnect');
  stopB();
  assert.deepEqual(seen, ['A', 'B', null, null]);
  assert.equal(a.listenerCount('accountsChanged') + b.listenerCount('accountsChanged') + b.listenerCount('disconnect'), 0);
});

test('network check switches only when needed and propagates rejection', async () => {
  const calls = [];
  const provider = { request: async args => { calls.push(args); return TARGET_CHAIN_ID; } };
  await ensureNetwork(provider);
  assert.equal(calls.length, 1);
  provider.request = async args => {
    if (args.method === 'eth_chainId') return '0x1';
    assert.equal(args.params[0].chainId, TARGET_CHAIN_ID);
    throw new Error('User rejected');
  };
  await assert.rejects(ensureNetwork(provider), /User rejected/);
  await assert.rejects(ensureNetwork(null), /Wallet not connected/);
});
