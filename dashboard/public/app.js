// Bot HR Manager Dashboard - 前端逻辑

// API 基础 URL
const API_BASE = 'http://localhost:8080/api';

// 初始化
async function init() {
  updateCurrentTime();
  loadDashboardData();
  setInterval(updateCurrentTime, 1000);
  
  // 每 30 秒刷新数据
  setInterval(loadDashboardData, 30000);
}

// 更新当前时间
function updateCurrentTime() {
  const now = new Date();
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit'
  };
  document.getElementById('currentTime').textContent = now.toLocaleDateString('zh-CN', options);
}

// 加载 Dashboard 数据
async function loadDashboardData() {
  try {
    // 加载统计数据
    await loadStats();
    
    // 加载 Bot 列表
    await loadBotList();
    
    // 加载 Token 趋势
    await loadTokenTrend();
    
    // 加载绩效对比
    await loadPerformanceComparison();
    
    // 加载排行榜
    await loadRanking();
    
    // 加载告警
    await loadAlerts();
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

// 加载统计数据
async function loadStats() {
  const response = await fetch(`${API_BASE}/stats`);
  const stats = await response.json();
  
  document.getElementById('totalTokens').textContent = formatNumber(stats.totalTokens);
  document.getElementById('avgSuccessRate').textContent = (stats.avgSuccessRate * 100).toFixed(1) + '%';
  document.getElementById('tokenEfficiency').textContent = stats.tokenEfficiency.toFixed(0);
  document.getElementById('alertCount').textContent = stats.alertCount;
  document.getElementById('botCount').textContent = stats.botCount;
}

// 加载 Bot 列表
async function loadBotList() {
  const response = await fetch(`${API_BASE}/bots`);
  const bots = await response.json();
  
  const botListEl = document.getElementById('botList');
  botListEl.innerHTML = bots.map(bot => `
    <div class="bot-item level-${bot.level}">
      <div class="bot-info">
        <div class="bot-name">${bot.bot_name}</div>
        <div class="bot-type">${bot.bot_type} | ${bot.level}</div>
      </div>
      <div class="bot-metrics">
        <div class="metric">
          <div class="metric-value">${formatNumber(bot.used_tokens)}</div>
          <div class="metric-label">已用</div>
        </div>
        <div class="metric">
          <div class="metric-value">${formatNumber(bot.total_budget)}</div>
          <div class="metric-label">预算</div>
        </div>
        <div class="metric">
          <div class="metric-value">${(bot.usagePercent * 100).toFixed(0)}%</div>
          <div class="metric-label">使用率</div>
        </div>
      </div>
    </div>
  `).join('');
}

// 加载 Token 趋势
async function loadTokenTrend() {
  const response = await fetch(`${API_BASE}/trend`);
  const trend = await response.json();
  
  const ctx = document.getElementById('tokenChart').getContext('2d');
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: trend.labels,
      datasets: [{
        label: 'Token 使用',
        data: trend.data,
        borderColor: '#1890ff',
        backgroundColor: 'rgba(24, 144, 255, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// 加载绩效对比
async function loadPerformanceComparison() {
  const response = await fetch(`${API_BASE}/performance`);
  const perf = await response.json();
  
  const ctx = document.getElementById('performanceChart').getContext('2d');
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: perf.labels,
      datasets: [
        {
          label: '成功率',
          data: perf.successRate,
          backgroundColor: 'rgba(82, 196, 26, 0.8)'
        },
        {
          label: '用户满意度',
          data: perf.userSatisfaction,
          backgroundColor: 'rgba(24, 144, 255, 0.8)'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}

// 加载排行榜
async function loadRanking() {
  const response = await fetch(`${API_BASE}/ranking`);
  const ranking = await response.json();
  
  const tbody = document.getElementById('rankingBody');
  tbody.innerHTML = ranking.map((bot, index) => `
    <tr class="rank-${index + 1}">
      <td><span class="rank-badge">${index + 1}</span></td>
      <td>${bot.bot_name}</td>
      <td>${bot.value.toFixed(0)}</td>
      <td>${(bot.successRate * 100).toFixed(1)}%</td>
      <td>${bot.userSatisfaction.toFixed(1)}</td>
    </tr>
  `).join('');
}

// 加载告警
async function loadAlerts() {
  const response = await fetch(`${API_BASE}/alerts`);
  const alerts = await response.json();
  
  const alertListEl = document.getElementById('alertList');
  
  if (alerts.length === 0) {
    alertListEl.innerHTML = '<div style="text-align:center; color:#999;">暂无告警</div>';
    return;
  }
  
  alertListEl.innerHTML = alerts.map(alert => `
    <div class="alert ${alert.severity}">
      <div class="alert-title">${alert.severity === 'critical' ? '🚨' : '⚠️'} ${alert.bot_name} - ${alert.violation_type}</div>
      <div>${alert.description}</div>
      <div style="font-size:12px; margin-top:5px; opacity:0.8;">${alert.timestamp}</div>
    </div>
  `).join('');
}

// 格式化数字
function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
