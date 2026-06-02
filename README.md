# AutoFTIR

科研数据在线分析平台（当前主线：`Backend + React`）。

## 当前主线能力

- 数据文件上传（CSV/TXT/Excel）
- 后端自动处理与图表生成（`/api/analyze/process|render|full`）
- React 页面内查看图表与 AI 报告
- 图表导出（PNG / SVG / PDF）
- 匿名模式下历史记录与偏好设置本地持久化

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React + Vite + Tailwind + Zustand |
| 后端 | FastAPI + Pydantic + Matplotlib |
| AI | Gemini（可选，失败时降级） |
| 数据库 | Supabase（认证/历史接口保留，主线前端当前不依赖） |

## 项目结构（主线）

```text
AutoFTIR/
├── frontend/                   # React 前端
│   └── src/
│       ├── pages/
│       ├── stores/
│       └── services/
├── backend/                    # FastAPI 后端
│   ├── api/
│   ├── core/
│   └── modules/
├── docker-compose.yml          # 默认入口（Backend + React）
├── docker-compose.https.yml    # legacy 入口（保留，不默认）
└── LEGACY.md                   # legacy 链路说明
```

## 快速开始（默认主线）

### 1. 环境变量

```bash
cp backend/.env.example backend/.env
```

根据需要填写 `backend/.env` 中的 Supabase / Google AI 配置。

### 2. Docker 启动（推荐）

```bash
docker compose up --build
```

启动后访问：
- 前端: [http://localhost:3000](http://localhost:3000)
- 后端: [http://localhost:9000](http://localhost:9000)
- API 文档: [http://localhost:9000/docs](http://localhost:9000/docs)

### 3. 本地开发启动

```bash
# backend
cd backend
pip install -r requirements.txt
uvicorn backend.api.main:app --reload --port 9000

# frontend
cd frontend
npm install
npm run dev
```

## 关键 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| POST | `/api/analyze/process` | 数据处理 |
| POST | `/api/analyze/render` | 渲染图表并返回 base64 |
| POST | `/api/analyze/full` | 处理 + 渲染 + AI 分析（支持 AI 降级） |

## Legacy 说明

`/api`（根目录 legacy API）与 Streamlit 链路已停用为默认入口，但代码仍保留。

- legacy 说明文档：`LEGACY.md`
- legacy compose：`docker-compose.https.yml`

请勿将 legacy 入口用于当前主线开发与验收。

## License

MIT
