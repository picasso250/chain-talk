# Chain Talk - 永恒的链上对话

> 极简以太坊合约驱动的永久论坛，数据不可篡改，规则不可更改

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Network: Ethereum](https://img.shields.io/badge/Network-Ethereum-627eea)](https://ethereum.org/)

## 🌟 在线演示

- **测试网体验**: https://chain-talk-sepolia.xi-aochi.workers.dev/
- **零门槛访问**: 无需连接钱包即可浏览所有内容
- **完全去中心化**: 所有数据存储在以太坊链上

## ✨ 特色功能

- 🚀 **零门槛只读访问** - 无需连接钱包即可浏览
- 📝 **永恒链上存储** - 所有主题和回复永久保存在区块链事件日志中
- 🔒 **固定规则** - 普通合约，无代理、无 owner、无升级入口
- ⚡ **极简合约** - 仅 22 行代码，1 个变量，1 个函数，1 个事件
- 🎨 **现代化 UI** - 基于 Svelte 5 (Runes) + Tailwind CSS
- 🌐 **固定主网** - 正式前端的数据源和合约地址固定为以太坊主网

## 📋 合约信息

### Sepolia 测试网（当前部署）

- **合约地址**: `0x759723E3869181616D6567458b59bCbA365FEcEe`
- **Chain ID**: 11155111 (0xaa36a7)
- **部署区块**: 11835312
- **编译器**: solc 0.8.37
- **区块浏览器**: [Sepolia Etherscan](https://sepolia.etherscan.io/address/0x759723E3869181616D6567458b59bCbA365FEcEe)

### 以太坊主网（已上线）

- **合约地址**: `0xec3639B4CC756d39e996447dE1787B09EF646b6F`
- **Chain ID**: 1 (0x1)
- **部署区块**: 26111445
- **编译器**: solc 0.8.37
- **区块浏览器**: [Etherscan](https://etherscan.io/address/0xec3639B4CC756d39e996447dE1787B09EF646b6F)
- **正式网站**: https://talk.io99.xyz

### 合约源码

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

/// @notice Immutable discussion log. replyTo == 0 starts a topic.
contract ChainTalk {
    uint256 private _postIdCounter;

    event Posted(
        uint256 indexed id,
        uint256 indexed replyTo,
        address indexed author,
        string content
    );

    function post(string calldata content, uint256 replyTo) external {
        require(bytes(content).length > 0, "Content cannot be empty");
        require(replyTo <= _postIdCounter, "Post does not exist");
        _postIdCounter++;
        emit Posted(_postIdCounter, replyTo, msg.sender, content);
    }
}
```

## 🛠️ 技术栈

### Frontend
- **框架**: Svelte 5 (Runes)
- **样式**: Tailwind CSS 4
- **Web3**: Ethers.js v6
- **构建工具**: Vite 7
- **托管**: Cloudflare Workers + Assets

### Backend
- **智能合约**: Solidity 0.8.37
- **工具链**: solc 编译、ethers 部署、Node 测试 + Anvil 本地 EVM
- **部署模式**: 普通合约直接部署，无管理员权限

### 数据索引
- **The Graph**: Subgraph 索引 Posted 事件
- **Studio 查询**: 前端固定读取 `mainnet-v1`，未发布到 Graph Network
  - 查询地址：https://api.studio.thegraph.com/query/1723159/chain-talk/mainnet-v1
  - 部署 ID：`QmdUtYJJhaMDRjdA8pJ3ZhKe32LtT21kVJYyi94EusrbVF`

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm
- EIP-1193 兼容钱包（MetaMask、Rabby 等）

### 安装和运行

```bash
# 克隆项目
git clone https://github.com/picasso250/chain-talk.git
cd chain-talk

# 安装前端依赖
cd frontend
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 本地运行 Cloudflare Worker

```bash
cd frontend
npx wrangler dev
```

### 合约开发

```bash
cd backend

# 安装依赖
npm install

# 编译合约
npm run build

# 运行测试
npm test

# 预估部署（需设置 RPC_URL、PRIVATE_KEY、CHAIN_ID）
node deploy.js

# 明确广播部署交易
node deploy.js --broadcast
```

## 📁 项目结构

```
chain-talk/
├── frontend/                 # Svelte 5 前端应用
│   ├── src/
│   │   ├── App.svelte        # 主应用组件
│   │   ├── ReplySection.svelte    # 回复组件
│   │   ├── MarkdownRenderer.svelte # Markdown 渲染组件
│   │   ├── constants.js      # 多网络合约配置
│   │   ├── forum.js          # 数据逻辑（发帖、读取事件）
│   │   └── wallet.js         # EIP-6963 钱包管理
│   ├── worker.js             # Cloudflare Worker 入口
│   ├── wrangler.toml         # Worker 配置
│   └── package.json
├── backend/                  # 智能合约
│   ├── contracts/
│   │   └── ChainTalk.sol     # 主合约（22行）
│   ├── compile.js            # solc 编译脚本
│   ├── deploy.js             # ethers 部署脚本
│   ├── test/
│   │   └── ChainTalk.cjs     # 合约测试
│   └── package.json
├── chain-talk-subgraph/      # The Graph 子图
│   ├── subgraph.yaml
│   ├── schema.graphql
│   └── src/chain-talk.ts
├── LICENSE
└── README.md
```

## 🔧 开发说明

### 合约设计理念

- **极简即安全**: 最好的代码就是没有代码，没有代码就没有 bug
- **无存储数据**: 合约只存一个自增计数器，所有内容存在事件日志中
- **不可升级**: 部署后规则永久固定，无管理员后门
- **无主概念**: 部署者对合约无任何特殊权限

### 讨论数据结构

- `replyTo = 0`: 创建新主题
- `replyTo > 0`: 回复指定帖子（支持楼中楼）
- 所有帖子共享顺序 ID
- 时间戳通过区块号查询，不重复存储在事件中

### 固定主网

前端固定使用 Ethereum 主网合约地址、Studio 查询版本和 Etherscan 链接。钱包切换网络不会改变网站的数据源；不检查或自动切换钱包网络，发送交易时由用户在钱包中选择 Ethereum 主网。Sepolia 部署仅保留为测试记录。

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

- [以太坊官网](https://ethereum.org/)
- [Solidity 文档](https://docs.soliditylang.org/)
- [Svelte 5 文档](https://svelte.dev/docs/svelte-v5-migration-guide)
- [Ethers.js v6 文档](https://docs.ethers.org/v6/)
- [The Graph 文档](https://thegraph.com/docs/)

---

⭐ 如果这个项目对您有帮助，请给个 Star！
