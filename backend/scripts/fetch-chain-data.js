const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// 合约配置
const CONTRACT_ADDRESS = "0xb9A8A83c8e599E19ad2E3E1C66721A63d2076380";
const RPC_URL = "https://arb1.arbitrum.io/rpc";

// 合约创建区块高度
const CREATION_BLOCK = 419912164;

// 数据文件路径
const DATA_DIR = path.join(__dirname, "..", "..", "frontend", "public", "data");
const STATE_FILE = path.join(DATA_DIR, "fetch-state.json");

async function main() {
    console.log("🔄 开始获取链上数据...");
    
    // 确保数据目录存在
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    // 连接到 Arbitrum
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, [
        "event TopicCreated(uint256 indexed topicId, address indexed author, uint256 timestamp, string content)",
        "event ReplyCreated(uint256 indexed replyId, uint256 indexed topicId, address indexed author, uint256 timestamp, string content)",
        "function getTopicIdCounter() view returns (uint256)",
        "function getReplyIdCounter() view returns (uint256)"
    ], provider);
    
    try {
        // 获取当前区块号
        const latestBlock = await provider.getBlockNumber();
        console.log(`📦 当前区块号: ${latestBlock}`);
        console.log(`🏁 合约创建区块: ${CREATION_BLOCK}`);
        
        // 读取上次获取的状态
        const lastState = loadFetchState();
        console.log(`📍 上次获取区块: ${lastState.lastFetchedBlock}`);
        
        // 计算本次查询的区块范围 (每小时约2400个区块，留150%余量=3600个区块)
        const rangeBlocks = 3600;
        const fromBlock = Math.max(CREATION_BLOCK, lastState.lastFetchedBlock + 1); // +1 避免重复
        const toBlock = Math.min(latestBlock, fromBlock + rangeBlocks - 1);
        
        // 获取区块时间戳用于验证
        const fromBlockInfo = await provider.getBlock(fromBlock);
        const toBlockInfo = await provider.getBlock(toBlock);
        
        console.log(`🔍 查询区块范围: ${fromBlock} - ${toBlock} (${toBlock - fromBlock + 1} 个区块)`);
        console.log(`⏰ 时间范围: ${new Date(fromBlockInfo.timestamp * 1000).toISOString()} - ${new Date(toBlockInfo.timestamp * 1000).toISOString()}`);
        
        // 获取计数器
        const topicCount = await contract.getTopicIdCounter();
        const replyCount = await contract.getReplyIdCounter();
        console.log(`📊 主题总数: ${topicCount}`);
        console.log(`💬 回复总数: ${replyCount}`);
        
        // 获取新事件
        const newTopics = await fetchTopics(contract, fromBlock, toBlock);
        const newReplies = await fetchReplies(contract, fromBlock, toBlock);
        
        console.log(`✅ 获取到 ${newTopics.length} 个新主题`);
        console.log(`✅ 获取到 ${newReplies.length} 个新回复`);
        
        // 读取现有数据并合并
        const existingTopics = loadExistingData("topics.json");
        const existingReplies = loadExistingData("replies.json");
        
        // 合并数据（去重）
        const allTopics = mergeData(existingTopics, newTopics, "topicId");
        const allReplies = mergeData(existingReplies, newReplies, "replyId");
        
        // 保存数据到文件
        const topicsFile = path.join(DATA_DIR, "topics.json");
        const repliesFile = path.join(DATA_DIR, "replies.json");
        
        fs.writeFileSync(topicsFile, JSON.stringify(allTopics, null, 2));
        fs.writeFileSync(repliesFile, JSON.stringify(allReplies, null, 2));
        
        // 更新状态
        updateFetchState(toBlock);
        
        console.log(`💾 主题数据已保存到: ${topicsFile} (总计 ${allTopics.length} 个)`);
        console.log(`💾 回复数据已保存到: ${repliesFile} (总计 ${allReplies.length} 个)`);
        console.log(`📍 更新状态: 下次从区块 ${toBlock + 1} 开始`);
        
        // 检查是否还有更多数据需要获取
        if (toBlock < latestBlock) {
            console.log("⚠️  还有更多历史数据需要获取，建议再次运行脚本");
        } else {
            console.log("🎉 数据获取完成! 已获取到最新区块");
        }
        
    } catch (error) {
        console.error("❌ 数据获取失败:", error);
        process.exit(1);
    }
}

function loadFetchState() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
        }
    } catch (error) {
        console.warn("⚠️  无法读取状态文件，使用默认值");
    }
    return { lastFetchedBlock: CREATION_BLOCK - 1 };
}

function loadExistingData(filename) {
    try {
        const filePath = path.join(DATA_DIR, filename);
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
    } catch (error) {
        console.warn(`⚠️  无法读取 ${filename}，使用空数组`);
    }
    return [];
}

function mergeData(existing, newData, uniqueKey) {
    const merged = [...existing];
    const existingIds = new Set(existing.map(item => item[uniqueKey]));
    
    for (const item of newData) {
        if (!existingIds.has(item[uniqueKey])) {
            merged.push(item);
            existingIds.add(item[uniqueKey]);
        }
    }
    
    // 按时间戳排序
    merged.sort((a, b) => {
        if (uniqueKey === "topicId") {
            // 主题按时间戳降序（最新的在前）
            return parseInt(b.timestamp) - parseInt(a.timestamp);
        } else {
            // 回复按时间戳升序（最早的在前）
            return parseInt(a.timestamp) - parseInt(b.timestamp);
        }
    });
    
    return merged;
}

function updateFetchState(blockNumber) {
    const state = {
        lastFetchedBlock: blockNumber,
        lastUpdateTime: new Date().toISOString()
    };
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    console.log(`📝 状态已更新: lastFetchedBlock=${blockNumber}, updateTime=${state.lastUpdateTime}`);
}

async function fetchTopics(contract, fromBlock, toBlock) {
    console.log("🔍 获取主题数据...");
    
    // 获取 TopicCreated 事件
    const topicFilter = contract.filters.TopicCreated();
    
    const logs = await contract.queryFilter(topicFilter, fromBlock, toBlock);
    console.log(`📝 找到 ${logs.length} 个主题事件日志`);
    
    const topics = [];
    
    for (const log of logs) {
        const topicId = log.args.topicId.toString();
        const author = log.args.author;
        const timestamp = log.args.timestamp.toString();
        const content = log.args.content;
        
        topics.push({
            topicId,
            author,
            timestamp,
            content,
            blockNumber: log.blockNumber.toString(),
            transactionHash: log.transactionHash
        });
    }
    
    return topics;
}

async function fetchReplies(contract, fromBlock, toBlock) {
    console.log("🔍 获取回复数据...");
    
    // 获取 ReplyCreated 事件
    const replyFilter = contract.filters.ReplyCreated();
    
    const logs = await contract.queryFilter(replyFilter, fromBlock, toBlock);
    console.log(`📝 找到 ${logs.length} 个回复事件日志`);
    
    const replies = [];
    
    for (const log of logs) {
        const replyId = log.args.replyId.toString();
        const topicId = log.args.topicId.toString();
        const author = log.args.author;
        const timestamp = log.args.timestamp.toString();
        const content = log.args.content;
        
        replies.push({
            replyId,
            topicId,
            author,
            timestamp,
            content,
            blockNumber: log.blockNumber.toString(),
            transactionHash: log.transactionHash
        });
    }
    
    return replies;
}

// 如果直接运行此脚本
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { main };