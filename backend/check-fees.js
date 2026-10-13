const API_KEY = '3UVRTPZ7XKYUHC9QDQFQP4H2UAV4B24UJI';
const addr = '0x806918b917a89956B8AF1a2897940c475973E2d3';
const url = `https://api.etherscan.io/v2/api?chainid=42161&module=account&action=txlist&address=${addr}&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=${API_KEY}`;

fetch(url).then(r => r.json()).then(d => {
  console.log('Status:', d.status);
  console.log('Message:', d.message);
  console.log('Result type:', typeof d.result, Array.isArray(d.result));
  if (typeof d.result === 'string') console.log('Result:', d.result);
  if (Array.isArray(d.result)) {
    const txs = d.result.filter(tx => tx.to && tx.to.toLowerCase() === '0x6cb266bb285ba5f6591e449543d259277d57c700');
    txs.forEach((tx, i) => {
      const fee = (BigInt(tx.gasUsed) * BigInt(tx.gasPrice)).toString();
      console.log(`交易 ${i+1}: ${tx.hash.slice(0,10)}...  Gas: ${tx.gasUsed}  费用: ${(Number(fee)/1e18).toFixed(6)} ETH`);
    });
    const total = txs.reduce((sum, tx) => sum + BigInt(tx.gasUsed) * BigInt(tx.gasPrice), 0n);
    console.log(`---`);
    console.log(`发帖交易共 ${txs.length} 笔，总计: ${(Number(total)/1e18).toFixed(6)} ETH`);
    console.log(`约合: $${(Number(total)/1e18 * 2480).toFixed(4)}`);
  }
});
