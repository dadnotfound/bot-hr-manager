# 部署指南

Bot HR Manager 部署到生产环境

---

## 部署方式

### 方式 1: 本地部署（推荐）

#### 系统要求
- Node.js >= 14.0.0
- npm >= 6.0.0
- 100MB 磁盘空间

#### 部署步骤

1. **克隆仓库**
```bash
git clone https://github.com/your-org/bot-hr-manager.git
cd bot-hr-manager
```

2. **安装依赖**
```bash
npm install --production
```

3. **配置文件**
```bash
cp ~/.openclaw/bot-hr-config.yaml.example ~/.openclaw/bot-hr-config.yaml
# 编辑配置文件
```

4. **启动服务**
```bash
npm run dashboard
```

5. **访问**
```
http://localhost:8080
```

---

### 方式 2: Docker 部署

#### Dockerfile

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

ENV PORT=8080
EXPOSE 8080

CMD ["npm", "run", "dashboard"]
```

#### 构建和运行

```bash
# 构建镜像
docker build -t bot-hr-manager .

# 运行容器
docker run -d \
  --name bot-hr-manager \
  -p 8080:8080 \
  -v ~/.openclaw:/root/.openclaw \
  bot-hr-manager
```

---

### 方式 3: Docker Compose

#### docker-compose.yml

```yaml
version: '3.8'

services:
  bot-hr-manager:
    build: .
    ports:
      - "8080:8080"
    volumes:
      - ~/.openclaw:/root/.openclaw
    environment:
      - NODE_ENV=production
      - PORT=8080
    restart: unless-stopped
```

#### 启动

```bash
docker-compose up -d
```

---

## 生产环境配置

### 环境变量

```bash
# .env
NODE_ENV=production
PORT=8080
BOT_HR_CONFIG=/root/.openclaw/bot-hr-config.yaml
```

### PM2 部署（推荐）

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start dashboard/server.js --name bot-hr-manager

# 设置开机自启
pm2 startup
pm2 save

# 监控
pm2 monit
```

### Nginx 反向代理

```nginx
server {
    listen 80;
    server_name bot-hr.example.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 监控和日志

### 日志

日志文件位置：
```
~/.openclaw/logs/bot-hr-manager/
├── access.log
├── error.log
└── combined.log
```

### 监控

使用 PM2 监控：
```bash
pm2 monit
```

查看日志：
```bash
pm2 logs bot-hr-manager
```

---

## 备份和恢复

### 数据备份

```bash
# 备份数据库
cp -r ~/.openclaw/data/bot-hr ~/backup/bot-hr-$(date +%Y%m%d)

# 定期备份
crontab -e
0 2 * * * cp -r ~/.openclaw/data/bot-hr ~/backup/bot-hr-$(date +\%Y\%m\%d)
```

### 数据恢复

```bash
# 恢复数据库
cp -r ~/backup/bot-hr-20260313/* ~/.openclaw/data/bot-hr/
```

---

## 故障排查

### 常见问题

#### 1. 端口被占用
```bash
# 查找占用端口的进程
lsof -i :8080

# 杀死进程
kill -9 <PID>
```

#### 2. 数据库锁定
```bash
# 删除锁文件
rm ~/.openclaw/data/bot-hr/*.db-lock
```

#### 3. 权限问题
```bash
# 修改权限
chmod 755 ~/.openclaw/data/bot-hr
```

---

## 更新和升级

### 更新步骤

```bash
# 1. 备份数据
cp -r ~/.openclaw/data/bot-hr ~/backup/bot-hr-pre-update

# 2. 拉取最新代码
git pull origin main

# 3. 安装依赖
npm install --production

# 4. 重启服务
pm2 restart bot-hr-manager
```

---

## 安全建议

1. **定期更新**
   - 及时更新依赖包
   - 关注安全公告

2. **限制访问**
   - 使用防火墙
   - 配置 Nginx 访问控制

3. **日志审计**
   - 定期检查访问日志
   - 监控异常行为

4. **备份策略**
   - 定期备份数据
   - 测试恢复流程
