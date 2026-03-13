const express = require('express');
const path = require('path');
const BotHRManager = require('../lib');

/**
 * Bot HR Manager Web Dashboard Server
 */
class DashboardServer {
  constructor(configPath) {
    this.app = express();
    this.configPath = configPath;
    this.hrManager = null;
    this.port = process.env.PORT || 8080;
  }

  /**
   * 初始化服务器
   */
  async initialize() {
    console.log('Initializing Bot HR Manager Dashboard...');
    
    // 初始化 HR Manager
    this.hrManager = new BotHRManager(this.configPath);
    await this.hrManager.initialize();
    
    // 配置 Express
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * 配置中间件
   */
  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  /**
   * 配置路由
   */
  setupRoutes() {
    // API 路由
    
    // 获取统计数据
    this.app.get('/api/stats', async (req, res) => {
      try {
        const stats = await this.getStats();
        res.json(stats);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 获取 Bot 列表
    this.app.get('/api/bots', async (req, res) => {
      try {
        const bots = await this.getBots();
        res.json(bots);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 获取 Token 趋势
    this.app.get('/api/trend', async (req, res) => {
      try {
        const trend = await this.getTrend();
        res.json(trend);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 获取绩效对比
    this.app.get('/api/performance', async (req, res) => {
      try {
        const perf = await this.getPerformance();
        res.json(perf);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 获取排行榜
    this.app.get('/api/ranking', async (req, res) => {
      try {
        const ranking = await this.hrManager.getBotRanking('tokensPerTask', 'ASC');
        res.json(ranking);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 获取告警列表
    this.app.get('/api/alerts', async (req, res) => {
      try {
        const alerts = await this.getAlerts();
        res.json(alerts);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 健康检查
    this.app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', timestamp: Date.now() });
    });
  }

  /**
   * 配置错误处理
   */
  setupErrorHandling() {
    this.app.use((err, req, res, next) => {
      console.error('Server error:', err);
      res.status(500).json({ error: err.message });
    });
  }

  /**
   * 获取统计数据
   */
  async getStats() {
    const bots = this.hrManager.monitors;
    let totalTokens = 0;
    let successRateSum = 0;
    let tokenEfficiencySum = 0;
    let alertCount = 0;

    for (const [botId, monitor] of bots) {
      const usage = await monitor.getMonthlyUsage();
      totalTokens += usage.used_tokens;
      tokenEfficiencySum += usage.used_tokens / (usage.total_budget || 1);
      
      // TODO: 从实际数据获取成功率
      successRateSum += 0.98;
      
      // TODO: 从违规记录获取告警数
    }

    return {
      totalTokens,
      avgSuccessRate: successRateSum / bots.size,
      tokenEfficiency: tokenEfficiencySum / bots.size,
      alertCount,
      botCount: bots.size
    };
  }

  /**
   * 获取 Bot 列表
   */
  async getBots() {
    const bots = [];

    for (const [botId, monitor] of this.monitors) {
      const usage = await monitor.getMonthlyUsage();
      bots.push({
        bot_id: botId,
        bot_name: monitor.config.bot_name || botId,
        bot_type: monitor.config.bot_type || 'unknown',
        level: monitor.config.level || 'junior',
        total_budget: usage.total_budget,
        used_tokens: usage.used_tokens,
        usagePercent: usage.used_tokens / usage.total_budget
      });
    }

    return bots;
  }

  /**
   * 获取 Token 趋势
   */
  async getTrend() {
    const trend = {
      labels: [],
      data: []
    };

    // 获取最近 7 天的数据
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      trend.labels.push(dateStr);
      
      // TODO: 从实际数据获取
      trend.data.push(Math.floor(Math.random() * 50000) + 30000);
    }

    return trend;
  }

  /**
   * 获取绩效对比
   */
  async getPerformance() {
    const labels = [];
    const successRate = [];
    const userSatisfaction = [];

    for (const [botId, monitor] of this.monitors) {
      labels.push(monitor.config.bot_name || botId);
      
      // TODO: 从实际数据获取
      successRate.push(Math.random() * 10 + 90); // 90-100
      userSatisfaction.push(Math.random() * 2 + 3); // 3-5
    }

    return {
      labels,
      successRate,
      userSatisfaction
    };
  }

  /**
   * 获取告警列表
   */
  async getAlerts() {
    const alerts = [];

    for (const [botId, monitor] of this.monitors) {
      const violations = await this.hrManager.getBotViolations(botId, 7);
      
      for (const violation of violations) {
        alerts.push({
          bot_name: monitor.config.bot_name || botId,
          violation_type: violation.violation_type,
          severity: violation.severity,
          description: violation.description,
          timestamp: new Date(violation.timestamp).toLocaleString('zh-CN')
        });
      }
    }

    return alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * 启动服务器
   */
  start() {
    this.app.listen(this.port, () => {
      console.log(`\n🚀 Bot HR Manager Dashboard is running!`);
      console.log(`📍 URL: http://localhost:${this.port}`);
      console.log(`📊 Monitoring ${this.hrManager.monitors.size} bots`);
      console.log(`\nPress Ctrl+C to stop\n`);
    });
  }

  /**
   * 关闭服务器
   */
  async close() {
    if (this.hrManager) {
      await this.hrManager.close();
    }
  }
}

// 启动服务器
if (require.main === module) {
  const configPath = process.env.BOT_HR_CONFIG || '~/.openclaw/bot-hr-config.yaml';
  const server = new DashboardServer(configPath);
  
  server.initialize().then(() => {
    server.start();
  }).catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

  // 优雅退出
  process.on('SIGINT', async () => {
    console.log('\n👋 Shutting down gracefully...');
    await server.close();
    process.exit(0);
  });
}

module.exports = DashboardServer;
