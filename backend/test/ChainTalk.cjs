const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("ChainTalk content validation", function () {
  async function deployForum() {
    const [author] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("ChainTalk");
    const forum = await factory.deploy();
    await forum.waitForDeployment();
    return { forum, author };
  }

  it("rejects empty topics without consuming an ID", async function () {
    const { forum } = await loadFixture(deployForum);
    await expect(forum.createTopic("")).to.be.revertedWith("Content cannot be empty");
    expect(await forum.getTopicIdCounter()).to.equal(0n);
    await forum.createTopic("First topic");
    expect(await forum.getTopicIdCounter()).to.equal(1n);
  });

  it("has no initialization, ownership or upgrade entry points", async function () {
    const { forum, author } = await loadFixture(deployForum);
    expect(await forum.version()).to.equal("1.0.0");
    const admin = new ethers.Interface([
      "function initialize()",
      "function owner() view returns (address)",
      "function transferOwnership(address)",
      "function renounceOwnership()",
      "function upgradeTo(address)",
      "function upgradeToAndCall(address,bytes)",
      "function proxiableUUID() view returns (bytes32)",
    ]);
    for (const [name, args] of [
      ["initialize", []], ["owner", []], ["transferOwnership", [author.address]],
      ["renounceOwnership", []], ["upgradeTo", [author.address]],
      ["upgradeToAndCall", [author.address, "0x"]], ["proxiableUUID", []],
    ]) {
      expect(forum.interface.getFunction(name)).to.equal(null);
      await expect(author.sendTransaction({
        to: await forum.getAddress(), data: admin.encodeFunctionData(name, args),
      })).to.be.reverted;
    }
  });

  it("rejects zero and future topic IDs without changing reply counts", async function () {
    const { forum } = await loadFixture(deployForum);
    await expect(forum.createReply(1, "Reply")).to.be.revertedWith("Topic does not exist");
    await forum.createTopic("First topic");
    for (const id of [0n, 2n, ethers.MaxUint256]) {
      await expect(forum.createReply(id, "Reply")).to.be.revertedWith("Topic does not exist");
      expect(await forum.getReplyCount(id)).to.equal(0n);
    }
    expect(await forum.getReplyIdCounter()).to.equal(0n);
    await forum.createTopic("Second topic");
    expect(await forum.getReplyCount(2)).to.equal(0n);
  });

  it("rejects empty replies without changing counters", async function () {
    const { forum } = await loadFixture(deployForum);
    await forum.createTopic("First topic");
    await expect(forum.createReply(1, "")).to.be.revertedWith("Content cannot be empty");
    expect(await forum.getReplyCount(1)).to.equal(0n);
    expect(await forum.getReplyIdCounter()).to.equal(0n);
  });

  it("accepts replies to the first and latest topics and emits their content", async function () {
    const { forum, author } = await loadFixture(deployForum);
    await forum.createTopic("First topic");
    await forum.createTopic("Second topic");
    let replyId = 0n;
    for (const topicId of [1n, 2n, 1n]) {
      replyId++;
      const content = "你好\n**Reply**";
      const tx = await forum.createReply(topicId, content);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);
      await expect(tx).to.emit(forum, "ReplyCreated")
        .withArgs(replyId, topicId, author.address, block.timestamp, content);
    }
    expect(await forum.getReplyCount(1)).to.equal(2n);
    expect(await forum.getReplyCount(2)).to.equal(1n);
    expect(await forum.getReplyIdCounter()).to.equal(3n);
  });
});
