# 🚀 AutoFTIR 部署指南

## 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 服务器开放端口: 9080 (HTTP), 9443 (HTTPS, 可选)

## 快速部署

### 1. 克隆代码到服务器

```bash
git clone https://github.com/alysechencn-oss/AutoFTIR.git
cd AutoFTIR
```

### 2. 配置环境变量

```bash
cp .env.example .env
nano .env  # 编辑填写 AI_API_KEY 和 AI_BASE_URL
```

### 3. 启动服务

```bash
docker-compose up -d
```

### 4. 验证

- 前端: `http://服务器IP:9080`
- 后端: `http://服务器IP:9080/api/health`

## 常用命令

| 操作 | 命令 |
|------|------|
| 启动 | `docker-compose up -d` |
| 停止 | `docker-compose down` |
| 重建 | `docker-compose up -d --build` |
| 日志 | `docker-compose logs -f` |
| 重启 | `docker-compose restart` |

## 代码热更新

修改以下文件后执行 `docker-compose restart` 即可生效（无需重建镜像）：

- `app.py` (前端)
- `backend/` (后端)
- `modules/` (公共模块)

## HTTPS 配置

1. 获取 SSL 证书（推荐 Let's Encrypt）
2. 放置到 `nginx/ssl/` 目录
3. 取消 `docker-compose.yml` 中 443 端口注释
4. 取消 `nginx/default.conf` 中 HTTPS 配置注释
5. 重启: `docker-compose restart nginx`
