const { ethers } = require('ethers');
const fs = require('node:fs');
const path = require('node:path');
const { ProxyAgent, setGlobalDispatcher } = require('undici');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Node.js fetch does not honor HTTP_PROXY/HTTPS_PROXY automatically; wire it up.
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
if (proxyUrl) {
  setGlobalDispatcher(new ProxyAgent(proxyUrl));
  console.log('Using proxy:', proxyUrl);
}

async function main() {
  const { RPC_URL, PRIVATE_KEY, CHAIN_ID } = process.env;
  if (!RPC_URL || !PRIVATE_KEY || !/^\d+$/.test(CHAIN_ID || '')) {
    throw new Error('Set RPC_URL, PRIVATE_KEY and CHAIN_ID explicitly');
  }
  require('./compile.js'); // Always deploy freshly compiled source.
  const artifact = JSON.parse(fs.readFileSync(path.join(__dirname, 'artifacts/ChainTalk.json')));
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  try {
    const network = await provider.getNetwork();
    if (network.chainId !== BigInt(CHAIN_ID)) throw new Error('RPC chain does not match CHAIN_ID');
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    const request = await factory.getDeployTransaction();
    const gas = await provider.estimateGas({ ...request, from: wallet.address });
    const fees = await provider.getFeeData();
    const price = fees.maxFeePerGas ?? fees.gasPrice;
    if (price === null) throw new Error('RPC did not return gas pricing');
    console.log('Chain:', network.chainId.toString(), 'Deployer:', wallet.address);
    console.log('Estimated maximum fee:', ethers.formatEther(gas * price), 'ETH');
    if (!process.argv.includes('--broadcast')) { console.log('Dry run. Add --broadcast to deploy.'); return; }
    if (await provider.getBalance(wallet.address) < gas * price) throw new Error('Insufficient balance');
    const contract = await factory.deploy();
    console.log('Transaction:', contract.deploymentTransaction().hash);
    const receipt = await contract.deploymentTransaction().wait();
    const info = { chainId: network.chainId.toString(), address: await contract.getAddress(), blockNumber: receipt.blockNumber, transactionHash: receipt.hash, compiler: artifact.compiler.version };
    fs.writeFileSync(path.join(__dirname, `deploy-${network.chainId}-${info.address}.json`), JSON.stringify(info, null, 2));
    console.log(info);
  } finally { provider.destroy(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
