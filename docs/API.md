# API 文档

Bot HR Manager RESTful API 文档

---

## 基础信息

**Base URL:** `http://localhost:8080/api`

**Content-Type:** `application/json`

---

## 端点列表

### 1. 获取统计数据

**GET** `/api/stats`

获取系统整体统计数据。

**响应示例：**
```json
{
  "totalTokens": 45000,
  "avgSuccessRate": 0.98,
  "tokenEfficiency": 0.45,
  "alertCount": 2,
  "botCount": 3
}
```

---

### 2. 获取 Bot 列表

**GET** `/api/bots`

获取所有 Bot 的基本信息和使用情况。

**响应示例：**
```json
[
  {
    "bot_id": "luckyai-bot",
    "bot_name": "幸运号 AI",
    "bot_type": "main-agent",
    "level": "senior",
    "total_budget": 100000,
    "used_tokens": 45000,
    "usagePercent": 0.45
  }
]
```

---

### 3. 获取 Token 趋势

**GET** `/api/trend`

获取最近 7 天的 Token 使用趋势。

**响应示例：**
```json
{
  "labels": ["2026-03-07", "2026-03-08", "2026-03-09", "2026-03-10", "2026-03-11", "2026-03-12", "2026-03-13"],
  "data": [32000, 35000, 28000, 42000, 38000, 45000, 40000]
}
```

---

### 4. 获取绩效对比

**GET** `/api/performance`

获取所有 Bot 的绩效对比数据。

**响应示例：**
```json
{
  "labels": ["幸运号 AI", "数据清洗 Bot"],
  "successRate": [98, 95],
  "userSatisfaction": [4.5, 4.2]
}
```

---

### 5. 获取排行榜

**GET** `/api/ranking`

获取 Bot 排行榜。

**查询参数：**
- `metric` (可选): 排序指标，默认 `tokensPerTask`
- `order` (可选): 排序方式，`ASC` 或 `DESC`，默认 `ASC`

**响应示例：**
```json
[
  {
    "bot_id": "luckyai-bot",
    "bot_name": "幸运号 AI",
    "value": 2500
  }
]
```

---

### 6. 获取告警列表

**GET** `/api/alerts`

获取最近的告警列表。

**响应示例：**
```json
[
  {
    "bot_name": "幸运号 AI",
    "violation_type": "token_overuse",
    "severity": "warning",
    "description": "Token 使用超过 80%",
    "timestamp": "2026-03-13 15:00:00"
  }
]
```

---

### 7. 健康检查

**GET** `/api/health`

检查服务健康状态。

**响应示例：**
```json
{
  "status": "ok",
  "timestamp": 1678760000000
}
```

---

## 错误响应

所有错误响应格式：

```json
{
  "error": "Error message description"
}
```

HTTP 状态码：
- `200` - 成功
- `400` - 请求参数错误
- `404` - 资源不存在
- `500` - 服务器错误
