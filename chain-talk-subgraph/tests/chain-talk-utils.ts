import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import { Posted } from "../generated/ChainTalk/ChainTalk"

export function createPostedEvent(id: i32, replyTo: i32): Posted {
  let event = changetype<Posted>(newMockEvent())
  event.parameters = [
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(id))),
    new ethereum.EventParam("replyTo", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(replyTo))),
    new ethereum.EventParam("author", ethereum.Value.fromAddress(Address.fromString("0x0000000000000000000000000000000000000001"))),
    new ethereum.EventParam("timestamp", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10))),
    new ethereum.EventParam("content", ethereum.Value.fromString("Post"))
  ]
  return event
}
