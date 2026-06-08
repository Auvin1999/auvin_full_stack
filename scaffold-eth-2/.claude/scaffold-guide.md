# Scaffold-ETH 2 项目辅导

> 以太坊 DApp 开发脚手架 - Hardhat 版本

---

## 📋 前置条件

| 工具 | 版本要求 | 当前版本 | 状态 |
|------|---------|---------|------|
| Node.js | >= v22.10.0 | v22.22.1 | ✅ |
| Yarn | v1 或 v2+ | v4.13.0 | ✅ |
| Git | 已安装 | - | ✅ |

---

## 🚀 启动步骤（三终端模式）

### 第一次运行：安装依赖

```bash
# 在 scaffold-eth-2-main 根目录执行
yarn install
```

> ⏱️ 首次安装需要 5-10 分钟，会安装 Hardhat、Next.js 等所有依赖

### 终端 1：启动本地区块链

```bash
yarn chain
```

启动后会看到：
```
Started chain and HTTP provider on http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
...
```

> 💡 账户 #0 是部署账户，拥有 10000 ETH

### 终端 2：部署智能合约

```bash
yarn deploy
```

成功后会看到：
```
✅  YourContract
   - deployment address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
   - deployed to chain 31337
```

### 终端 3：启动前端

```bash
yarn start
```

打开 http://localhost:3000

---

## 🎯 前端页面导航

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/` | 欢迎页面 + 合约说明 |
| Debug Contracts | `/debug` | **核心** - 读写合约、查看事件 |
| Block Explorer | `/blockexplorer` | 本地链浏览器 |

---

## 🔧 开发工作流

### 1. 修改智能合约

编辑 `packages/hardhat/contracts/YourContract.sol`

```solidity
// 示例：添加新函数
function yourFunction() public pure returns (uint256) {
    return 42;
}
```

保存后，前端会**自动热重载**合约代码！

### 2. 重新部署合约

```bash
yarn deploy
```

### 3. 前端使用合约

```typescript
// 读取
const { data } = useScaffoldReadContract({
  contractName: "YourContract",
  functionName: "yourFunction",
});

// 写入
const { writeContractAsync } = useScaffoldWriteContract({
  contractName: "YourContract",
});

await writeContractAsync({
  functionName: "setGreeting",
  args: ["Hello World"],
});
```

---

## 📁 核心目录结构

```
scaffold-eth-2-main/
├── packages/
│   ├── hardhat/              # 智能合约（Solidity）
│   │   ├── contracts/        # .sol 合约文件
│   │   ├── deploy/           # 部署脚本
│   │   ├── test/             # 合约测试
│   │   └── hardhat.config.ts # Hardhat 配置
│   │
│   └── nextjs/               # 前端（React）
│       ├── contracts/        # 自动生成的合约类型
│       ├── hooks/            # scaffold-eth 自定义 Hooks
│       ├── pages/            # 页面
│       └── components/       # 组件
│
├── .claude/
│   └── scaffold-guide.md     # 本文件
└── yarn.lock
```

---

## 🧪 测试合约

```bash
# 运行所有测试
yarn test

# 运行特定测试文件
yarn test test/YourContract.test.ts
```

---

## 🔐 常见问题

| 问题 | 解决方案 |
|------|----------|
| 前端显示 "Failed to fetch" | 确认 `yarn chain` 正在运行 |
| 合约调用失败 | 确认已执行 `yarn deploy` |
| 钱包连接失败 | 检查 MetaMask 是否添加了本地网络 localhost:8545, Chain ID: 31337 |
| 依赖安装报错 | 尝试删除 node_modules 后重新 `yarn install` |

---

## 📚 下一步学习

1. **玩转 Debug Contracts 页面** - 读写合约、监听事件
2. **修改 YourContract.sol** - 添加新的状态变量和函数
3. **创建新页面** - 复制 `pages/index.tsx` 创建新页面
4. **部署到测试网** - 配置 API Key 后部署到 Sepolia

---

## 📖 参考文档

- [Scaffold-ETH 2 官方文档](https://docs.scaffoldeth.io)
- [Wagmi 文档](https://wagmi.sh)
- [Viem 文档](https://viem.sh)
- [Hardhat 文档](https://hardhat.org)

---

## 🎓 快速检查清单

启动前确认：

- [ ] 已执行 `yarn install`
- [ ] 三个终端分别运行：`yarn chain`、`yarn deploy`、`yarn start`
- [ ] 浏览器打开 http://localhost:3000
- [ ] MetaMask 连接 localhost:8545
- [ ] Debug Contracts 页面能读写合约

---

*最后更新: 2026-06-08*
