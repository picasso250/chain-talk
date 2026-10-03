const { ethers } = require("hardhat");

async function main() {
  console.log("部署不可升级的 ChainTalk 合约到 Arbitrum 主网...");

  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);

  

  // 部署合约
  const ChainTalk = await ethers.getContractFactory("ChainTalk");
  const contract = await ChainTalk.deploy();
  
  await contract.waitForDeployment();
  const receipt = await contract.deploymentTransaction().wait();
  console.log("部署区块:", receipt.blockNumber);
  
  console.log("🎉 ChainTalk 合约地址:", await contract.getAddress());
  console.log("📝 交易哈希:", contract.deploymentTransaction().hash);
  
  // 验证初始状态
  const version = await contract.version();
  const topicCount = await contract.getTopicIdCounter();
  
  console.log("✅ 合约版本:", version);
  console.log("📊 初始主题计数:", topicCount.toString());
  
  console.log("请使用新地址和部署区块配置前端、子图；旧代理不会自动迁移。");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });