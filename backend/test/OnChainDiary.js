const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OnChainDiary", function () {
  it("Should emit EntryCreated event with correct content", async function () {
    const [owner] = await ethers.getSigners();
    const OnChainDiary = await ethers.getContractFactory("OnChainDiary");
    const diary = await OnChainDiary.deploy();

    const content = "Hello, Anti-Revisionism World!";
    
    // 验证事件触发
    await expect(diary.writeEntry(content))
      .to.emit(diary, "EntryCreated")
      .withArgs(owner.address, (val) => typeof val === 'bigint', content);
  });
});
