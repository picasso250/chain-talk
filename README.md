# Chain Talk - 去中心化链上论坛

> 基于 Arbitrum 的永恒存储论坛，零门槛访问，完全去中心化

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Network: Arbitrum One](https://img.shields.io/badge/Network-Arbitrum%20One-28A0F0)](https://arbitrum.io/)
[![Contract: Verified](https://img.shields.io/badge/Contract-Verified-brightgreen)](https://arbiscan.io/address/0xb9A8A83c8e599E19ad2E3E1C66721A63d2076380)

## 🌟 在线演示

- **体验地址**: https://chain-talk.netlify.app/
- **零门槛访问**: 无需连接钱包即可浏览所有内容
- **完全去中心化**: 所有数据存储在 Arbitrum 链上

## ✨ 特色功能

- 🚀 **零门槛只读访问** - 有 MetaMask 即可浏览，无需连接授权
- 📝 **永恒链上存储** - 所有主题和回复永久保存在区块链上
- 🔒 **固定规则** - 新版为普通合约，无代理、owner 或升级入口
- ⚡ **高性能体验** - 部署在 Arbitrum One，享受低 Gas 费和快速确认
- 🎨 **现代化 UI** - 基于 Svelte 5 (Runes) + Tailwind CSS

## 🛠️ 技术栈

### Frontend
- **框架**: Svelte 5 (Runes) - 最新响应式编程范式
- **样式**: Tailwind CSS 4 - 实用优先的 CSS 框架
- **Web3**: Ethers.js v6 - 以太坊交互标准库
- **构建工具**: Vite 7 - 极速前端构建工具

### Backend
- **智能合约**: Solidity 0.8.30 - 最新的 Solidity 版本
- **开发框架**: Hardhat - 专业以太坊开发环境
- **部署模式**: 普通合约直接部署，无管理员权限
- **部署网络**: Arbitrum One 主网

### 架构特点
- **不可升级**: 新版合约部署后不能更换逻辑
- **完全去中心化**: 无服务器、无数据库、无单点故障
- **链上数据完整性**: 所有数据公开透明，不可篡改

## 📋 旧版线上合约信息（尚未切换）

- **网络**: Arbitrum One 主网
- **合约地址**: `0xb9A8A83c8e599E19ad2E3E1C66721A63d2076380`
- **Chain ID**: 42161 (0xa4b1)
- **版本**: v0.2.0 (支持回复计数)
- **区块浏览器**: [Arbiscan](https://arbiscan.io/address/0xb9A8A83c8e599E19ad2E3E1C66721A63d2076380)

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- MetaMask 浏览器扩展

### 安装和运行

1. **克隆项目**
```bash
git clone https://github.com/picasso250/chain-talk.git
cd chain-talk
```

2. **安装依赖**
```bash
# 安装前端依赖
cd frontend
npm install

# 安装合约依赖 (如需本地开发)
cd ../backend
npm install
```

3. **启动开发环境**
```bash
# 启动前端开发服务器
cd frontend
npm run dev
```

4. **构建生产版本**
```bash
# 构建前端
cd frontend
npm run build
```

### 网络配置

1. 在 MetaMask 中添加 Arbitrum One 网络：
- **网络名称**: Arbitrum One
- **RPC URL**: https://arb1.arbitrum.io/rpc
- **链ID**: 42161
- **符号**: ETH
- **浏览器 URL**: https://arbiscan.io/

2. 确保钱包中有少量 ETH 用于支付 Gas 费

## 📁 项目结构

```
chain-talk/
├── frontend/                 # Svelte 5 前端应用
│   ├── src/
│   │   ├── App.svelte        # 主应用组件
│   │   ├── ReplySection.svelte    # 回复组件
│   │   ├── MarkdownRenderer.svelte # Markdown 渲染组件
│   │   └── constants.js      # 合约配置常量
│   ├── package.json
│   └── vite.config.js
├── backend/                  # 智能合约
│   ├── contracts/
│   │   └── ChainTalk.sol     # 主合约
│   ├── scripts/              # 部署和升级脚本
│   └── package.json
├── netlify.toml             # Netlify 部署配置
├── LICENSE                  # MIT 许可证
└── README.md               # 项目文档
```

## 不可升级版本 1.0.0 的切换

源码已改为普通合约，但尚未部署。当前前端及子图地址仍指向旧版代理，不代表线上已不可升级。

1. 在 backend 运行 npm test；先使用 scripts/deploy-sepolia.js 验证，再通过 scripts/deploy-arbitrum.js 部署新合约。两个脚本均直接部署，无初始化参数。
2. 记录新地址和部署区块，并验证合约源码。不要把此合约作为旧代理的升级实现，存储布局已改变。
3. 更新 frontend/src/constants.js 的合约地址；更新 chain-talk-subgraph/subgraph.yaml 与 networks.json 的地址和起始区块。新合约计数从零开始，必须部署独立的新子图，不复用旧索引数据。
4. 子图构建、部署并同步完成后，更新 frontend/src/forum.js 的查询端点，最后发布前端。

旧代理和历史日志仍存在于链上，其权限不会因新部署而改变；新版不迁移旧讨论，也不支持对旧主题继续回复。所有线上交易和发布需另行执行。

## 🔧 开发说明

### 讨论数据与交易链接

主题和回复由一次 GraphQL 查询读取。交易确认后，前端从回执事件直接展示新内容；索引尚未返回这些记录时保留本地已确认内容，按实体 ID 去重。该临时状态仅保存在当前页面，刷新页面后依赖子图的同步进度。

子图的 Topic 和 Reply 均要求 `transactionHash` 字段。发布此版本时，必须先部署新子图并等待历史事件同步、确认查询包含真实交易哈希，再发布前端；不兼容旧 schema。

前端数据逻辑测试：在 `frontend` 目录运行 `node --test src/forum.test.js`，构建运行 `npm run build`。子图验证依次运行 `npm run codegen` 和 `npm run build`。

### 合约开发

```bash
cd backend

# 编译合约
npx hardhat compile

# 运行测试
npx hardhat test

# 部署到本地网络
npx hardhat run scripts/deploy-local.js --network localhost
```

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

- [Arbitrum 官网](https://arbitrum.io/)
- [OpenZeppelin 升级文档](https://docs.openzeppelin.com/contracts/4.x/upgrades)
- [Svelte 5 文档](https://svelte.dev/docs/svelte-v5-migration-guide)
- [Ethers.js v6 文档](https://docs.ethers.org/v6/)

## 🌟 技术亮点

- **技术栈**: Svelte 5 Runes、Solidity 0.8.30，普通合约直接部署
- **用户体验优化**: 零门槛只读访问，降低 Web3 使用门槛
- **生产就绪**: 已在 Arbitrum 主网部署，经过充分测试
- **固定规则**: 新版不保留升级或管理员后门，修改规则需要部署新地址
- **完全开源**: MIT 许可证，鼓励社区贡献和二次开发

---

⭐ 如果这个项目对您有帮助，请给个 Star！
