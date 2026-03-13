const TokenMonitor = require('./token_monitor');
const PerformanceCalculator = require('./performance_calc');
const ViolationDetector = require('./violation_detector');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * BotHRManager 类 - Bot HR 管理系统主入口
 */
class BotHRManager {
  constructor(configPath = null) {
    this.monitors = new Map();
    this.config = this.loadConfig(configPath);
  }

  /**
   * 加载配置文件
   */
  loadConfig(configPath) {
    if (configPath && fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf8');
      return yaml.load(content);
    }

    // 默认配置
    return {
      defaultBudget: 100000,
      bots: [],
      notifications: {
        warning: { enabled: true },
        critical: { enabled: true }
      }
    };
  }

  /**
   * 初始化
   */
  async initialize() {
    console.log('Initializing Bot HR Manager...');
    console.log(`Found ${this.config.bots.length} bots to monitor`);

    // 为每个 Bot 创建监控器
    for (const botConfig of this.config.bots) {
      const monitor = new TokenMonitor(botConfig.bot_id, botConfig);
      await monitor.initialize();
      this.monitors.set(botConfig.bot_id, monitor);
      console.log(`  ✓ Bot ${botConfig.bot_id} (${botConfig.bot_name})`);
    }

    console.log(`Bot HR Manager initialized with ${this.monitors.size} bots`);
  }

  /**
   * 会话开始事件
   */
  async onSessionStart(session) {
    const botId = session.botId;
    const monitor = this.monitors.get(botId);
    
    if (monitor) {
      await monitor.trackUsage(session.id, 0);
    }
  }

  /**
   * 会话结束事件
   */
  async onSessionEnd(session) {
    const botId = session.botId;
    const monitor = this.monitors.get(botId);
    
    if (monitor) {
      // 追踪 Token 使用
      await monitor.trackUsage(session.id, session.tokens || 0, session.taskCount || 0);
      
      // 计算绩效
      const perfCalc = new PerformanceCalculator(botId);
      await perfCalc.initialize();
      await perfCalc.calculateDailyMetrics();
      await perfCalc.close();
      
      // 检查违规
      const detector = new ViolationDetector(botId, this.config);
      await detector.initialize();
      const violations = await detector.checkViolations();
      
      for (const violation of violations) {
        await detector.applyDiscipline(violation);
      }
      
      await detector.close();
    }
  }

  /**
   * 获取 Dashboard 数据
   */
  getDashboardData() {
    const data = {
      bots: [],
      timestamp: Date.now()
    };

    for (const [botId, monitor] of this.monitors) {
      data.bots.push({
        bot_id: botId,
        ...monitor.config
      });
    }

    return data;
  }

  /**
   * 获取 Bot 的 Token 使用情况
   */
  async getBotTokenUsage(botId) {
    const monitor = this.monitors.get(botId);
    if (!monitor) {
      throw new Error(`Bot ${botId} not found`);
    }

    return await monitor.getMonthlyUsage();
  }

  /**
   * 获取 Bot 的绩效指标
   */
  async getBotMetrics(botId, days = 7) {
    const perfCalc = new PerformanceCalculator(botId);
    await perfCalc.initialize();
    const metrics = await perfCalc.getMetrics(days);
    await perfCalc.close();
    
    return metrics;
  }

  /**
   * 获取 Bot 的违规历史
   */
  async getBotViolations(botId, days = 30) {
    const detector = new ViolationDetector(botId);
    await detector.initialize();
    const violations = await detector.getViolationHistory(days);
    await detector.close();
    
    return violations;
  }

  /**
   * 获取所有 Bot 的排行榜
   */
  async getBotRanking(metric = 'tokensPerTask', order = 'ASC') {
    const rankings = [];

    for (const [botId, monitor] of this.monitors) {
      const perfCalc = new PerformanceCalculator(botId);
      await perfCalc.initialize();
      const metrics = await perfCalc.getMetrics(1);
      await perfCalc.close();

      const latest = Object.values(metrics)[0];
      if (latest && latest.efficiency && latest.efficiency[metric]) {
        rankings.push({
          bot_id: botId,
          bot_name: monitor.config.bot_name,
          value: latest.efficiency[metric]
        });
      }
    }

    // 排序
    rankings.sort((a, b) => {
      return order === 'ASC' ? a.value - b.value : b.value - a.value;
    });

    return rankings;
  }

  /**
   * 生成每日报告
   */
  async generateDailyReport() {
    const report = {
      date: new Date().toISOString().split('T')[0],
      bots: []
    };

    for (const [botId, monitor] of this.monitors) {
      const usage = await monitor.getMonthlyUsage();
      const perfCalc = new PerformanceCalculator(botId);
      await perfCalc.initialize();
      const metrics = await perfCalc.getMetrics(1);
      await perfCalc.close();

      report.bots.push({
        bot_id: botId,
        bot_name: monitor.config.bot_name,
        usage: usage,
        metrics: metrics
      });
    }

    return report;
  }

  /**
   * 关闭所有连接
   */
  async close() {
    for (const monitor of this.monitors.values()) {
      await monitor.close();
    }
  }
}

module.exports = BotHRManager;
