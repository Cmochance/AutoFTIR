# Legacy 链路说明

本仓库保留了一套历史链路，便于回溯与对照：

- `api/`：旧版统一 API（与当前 `backend/` 主线并存）
- `frontend/streamlit_app.py` 及相关组件：旧版 Streamlit 前端
- `docker-compose.https.yml`：legacy HTTPS 代理实验入口

## 当前状态

1. legacy 代码保留但不作为默认开发入口。
2. 默认主线为：`backend/` + `frontend/src`（React）。
3. README、默认 `docker-compose.yml`、验收流程均已切到主线。

## 如需运行 legacy（仅用于回溯）

```bash
docker compose -f docker-compose.https.yml up --build
```

注意：
- legacy 依赖与主线不同，不保证与主线行为一致。
- legacy 不作为本轮功能修复和稳定性验收标准。

## 风险与限制

- 双链路并存会增加维护成本与认知负担。
- 对外发布时应只暴露主线入口，避免契约混淆。
