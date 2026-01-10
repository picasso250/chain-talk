const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("升级 ChainTalk 合约到 Arbitrum 主网...");
  
  // Arbitrum 主网代理合约地址
  const PROXY_ADDRESS = "0xb9A8A83c8e599E19ad2E3E1C66721A63d2076380";

  console.log("代理合约地址:", PROXY_ADDRESS);

  const ChainTalk = await ethers.getContractFactory("ChainTalk");
  const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, ChainTalk);
  
  console.log("合约已升级到:", await upgraded.getAddress());
  
  // 验证升级后的版本
  const version = await upgraded.version();
  console.log("升级后版本:", version);
  
  if (version === "0.2.0") {
    console.log("✅ Arbitrum 升级成功！合约现在是 v0.2.0");
  } else {
    console.log("❌ 升级可能失败，版本不是 v0.2.0");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });