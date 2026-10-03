import { BrowserProvider, Contract } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS, SUBGRAPH_URL } from "./constants.js";

export async function postMessage(provider, content, replyTo = "0") {
  const signer = await new BrowserProvider(provider).getSigner();
  const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  const tx = await contract.post(content, replyTo);
  const receipt = await tx.wait();
  return confirmedEvent(receipt, contract.interface, signer.provider);
}

export async function loadPosts(request = fetch) {
  const posts = [];
  let after = "";
  while (true) {
    const response = await request(SUBGRAPH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query Posts($after: ID!) {
          posts(first: 1000, orderBy: id, orderDirection: asc, where: { id_gt: $after }) {
            id replyTo author content timestamp transactionHash
          }
          _meta { hasIndexingErrors }
        }`,
        variables: { after },
      }),
    });
    if (!response.ok) throw new Error(`Subgraph HTTP ${response.status}`);
    const { data, errors } = await response.json();
    if (errors?.length || !Array.isArray(data?.posts) || data?._meta?.hasIndexingErrors) {
      throw new Error(errors?.[0]?.message ?? "Subgraph indexing or response error");
    }
    const page = data.posts;
    posts.push(...page);
    if (page.length < 1000) return posts;
    const next = page.at(-1).id;
    if (next <= after) throw new Error("Subgraph pagination did not advance");
    after = next;
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
