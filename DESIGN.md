# OpenClaw Bot 绩效管理体系设计方案

**设计目标：** 为 OpenClaw 中的 AI Agent/Bot 植入完整的绩效管理体系  
**核心理念：** 将"狠辣"人力资源管理手段合理应用到 AI Bot 上  
**设计时间：** 2026-03-13

---

## 📋 目录

1. [核心架构设计](#核心架构设计)
2. [数据模型设计](#数据模型设计)
3. [绩效指标体系](#绩效指标体系)
4. [技术实现方案](#技术实现方案)
5. [OpenClaw 集成方案](#openclaw-集成方案)
6. [MVP 开发计划](#mvp-开发计划)

---

## 核心架构设计

### 系统架构图

```
┌─────────────────────────────────────────────────────────┐
│                  OpenClaw Gateway                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Agent A    │  │   Agent B    │  │   Agent C    │  │
│  │  (luckyai)   │  │ (sub-agent)  │  │  (ACP)       │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │          │
└─────────┼─────────────────┼─────────────────┼──────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                  ┌─────────▼─────────┐
                  │  Bot HR Monitor   │
                  │  (绩效监控服务)    │
                  └─────────┬─────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
    ┌─────▼─────┐    ┌─────▼─────┐    ┌─────▼─────┐
    │ Token DB  │    │ Metrics DB│    │ Config DB │
    │ (用量统计) │    │ (绩效数据) │    │ (配置数据) │
    └───────────┘    └───────────┘    └───────────┘
```

---

## 数据模型设计

### 1. Bot 基础信息表 (bot_registry)

```json
{
  "bot_id": "luckyai-bot",
  "bot_name": "幸运号 AI",
  "bot_type": "main-agent|sub-agent|acp",
  "level": "junior|senior|expert",
  "status": "active|suspended|frozen",
  "created_at": "2026-03-13T00:00:00Z",
  "owner": "ou_010b1295932c3f557923e9016f4dfeae"
}
```

### 2. Token 预算表 (token_budget)

```json
{
  "bot_id": "luckyai-bot",
  "month": "2026-03",
  "total_budget": 1000000,
  "used_tokens": 45000,
  "remaining_tokens": 955000,
  "warning_threshold": 0.8,
  "critical_threshold": 0.95,
  "status": "normal|warning|critical"
}
```

### 3. 绩效指标表 (performance_metrics)

```json
{
  "bot_id": "luckyai-bot",
  "date": "2026-03-13",
  "metrics": {
    "efficiency": {
      "tokens_per_task": 2500,
      "tasks_per_hour": 120,
      "cost_per_task": 0.05
    },
    "quality": {
      "success_rate": 0.98,
      "user_satisfaction": 4.5,
      "error_rate": 0.02
    },
    "loyalty": {
      "uptime": 0.999,
      "reuse_rate": 0.85,
      "user_retention": 0.78
    }
  }
}
```

### 4. 违规记录表 (violations)

```json
{
  "bot_id": "luckyai-bot",
  "violation_id": "vio-001",
  "type": "token_overuse|security_breach|performance_fail",
  "severity": "warning|critical",
  "description": "Token usage exceeded daily limit",
  "timestamp": "2026-03-13T10:00:00Z",
  "action_taken": "reduced_budget|suspended|none"
}
```

---

## 绩效指标体系

### 一级指标（3 大类）

#### 1. 效率指标 (Efficiency)
- **tokensPerTask** - 每个任务平均 Token 消耗
- **tasksPerHour** - 每小时完成任务数
- **costPerTask** - 每个任务成本（美元）

#### 2. 质量指标 (Quality)
- **successRate** - 成功率（目标 > 98%）
- **userSatisfaction** - 用户满意度（目标 > 4.5/5.0）
- **errorRate** - 错误率（目标 < 2%）

#### 3. 忠诚度指标 (Loyalty)
- **uptime** - 可用性（目标 > 99.9%）
- **reuseRate** - 复用率（目标 > 85%）
- **userRetention** - 用户留存率（目标 > 78%）

### 二级指标（细分）

#### Token 效率
```javascript
{
  "daily_avg": 45000,
  "weekly_avg": 315000,
  "monthly_avg": 1350000,
  "trend": "decreasing|stable|increasing"
}
```

#### 任务分布
```javascript
{
  "by_type": {
    "message_send": 120,
    "file_read": 45,
    "web_search": 30
  },
  "by_status": {
    "success": 285,
    "failed": 5,
    "timeout": 10
  }
}
```

---

## 技术实现方案

### 方案 A：OpenClaw Skill（推荐）

**优点：**
- ✅ 无需修改 OpenClaw 核心代码
- ✅ 可以作为独立模块部署
- ✅ 易于维护和升级

**实现步骤：**

1. **创建 Skill 目录结构**
```bash
mkdir -p ~/.openclaw/skills/bot-hr-manager
cd ~/.openclaw/skills/bot-hr-manager
```

2. **创建 SKILL.md**
```markdown
# Bot HR Manager Skill

为 OpenClaw Agent 提供"人力资源"管理服务，包括：
- Token 预算管理
- 绩效指标追踪
- 自动违规检测
- 绩效报告生成
```

3. **核心模块设计**

#### 模块 1：Token 监控器 (token_monitor.js)
```javascript
class TokenMonitor {
  constructor(botId, config) {
    this.botId = botId;
    this.config = config;
    this.db = new Database('bot_hr.db');
  }

  async trackTokenUsage(sessionId, tokenCount) {
    // 记录 Token 使用
    await this.db.insert('token_usage', {
      bot_id: this.botId,
      session_id: sessionId,
      tokens: tokenCount,
      timestamp: Date.now()
    });

    // 检查是否超限
    const usage = await this.getMonthlyUsage();
    const budget = await this.getTokenBudget();

    if (usage.used / budget.total > budget.critical) {
      await this.triggerAlert('critical');
    } else if (usage.used / budget.total > budget.warning) {
      await this.triggerAlert('warning');
    }
  }

  async getMonthlyUsage() {
    // 获取本月使用量
    return await this.db.query(`
      SELECT SUM(tokens) as used
      FROM token_usage
      WHERE bot_id = ? AND month = ?
    `, [this.botId, getCurrentMonth()]);
  }
}
```

#### 模块 2：绩效计算器 (performance_calculator.js)
```javascript
class PerformanceCalculator {
  constructor(botId) {
    this.botId = botId;
    this.db = new Database('bot_hr.db');
  }

  async calculateDailyMetrics() {
    const sessions = await this.getTodaySessions();
    
    return {
      efficiency: {
        tokensPerTask: this.calcTokensPerTask(sessions),
        tasksPerHour: this.calcTasksPerHour(sessions),
        costPerTask: this.calcCostPerTask(sessions)
      },
      quality: {
        successRate: this.calcSuccessRate(sessions),
        userSatisfaction: await this.getUserSatisfaction(),
        errorRate: this.calcErrorRate(sessions)
      },
      loyalty: {
        uptime: await this.getUptime(),
        reuseRate: await this.getReuseRate(),
        userRetention: await this.getUserRetention()
      }
    };
  }

  calcTokensPerTask(sessions) {
    const totalTokens = sessions.reduce((sum, s) => sum + s.tokens, 0);
    const totalTasks = sessions.length;
    return totalTokens / totalTasks;
  }
}
```

#### 模块 3：违规检测器 (violation_detector.js)
```javascript
class ViolationDetector {
  constructor(botId, config) {
    this.botId = botId;
    this.config = config;
    this.db = new Database('bot_hr.db');
  }

  async checkViolations() {
    const violations = [];

    // 检查 Token 超限
    const tokenStatus = await this.checkTokenBudget();
    if (tokenStatus.status === 'critical') {
      violations.push({
        type: 'token_overuse',
        severity: 'critical',
        description: `Token 使用超过 ${tokenStatus.percentage}%`
      });
    }

    // 检查成功率
    const metrics = await this.getMetrics();
    if (metrics.quality.successRate < 0.95) {
      violations.push({
        type: 'performance_fail',
        severity: 'warning',
        description: `成功率仅 ${metrics.quality.successRate*100}%`
      });
    }

    return violations;
  }

  async applyDiscipline(violation) {
    switch (violation.severity) {
      case 'critical':
        await this.suspendBot();
        break;
      case 'warning':
        await this.reduceBudget();
        break;
    }
  }
}
```

#### 模块 4：报告生成器 (report_generator.js)
```javascript
class ReportGenerator {
  constructor(botId) {
    this.botId = botId;
    this.db = new Database('bot_hr.db');
  }

  async generateDailyReport() {
    const metrics = await this.getMetrics();
    const violations = await this.getViolations();
    const budget = await this.getTokenBudget();

    return `
# ${this.botId} 每日绩效报告

## 📊 核心指标
- Token 使用：${budget.used} / ${budget.total}
- 成功率：${(metrics.quality.successRate * 100).toFixed(1)}%
- 用户满意度：${metrics.quality.userSatisfaction}/5.0

## ⚠️ 违规记录
${violations.length > 0 ? violations.map(v => `- ${v.description}`).join('\n') : '无'}

## 💡 优化建议
${this.generateRecommendations(metrics)}
    `;
  }
}
```

### 方案 B：OpenClaw 插件（高级）

**优点：**
- ✅ 深度集成到 OpenClaw 核心
- ✅ 可以拦截所有 Agent 请求
- ✅ 实时监控和控制

**缺点：**
- ❌ 需要修改 OpenClaw 源码
- ❌ 升级维护复杂

**实现位置：**
```javascript
// 在 openclaw-gateway 中间件
app.use(async (req, res, next) => {
  const botId = req.agent.id;
  const monitor = new BotHRMonitor(botId);
  
  // 检查 Token 预算
  const canProceed = await monitor.checkTokenBudget();
  if (!canProceed) {
    return res.status(429).json({ error: 'Token budget exceeded' });
  }
  
  // 记录请求
  await monitor.trackRequest(req);
  
  next();
});
```

---

## OpenClaw 集成方案

### 集成点设计

#### 1. Session Hook（会话钩子）
```javascript
// 在 session 开始/结束时记录
openclaw.on('sessionStart', (session) => {
  botHR.trackSessionStart(session.id, session.agentId);
});

openclaw.on('sessionEnd', (session) => {
  botHR.trackSessionEnd(session.id, session.metrics);
});
```

#### 2. Tool Call Hook（工具调用钩子）
```javascript
// 拦截所有工具调用
openclaw.on('beforeToolCall', (toolCall) => {
  const cost = estimateTokenCost(toolCall);
  const canProceed = botHR.checkBudget(toolCall.agentId, cost);
  
  if (!canProceed) {
    throw new Error('Insufficient token budget');
  }
});
```

#### 3. Error Hook（错误钩子）
```javascript
// 记录错误和违规
openclaw.on('agentError', (error) => {
  botHR.recordViolation(error.agentId, {
    type: 'execution_error',
    severity: 'warning',
    description: error.message
  });
});
```

### 配置文件设计

```yaml
# ~/.openclaw/bot-hr-config.yaml

bot_hr:
  enabled: true
  database: ~/.openclaw/data/bot-hr.db
  monitoring_interval: 60  # 秒

  budgets:
    default:
      monthly: 1000000
      daily: 50000
      warning_threshold: 0.8
      critical_threshold: 0.95

  kpi:
    efficiency:
      tokens_per_task: 2500
      tasks_per_hour: 120
    quality:
      success_rate: 0.98
      user_satisfaction: 4.5
    loyalty:
      uptime: 0.999

  disciplines:
    warning:
      threshold: 3
      action: reduce_budget
      amount: 0.1
    suspension:
      threshold: 5
      action: pause_service
      duration: 86400
    termination:
      threshold: 10
      action: deactivate_bot
```

---

## MVP 开发计划

### Phase 1：核心功能（Week 1）

**Day 1-2：基础架构**
- [ ] 创建 Skill 目录结构
- [ ] 设计数据库 Schema
- [ ] 实现 Token Monitor
- [ ] 实现 Performance Calculator

**Day 3-4：监控和告警**
- [ ] 实现 Violation Detector
- [ ] 实现告警机制
- [ ] 集成到 OpenClaw Session Hook
- [ ] 测试 Token 预算控制

**Day 5-6：报告和可视化**
- [ ] 实现 Report Generator
- [ ] 创建简单的 Web Dashboard
- [ ] 生成每日绩效报告
- [ ] 发送报告到飞书

### Phase 2：高级功能（Week 2）

**Day 1-2：自动化管理**
- [ ] 实现自动降级机制
- [ ] 实现自动暂停机制
- [ ] 实现预算自动调整
- [ ] 实现 Bot "晋升"系统

**Day 3-4：可视化增强**
- [ ] 创建 Grafana Dashboard
- [ ] 添加实时监控图表
- [ ] 添加趋势分析
- [ ] 添加 Bot 排行榜

**Day 5-6：集成和优化**
- [ ] 集成到 BotLearn
- [ ] 优化性能
- [ ] 添加单元测试
- [ ] 编写文档

---

## 技术栈推荐

### 后端
- **Node.js** - 与 OpenClaw 技术栈一致
- **SQLite** - 轻量级数据库
- **Express** - Web API 服务

### 前端
- **React** - Dashboard 界面
- **Recharts** - 数据可视化
- **Tailwind CSS** - 样式

### 监控
- **Grafana** - 数据可视化
- **Prometheus** - 指标收集（可选）

---

## 预期效果

### 成本控制
- ✅ Token 成本降低 20-30%（通过预算强制约束）
- ✅ 避免 Bot 失控导致的成本爆炸

### 质量提升
- ✅ Bot 成功率提升到 98%+
- ✅ 用户满意度提升到 4.5+/5.0

### 管理效率
- ✅ 自动化管理，无需人工干预
- ✅ 实时监控，及时发现问题
- ✅ 数据驱动，持续优化

---

## 下一步行动

1. **确认需求** - 是否需要完整实现这个系统？
2. **选择方案** - 方案 A（Skill）还是方案 B（插件）？
3. **开始开发** - 我可以立即开始 MVP 开发
4. **测试验证** - 在 luckyai 和 sub-agent 上测试

---

**需要我立即开始实现吗？** 🚀

我可以从 Phase 1 Day 1 开始，创建基础架构和 Token Monitor 模块。
