# PROJECT CONSTITUTION & PHILOSOPHY

1. Zero Over-Engineering (零过度设计)
2. Atomic Changes (原子化变更)
3. Stability First (稳定性优先)
4. Tech Stack Constraints (技术栈约束)
5. Verification Process (验证流程)

---

如果我在大的改动之后忘记，那么你提醒我
"Review logic. Remove redundant code. Simplify state management. Refactor to reduce Cognitive Load"
    Rule: Readability > Line Count.

---

小步快跑

---

### 马斯克会怎么做？(The Musk Algorithm applied to AI)

如果马斯克在管理这个 AI 团队，他会强制执行 **"The Algorithm"** 的五步法。

1.  **质疑需求 (Question the Requirements)**：
    *   AI 说：“为了状态管理，我建议引入 Redux。”
    *   马斯克式回答：“**驳回。** 你的需求是错的。这个应用只有 3 个状态，用全局变量或者 Svelte Store 足够了。蠢货。”

2.  **删除零件 (Delete the Part)**：
    *   AI 生成了 `vite.config.js`, `svelte.config.js`, `.prettierrc`, `.eslintrc`。
    *   马斯克式操作：**删掉。** 只需要 `index.html` 和 `main.js` 能跑起来就行。如果跑不起来，再加回来。

3.  **简化与优化 (Simplify or Optimize)**：
    *   永远不要让 AI 一次性重构整个项目。
    *   **指令技巧**：“只重构 `Sidebar` 组件。不要动其他任何东西。确信能跑了再告诉我。”

4.  **加快迭代周期 (Accelerate Cycle Time)**：
    *   **指令技巧**：“每写完一个函数，就给我输出一段测试代码。我要看到它现在就能跑。”

5.  **自动化 (Automate)**：
    *   这就是你正在做的——试图配置 OpenCode 让它自动遵守规则。

---

- 不要 npm run dev
- npm run build 来检查你的语法等

---

### 代理设置注意 (Proxy Setting Note)
在 Windows 环境下，使用 `export` 设置代理环境变量，而不是 `set`：
```bash
export HTTP_PROXY=http://127.0.0.1:8800
export HTTPS_PROXY=http://127.0.0.1:8800
npx hardhat run scripts/deploy-sepolia.js --network sepolia
```
这是因为在 Windows 上 OpenCode 对 bash 做了特殊处理，`export` 命令可以正确设置环境变量。