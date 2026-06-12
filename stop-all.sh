#!/bin/bash

# 若依微服务项目 - 一键停止脚本
# 用于停止所有后端服务和前端

# 设置项目根目录
PROJECT_DIR="/Users/cheang/Downloads/auvin/work/maintain/admin/dst-maintain-meta/auvin_learn_full_stack"
cd "$PROJECT_DIR" || exit 1

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

# 根据 PID 文件停止进程
stop_service_by_pid() {
    local pid_file=$1
    local service_name=$2

    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            log_info "正在停止 $service_name (PID: $pid)..."
            kill $pid
            # 等待进程结束
            local count=0
            while ps -p $pid > /dev/null 2>&1 && [ $count -lt 10 ]; do
                sleep 1
                count=$((count + 1))
            done
            if ps -p $pid > /dev/null 2>&1; then
                log_warn "$service_name 未响应，强制终止..."
                kill -9 $pid
            fi
            log_info "$service_name 已停止"
        else
            log_warn "$service_name 进程不存在 (PID: $pid)"
        fi
        rm -f "$pid_file"
    else
        log_warn "$service_name PID 文件不存在"
    fi
}

# 根据端口停止进程
stop_service_by_port() {
    local port=$1
    local service_name=$2

    local pid=$(lsof -ti:$port)
    if [ -n "$pid" ]; then
        log_info "正在停止 $service_name (端口: $port, PID: $pid)..."
        kill $pid
        # 等待进程结束
        local count=0
        while lsof -ti:$port >/dev/null 2>&1 && [ $count -lt 10 ]; do
            sleep 1
            count=$((count + 1))
        done
        if lsof -ti:$port >/dev/null 2>&1; then
            log_warn "$service_name 未响应，强制终止..."
            kill -9 $(lsof -ti:$port)
        fi
        log_info "$service_name 已停止"
    else
        log_warn "$service_name 未在运行 (端口: $port)"
    fi
}

log_info "=== 停止所有服务 ==="

# 停止前端（Vue2 和 Vue3）
stop_service_by_pid "$PROJECT_DIR/logs/frontend.pid" "前端(Vue2)"
stop_service_by_pid "$PROJECT_DIR/logs/frontend-vue3.pid" "前端(Vue3)"
stop_service_by_port 1024 "前端"

# 停止后端服务（按端口停止）
stop_service_by_port 8080 "Gateway"
stop_service_by_port 9200 "Auth"
stop_service_by_port 9201 "System"
stop_service_by_port 9202 "Gen"
stop_service_by_port 9203 "Job"
stop_service_by_port 9300 "File"
stop_service_by_port 9100 "Monitor"

# 停止 Nacos
log_info "正在停止 Nacos..."
cd /Users/cheang/nacos/bin && ./shutdown.sh 2>/dev/null
cd "$PROJECT_DIR"

# 等待 Nacos 完全停止
local count=0
while lsof -ti:8848 >/dev/null 2>&1 && [ $count -lt 10 ]; do
    sleep 1
    count=$((count + 1))
done
if lsof -ti:8848 >/dev/null 2>&1; then
    log_warn "Nacos 未响应，强制终止..."
    kill -9 $(lsof -ti:8848) 2>/dev/null
fi
log_info "Nacos 已停止"

# 清理 PID 文件
rm -f "$PROJECT_DIR/logs"/*.pid

echo ""
log_info "=== 所有服务已停止 ==="
echo ""
echo "注意: MySQL、Redis 需要手动停止"
echo "  停止 MySQL: brew services stop mysql"
echo "  停止 Redis: brew services stop redis"
