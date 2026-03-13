const Database = require('./database');

/**
 * ViolationDetector 类 - 违规检测
 */
class ViolationDetector {
  constructor(botId, config) {
    this.botId = botId;
    this.config = config;
    this.db = new Database('violations');
    this.botsDb = new Database('bots');
  }

  /**
   * 初始化数据库
   */
  async initialize() {
    const schemaPath = require('path').join(__dirname, '../db/schema.sql');
    await this.db.initialize(schemaPath);
    await this.botsDb.initialize(schemaPath);
  }

  /**
   * 检查违规
   */
  async checkViolations() {
    const violations = [];

    // 检查 Token 超限
    const tokenViolation = await this.checkTokenBudget();
    if (tokenViolation) {
      violations.push(tokenViolation);
    }

    // 检查成功率
    const performanceViolation = await this.checkPerformance();
    if (performanceViolation) {
      violations.push(performanceViolation);
    }

    // 检查重复违规
    const repeatViolation = await this.checkRepeatViolations();
    if (repeatViolation) {
      violations.push(repeatViolation);
    }

    return violations;
  }

  /**
   * 检查 Token 预算
   */
  async checkTokenBudget() {
    const month = this.getCurrentMonth();
    
    const budget = await this.botsDb.get(
      'SELECT * FROM token_budgets WHERE bot_id = ? AND month = ?',
      [this.botId, month]
    );

    if (!budget) return null;

    const usagePercent = budget.used_tokens / budget.total_budget;

    if (usagePercent > budget.critical_threshold) {
      return {
        type: 'token_overuse',
        severity: 'critical',
        description: `Token 使用超过 ${(usagePercent * 100).toFixed(1)}% (${budget.used_tokens}/${budget.total_budget})`,
        action: 'freeze_bot'
      };
    } else if (usagePercent > budget.warning_threshold) {
      return {
        type: 'token_overuse',
        severity: 'warning',
        description: `Token 使用超过 ${(usagePercent * 100).toFixed(1)}% (${budget.used_tokens}/${budget.total_budget})`,
        action: 'reduce_budget'
      };
    }

    return null;
  }

  /**
   * 检查绩效
   */
  async checkPerformance() {
    // TODO: 实现实际的绩效检查
    // 这里返回 null 表示无违规
    return null;
  }

  /**
   * 检查重复违规
   */
  async checkRepeatViolations() {
    const violations = await this.db.query(
      'SELECT * FROM violations WHERE bot_id = ? ORDER BY timestamp DESC',
      [this.botId]
    );

    const warningCount = violations.filter(v => v.severity === 'warning').length;
    const criticalCount = violations.filter(v => v.severity === 'critical').length;

    if (criticalCount >= 1) {
      return {
        type: 'repeat_violations',
        severity: 'critical',
        description: `Bot 有 ${criticalCount} 个严重违规`,
        action: 'terminate_bot'
      };
    } else if (warningCount >= 3) {
      return {
        type: 'repeat_violations',
        severity: 'warning',
        description: `Bot 有 ${warningCount} 个警告`,
        action: 'suspend_bot'
      };
    }

    return null;
  }

  /**
   * 执行违规处理
   */
  async applyDiscipline(violation) {
    console.log(`[VIOLATION] ${this.botId}: ${violation.description}`);

    // 记录违规
    await this.db.insert('violations', {
      bot_id: this.botId,
      violation_type: violation.type,
      severity: violation.severity,
      description: violation.description,
      action_taken: violation.action
    });

    // 根据严重程度执行处理
    switch (violation.action) {
      case 'freeze_bot':
        await this.freezeBot();
        break;
      case 'suspend_bot':
        await this.suspendBot();
        break;
      case 'reduce_budget':
        await this.reduceBudget();
        break;
      case 'terminate_bot':
        await this.terminateBot();
        break;
    }
  }

  /**
   * 冻结 Bot
   */
  async freezeBot() {
    await this.botsDb.update('bots', 
      { status: 'frozen' },
      { bot_id: this.botId }
    );
    console.log(`[ACTION] Bot ${this.botId} 已冻结`);
  }

  /**
   * 暂停 Bot
   */
  async suspendBot() {
    await this.botsDb.update('bots', 
      { status: 'suspended' },
      { bot_id: this.botId }
    );
    console.log(`[ACTION] Bot ${this.botId} 已暂停`);
  }

  /**
   * 减少 Token 预算
   */
  async reduceBudget() {
    const month = this.getCurrentMonth();
    const budget = await this.botsDb.get(
      'SELECT * FROM token_budgets WHERE bot_id = ? AND month = ?',
      [this.botId, month]
    );

    if (budget) {
      const newBudget = Math.floor(budget.total_budget * 0.9); // 减少 10%
      await this.botsDb.update('token_budgets',
        { total_budget: newBudget },
        { bot_id: this.botId, month: month }
      );
      console.log(`[ACTION] Bot ${this.botId} Token 预算减少 10%: ${budget.total_budget} → ${newBudget}`);
    }
  }

  /**
   * 终止 Bot
   */
  async terminateBot() {
    await this.botsDb.update('bots', 
      { status: 'terminated' },
      { bot_id: this.botId }
    );
    console.log(`[ACTION] Bot ${this.botId} 已终止`);
  }

  /**
   * 获取违规历史
   */
  async getViolationHistory(days = 30) {
    return await this.db.query(`
      SELECT * FROM violations
      WHERE bot_id = ? AND timestamp > datetime('now', '-${days} days') * 1000
      ORDER BY timestamp DESC
    `, [this.botId]);
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
    await this.db.close();
    await this.botsDb.close();
  }
}

module.exports = ViolationDetector;
