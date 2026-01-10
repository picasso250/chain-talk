const { ethers } = require("hardhat");

async function main() {
  console.log("验证升级结果...");
  
  const PROXY_ADDRESS = "0xdBd31F6C024cE3433E482aa4288dc369584E31a2";
  
  try {
    // 获取合约实例
    const ChainTalk = await ethers.getContractFactory("ChainTalk");
    const contract = ChainTalk.attach(PROXY_ADDRESS);
    
    // 测试版本是否更新
    const version = await contract.version();
    console.log("当前合约版本:", version);
    
    // 测试新功能是否存在
    try {
      const replyIdCounter = await contract.getReplyIdCounter();
      console.log("✅ getReplyIdCounter() 可用，值:", replyIdCounter.toString());
    } catch (error) {
      console.log("❌ getReplyIdCounter() 不可用:", error.message);
    }
    
    try {
      const replyCount = await contract.getReplyCount(1);
      console.log("✅ getReplyCount() 可用，值:", replyCount.toString());
    } catch (error) {
      console.log("❌ getReplyCount() 不可用:", error.message);
    }
    
    // 测试原有功能
    const topicCount = await contract.getTopicIdCounter();
    console.log("主题计数:", topicCount.toString());
    
    // 创建测试数据
    console.log("\n=== 创建测试主题 ===");
    const topicTx = await contract.createTopic("升级测试主题");
    await topicTx.wait();
    
    console.log("=== 创建测试回复 ===");
    const replyTx = await contract.createReply(1, "升级测试回复");
    await replyTx.wait();
    
    // 验证新功能
    const newReplyIdCounter = await contract.getReplyIdCounter();
    const newReplyCount = await contract.getReplyCount(1);
    
    console.log("升级后回复ID计数:", newReplyIdCounter.toString());
    console.log("主题1回复数量:", newReplyCount.toString());
    
    if (version === "0.2.0" && newReplyIdCounter.toString() === "1") {
      console.log("\n🎉 升级成功！新功能正常工作。");
    } else {
      console.log("\n❌ 升级可能有问题。");
    }
    
  } catch (error) {
    console.error("❌ 升级验证失败:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });