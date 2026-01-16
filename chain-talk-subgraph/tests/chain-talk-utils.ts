import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  Initialized,
  OwnershipTransferred,
  ReplyCreated,
  TopicCreated,
  Upgraded
} from "../generated/ChainTalk/ChainTalk"

export function createInitializedEvent(version: BigInt): Initialized {
  let initializedEvent = changetype<Initialized>(newMockEvent())

  initializedEvent.parameters = new Array()

  initializedEvent.parameters.push(
    new ethereum.EventParam(
      "version",
      ethereum.Value.fromUnsignedBigInt(version)
    )
  )

  return initializedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

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

export function createUpgradedEvent(implementation: Address): Upgraded {
  let upgradedEvent = changetype<Upgraded>(newMockEvent())

  upgradedEvent.parameters = new Array()

  upgradedEvent.parameters.push(
    new ethereum.EventParam(
      "implementation",
      ethereum.Value.fromAddress(implementation)
    )
  )

  return upgradedEvent
}
