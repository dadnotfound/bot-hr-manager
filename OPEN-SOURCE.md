# Bot HR 管理系统 - 纯开源本地部署方案

**目标：** 免费开源，无需后端服务，纯本地部署  
**适合：** 个人用户、小团队、自托管场景

---

## 🎯 核心设计理念

**原则：**
1. ✅ 完全免费开源（MIT/Apache License）
2. ✅ 无需后端服务（纯本地部署）
3. ✅ 数据隐私（所有数据存储在本地）
4. ✅ 易于部署（一键安装）
5. ✅ 跨平台支持（Linux/macOS/Windows）

---

## 📋 架构方案

### 方案对比

#### 方案 A：OpenClaw Skill（推荐）⭐

**架构：**
```
OpenClaw Gateway
    ↓
Agent（加载 Skill）
    ↓
Bot HR Manager Skill
    ↓
本地 SQLite DB + 文件系统
    ↓
本地 Web Dashboard（可选）
```

**优点：**
- ✅ 无需外部服务
- ✅ 完全本地化
- ✅ 数据隐私
- ✅ 易于安装
- ✅ 跨用户独立

**缺点：**
- ❌ 每个用户独立安装
- ❌ 数据无法跨用户共享
- ❌ 无集中式 Dashboard

---

#### 方案 B：Docker 容器化

**架构：**
```
Docker Compose
    ├── bot-hr-api (Node.js 服务)
    ├── bot-hr-db (PostgreSQL)
    └── bot-hr-dashboard (Web UI)
```

**优点：**
- ✅ 一键部署
- ✅ 环境隔离
- ✅ 跨平台
- ✅ 易于升级

**缺点：**
- ❌ 需要 Docker
- ❌ 资源占用较大
- ❌ 对新手不友好

---

#### 方案 C：单文件可执行程序

**架构：**
```
bot-hr-manager (单个二进制文件)
    ├── 内嵌 SQLite
    ├── 内嵌 Web Server
    └── 内嵌 Dashboard
```

**优点：**
- ✅ 极简部署（单个文件）
- ✅ 无依赖
- ✅ 跨平台

**缺点：**
- ❌ 开发复杂度高
- ❌ 不易扩展

---

## 🏆 推荐方案：OpenClaw Skill + 本地 Web Dashboard

### 完整架构

```
┌─────────────────────────────────────────────────┐
│              用户电脑/服务器                      │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │        OpenClaw Gateway                  │   │
│  │                                         │   │
│  │  ┌──────────┐  ┌──────────┐  ┌────────┐ │   │
│  │  │ Agent A  │  │ Agent B  │  │Agent C │ │   │
│  │  └────┬─────┘  └────┬─────┘  └───┬────┘ │   │
│  └───────┼────────────┼──────────────┼─────┘   │
│          │            │              │         │
│          └────────────┼──────────────┘         │
│                       │                        │
│          ┌────────────▼─────────────┐         │
│          │  Bot HR Manager Skill     │         │
│          │  - Token 监控             │         │
│          │  - 绩效计算               │         │
│          │  - 违规检测               │         │
│          │  - 报告生成               │         │
│          └────────────┬─────────────┘         │
│                       │                        │
│          ┌────────────▼─────────────┐         │
│          │   本地数据库 (SQLite)      │         │
│          │   - bots.db               │         │
│          │   - metrics.db            │         │
│          │   - violations.db         │         │
│          └──────────────────────────┘         │
│                       │                        │
│          ┌────────────▼─────────────┐         │
│          │  本地 Web Dashboard       │         │
│          │  (可选，端口 8080)         │         │
│          │  - 实时监控               │         │
│          │  - 绩效图表               │         │
│          │  - 违规告警               │         │
│          └──────────────────────────┘         │
└─────────────────────────────────────────────────┘
```

---

## 💾 数据库设计（SQLite）

### 文件结构

```
~/.openclaw/data/bot-hr/
├── bots.db              # Bot 基础信息
├── token_usage.db        # Token 使用记录
├── performance.db        # 绩效指标
├── violations.db         # 违规记录
└── config.yaml           # 配置文件
```

### 数据库 Schema

#### bots.db

