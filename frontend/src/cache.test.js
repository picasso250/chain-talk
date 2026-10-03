import { test } from "node:test";
import assert from "node:assert/strict";
import { CACHE_KEY, readCachedPosts, cachePosts } from "./cache.js";
import { mergePosts } from "./forum.js";

const post = {
  id: "1", replyTo: "0", timestamp: "10", content: "hello",
  author: `0x${"a".repeat(40)}`, transactionHash: `0x${"b".repeat(64)}`,
};

test("cache round trip is scoped and cannot preserve local confirmation flags", () => {
  let value;
  const storage = {
    setItem(key, data) { assert.equal(key, CACHE_KEY); value = data; },
    getItem(key) { assert.equal(key, CACHE_KEY); return value; },
  };
  cachePosts([{ ...post, confirmedLocally: true }], storage);
  const cached = readCachedPosts(storage);
  assert.deepEqual(cached, [post]);
  assert.deepEqual(mergePosts([], cached), []);
});

test("invalid cache is ignored before it reaches the UI", () => {
  for (const value of [null, "broken", "{}", JSON.stringify([{ ...post, id: "bad" }]), JSON.stringify([{ ...post, replyTo: 0 }])]) {
    assert.deepEqual(readCachedPosts({ getItem: () => value }), []);
  }
});

test("disabled storage and quota failures do not interrupt the app", () => {
  const storage = {
    getItem() { throw new Error("disabled"); },
    setItem() { throw new Error("quota exceeded"); },
  };
  assert.deepEqual(readCachedPosts(storage), []);
  assert.doesNotThrow(() => cachePosts([post], storage));
});
