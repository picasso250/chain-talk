import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  ReplyCreated,
  TopicCreated,
} from "../generated/ChainTalk/ChainTalk"

export function createReplyCreatedEvent(
  replyId: BigInt,
  topicId: BigInt,
  author: Address,
  timestamp: BigInt,
  content: string
): ReplyCreated {
  let replyCreatedEvent = changetype<ReplyCreated>(newMockEvent())

  replyCreatedEvent.parameters = new Array()

  replyCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "replyId",
      ethereum.Value.fromUnsignedBigInt(replyId)
    )
  )
  replyCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "topicId",
      ethereum.Value.fromUnsignedBigInt(topicId)
    )
  )
  replyCreatedEvent.parameters.push(
    new ethereum.EventParam("author", ethereum.Value.fromAddress(author))
  )
  replyCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )
  replyCreatedEvent.parameters.push(
    new ethereum.EventParam("content", ethereum.Value.fromString(content))
  )

  return replyCreatedEvent
}

export function createTopicCreatedEvent(
  topicId: BigInt,
  author: Address,
  timestamp: BigInt,
  content: string
): TopicCreated {
  let topicCreatedEvent = changetype<TopicCreated>(newMockEvent())

  topicCreatedEvent.parameters = new Array()

  topicCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "topicId",
      ethereum.Value.fromUnsignedBigInt(topicId)
    )
  )
  topicCreatedEvent.parameters.push(
    new ethereum.EventParam("author", ethereum.Value.fromAddress(author))
  )
  topicCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )
  topicCreatedEvent.parameters.push(
    new ethereum.EventParam("content", ethereum.Value.fromString(content))
  )

  return topicCreatedEvent
}
