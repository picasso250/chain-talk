const { exec } = require('child_process');
const path = require('path');

async function fetchAllData() {
    console.log('🚀 开始批量获取所有历史数据...');
    
    let attempts = 0;
    const maxAttempts = 100; // 最多100次，防止无限循环
    
    while (attempts < maxAttempts) {
        attempts++;
        console.log(`\n📍 第 ${attempts} 次尝试...`);
        
        try {
            await new Promise((resolve, reject) => {
                exec('cd backend && npx hardhat run scripts/fetch-chain-data.js', 
                    (error, stdout, stderr) => {
                        console.log(stdout);
                        if (stderr) console.error(stderr);
                        if (error) {
                            reject(error);
                        } else {
                            resolve();
                        }
                    });
            });
            
            // 检查输出是否包含"🎉 数据获取完成"
            // 如果是，说明已经获取到最新区块
            if (stdout.includes('🎉 数据获取完成! 已获取到最新区块')) {
                console.log('\n✅ 所有数据获取完成!');
                break;
            }
            
        } catch (error) {
            console.error('❌ 获取过程中出错:', error.message);
            break;
        }
    }
    
    if (attempts >= maxAttempts) {
        console.log('\n⚠️  达到最大尝试次数，可能还有更多数据');
    }
}

fetchAllData().catch(console.error);