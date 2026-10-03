import { assert, test, clearStore } from "matchstick-as/assembly/index"
import { handlePosted } from "../src/chain-talk"
import { createPostedEvent } from "./chain-talk-utils"

test("Indexes roots and nested replies with real transaction hashes", () => {
  clearStore()
  let root = createPostedEvent(1, 0)
  handlePosted(root)
  handlePosted(createPostedEvent(2, 1))
  handlePosted(createPostedEvent(3, 2))
  assert.entityCount("Post", 3)
  assert.fieldEquals("Post", "1", "replyTo", "0")
  assert.fieldEquals("Post", "3", "replyTo", "2")
  assert.fieldEquals("Post", "1", "transactionHash", root.transaction.hash.toHexString())
  clearStore()
})
