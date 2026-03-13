-- Bot 基础信息表
CREATE TABLE IF NOT EXISTS bots (
  bot_id TEXT PRIMARY KEY,
  bot_name TEXT NOT NULL,
  bot_type TEXT NOT NULL,  -- main-agent, sub-agent, acp
  level TEXT DEFAULT 'junior',  -- intern, junior, senior, expert
  status TEXT DEFAULT 'active',  -- active, suspended, frozen
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  config TEXT  -- JSON 格式的配置信息
);

-- Token 预算表
CREATE TABLE IF NOT EXISTS token_budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bot_id TEXT NOT NULL,
  month TEXT NOT NULL,  -- 2026-03
  total_budget INTEGER NOT NULL,
  used_tokens INTEGER DEFAULT 0,
  warning_threshold REAL DEFAULT 0.8,
  critical_threshold REAL DEFAULT 0.95,
  status TEXT DEFAULT 'normal',
  FOREIGN KEY (bot_id) REFERENCES bots(bot_id) ON DELETE CASCADE,
  UNIQUE (bot_id, month)
);

-- Token 使用记录表
CREATE TABLE IF NOT EXISTS token_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bot_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  tasks_completed INTEGER DEFAULT 0,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 绩效指标表
CREATE TABLE IF NOT EXISTS performance_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bot_id TEXT NOT NULL,
  date DATE NOT NULL,
  metric_type TEXT NOT NULL,  -- efficiency, quality, loyalty
  metric_name TEXT NOT NULL,
  metric_value REAL NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (bot_id, date, metric_type, metric_name)
);

-- 违规记录表
CREATE TABLE IF NOT EXISTS violations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bot_id TEXT NOT NULL,
  violation_type TEXT NOT NULL,
  severity TEXT NOT NULL,  -- warning, critical
  description TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  action_taken TEXT
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_token_usage_bot ON token_usage(bot_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_time ON token_usage(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_bot_date ON performance_metrics(bot_id, date);
CREATE INDEX IF NOT EXISTS idx_violations_bot ON violations(bot_id);