```sql
CREATE TABLE bots (
  bot_id TEXT PRIMARY KEY,
  bot_name TEXT NOT NULL,
  bot_type TEXT NOT NULL,  -- main-agent, sub-agent, acp
  level TEXT DEFAULT 'junior',  -- intern, junior, senior, expert
  status TEXT DEFAULT 'active',  -- active, suspended, frozen
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  config JSON  -- 存储配置信息
);

CREATE TABLE token_budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bot_id TEXT NOT NULL,
  month TEXT NOT NULL,  -- 2026-03
  total_budget INTEGER NOT NULL,
  used_tokens INTEGER DEFAULT 0,
  warning_threshold REAL DEFAULT 0.8,
  critical_threshold REAL DEFAULT 0.95,
  status TEXT DEFAULT 'normal',
  FOREIGN KEY (bot_id) REFERENCES bots(bot_id),
  UNIQUE (bot_id, month)
);
```

#### token_usage.db

```sql
CREATE TABLE token_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bot_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  tasks_completed INTEGER DEFAULT 0,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_token_usage_bot ON token_usage(bot_id);
CREATE INDEX idx_token_usage_time ON token_usage(timestamp);
```

#### performance.db

```sql
CREATE TABLE performance_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bot_id TEXT NOT NULL,
  date DATE NOT NULL,
  metric_type TEXT NOT NULL,  -- efficiency, quality, loyalty
  metric_name TEXT NOT NULL,
  metric_value REAL NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (bot_id, date, metric_type, metric_name)
);

CREATE INDEX idx_performance_bot_date ON performance_metrics(bot_id, date);
```

#### violations.db

```sql
CREATE TABLE violations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bot_id TEXT NOT NULL,
  violation_type TEXT NOT NULL,
  severity TEXT NOT NULL,  -- warning, critical
  description TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  action_taken TEXT
);

CREATE INDEX idx_violations_bot ON violations(bot_id);
```

---

## 🔧 Skill 实现

### 目录结构

```
~/.openclaw/skills/bot-hr-manager/
├── SKILL.md                 # Skill 文档
├── lib/
│   ├── index.js             # 主入口
│   ├── token_monitor.js     # Token 监控
│   ├── performance_calc.js  # 绩效计算
│   ├── violation_detector.js # 违规检测
│   ├── database.js          # 数据库操作
│   └── config.js            # 配置管理
├── db/
│   ├── schema.sql           # 数据库 Schema
│   └── migrations/          # 数据库迁移
├── dashboard/
│   ├── index.html           # Web Dashboard
│   ├── app.js              # 前端逻辑
│   └── styles.css          # 样式
├── config.yaml             # 配置文件
└── README.md               # 使用说明
```

### 核心代码

#### lib/database.js

```javascript
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
  constructor(dbName) {
    const dbDir = path.join(process.env.HOME, '.openclaw/data/bot-hr');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    this.db = new sqlite3.Database(
      path.join(dbDir, `${dbName}.db`),
      (err) => {
        if (err) {
          console.error(`Error opening ${dbName}.db:`, err);
        } else {
          console.log(`Connected to ${dbName}.db`);
        }
      }
    );
  }

  async initialize(schema) {
    return new Promise((resolve, reject) => {
      this.db.exec(schema, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async insert(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const sql = `
      INSERT INTO ${table} (${keys.join(', ')})
      VALUES (${keys.map(() => '?').join(', ')})
    `;
    
    return new Promise((resolve, reject) => {
      this.db.run(sql, values, function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }

  async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = Database;
```

#### lib/token_monitor.js

```javascript
const Database = require('./database');
const fs = require('fs');

class TokenMonitor {
  constructor(botId, config) {
    this.botId = botId;
    this.config = config;
    this.db = new Database('token_usage');
    this.botsDb = new Database('bots');
  }

  async initialize() {
    // 初始化数据库
    const schema = fs.readFileSync(
      path.join(__dirname, '../db/schema.sql'),
      'utf8'
    );
    await this.db.initialize(schema);
    await this.botsDb.initialize(schema);
  }

  async trackUsage(sessionId, tokenCount) {
    // 记录 Token 使用
    await this.db.insert('token_usage', {
      bot_id: this.botId,
      session_id: sessionId,
      tokens_used: tokenCount,
      timestamp: Date.now()
    });

    // 检查预算
    await this.checkBudget();
  }

  async checkBudget() {
    const month = getCurrentMonth();
    
    // 获取本月预算
    const budget = await this.botsDb.query(`
      SELECT * FROM token_budgets
      WHERE bot_id = ? AND month = ?
    `, [this.botId, month]);

    if (budget.length === 0) {
      // 创建默认预算
      await this.createDefaultBudget(month);
      return;
    }

    const budgetInfo = budget[0];
    const usagePercent = budgetInfo.used_tokens / budgetInfo.total_budget;

    // 检查阈值
    if (usagePercent > budgetInfo.critical_threshold) {
      await this.triggerAlert('critical', budgetInfo);
    } else if (usagePercent > budgetInfo.warning_threshold) {
      await this.triggerAlert('warning', budgetInfo);
    }
  }

  async createDefaultBudget(month) {
    await this.botsDb.insert('token_budgets', {
      bot_id: this.botId,
      month: month,
      total_budget: this.config.defaultBudget,
      used_tokens: 0,
      warning_threshold: 0.8,
      critical_threshold: 0.95
    });
  }

  async triggerAlert(level, budget) {
    console.log(`[${level.toUpperCase()}] Bot ${this.botId}: Token 使用超过 ${budget.used_tokens / budget.total_budget * 100}%`);
    
    // 发送通知（飞书、邮件等）
    if (this.config.notifications[level]) {
      await sendNotification({
        bot_id: this.botId,
        level: level,
        message: `Token 使用超过 ${(budget.used_tokens / budget.total_budget * 100).toFixed(1)}%`
      });
    }
  }

  async getMonthlyUsage() {
    const month = getCurrentMonth();
    const result = await this.db.query(`
      SELECT SUM(tokens_used) as total
      FROM token_usage
      WHERE bot_id = ? AND strftime('%Y-%m', timestamp/1000, 'unixepoch') = ?
    `, [this.botId, month]);
    
    return result[0].total || 0;
  }
}

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

module.exports = TokenMonitor;
```

