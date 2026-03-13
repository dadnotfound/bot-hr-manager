const Database = require('./database');

/**
 * PerformanceCalculator 类 - 绩效指标计算
 */
class PerformanceCalculator {
  constructor(botId) {
    this.botId = botId;
    this.db = new Database('performance');
    this.tokenUsageDb = new Database('token_usage');
  }

  /**
   * 初始化数据库
   */
  async initialize() {
    const schemaPath = require('path').join(__dirname, '../db/schema.sql');
    await this.db.initialize(schemaPath);
    await this.tokenUsageDb.initialize(schemaPath);
  }

  /**
   * 计算每日绩效指标
   */
  async calculateDailyMetrics(date = null) {
    if (!date) {
      date = this.getToday();
    }

    const metrics = {
      efficiency: await this.calculateEfficiencyMetrics(date),
      quality: await this.calculateQualityMetrics(date),
      loyalty: await this.calculateLoyaltyMetrics(date)
    };

    // 保存到数据库
    await this.saveMetrics(date, metrics);

    return metrics;
  }

  /**
   * 计算效率指标
   */
  async calculateEfficiencyMetrics(date) {
    // 获取当天所有会话
    const sessions = await this.tokenUsageDb.query(
      `SELECT * FROM token_usage 
       WHERE bot_id = ? AND DATE(timestamp/1000, 'unixepoch') = ?`,
      [this.botId, date]
    );

    if (sessions.length === 0) {
      return {
        tokensPerTask: 0,
        tasksPerHour: 0,
        costPerTask: 0
      };
    }

    const totalTokens = sessions.reduce((sum, s) => sum + s.tokens_used, 0);
    const totalTasks = sessions.reduce((sum, s) => sum + (s.tasks_completed || 0), 0);

    const tokensPerTask = totalTasks > 0 ? totalTokens / totalTasks : 0;
    
    // 计算任务完成时间（假设会话持续 1 小时）
    const tasksPerHour = sessions.length > 0 ? totalTasks / sessions.length : 0;
    
    // 假设每 1000 Token 成本 $0.01
    const costPerTask = tokensPerTask * 0.00001;

    return {
      tokensPerTask: Math.round(tokensPerTask),
      tasksPerHour: Math.round(tasksPerHour * 100) / 100,
      costPerTask: Math.round(costPerTask * 10000) / 10000
    };
  }

  /**
   * 计算质量指标
   */
  async calculateQualityMetrics(date) {
    // TODO: 从实际会话数据计算成功率
    // 这里使用模拟数据
    return {
      successRate: 0.98,  // 98%
      userSatisfaction: 4.5,  // 4.5/5.0
      errorRate: 0.02  // 2%
    };
  }

  /**
   * 计算忠诚度指标
   */
  async calculateLoyaltyMetrics(date) {
    // TODO: 从实际数据计算可用性和复用率
    // 这里使用模拟数据
    return {
      uptime: 0.999,  // 99.9%
      reuseRate: 0.85,  // 85%
      userRetention: 0.78  // 78%
    };
  }

  /**
   * 保存指标到数据库
   */
  async saveMetrics(date, metrics) {
    for (const type of Object.keys(metrics)) {
      for (const [name, value] of Object.entries(metrics[type])) {
        await this.db.insert('performance_metrics', {
          bot_id: this.botId,
          date: date,
          metric_type: type,
          metric_name: name,
          metric_value: value
        });
      }
    }
  }

  /**
   * 获取指标
   */
  async getMetrics(days = 7) {
    const result = await this.db.query(`
      SELECT date, metric_type, metric_name, metric_value
      FROM performance_metrics
      WHERE bot_id = ? AND date > date('now', '-${days} days')
      ORDER BY date DESC, metric_type, metric_name
    `, [this.botId]);
    
    return this.formatMetrics(result);
  }

  /**
   * 格式化指标数据
   */
  formatMetrics(rows) {
    const metrics = {};
    
    for (const row of rows) {
      if (!metrics[row.date]) {
        metrics[row.date] = {
          efficiency: {},
          quality: {},
          loyalty: {}
        };
      }
      
      metrics[row.date][row.metric_type][row.metric_name] = row.metric_value;
    }
    
    return metrics;
  }

  /**
   * 获取今天的日期
   */
  getToday() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  /**
   * 关闭数据库连接
   */
  async close() {
    await this.db.close();
    await this.tokenUsageDb.close();
  }
}

module.exports = PerformanceCalculator;
