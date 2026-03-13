const Database = require('./database');
const path = require('path');

/**
 * TokenMonitor 类 - Token 使用监控
 */
class TokenMonitor {
  constructor(botId, config) {
    this.botId = botId;
    this.config = config;
    this.tokenUsageDb = new Database('token_usage');
    this.botsDb = new Database('bots');
  }

  /**
   * 初始化数据库
   */
  async initialize() {
    const schemaPath = path.join(__dirname, '../db/schema.sql');
    await this.tokenUsageDb.initialize(schemaPath);
    await this.botsDb.initialize(schemaPath);
    
    // 确保 Bot 记录存在
    await this.ensureBotExists();
  }

  /**
   * 确保 Bot 记录存在
   */
  async ensureBotExists() {
    const bot = await this.botsDb.get(
      'SELECT * FROM bots WHERE bot_id = ?',
      [this.botId]
    );
    
    if (!bot) {
      await this.botsDb.insert('bots', {
        bot_id: this.botId,
        bot_name: this.config.bot_name || this.botId,
        bot_type: this.config.bot_type || 'unknown',
        level: this.config.level || 'junior',
        status: 'active',
        config: JSON.stringify(this.config)
      });
    }
  }

  /**
   * 追踪 Token 使用
   */
  async trackUsage(sessionId, tokenCount, taskCount = 0) {
    // 记录 Token 使用
    await this.tokenUsageDb.insert('token_usage', {
      bot_id: this.botId,
      session_id: sessionId,
      tokens_used: tokenCount,
      tasks_completed: taskCount
    });

    // 更新预算使用情况
    await this.updateBudgetUsage(tokenCount);

    // 检查预算
    await this.checkBudget();
  }

  /**
   * 更新预算使用情况
   */
  async updateBudgetUsage(tokenCount) {
    const month = this.getCurrentMonth();
    
    // 获取或创建预算记录
    let budget = await this.botsDb.get(
      'SELECT * FROM token_budgets WHERE bot_id = ? AND month = ?',
      [this.botId, month]
    );

    if (!budget) {
      // 创建默认预算
      await this.botsDb.insert('token_budgets', {
        bot_id: this.botId,
        month: month,
        total_budget: this.config.token_budget || this.config.defaultBudget || 100000,
        used_tokens: tokenCount,
        warning_threshold: 0.8,
        critical_threshold: 0.95
      });
    } else {
      // 更新已使用 Token
      await this.botsDb.update('token_budgets', 
        { used_tokens: budget.used_tokens + tokenCount },
        { bot_id: this.botId, month: month }
      );
    }
  }

  /**
   * 检查预算
   */
  async checkBudget() {
    const month = this.getCurrentMonth();
    
    const budget = await this.botsDb.get(
      'SELECT * FROM token_budgets WHERE bot_id = ? AND month = ?',
      [this.botId, month]
    );

    if (!budget) return;

    const usagePercent = budget.used_tokens / budget.total_budget;

    // 检查阈值
    if (usagePercent > budget.critical_threshold) {
      await this.triggerAlert('critical', budget);
    } else if (usagePercent > budget.warning_threshold) {
      await this.triggerAlert('warning', budget);
    }
  }

  /**
   * 触发告警
   */
  async triggerAlert(level, budget) {
    const usagePercent = (budget.used_tokens / budget.total_budget * 100).toFixed(1);
    const message = `[${level.toUpperCase()}] Bot ${this.botId}: Token 使用超过 ${usagePercent}% (${budget.used_tokens}/${budget.total_budget})`;
    
    console.log(message);
    
    // 记录到违规表
    await this.botsDb.insert('violations', {
      bot_id: this.botId,
      violation_type: 'token_overuse',
      severity: level,
      description: message,
      action_taken: level === 'critical' ? 'bot_frozen' : 'none'
    });

    // TODO: 发送通知（飞书、邮件等）
    if (this.config.notifications && this.config.notifications[level]) {
      await this.sendNotification(level, message);
    }
  }

  /**
   * 发送通知
   */
  async sendNotification(level, message) {
    // TODO: 实现飞书、邮件等通知方式
    console.log(`[NOTIFICATION] ${message}`);
  }

  /**
   * 获取本月使用情况
   */
  async getMonthlyUsage() {
    const month = this.getCurrentMonth();
    const result = await this.botsDb.get(
      'SELECT * FROM token_budgets WHERE bot_id = ? AND month = ?',
      [this.botId, month]
    );
    
    return result || { total_budget: 0, used_tokens: 0 };
  }

  /**
   * 获取使用趋势
   */
  async getUsageTrend(days = 7) {
    const result = await this.tokenUsageDb.query(`
      SELECT 
        DATE(timestamp/1000, 'unixepoch') as date,
        SUM(tokens_used) as tokens,
        COUNT(*) as sessions
      FROM token_usage
      WHERE bot_id = ? AND timestamp > datetime('now', '-${days} days') * 1000
      GROUP BY date
      ORDER BY date ASC
    `, [this.botId]);
    
    return result;
  }

  /**
   * 获取当前月份
   */
  getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  /**
   * 关闭数据库连接
   */
  async close() {
    await this.tokenUsageDb.close();
    await this.botsDb.close();
  }
}

module.exports = TokenMonitor;