#### lib/index.js（Skill 主入口）

```javascript
const TokenMonitor = require('./token_monitor');
const PerformanceCalculator = require('./performance_calc');
const ViolationDetector = require('./violation_detector');

class BotHRManager {
  constructor(config) {
    this.config = config;
    this.monitors = new Map();
  }

  async initialize() {
    console.log('Initializing Bot HR Manager...');
    
    // 为每个 Bot 创建监控器
    for (const botConfig of this.config.bots) {
      const monitor = new TokenMonitor(botConfig.bot_id, botConfig);
      await monitor.initialize();
      this.monitors.set(botConfig.bot_id, monitor);
    }
    
    console.log(`Bot HR Manager initialized with ${this.monitors.size} bots`);
  }

  async onSessionStart(session) {
    const botId = session.botId;
    const monitor = this.monitors.get(botId);
    
    if (monitor) {
      await monitor.trackUsage(session.id, 0);
    }
  }

  async onSessionEnd(session) {
    const botId = session.botId;
    const monitor = this.monitors.get(botId);
    
    if (monitor) {
      await monitor.trackUsage(session.id, session.tokens);
      
      // 计算绩效
      const perfCalc = new PerformanceCalculator(botId);
      await perfCalc.calculateMetrics();
      
      // 检查违规
      const detector = new ViolationDetector(botId);
      await detector.checkViolations();
    }
  }

  getDashboardData() {
    // 返回 Dashboard 数据
    return {
      bots: Array.from(this.monitors.keys()),
      timestamp: Date.now()
    };
  }
}

module.exports = BotHRManager;
```

---

## 🌐 本地 Web Dashboard（可选）

### 启动本地 Web Server

```javascript
// dashboard/server.js
const express = require('express');
const app = express();
const BotHRManager = require('../lib');

const hrManager = new BotHRManager(require('../config.yaml'));
await hrManager.initialize();

// API 路由
app.get('/api/bots', (req, res) => {
  const data = hrManager.getDashboardData();
  res.json(data);
});

app.get('/api/bots/:botId/metrics', async (req, res) => {
  const perfCalc = new PerformanceCalculator(req.params.botId);
  const metrics = await perfCalc.getMetrics();
  res.json(metrics);
});

// 静态文件
app.use(express.static('public'));

// 启动服务
app.listen(8080, () => {
  console.log('Dashboard running on http://localhost:8080');
});
```

### 简单的 Dashboard 界面

```html
<!-- dashboard/public/index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Bot HR Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <h1>Bot HR Dashboard</h1>
  
  <div id="bots-list"></div>
  
  <canvas id="tokenChart"></canvas>
  
  <script>
    // 获取 Bot 列表
    fetch('/api/bots')
      .then(r => r.json())
      .then(data => {
        document.getElementById('bots-list').innerHTML = 
          data.bots.map(bot => `<div>${bot}</div>`).join('');
      });
    
    // 获取 Token 使用图表
    fetch('/api/bots/luckyai-bot/metrics')
      .then(r => r.json())
      .then(data => {
        new Chart(document.getElementById('tokenChart'), {
          type: 'line',
          data: {
            labels: data.dates,
            datasets: [{
              label: 'Token 使用',
              data: data.tokens
            }]
          }
        });
      });
  </script>
</body>
</html>
```

---

## 📦 部署方案

