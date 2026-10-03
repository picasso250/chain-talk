import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { discoverWallets, watchAccount } from './wallet.js';

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
