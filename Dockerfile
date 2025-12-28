# ============================================
# AutoFTIR - Multi-stage Dockerfile
# 前端 (Streamlit) + 后端 (FastAPI) 统一镜像
# ============================================

FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖（matplotlib 需要）
RUN apt-get update && apt-get install -y --no-install-recommends \
    libfreetype6-dev \
    libpng-dev \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件并安装
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制项目文件
COPY . .

# 暴露端口
EXPOSE 8000 8501

# 默认启动命令（会被 docker-compose 覆盖）
CMD ["python", "-m", "streamlit", "run", "app.py", "--server.address=0.0.0.0"]
