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
- 🔄 **可升级架构** - 基于 OpenZeppelin UUPS 代理模式，支持合约升级
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
- **升级模式**: OpenZeppelin UUPS - 行业标准的可升级合约模式
- **部署网络**: Arbitrum One 主网

### 架构特点
- **UUPS 代理模式**: 合约可升级，节省 Gas 费用
- **完全去中心化**: 无服务器、无数据库、无单点故障
- **链上数据完整性**: 所有数据公开透明，不可篡改

## 📋 合约信息

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

## 🔧 开发说明

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

- **前沿技术栈**: 采用最新的 Svelte 5 Runes、Solidity 0.8.30 和 UUPS 升级模式
- **用户体验优化**: 零门槛只读访问，降低 Web3 使用门槛
- **生产就绪**: 已在 Arbitrum 主网部署，经过充分测试
- **可持续发展**: 可升级架构确保项目长期演进
- **完全开源**: MIT 许可证，鼓励社区贡献和二次开发

---

⭐ 如果这个项目对您有帮助，请给个 Star！