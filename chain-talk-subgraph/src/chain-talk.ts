// 从 generated 目录导入我们真正关心的事件类型
import {
  TopicCreated as TopicCreatedEvent,
  ReplyCreated as ReplyCreatedEvent
} from "../generated/ChainTalk/ChainTalk" 

// 从 generated 目录导入我们在 schema.graphql 中定义的实体类型
import { Topic, Reply } from "../generated/schema"

/**
 * 处理 TopicCreated 事件的函数
 * 当合约发出 TopicCreated 事件时，这个函数会被调用
 */
export function handleTopicCreated(event: TopicCreatedEvent): void {
  // 创建一个新的 Topic 实体，使用事件中的 topicId 作为唯一ID
  // .toString() 是必须的，因为ID的类型是 String
  let topic = new Topic(event.params.topicId.toString())

  // 从事件参数中获取数据，填充到实体的字段中
  topic.author = event.params.author
  topic.content = event.params.content
  topic.timestamp = event.params.timestamp

  // 保存这个新的 topic 实体
  topic.save()
}

/**
 * 处理 ReplyCreated 事件的函数
 * 当合约发出 ReplyCreated 事件时，这个函数会被调用
 */
export function handleReplyCreated(event: ReplyCreatedEvent): void {
  // 创建一个新的 Reply 实体，使用事件中的 replyId 作为唯一ID
  let reply = new Reply(event.params.replyId.toString())

  // 填充回复的元数据
  reply.author = event.params.author
  reply.content = event.params.content
  reply.timestamp = event.params.timestamp

  // ★★★ 关键步骤：建立与 Topic 的关联关系 ★★★
  // 将 Reply 实体的 'topic' 字段指向对应的 Topic ID
  reply.topic = event.params.topicId.toString()

  // 保存这个新的 reply 实体
  reply.save()
}