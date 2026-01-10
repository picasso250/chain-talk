const { ethers } = require("hardhat");
const { run } = require("hardhat");

async function main() {
  console.log("验证 UUPS 代理合约...");
  
  const proxyAddress = "0xb9A8A83c8e599E19ad2E3E1C66721A63d2076380";
  const implAddress = "0x8c199101e6cc4864bD9009bBB7AbDc3C979CCCbA";
  
  console.log("代理合约地址:", proxyAddress);
  console.log("实现合约地址:", implAddress);
  
  // 步骤 1: 验证实现合约
  console.log("\n=== 验证实现合约 ===");
  try {
    await run("verify:verify", {
      address: implAddress,
      network: "arbitrum",
      constructorArguments: [] // ChainTalk 实现合约无构造函数参数
    });
    console.log("✅ 实现合约验证成功");
  } catch (error) {
    console.log("❌ 实现合约验证失败:", error.message);
    
    // 检查是否已经验证过
    if (error.message.includes("Already Verified")) {
      console.log("✅ 实现合约已验证过");
    }
  }
  
  // 等待几秒避免API限制
  console.log("⏳ 等待 3 秒...");
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // 步骤 2: 验证代理合约
  console.log("\n=== 验证代理合约 ===");
  try {
    // UUPS 代理构造函数参数: [implementationAddress, adminAddress, data]
    // UUPS 使用 address(0) 作为管理员，初始化数据为空（因为 initialize() 单独调用）
    await run("verify:verify", {
      address: proxyAddress,
      network: "arbitrum",
      constructorArguments: [
        implAddress,                                    // 实现合约地址
        "0x0000000000000000000000000000000000000000",   // 管理员地址 (UUPS 无需管理员)
        "0x"                                            // 初始化数据 (空)
      ]
    });
    console.log("✅ 代理合约验证成功");
  } catch (error) {
    console.log("❌ 代理合约验证失败:", error.message);
    
    // 检查是否已经验证过
    if (error.message.includes("Already Verified")) {
      console.log("✅ 代理合约已验证过");
    }
  }
  
  console.log("\n🎉 验证完成！");
  console.log("🔗 在 Arbiscan 查看:");
  console.log(`  代理: https://arbiscan.io/address/${proxyAddress}`);
  console.log(`  实现: https://arbiscan.io/address/${implAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });