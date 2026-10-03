import { assert, test, clearStore } from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { handleTopicCreated, handleReplyCreated } from "../src/chain-talk"
import { createTopicCreatedEvent, createReplyCreatedEvent } from "./chain-talk-utils"

test("Indexes topics and replies with their real transaction hashes", () => {
  clearStore()
  let author = Address.fromString("0x0000000000000000000000000000000000000001")
  let topic = createTopicCreatedEvent(BigInt.fromI32(1), author, BigInt.fromI32(10), "Topic")
  handleTopicCreated(topic)
  let reply = createReplyCreatedEvent(BigInt.fromI32(1), BigInt.fromI32(1), author, BigInt.fromI32(11), "Reply")
  handleReplyCreated(reply)
  assert.entityCount("Topic", 1)
  assert.entityCount("Reply", 1)
  assert.fieldEquals("Topic", "1", "transactionHash", topic.transaction.hash.toHexString())
  assert.fieldEquals("Reply", "1", "transactionHash", reply.transaction.hash.toHexString())
  assert.fieldEquals("Reply", "1", "topic", "1")
  clearStore()
})
