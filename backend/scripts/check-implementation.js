const { ethers } = require("hardhat");

async function main() {
  console.log("检查实现合约...");
  
  const IMPLEMENTATION_ADDRESS = "0xca338D04528C34AE463Ce6a62Ce90A68974F95C7";
  
  try {
    const provider = ethers.provider;
    const code = await provider.getCode(IMPLEMENTATION_ADDRESS);
    console.log("实现合约代码长度:", code.length, "字符");
    
    if (code.length > 100) {
      console.log("✅ 实现合约存在且包含代码");
      
      // 尝试直接连接实现合约
      const ChainTalk = await ethers.getContractFactory("ChainTalk");
      const implementation = ChainTalk.attach(IMPLEMENTATION_ADDRESS);
      
      const version = await implementation.version();
      console.log("实现合约版本:", version);
      
      console.log("\n这确实是一个代理合约，但可能不是标准的ERC1967格式");
      console.log("让我们尝试直接升级...");
    } else {
      console.log("❌ 实现合约似乎不存在或为空");
    }
    
  } catch (error) {
    console.error("❌ 实现合约检查失败:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });