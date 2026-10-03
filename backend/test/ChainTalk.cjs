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
  await assert.rejects(f.post.staticCall('',0), /Content cannot be empty/);
  await assert.rejects(async () => { await (await f.post('',0, { gasLimit: 100000 })).wait(); }, error => error.code === 'CALL_EXCEPTION');
  const receipt = await (await f.post('First',0)).wait();
  const event = f.interface.parseLog(receipt.logs[0]);
  assert.equal(event.args.id, 1n);
});
test('no initialization, ownership or upgrade entry points', async () => {
  const f = await deploy();
  const admin = new ethers.Interface(['function initialize()', 'function owner()', 'function transferOwnership(address)', 'function renounceOwnership()', 'function upgradeTo(address)', 'function upgradeToAndCall(address,bytes)', 'function proxiableUUID()']);
  for (const [name,args] of [['initialize',[]],['owner',[]],['transferOwnership',[author.address]],['renounceOwnership',[]],['upgradeTo',[author.address]],['upgradeToAndCall',[author.address,'0x']],['proxiableUUID',[]]]) {
    assert.equal(f.interface.getFunction(name), null);
    await assert.rejects(provider.call({ to: await f.getAddress(), data: admin.encodeFunctionData(name,args) }), error => error.code === 'CALL_EXCEPTION');
  }
});
test('future and self references revert without consuming IDs', async () => {
  const f = await deploy();
  await assert.rejects(f.post.staticCall('Reply',1), /Post does not exist/);
  await (await f.post('First',0)).wait();
  for (const id of [2n,ethers.MaxUint256]) {
    await assert.rejects(f.post.staticCall('Reply',id), /Post does not exist/);
  }
  await assert.rejects(async () => { await (await f.post('Bad',2,{gasLimit:100000})).wait(); }, e => e.code === 'CALL_EXCEPTION');
  const receipt = await (await f.post('Valid',1)).wait();
  assert.equal(f.interface.parseLog(receipt.logs[0]).args.id,2n);
});
test('empty nested replies revert', async () => {
  const f = await deploy();
  await (await f.post('First',0)).wait();
  await (await f.post('Reply',1)).wait();
  await assert.rejects(f.post.staticCall('',2), /Content cannot be empty/);
});
test('topics and nested replies share sequential IDs and preserve parent links', async () => {
  const f = await deploy();
  let id = 0n;
  for (const parent of [0n,1n,2n,0n,3n]) {
    const receipt = await (await f.post('你好',parent)).wait();
    const event = f.interface.parseLog(receipt.logs[0]);
    assert.equal(event.name,'Posted');
    assert.deepEqual([...event.args], [++id,parent,author.address,'你好']);
  }
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