### 方案 1：手动安装

```bash
# 1. 克隆仓库
git clone https://github.com/your-org/bot-hr-manager.git
cd bot-hr-manager

# 2. 安装依赖
npm install

# 3. 复制到 OpenClaw Skills 目录
cp -r ~/.openclaw/skills/bot-hr-manager ~/.openclaw/skills/

# 4. 配置
cp config.yaml.example ~/.openclaw/bot-hr-config.yaml
# 编辑配置文件

# 5. 启动 Dashboard（可选）
npm run dashboard
```

### 方案 2：一键安装脚本

```bash
#!/bin/bash
# install.sh

echo "Installing Bot HR Manager..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
  echo "Error: Node.js not found"
  exit 1
fi

# 创建目录
mkdir -p ~/.openclaw/skills/bot-hr-manager

# 下载最新版本
curl -L https://github.com/your-org/bot-hr-manager/archive/main.tar.gz | tar xz
cp -r bot-hr-manager-main/* ~/.openclaw/skills/bot-hr-manager/

# 安装依赖
cd ~/.openclaw/skills/bot-hr-manager
npm install

echo "Bot HR Manager installed successfully!"
echo "Run 'npm run dashboard' to start the web interface"
```

---

## 📝 配置文件

### config.yaml

```yaml
# Bot HR Manager 配置

# 默认 Token 预算
defaultBudget: 100000  # 10 万 Token/月

# 监控的 Bot 列表
bots:
  - bot_id: luckyai-bot
    bot_name: 幸运号 AI
    bot_type: main-agent
    level: senior
    token_budget: 100000
    
  - bot_id: data-cleaner-bot
    bot_name: 数据清洗 Bot
    bot_type: sub-agent
    level: junior
    token_budget: 50000

# 告警配置
notifications:
  warning:
    enabled: true
    channels: [feishu, email]
  critical:
    enabled: true
    channels: [feishu, email, sms]

# Dashboard 配置
dashboard:
  enabled: true
  port: 8080
  auto_start: false

# 绩效 KPI
kpi:
  efficiency:
    tokens_per_task: 2500
    tasks_per_hour: 120
  quality:
    success_rate: 0.98
    user_satisfaction: 4.5
  loyalty:
    uptime: 0.999
    reuse_rate: 0.85
```

---

## 🎯 使用流程

### 1. 安装

```bash
# 一键安装
curl -sSL https://raw.githubusercontent.com/your-org/bot-hr-manager/main/install.sh | bash
```

### 2. 配置

编辑 `~/.openclaw/bot-hr-config.yaml`，添加需要监控的 Bot。

### 3. 使用

```bash
# 启动 Dashboard
cd ~/.openclaw/skills/bot-hr-manager
npm run dashboard

# 访问 http://localhost:8080
```

### 4. 自动监控

Bot HR Manager 会自动：
- ✅ 监控所有 Bot 的 Token 使用
- ✅ 计算每日绩效指标
- ✅ 检测违规行为
- ✅ 生成每日报告
- ✅ 发送告警通知

---

## 📊 开源计划

### GitHub 仓库

```
https://github.com/your-org/bot-hr-manager
```

### License

MIT License（完全免费开源）

### 贡献指南

欢迎社区贡献：
- 新功能
- Bug 修复
- 文档改进
- 翻译

---

## 🚀 MVP 开发计划

### Week 1：核心功能
- [ ] Skill 框架搭建
- [ ] SQLite 数据库设计
- [ ] Token Monitor 实现
- [ ] Performance Calculator 实现

### Week 2：增强功能
- [ ] Violation Detector 实现
- [ ] 告警机制
- [ ] Web Dashboard
- [ ] 文档编写

### Week 3：测试和优化
- [ ] 单元测试
- [ ] 集成测试
- [ ] 性能优化
- [ ] 打包发布

---

## 💡 总结

### 核心优势

1. ✅ **完全免费** - MIT License
2. ✅ **无需后端** - 纯本地部署
3. ✅ **数据隐私** - 所有数据在本地
4. ✅ **易于部署** - 一键安装脚本
5. ✅ **跨平台** - Linux/macOS/Windows
6. ✅ **开源社区** - 欢迎贡献

### 适用场景

- ✅ 个人开发者
- ✅ 小团队
- ✅ 自托管需求
- ✅ 数据敏感场景
- ✅ 离线环境

---

**需要我立即开始实现这个开源版本吗？** 🚀

我可以从 Week 1 开始：
1. 创建 GitHub 仓库
2. 搭建 Skill 框架
3. 实现 SQLite 数据库
4. 实现 Token Monitor
