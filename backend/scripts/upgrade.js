const { ethers, upgrades } = require("hardhat");

async function main() {
  const PROXY_ADDRESS = process.env.PROXY_ADDRESS;
  
  if (!PROXY_ADDRESS) {
    throw new Error("请设置 PROXY_ADDRESS 环境变量");
  }

  console.log("升级 ChainTalk 合约...");
  console.log("代理合约地址:", PROXY_ADDRESS);

  const ChainTalk = await ethers.getContractFactory("ChainTalk");
  const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, ChainTalk);
  
  console.log("合约已升级到:", upgraded.address);
  
  // 验证升级后的版本
  const version = await upgraded.version();
  console.log("升级后版本:", version);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });