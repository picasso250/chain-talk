const SUBGRAPH_URL = "https://api.studio.thegraph.com/query/1723159/chain-talk-arbitrum/v0.0.1";

fetch(SUBGRAPH_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    query: `{
      posts(first: 100, orderBy: id, orderDirection: asc) {
        id replyTo author content timestamp transactionHash
      }
    }`
  })
}).then(r => r.json()).then(d => {
  console.log(`读到 ${d.data.posts.length} 条帖子:`);
  d.data.posts.forEach(p => {
    console.log(`---`);
    console.log(`#${p.id} (replyTo: ${p.replyTo})`);
    console.log(`作者: ${p.author}`);
    console.log(`内容: ${p.content.slice(0, 80)}${p.content.length > 80 ? '...' : ''}`);
  });
});
