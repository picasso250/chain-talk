import {
  Initialized as InitializedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  ReplyCreated as ReplyCreatedEvent,
  TopicCreated as TopicCreatedEvent,
  Upgraded as UpgradedEvent
} from "../generated/ChainTalk/ChainTalk"
import {
  Initialized,
  OwnershipTransferred,
  ReplyCreated,
  TopicCreated,
  Upgraded
} from "../generated/schema"

export function handleInitialized(event: InitializedEvent): void {
  let entity = new Initialized(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.version = event.params.version

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleReplyCreated(event: ReplyCreatedEvent): void {
  let entity = new ReplyCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.replyId = event.params.replyId
  entity.topicId = event.params.topicId
  entity.author = event.params.author
  entity.timestamp = event.params.timestamp
  entity.content = event.params.content

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTopicCreated(event: TopicCreatedEvent): void {
  let entity = new TopicCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.topicId = event.params.topicId
  entity.author = event.params.author
  entity.timestamp = event.params.timestamp
  entity.content = event.params.content

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUpgraded(event: UpgradedEvent): void {
  let entity = new Upgraded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.implementation = event.params.implementation

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
