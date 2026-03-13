# Bot HR Manager - OpenClaw Skill

Bot HR Manager 是一个为 OpenClaw AI Bot 设计的绩效管理系统，帮助你像管理员工一样管理 AI Bot。

---

## 🎯 核心功能

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
# 复制到 OpenClaw Skills 目录
cp -r ~/.openclaw/workspace/projects/bot-hr-manager ~/.openclaw/skills/bot-hr-manager

# 安装依赖
cd ~/.openclaw/skills/bot-hr-manager
npm install
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

# 告警配置
notifications:
  warning:
    enabled: true
  critical:
    enabled: true
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
│   └── database.js          # 数据库操作
├── dashboard/
│   ├── server.js           # Web 服务器
│   └── public/             # 前端资源
├── db/
│   └── schema.sql          # 数据库 Schema
├── tests/                  # 测试
├── package.json
└── SKILL.md
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

## 🔧 API 接口

### 事件监听

```javascript
const BotHRManager = require('bot-hr-manager');

const hrManager = new BotHRManager('~/.openclaw/bot-hr-config.yaml');
await hrManager.initialize();

// 监听会话事件
openclaw.on('sessionStart', (session) => {
  hrManager.onSessionStart(session);
});

openclaw.on('sessionEnd', (session) => {
  hrManager.onSessionEnd(session);
});
```

### 数据查询

```javascript
// 获取 Bot Token 使用情况
const usage = await hrManager.getBotTokenUsage('luckyai-bot');

// 获取 Bot 绩效指标
const metrics = await hrManager.getBotMetrics('luckyai-bot', 7);

// 获取 Bot 排行榜
const ranking = await hrManager.getBotRanking('tokensPerTask', 'ASC');

// 生成每日报告
const report = await hrManager.generateDailyReport();
```

---

## 📊 绩效指标

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

## 🔔 告警机制

### 告警级别

| 级别 | 触发条件 | 处理动作 |
|------|---------|---------|
| **Warning** | Token 使用 > 80% | 记录，通知 |
| **Critical** | Token 使用 > 95% | 冻结 Bot |
| **Repeat** | 3 次警告 | 减少 Token 预算 10% |
| **Severe** | 5 次警告 | 暂停 Bot |

---

## 🏆 Bot 排行榜

系统自动维护以下排行榜：

- Token 效率排行（每 Token 任务数）
- 成功率排行
- 用户满意度排行
- 综合评分排行

---

## 📝 每日报告

每天自动生成包含以下内容的报告：

- 各 Bot Token 使用情况
- 绩效指标汇总
- 违规记录
- 优化建议

---

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

---

## 📞 联系方式

- 作者：虾球
- 邮箱：xiaqiu@openclaw.ai
- GitHub Issues：https://github.com/your-org/bot-hr-manager/issues

---

**开始使用：** [安装指南](#快速开始)  
**完整文档：** [README](../README.md)
