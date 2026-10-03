import { BrowserProvider, Contract, JsonRpcProvider } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./constants.js";
import { ensureNetwork } from "./wallet.js";

// Sepolia testnet RPC for reading events directly (no The Graph needed during testing)
const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
const DEPLOY_BLOCK = 11835312;
const BLOCK_CHUNK = 5000; // Read logs in chunks to avoid RPC limits

export async function postMessage(provider, content, replyTo = "0") {
  await ensureNetwork(provider);
  const signer = await new BrowserProvider(provider).getSigner();
  const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  const tx = await contract.post(content, replyTo);
  const receipt = await tx.wait();
  return confirmedEvent(receipt, contract.interface, signer.provider);
}

export async function loadPosts() {
  const provider = new JsonRpcProvider(RPC_URL);
  try {
    const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const latest = await provider.getBlockNumber();
    const posts = [];
    const blockCache = new Map();
    for (let from = DEPLOY_BLOCK; from <= latest; from += BLOCK_CHUNK) {
      const to = Math.min(from + BLOCK_CHUNK - 1, latest);
      const events = await contract.queryFilter("Posted", from, to);
      for (const e of events) {
        if (!blockCache.has(e.blockNumber)) {
          const block = await provider.getBlock(e.blockNumber);
          blockCache.set(e.blockNumber, block?.timestamp ?? 0);
        }
        posts.push({
          id: e.args.id.toString(),
          replyTo: e.args.replyTo.toString(),
          author: e.args.author,
          content: e.args.content,
          timestamp: blockCache.get(e.blockNumber).toString(),
          transactionHash: e.transactionHash,
        });
      }
    }
    return posts;
  } finally {
    provider.destroy();
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

export async function confirmedEvent(receipt, contractInterface, provider) {
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) continue;
    const event = contractInterface.parseLog(log);
    if (event?.name !== "Posted") continue;
    const { args } = event;
    const block = await provider.getBlock(receipt.blockNumber);
    return {
      id: args.id.toString(), replyTo: args.replyTo.toString(),
      author: args.author, content: args.content,
      timestamp: (block?.timestamp ?? 0).toString(),
      transactionHash: receipt.hash, confirmedLocally: true,
    };
  }
  throw new Error("Missing Posted event in confirmed transaction");
}
