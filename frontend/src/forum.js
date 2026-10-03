import { BrowserProvider, Contract } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./constants.js";
import { ensureNetwork } from "./wallet.js";

export async function postMessage(provider, content, replyTo = "0") {
  await ensureNetwork(provider);
  const signer = await new BrowserProvider(provider).getSigner();
  const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  const tx = await contract.post(content, replyTo);
  return confirmedEvent(await tx.wait(), contract.interface);
}

const endpoint = "https://api.studio.thegraph.com/query/1723159/chain-talk/version/latest";

export async function loadPosts() {
  const posts = [];
  let after = "";
  // Cursor follows the indexer's ID ordering, independently of numeric post order.
  while (true) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query($after: ID!) {
          posts(first: 1000, orderBy: id, orderDirection: asc, where: {id_gt: $after}) {
            id replyTo author content timestamp transactionHash
          }
        }`, variables: { after },
      }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    if (result.errors?.length || !Array.isArray(result.data?.posts)) throw new Error("Invalid discussion response");
    const page = result.data.posts;
    posts.push(...page);
    if (page.length < 1000) return posts;
    const cursor = page.at(-1).id;
    if (cursor === after) throw new Error("Discussion pagination stalled");
    after = cursor;
  }
}

export function mergePosts(indexed, current) {
  const merged = new Map(indexed.map(post => [post.id, post]));
  for (const post of current) {
    if (post.confirmedLocally && !merged.has(post.id)) merged.set(post.id, post);
  }
  return [...merged.values()];
}

// Derive discussion groups from parent IDs; no second mutable copy of posts.
export function discussionTopics(posts) {
  const roots = new Map();
  const topics = [];
  const ordered = [...posts].sort((a, b) => BigInt(a.id) < BigInt(b.id) ? -1 : 1);
  for (const post of ordered) {
    if (post.replyTo === "0") {
      const topic = { ...post, replies: [] };
      roots.set(post.id, topic);
      topics.push(topic);
    } else {
      const root = roots.get(post.replyTo);
      if (!root) continue;
      root.replies.push(post);
      roots.set(post.id, root);
    }
  }
  return topics.reverse();
}

export function confirmedEvent(receipt, contractInterface) {
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) continue;
    const event = contractInterface.parseLog(log);
    if (event?.name !== "Posted") continue;
    const { args } = event;
    return {
      id: args.id.toString(), replyTo: args.replyTo.toString(),
      author: args.author, content: args.content, timestamp: args.timestamp.toString(),
      transactionHash: receipt.hash, confirmedLocally: true,
    };
  }
  throw new Error("Missing Posted event in confirmed transaction");
}
