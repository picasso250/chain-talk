const { ethers } = require("hardhat");
const { getImplementationAddress } = require("@openzeppelin/upgrades-core");

async function main() {
  console.log("获取 UUPS 代理合约的实现地址...");
  
  const proxyAddress = "0xb9A8A83c8e599E19ad2E3E1C66721A63d2076380";
  console.log("代理合约地址:", proxyAddress);
  
  try {
    const implAddress = await getImplementationAddress(
      ethers.provider,
      proxyAddress
    );
    console.log("🎯 实现合约地址:", implAddress);
    
    // 验证实现地址是否有效
    const code = await ethers.provider.getCode(implAddress);
    if (code === "0x") {
      console.error("❌ 实现合约地址无效，没有字节码");
    } else {
      console.log("✅ 实现合约验证成功");
    }
    
  } catch (error) {
    console.error("❌ 获取实现地址失败:", error.message);
    
    // 备用方法：直接从存储槽读取
    console.log("\n🔄 尝试备用方法...");
    try {
      const implSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
      const implStorage = await ethers.provider.getStorageAt(proxyAddress, implSlot);
      const implAddress = ethers.getAddress("0x" + implStorage.slice(26));
      console.log("🎯 备用方法 - 实现合约地址:", implAddress);
    } catch (backupError) {
      console.error("❌ 备用方法也失败:", backupError.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });