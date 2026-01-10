const { ethers } = require("hardhat");

async function main() {
  console.log("测试完整的前端功能...");
  
  const PROXY_ADDRESS = "0xdBd31F6C024cE3433E482aa4288dc369584E31a2";
  const ChainTalk = await ethers.getContractFactory("ChainTalk");
  const contract = ChainTalk.attach(PROXY_ADDRESS);
  
  try {
    // 创建几个主题
    console.log("\n=== 创建测试主题 ===");
    await contract.createTopic("第一个测试主题");
    await contract.createTopic("第二个测试主题");
    await contract.createTopic("第三个测试主题");
    
    // 为每个主题创建不同数量的回复
    console.log("\n=== 创建测试回复 ===");
    await contract.createReply(1, "主题1的第一个回复");
    await contract.createReply(1, "主题1的第二个回复");
    await contract.createReply(1, "主题1的第三个回复");
    
    await contract.createReply(2, "主题2的第一个回复");
    
    await contract.createReply(3, "主题3的第一个回复");
    await contract.createReply(3, "主题3的第二个回复");
    
    // 验证回复数量
    console.log("\n=== 验证回复数量 ===");
    const topic1Replies = await contract.getReplyCount(1);
    const topic2Replies = await contract.getReplyCount(2);
    const topic3Replies = await contract.getReplyCount(3);
    
    console.log(`主题1回复数量: ${topic1Replies.toString()}`);
    console.log(`主题2回复数量: ${topic2Replies.toString()}`);
    console.log(`主题3回复数量: ${topic3Replies.toString()}`);
    
    console.log("\n✅ 前端功能测试数据准备完成！");
    console.log("前端现在应该能够显示:");
    console.log("- 主题1: 3 replies");
    console.log("- 主题2: 1 reply"); 
    console.log("- 主题3: 2 replies");
    
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