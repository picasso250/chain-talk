# Chain Talk - 永恒的链上对话

> 极简以太坊合约驱动的论坛：已确认记录无修改或删除入口，合约规则不可升级

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Network: Arbitrum One](https://img.shields.io/badge/Network-Arbitrum_One-28a0f0)](https://arbitrum.io/)

## 🌟 在线演示

- **本分支网站**: https://talka.io99.xyz
- **独立部署**: `arbitrum` 分支运行 Arbitrum One；`main` 分支运行 Ethereum 主网（https://talk.io99.xyz），两者不共享帖子或索引。
- **零门槛访问**: 无需连接钱包即可浏览所有内容
- **完全去中心化**: 帖子记录写入 Arbitrum One 交易和事件日志；网站与索引服务负责展示

## ✨ 特色功能

- 🚀 **零门槛只读访问** - 无需连接钱包即可浏览
- 📝 **链上记录** - 合约不提供修改或删除入口；历史读取依赖保存历史数据的基础设施
- 🔒 **固定规则** - 普通合约，无代理、无 owner、无升级入口
- ⚡ **极简合约** - 仅 22 行代码，1 个变量，1 个函数，1 个事件
- 🎨 **现代化 UI** - 基于 Svelte 5 (Runes) + Tailwind CSS
- 📝 **Markdown 支持** - 主题和回复都支持 Markdown，带 Preview 预览
- 💬 **楼中楼回复** - 支持回复的回复，无限嵌套
- ⚡ **秒开体验** - localStorage 缓存，打开即显示，后台完整查询并刷新
- 🌐 **多钱包支持** - EIP-6963 标准，兼容 MetaMask、Rabby 等
- 💰 **无平台收费** - 发帖人支付 Arbitrum One 交易 Gas 费（ETH）

## 📋 合约信息

### Arbitrum One（本分支）

- **合约地址**: `0x6Cb266BB285BA5F6591e449543d259277d57C700`
- **Chain ID**: 42161 (0xa4b1)
- **部署区块**: 514306515
- **编译器**: solc 0.8.37
- **区块浏览器**: [Arbiscan](https://arbiscan.io/address/0x6Cb266BB285BA5F6591e449543d259277d57C700)
- **Worker 名称**: `chain-talk-arbitrum`
- **正式网站**: https://talka.io99.xyz

`backend/deploy-*.json` 中的 Ethereum 和 Sepolia 文件仅为历史部署记录，不是本分支配置。

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
- **Studio 查询**: 前端固定读取 `chain-talk-arbitrum/v0.0.1`
  - 查询地址：https://api.studio.thegraph.com/query/1723159/chain-talk-arbitrum/v0.0.1

## 💰 使用成本

所有交易由发帖人支付 Gas 费，合约本身不收取任何费用：

实际费用取决于内容字节长度、链上状态和交易时的 Gas 价格，以钱包显示的估算为准。主题和回复调用同一个 `post` 函数。

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm
- EIP-1193 兼容钱包（MetaMask、Rabby 等）

### 安装和运行

```bash
# 克隆项目
git clone --branch arbitrum https://github.com/picasso250/chain-talk.git
cd chain-talk

# 安装前端依赖
cd frontend
npm install

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

# 预估部署（需设置 Arbitrum One RPC_URL、PRIVATE_KEY、CHAIN_ID=42161）
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
│   │   ├── constants.js      # 本分支网络与合约配置
│   │   ├── forum.js          # 数据逻辑（发帖、读取事件）
│   │   └── wallet.js         # EIP-6963 钱包管理
│   ├── wrangler.jsonc         # Worker 配置
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

### 独立分支部署

前端固定使用 `frontend/src/constants.js` 中的 Arbitrum One 配置。钱包切换网络不会改变读取数据源；发帖和回复前检查 chain ID，网络不匹配时提示用户在钱包中切换。缓存按 chain ID 和合约地址隔离。

Worker 名称和域名配置在 `frontend/wrangler.jsonc`。Subgraph 的 `subgraph.yaml` 和 `networks.json` 使用同一合约地址和起始区块，`package.json` 中的部署目标为 `chain-talk-arbitrum`。本地 Graph Node 的 `host.docker.internal:8545` 必须连接 Arbitrum One RPC 或对应分叉。

两个分支使用同一套应用逻辑，各自保留部署配置；同步代码时不要覆盖这些配置。

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
