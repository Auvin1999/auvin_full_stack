#!/bin/bash

# 若依微服务项目 - 一键启动脚本
# 用于快速启动所有后端服务和前端

# 解析命令行参数
FRONTEND_VERSION="vue2"  # 默认使用 Vue2

while [[ $# -gt 0 ]]; do
    case $1 in
        --vue2)
            FRONTEND_VERSION="vue2"
            shift
            ;;
        --vue3)
            FRONTEND_VERSION="vue3"
            shift
            ;;
        *)
            echo "未知参数: $1"
            echo "用法: $0 [--vue2|--vue3]"
            echo "  --vue2  启动 Vue2 版本前端 (默认)"
            echo "  --vue3  启动 Vue3 版本前端"
            exit 1
            ;;
    esac
done

echo "将启动 ${FRONTEND_VERSION} 版本前端"

# 设置项目根目录
PROJECT_DIR="/Users/cheang/Downloads/auvin/work/maintain/admin/auvin_learn_full_stack"
cd "$PROJECT_DIR" || exit 1

# 设置 Java Home (根据你的环境修改)
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@17/17.0.15/libexec/openjdk.jdk/Contents/Home

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查服务是否运行
check_service() {
    local port=$1
    local name=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warn "$name 正在运行 (端口 $port)"
        return 0
    else
        return 1
    fi
}

# 等待服务启动
wait_for_service() {
    local port=$1
    local name=$2
    local max_wait=60
    local count=0

    log_info "等待 $name 启动..."
    while [ $count -lt $max_wait ]; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            log_info "$name 启动成功！"
            return 0
        fi
        sleep 2
        count=$((count + 2))
        echo -n "."
    done
    echo ""
    log_error "$name 启动超时！"
    return 1
}

# 启动函数
start_backend_service() {
    local service_name=$1
    local service_dir=$2
    local port=$3

    if check_service $port "$service_name"; then
        log_warn "$service_name 已在运行，跳过启动"
        return 0
    fi

    log_info "正在启动 $service_name..."
    cd "$PROJECT_DIR/$service_dir" || exit 1

    # 使用 nohup 后台启动
    nohup mvn spring-boot:run > "$PROJECT_DIR/logs/$service_name.log" 2>&1 &
    local pid=$!
    echo $pid > "$PROJECT_DIR/logs/$service_name.pid"

    # 等待服务启动
    wait_for_service $port "$service_name"
}

# 创建日志目录
mkdir -p "$PROJECT_DIR/logs"

# ==================== 检查必要服务 ====================
log_info "=== 检查必要服务 ==="

# 检查并启动 Nacos
if ! check_service 8848 "Nacos"; then
    log_warn "Nacos 未启动，正在启动..."
    export JAVA_HOME=/opt/homebrew/Cellar/openjdk@17/17.0.15/libexec/openjdk.jdk/Contents/Home
    cd /Users/cheang/nacos/bin && ./startup.sh -m standalone
    cd "$PROJECT_DIR"

    # 等待 Nacos 启动
    if ! wait_for_service 8848 "Nacos"; then
        log_error "Nacos 启动失败！"
        exit 1
    fi
    log_info "Nacos 启动成功！"
fi

# 检查 MySQL
if ! pgrep -x "mysqld" > /dev/null; then
    log_warn "MySQL 未运行，尝试启动..."
    brew services start mysql 2>/dev/null || sudo systemctl start mysql 2>/dev/null
    sleep 3
fi

# 检查 Redis
if ! pgrep -x "redis-server" > /dev/null; then
    log_warn "Redis 未运行，尝试启动..."
    brew services start redis 2>/dev/null || redis-server --daemonize yes 2>/dev/null
    sleep 2
fi

# ==================== 启动后端服务 ====================
log_info "=== 启动后端服务 ==="

# 启动顺序很重要！
start_backend_service "Gateway" "ruoyi-gateway" 8080
start_backend_service "Auth" "ruoyi-auth" 9200
start_backend_service "System" "ruoyi-modules/ruoyi-system" 9201
start_backend_service "Gen" "ruoyi-modules/ruoyi-gen" 9202
start_backend_service "Job" "ruoyi-modules/ruoyi-job" 9203
start_backend_service "File" "ruoyi-modules/ruoyi-file" 9300

# ==================== 启动前端 ====================
log_info "=== 启动前端 ==="

# 设置前端目录
FRONTEND_DIR=""
FRONTEND_LOG="frontend.log"
FRONTEND_PID="frontend.pid"

if [[ "$FRONTEND_VERSION" == "vue2" ]]; then
    FRONTEND_DIR="ruoyi-ui-vue2"
    log_info "启动 Vue2 版本前端..."
elif [[ "$FRONTEND_VERSION" == "vue3" ]]; then
    FRONTEND_DIR="ruoyi-ui-vue3"
    FRONTEND_LOG="frontend-vue3.log"
    FRONTEND_PID="frontend-vue3.pid"
    log_info "启动 Vue3 版本前端..."
fi

if check_service 1024 "前端"; then
    log_warn "前端已在运行，跳过启动"
else
    log_info "正在启动前端..."
    cd "$PROJECT_DIR/$FRONTEND_DIR" || exit 1

    # 检查 node_modules
    if [ ! -d "node_modules" ]; then
        log_info "首次启动，安装依赖..."
        npm install --registry=https://registry.npmmirror.com
    fi

    # 启动前端
    nohup npm run dev > "$PROJECT_DIR/logs/$FRONTEND_LOG" 2>&1 &
    echo $! > "$PROJECT_DIR/logs/$FRONTEND_PID"

    wait_for_service 1024 "前端"
fi

# ==================== 启动完成 ====================
echo ""
log_info "=== 所有服务启动完成 ==="
echo ""
echo "============================================"
echo "  服务访问地址"
echo "============================================"
echo "  前端地址:    http://localhost:1024 (${FRONTEND_VERSION}版本)"
echo "  Nacos:       http://localhost:8848/nacos (nacos/nacos)"
echo "  Gateway:     http://localhost:8080"
echo "  Auth:        http://localhost:9200"
echo "  System:      http://localhost:9201"
echo "  Gen:         http://localhost:9202"
echo "  Job:         http://localhost:9203"
echo "  File:        http://localhost:9300"
echo "============================================"
echo ""
echo "默认账号: admin / admin123"
echo ""
echo "查看日志:"
echo "  后端: tail -f logs/*.log"
echo "  前端: tail -f logs/frontend.log"
echo ""
echo "停止服务:"
echo "  ./stop-all.sh"
echo "============================================"
