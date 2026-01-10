const { ethers } = require("hardhat");

async function main() {
  console.log("检查合约地址状态...");
  
  const PROXY_ADDRESS = "0xdBd31F6C024cE3433E482aa4288dc369584E31a2";
  
  try {
    // 获取合约实例
    const ChainTalk = await ethers.getContractFactory("ChainTalk");
    const contract = ChainTalk.attach(PROXY_ADDRESS);
    
    // 测试基本功能
    const version = await contract.version();
    const topicCount = await contract.getTopicIdCounter();
    
    console.log("✅ 合约连接成功");
    console.log("合约版本:", version);
    console.log("主题计数:", topicCount.toString());
    
    // 尝试获取代理信息
    const provider = ethers.provider;
    const code = await provider.getCode(PROXY_ADDRESS);
    console.log("合约代码长度:", code.length, "字符");
    
    // 检查是否是代理合约（通过查看存储槽）
    try {
      const implementationSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
      const implementation = await provider.getStorage(PROXY_ADDRESS, implementationSlot);
      console.log("实现合约地址:", ethers.getAddress("0x" + implementation.slice(-40)));
    } catch (error) {
      console.log("无法获取实现合约地址:", error.message);
    }
    
  } catch (error) {
    console.error("❌ 合约检查失败:", error.message);
    
    // 尝试检查其他可能的地址
    console.log("\n检查最近的部署历史...");
    console.log("可能的合约地址:");
    console.log("1. 0xdBd31F6C024cE3433E482aa4288dc369584E31a2 (当前)");
    console.log("2. 0x446A1E190Bd0F1525303b02c48C636DBB6A5D14D (第一次部署)");
    console.log("3. 0xDf48Da945Ee5998C80F0695A27B3a2DE4b3e8E75 (第二次部署)");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });