# Bot HR Manager

> 像 HR 一样管理你的 AI Bot - 让每一分 Token 花费都物有所值

---

## 🎯 项目简介

**Bot HR Manager** 是一个为 OpenClaw AI Bot 设计的绩效管理系统，帮助你：

- 💰 **控制成本** - 节省 20-30% Token 成本
- 📈 **提升质量** - Bot 成功率提升到 98%+
- ⚡ **提高效率** - 节省 80% 管理时间
- 🎯 **数据驱动** - 基于数据的决策

---

## ✨ 核心功能

### 1. Token 预算管理 💰
- 设置每个 Bot 的月度 Token 预算
- 实时追踪 Token 使用
- 自动冻结超预算 Bot

### 2. 绩效监控面板 📊
- 实时监控 Bot 状态
- 成功率、Token 效率、用户满意度
- 趋势图表和对比分析

### 3. 智能告警 🔔
- Token 超限告警
- 质量下降告警
- Bot 崩溃告警

### 4. Bot 排行榜 🏆
- Token 效率排行
- 成功率排行
- 综合评分排行

### 5. 每日报告 📝
- 自动生成每日绩效报告
- 发送到飞书/邮件

---

## 🚀 快速开始

### 安装

```bash
# 克隆仓库
git clone https://github.com/your-org/bot-hr-manager.git
cd bot-hr-manager

# 安装依赖
npm install

# 复制到 OpenClaw Skills 目录
cp -r . ~/.openclaw/skills/bot-hr-manager/
```

### 配置

创建配置文件 `~/.openclaw/bot-hr-config.yaml`：

```yaml
# 默认 Token 预算
defaultBudget: 100000  # 10 万 Token/月

# 监控的 Bot 列表
bots:
  - bot_id: luckyai-bot
    bot_name: 幸运号 AI
    bot_type: main-agent
    level: senior
    token_budget: 100000
```

### 使用

```bash
# 启动 Dashboard
cd ~/.openclaw/skills/bot-hr-manager
npm run dashboard

# 访问
open http://localhost:8080
```

---

## 📁 项目结构

```
bot-hr-manager/
├── lib/
│   ├── index.js             # 主入口
│   ├── token_monitor.js     # Token 监控
│   ├── performance_calc.js  # 绩效计算
│   ├── violation_detector.js # 违规检测
│   ├── database.js          # 数据库操作
│   └── config.js            # 配置管理
├── dashboard/
│   ├── server.js            # Web 服务器
│   └── public/              # 前端资源
├── db/
│   ├── schema.sql           # 数据库 Schema
│   └── migrations/          # 数据库迁移
├── tests/                   # 测试
├── SKILL.md                 # OpenClaw Skill 文档
├── package.json
└── README.md
```

---

## 💾 数据存储

所有数据存储在本地 SQLite 数据库：

```
~/.openclaw/data/bot-hr/
├── bots.db              # Bot 基础信息
├── token_usage.db        # Token 使用记录
├── performance.db        # 绩效指标
└── violations.db         # 违规记录
```

---

## 🔧 配置选项

### 配置文件

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `defaultBudget` | 默认月度 Token 预算 | `100000` |
| `warning.threshold` | 警告阈值 | `0.8` |
| `critical.threshold` | 临界阈值 | `0.95` |
| `dashboard.port` | Dashboard 端口 | `8080` |

---

## 📊 性能指标

### 效率指标
- `tokensPerTask` - 每个任务平均 Token 消耗
- `tasksPerHour` - 每小时完成任务数
- `costPerTask` - 每个任务成本

### 质量指标
- `successRate` - 成功率（目标 > 98%）
- `userSatisfaction` - 用户满意度（目标 > 4.5/5.0）
- `errorRate` - 错误率（目标 < 2%）

### 忠诚度指标
- `uptime` - 可用性（目标 > 99.9%）
- `reuseRate` - 复用率（目标 > 85%）

---

## 🤝 贡献指南

欢迎贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

---
