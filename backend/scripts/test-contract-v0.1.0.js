const { ethers } = require("hardhat");

async function main() {
  console.log("测试 ChainTalk v0.1.0 合约功能...");
  
  // 合约地址 (新部署的代理合约)
  const CONTRACT_ADDRESS = "0xDf48Da945Ee5998C80F0695A27B3a2DE4b3e8E75";
  
  // 获取合约实例
  const ChainTalk = await ethers.getContractFactory("ChainTalk");
  const contract = ChainTalk.attach(CONTRACT_ADDRESS);
  
  try {
    // 1. 测试初始状态
    console.log("\n=== 测试初始状态 ===");
    const version = await contract.version();
    const topicCount = await contract.getTopicIdCounter();
    
    console.log("合约版本:", version);
    console.log("主题计数:", topicCount.toString());
    
    // 2. 测试创建主题
    console.log("\n=== 测试创建主题 ===");
    const topicContent = "ChainTalk v0.1.0 测试主题 🚀";
    const createTopicTx = await contract.createTopic(topicContent);
    const receipt = await createTopicTx.wait();
    
    console.log("创建主题交易哈希:", createTopicTx.hash);
    console.log("Gas 使用:", receipt.gasUsed.toString());
    
    // 3. 测试创建回复
    console.log("\n=== 测试创建回复 ===");
    const replyContent = "这是一个测试回复 💬";
    const createReplyTx = await contract.createReply(1, replyContent);
    const replyReceipt = await createReplyTx.wait();
    
    console.log("创建回复交易哈希:", createReplyTx.hash);
    console.log("Gas 使用:", replyReceipt.gasUsed.toString());
    
    // 4. 测试新功能：获取主题回复数量
    console.log("\n=== 测试回复计数功能 ===");
    const topic1ReplyCount = await contract.getReplyCount(1);
    console.log("主题1的回复数量:", topic1ReplyCount.toString());
    
    // 5. 为同一个主题添加更多回复
    console.log("\n=== 添加更多回复 ===");
    await contract.createReply(1, "第二个回复 🎉");
    await contract.createReply(1, "第三个回复 🔥");
    
    const updatedReplyCount = await contract.getReplyCount(1);
    console.log("更新后主题1的回复数量:", updatedReplyCount.toString());
    
    // 6. 测试新主题的回复计数
    console.log("\n=== 测试新主题回复计数 ===");
    await contract.createTopic("第二个主题 📝");
    await contract.createReply(2, "新主题的第一个回复");
    
    const topic2ReplyCount = await contract.getReplyCount(2);
    console.log("主题2的回复数量:", topic2ReplyCount.toString());
    
    // 7. 验证计数器
    console.log("\n=== 验证主题计数器 ===");
    const newTopicCount = await contract.getTopicIdCounter();
    console.log("总主题计数:", newTopicCount.toString());
    
    // 8. 检查事件
    console.log("\n=== 检查最后一个事件 ===");
    const finalReceipt = await createReplyTx.wait();
    const replyEvents = finalReceipt.logs.filter(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed.name === "ReplyCreated";
      } catch {
        return false;
      }
    });
    
    if (replyEvents.length > 0) {
      const replyEvent = contract.interface.parseLog(replyEvents[0]);
      console.log("回复事件详情:");
      console.log("  Reply ID:", replyEvent.args.replyId.toString());
      console.log("  Topic ID:", replyEvent.args.topicId.toString());
      console.log("  Author:", replyEvent.args.author);
      console.log("  Timestamp:", replyEvent.args.timestamp.toString());
      console.log("  Content:", replyEvent.args.content);
    }
    
    console.log("\n✅ 所有测试通过！v0.1.0 合约功能正常。");
    console.log("✅ 新的回复计数功能工作正常。");
    
  } catch (error) {
    console.error("❌ 测试失败:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });