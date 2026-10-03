const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');
const { ethers } = require('ethers');
const artifact = require('../artifacts/ChainTalk.json');
let node, provider, author;
before(async () => {
  const binary = process.env.ANVIL_BIN || path.join(__dirname, '../node_modules/@foundry-rs/anvil-win32-amd64/bin/anvil.exe');
  node = spawn(binary, ['--host', '127.0.0.1', '--port', '0', '--chain-id', '31337'], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  const url = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Anvil startup timed out')), 15000);
    let output = '';
    node.on('error', error => { clearTimeout(timer); reject(error); });
    node.on('exit', code => { clearTimeout(timer); reject(new Error(`Anvil exited: ${code}`)); });
    node.stdout.on('data', data => {
      output += data.toString();
      const match = output.match(/Listening on (127\.0\.0\.1:\d+)/);
      if (match) { clearTimeout(timer); resolve(`http://${match[1]}`); }
    });
  });
  provider = new ethers.JsonRpcProvider(url, 31337, { cacheTimeout: -1 });
  provider.pollingInterval = 50;
  author = await provider.getSigner();
});
after(() => { provider?.destroy(); node?.kill(); });
async function deploy() {
  const forum = await new ethers.ContractFactory(artifact.abi, artifact.bytecode, author).deploy();
  await forum.waitForDeployment();
  return forum;
}
test('empty topics revert without consuming IDs', async () => {
  const f = await deploy();
  await assert.rejects(f.createTopic.staticCall(''), /Content cannot be empty/);
  await assert.rejects(async () => { await (await f.createTopic('', { gasLimit: 100000 })).wait(); }, error => error.code === 'CALL_EXCEPTION');
  assert.equal(await f.getTopicIdCounter(), 0n);
  await (await f.createTopic('First')).wait();
  assert.equal(await f.getTopicIdCounter(), 1n);
});
test('no initialization, ownership or upgrade entry points', async () => {
  const f = await deploy();
  assert.equal(await f.version(), '1.0.0');
  const admin = new ethers.Interface(['function initialize()', 'function owner()', 'function transferOwnership(address)', 'function renounceOwnership()', 'function upgradeTo(address)', 'function upgradeToAndCall(address,bytes)', 'function proxiableUUID()']);
  for (const [name,args] of [['initialize',[]],['owner',[]],['transferOwnership',[author.address]],['renounceOwnership',[]],['upgradeTo',[author.address]],['upgradeToAndCall',[author.address,'0x']],['proxiableUUID',[]]]) {
    assert.equal(f.interface.getFunction(name), null);
    await assert.rejects(provider.call({ to: await f.getAddress(), data: admin.encodeFunctionData(name,args) }), error => error.code === 'CALL_EXCEPTION');
  }
});
test('zero and future topics reject replies without changing counters', async () => {
  const f = await deploy();
  await assert.rejects(f.createReply.staticCall(1,'Reply'), /Topic does not exist/);
  await (await f.createTopic('First')).wait();
  for (const id of [0n,2n,ethers.MaxUint256]) {
    await assert.rejects(f.createReply.staticCall(id,'Reply'), /Topic does not exist/);
  }
  assert.equal(await f.getReplyIdCounter(), 0n);
});
test('empty replies leave counts unchanged', async () => {
  const f = await deploy();
  await (await f.createTopic('First')).wait();
  await assert.rejects(f.createReply.staticCall(1,''), /Content cannot be empty/);
  assert.equal(await f.getReplyIdCounter(), 0n);
});
test('valid replies emit content and update global counter', async () => {
  const f = await deploy();
  await (await f.createTopic('First')).wait();
  await (await f.createTopic('Second')).wait();
  let id = 0n;
  for (const topic of [1n,2n,1n]) {
    const receipt = await (await f.createReply(topic,'你好\n**Reply**')).wait();
    const event = f.interface.parseLog(receipt.logs[0]);
    const block = await provider.getBlock(receipt.blockNumber);
    assert.equal(event.name,'ReplyCreated');
    assert.deepEqual([...event.args], [++id,topic,author.address,BigInt(block.timestamp),'你好\n**Reply**']);
  }
  assert.equal(await f.getReplyIdCounter(),3n);
});

test('deployment dry run sends no transaction and rejects the wrong chain', async () => {
  const { promisify } = require('node:util');
  const execFile = promisify(require('node:child_process').execFile);
  const wallet = ethers.Wallet.createRandom();
  await provider.send('anvil_setBalance', [wallet.address, '0x56BC75E2D63100000']);
  const env = { ...process.env, RPC_URL: provider._getConnection().url, PRIVATE_KEY: wallet.privateKey, CHAIN_ID: '31337' };
  const script = path.join(__dirname, '../deploy.js');
  const { stdout } = await execFile(process.execPath, [script], { env, windowsHide: true });
  assert.match(stdout, /Dry run/);
  assert.equal(await provider.getTransactionCount(wallet.address), 0);
  await assert.rejects(execFile(process.execPath, [script], { env: { ...env, CHAIN_ID: '1' }, windowsHide: true }), error => error.stderr.includes('RPC chain does not match'));
});
