const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("部署可升级的 ChainTalk 合约到 Sepolia 测试网...");

  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);

  // 部署合约
  const ChainTalk = await ethers.getContractFactory("ChainTalk");
  const contract = await upgrades.deployProxy(ChainTalk, [], { initializer: 'initialize' });
  
  await contract.waitForDeployment();
  
  console.log("ChainTalk 代理合约地址:", await contract.getAddress());
  console.log("交易哈希:", contract.deploymentTransaction().hash);
  
  // 验证初始状态
  const version = await contract.version();
  const topicCount = await contract.getTopicIdCounter();
  
  console.log("合约版本:", version);
  console.log("初始主题计数:", topicCount.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });