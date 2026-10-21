import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CHAINS } from '../config/chains.js';

test('distinct verified chain metadata drives each site', () => {
  assert.deepEqual([CHAINS.ethereum.CHAIN_ID, CHAINS.arbitrum.CHAIN_ID], [1, 42161]);
  assert.equal(CHAINS.ethereum.CONTRACT_ADDRESS, '0xec3639B4CC756d39e996447dE1787B09EF646b6F');
  assert.equal(CHAINS.arbitrum.CONTRACT_ADDRESS, '0x6Cb266BB285BA5F6591e449543d259277d57C700');
  assert.notEqual(CHAINS.ethereum.SUBGRAPH_URL, CHAINS.arbitrum.SUBGRAPH_URL);
  assert.equal(CHAINS.ethereum.OTHER_VERSION_URL, 'https://talka.io99.xyz/');
  assert.equal(CHAINS.arbitrum.OTHER_VERSION_URL, 'https://talk.io99.xyz/');
});
test('deployments have unique Workers, domains, datasets, and explicit site names', () => {
  const eth=JSON.parse(readFileSync(new URL('../wrangler.ethereum.jsonc',import.meta.url)));
  const arb=JSON.parse(readFileSync(new URL('../wrangler.arbitrum.jsonc',import.meta.url)));
  assert.equal(eth.name, 'chain-talk');
  assert.equal(arb.name, 'chain-talk-arbitrum');
  assert.equal(eth.routes[0].pattern, 'talk.io99.xyz');
  assert.equal(arb.routes[0].pattern, 'talka.io99.xyz');
  assert.equal(eth.vars.SITE,'ethereum');
  assert.equal(arb.vars.SITE,'arbitrum');
  assert.notEqual(eth.analytics_engine_datasets[0].dataset,arb.analytics_engine_datasets[0].dataset);
  assert.equal(eth.d1_databases[0].database_id,arb.d1_databases[0].database_id);
});
