const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("升级 ChainTalk 合约到 Arbitrum 主网...");
  
  // Arbitrum 主网代理合约地址 (待部署后更新)
  const PROXY_ADDRESS = "0x0000000000000000000000000000000000000000";

  if (PROXY_ADDRESS === "0x0000000000000000000000000000000000000000") {
    throw new Error("请先部署到 Arbitrum 并更新 PROXY_ADDRESS");
  }

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