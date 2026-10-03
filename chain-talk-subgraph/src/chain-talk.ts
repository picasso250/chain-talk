import { Posted } from "../generated/ChainTalk/ChainTalk"
import { Post } from "../generated/schema"

export function handlePosted(event: Posted): void {
  let post = new Post(event.params.id.toString())
  post.replyTo = event.params.replyTo
  post.author = event.params.author
  post.content = event.params.content
  post.timestamp = event.params.timestamp
  post.transactionHash = event.transaction.hash
  post.save()
}
