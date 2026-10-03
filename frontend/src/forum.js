import { BrowserProvider, Contract } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./constants.js";
import { ensureNetwork } from "./wallet.js";

async function submit(provider, method, args, event) {
  await ensureNetwork(provider);
  const signer = await new BrowserProvider(provider).getSigner();
  const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  const tx = await contract[method](...args);
  return confirmedEvent(await tx.wait(), contract.interface, event);
}

export const postTopic = (provider, content) =>
  submit(provider, "createTopic", [content], "TopicCreated");

export const postReply = (provider, topicId, content) =>
  submit(provider, "createReply", [topicId, content], "ReplyCreated");

const endpoint = "https://api.studio.thegraph.com/query/1723159/chain-talk/version/latest";

export async function loadTopics() {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: `{
      topics(orderBy: timestamp, orderDirection: desc) {
        id author content timestamp transactionHash
        replies(orderBy: timestamp, orderDirection: asc) {
          id author content timestamp transactionHash
        }
      }
    }` }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const result = await response.json();
  if (result.errors?.length || !Array.isArray(result.data?.topics)) {
    throw new Error("Invalid discussion response");
  }
  return result.data.topics;
}

// Keep confirmed local events until the indexer returns them; never duplicate IDs.
export function mergeTopics(indexed, current) {
  const merged = new Map(indexed.map(topic => [topic.id, { ...topic, replies: [...topic.replies] }]));
  for (const topic of current) {
    const next = merged.get(topic.id);
    if (!next) {
      if (topic.confirmedLocally || topic.replies.some(reply => reply.confirmedLocally)) merged.set(topic.id, topic);
      continue;
    }
    const ids = new Set(next.replies.map(reply => reply.id));
    next.replies.push(...topic.replies.filter(reply => reply.confirmedLocally && !ids.has(reply.id)));
    next.replies.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
  }
  return [...merged.values()].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
}

export function confirmedEvent(receipt, contractInterface, name) {
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) continue;
    const event = contractInterface.parseLog(log);
    if (event?.name !== name) continue;
    const { args } = event;
    const record = {
      id: (name === "TopicCreated" ? args.topicId : args.replyId).toString(),
      author: args.author,
      content: args.content,
      timestamp: args.timestamp.toString(),
      transactionHash: receipt.hash,
      confirmedLocally: true,
    };
    return name === "TopicCreated" ? { ...record, replies: [] } : { ...record, topicId: args.topicId.toString() };
  }
  throw new Error(`Missing ${name} event in confirmed transaction`);
}
