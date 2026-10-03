import { CONTRACT_ADDRESS } from "./constants.js";

export const CACHE_KEY = `chain-talk:1:${CONTRACT_ADDRESS.toLowerCase()}:posts:v1`;

export function readCachedPosts(storage) {
  try {
    const posts = JSON.parse((storage ?? localStorage).getItem(CACHE_KEY));
    if (!Array.isArray(posts) || !posts.every(post =>
      post && [post.id, post.replyTo, post.timestamp, post.author, post.transactionHash].every(value => typeof value === "string") &&
      /^[1-9]\d*$/.test(post.id) && /^\d+$/.test(post.replyTo) &&
      /^\d+$/.test(post.timestamp) && typeof post.content === "string" &&
      /^0x[0-9a-f]{40}$/i.test(post.author) &&
      /^0x[0-9a-f]{64}$/i.test(post.transactionHash)
    )) return [];
    return posts.map(({ id, replyTo, timestamp, content, author, transactionHash }) =>
      ({ id, replyTo, timestamp, content, author, transactionHash }));
  } catch {
    return [];
  }
}

export function cachePosts(posts, storage) {
  try {
    (storage ?? localStorage).setItem(CACHE_KEY, JSON.stringify(posts));
  } catch {
    // Storage may be disabled or full; caching must not interrupt reading.
  }
}
