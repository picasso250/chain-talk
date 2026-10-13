const { ethers } = require("ethers");

async function main() {
    console.log("🔍 查找合约创建区块高度...");
    
    const CONTRACT_ADDRESS = "0x6Cb266BB285BA5F6591e449543d259277d57C700";
    
    // 连接到 Arbitrum
    const provider = new ethers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");
    
    try {
        // 方法1: 通过合约代码查找
        console.log("📍 方法1: 查找合约首次出现的区块...");
        
        // 获取当前区块
        const latestBlock = await provider.getBlockNumber();
        console.log(`当前区块: ${latestBlock}`);
        
        // 二分查找合约创建区块
        let left = 0;
        let right = latestBlock;
        let creationBlock = null;
        
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const code = await provider.getCode(CONTRACT_ADDRESS, mid);
            
            if (code.length > 2) { // 合约存在
                creationBlock = mid;
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        
        if (creationBlock !== null) {
            console.log(`✅ 合约创建区块高度: ${creationBlock}`);
            
            // 获取创建区块的详细信息
            const block = await provider.getBlock(creationBlock);
            console.log(`📅 创建时间: ${new Date(block.timestamp * 1000).toISOString()}`);
            console.log(`⛽ 创建区块哈希: ${block.hash}`);
            
            // 查找该区块中的合约创建交易
            console.log("\n🔍 查找创建交易...");
            const blockWithTxs = await provider.getBlock(creationBlock);
            
            for (const hash of blockWithTxs.transactions) {
                const receipt = await provider.getTransactionReceipt(hash);
                if (receipt?.contractAddress?.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
                    console.log(`🎯 找到创建交易: ${hash}`);
                    break;
                }
            }
        } else {
            console.log("❌ 未找到合约创建区块");
        }
        
    } catch (error) {
        console.error("❌ 查找失败:", error.message);
        process.exitCode = 1;
    } finally {
        provider.destroy();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
