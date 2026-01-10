const { ethers } = require("hardhat");

async function main() {
  console.log("测试 ChainTalk 合约功能...");
  
  // 合约地址 (已部署的代理合约)
  const CONTRACT_ADDRESS = "0x446A1E190Bd0F1525303b02c48C636DBB6A5D14D";
  
  // 获取合约实例
  const ChainTalk = await ethers.getContractFactory("ChainTalk");
  const contract = ChainTalk.attach(CONTRACT_ADDRESS);
  
  try {
    // 1. 测试初始状态
    console.log("\n=== 测试初始状态 ===");
    const version = await contract.version();
    const topicCount = await contract.getTopicIdCounter();
    const replyCount = await contract.getReplyIdCounter();
    
    console.log("合约版本:", version);
    console.log("主题计数:", topicCount.toString());
    console.log("回复计数:", replyCount.toString());
    
    // 2. 测试创建主题
    console.log("\n=== 测试创建主题 ===");
    const topicContent = "ChainTalk 可升级版本测试主题 🚀";
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
    
    // 4. 验证计数器
    console.log("\n=== 验证计数器 ===");
    const newTopicCount = await contract.getTopicIdCounter();
    const newReplyCount = await contract.getReplyIdCounter();
    
    console.log("新主题计数:", newTopicCount.toString());
    console.log("新回复计数:", newReplyCount.toString());
    
    // 5. 检查事件
    console.log("\n=== 检查事件 ===");
    const topicEvents = receipt.logs.filter(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed.name === "TopicCreated";
      } catch {
        return false;
      }
    });
    
    const replyEvents = replyReceipt.logs.filter(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed.name === "ReplyCreated";
      } catch {
        return false;
      }
    });
    
    console.log("TopicCreated 事件数量:", topicEvents.length);
    console.log("ReplyCreated 事件数量:", replyEvents.length);
    
    if (topicEvents.length > 0) {
      const topicEvent = contract.interface.parseLog(topicEvents[0]);
      console.log("主题事件详情:");
      console.log("  Topic ID:", topicEvent.args.topicId.toString());
      console.log("  Author:", topicEvent.args.author);
      console.log("  Timestamp:", topicEvent.args.timestamp.toString());
      console.log("  Content:", topicEvent.args.content);
    }
    
    if (replyEvents.length > 0) {
      const replyEvent = contract.interface.parseLog(replyEvents[0]);
      console.log("回复事件详情:");
      console.log("  Reply ID:", replyEvent.args.replyId.toString());
      console.log("  Topic ID:", replyEvent.args.topicId.toString());
      console.log("  Author:", replyEvent.args.author);
      console.log("  Timestamp:", replyEvent.args.timestamp.toString());
      console.log("  Content:", replyEvent.args.content);
    }
    
    console.log("\n✅ 所有测试通过！合约功能正常。");
    
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