# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是若依微服务版本 (RuoYi-Cloud v3.6.7)，基于 Spring Boot 4.x + Spring Cloud & Alibaba 的前后端分离分布式微服务架构。

**技术栈：**
- 后端：Spring Boot 4.0.3, Spring Cloud 2025.1.0, Spring Cloud Alibaba 2025.1.0.0
- 前端：Vue 2.6.12 + Element UI 2.15.14
- 注册中心/配置中心：Nacos 3.x
- 数据库：MySQL 5.7/8.0+
- 缓存：Redis 3.0+
- Java 版本：JDK 17+

## 模块架构

```
ruoyi-cloud/
├── ruoyi-ui/              # 前端 Vue2 [端口: 80]
├── ruoyi-gateway/         # 网关模块 [端口: 8080]
├── ruoyi-auth/            # 认证中心 [端口: 9200]
├── ruoyi-api/             # 接口模块
│   └── ruoyi-api-system/  # 系统接口
├── ruoyi-common/          # 通用模块
│   ├── ruoyi-common-core/
│   ├── ruoyi-common-datascope/
│   ├── ruoyi-common-datasource/
│   ├── ruoyi-common-log/
│   ├── ruoyi-common-redis/
│   ├── ruoyi-common-seata/
│   ├── ruoyi-common-security/
│   ├── ruoyi-common-sensitive/
│   └── ruoyi-common-swagger/
├── ruoyi-modules/         # 业务模块
│   ├── ruoyi-system/      # 系统模块 [端口: 9201]
│   ├── ruoyi-gen/         # 代码生成 [端口: 9202]
│   ├── ruoyi-job/         # 定时任务 [端口: 9203]
│   └── ruoyi-file/        # 文件服务 [端口: 9300]
├── ruoyi-visual/          # 图形化管理
│   └── ruoyi-visual-monitor/  # 监控中心 [端口: 9100]
├── sql/                   # 数据库脚本
└── pom.xml               # Maven 父配置
```

## 环境要求

| 软件 | 版本要求 | 说明 |
|------|----------|------|
| JDK | 17+ | 必须，项目使用 Spring Boot 4.x |
| Maven | 3.3+ | 构建工具 |
| MySQL | 5.7+ 或 8.0+ | 数据库 |
| Redis | 3.0+ | 缓存服务 |
| Nacos | 3.x | 注册中心和配置中心（必须） |
| Node.js | 14-16 | 前端构建 |

## 常用命令

### 后端编译打包

```bash
# 编译整个项目（跳过测试）
mvn clean package -DskipTests

# 编译单个模块
cd ruoyi-gateway
mvn clean package -DskipTests

# 查看依赖树
mvn dependency:tree
```

### 启动后端服务（开发环境）

**启动顺序很重要：**

1. **启动 Nacos**（必须先启动）
   ```bash
   # 单机模式启动
   cd /path/to/nacos/bin
   ./startup.sh -m standalone
   # Windows: startup.cmd -m standalone
   # 访问: http://localhost:8848/nacos (nacos/nacos)
   ```

2. **启动 Gateway** (网关)
   ```bash
   cd ruoyi-gateway
   mvn spring-boot:run
   ```

3. **启动 Auth** (认证中心)
   ```bash
   cd ruoyi-auth
   mvn spring-boot:run
   ```

4. **启动 System** (系统模块)
   ```bash
   cd ruoyi-modules/ruoyi-system
   mvn spring-boot:run
   ```

5. **启动其他业务模块**（可选）
   ```bash
   # 代码生成
   cd ruoyi-modules/ruoyi-gen && mvn spring-boot:run

   # 定时任务
   cd ruoyi-modules/ruoyi-job && mvn spring-boot:run

   # 文件服务
   cd ruoyi-modules/ruoyi-file && mvn spring-boot:run
   ```

### 前端开发

```bash
cd ruoyi-ui

# 安装依赖
npm install
# 或使用淘宝镜像
npm install --registry=https://registry.npmmirror.com

# 开发环境启动
npm run dev
# 访问: http://localhost:80

# 生产环境构建
npm run build:prod

# 预发布构建
npm run build:stage
```

### 数据库初始化

```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE `ry-cloud` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

# 导入 SQL
mysql -u root -p ry-cloud < sql/ry_20250523.sql
mysql -u root -p ry-cloud < sql/ry_config_20260311.sql
```

### Docker 部署（生产环境）

```bash
cd docker

# 启动所有服务（包括 Nacos、MySQL、Redis、Nginx 等）
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 配置说明

### Nacos 配置

微服务使用 Nacos 作为注册中心和配置中心，必须先启动 Nacos。

**在 Nacos 中导入配置：**
1. 访问 http://localhost:8848/nacos
2. 登录（默认: nacos/nacos）
3. 进入「配置管理」→「配置列表」
4. 导入 `sql/ry_config_20260311.sql` 中的配置

**配置命名规范：**
- 应用配置: `{服务名}-{环境}.yml` (如: `ruoyi-gateway-dev.yml`)
- 通用配置: `application-{环境}.yml` (如: `application-dev.yml`)

### 服务端口

| 服务 | 端口 | 说明 |
|------|------|------|
| ruoyi-ui | 80 | 前端 |
| ruoyi-gateway | 8080 | 网关 |
| ruoyi-auth | 9200 | 认证中心 |
| ruoyi-system | 9201 | 系统模块 |
| ruoyi-gen | 9202 | 代码生成 |
| ruoyi-job | 9203 | 定时任务 |
| ruoyi-file | 9300 | 文件服务 |
| ruoyi-monitor | 9100 | 监控中心 |

### 默认账号

- 管理员: `admin / admin123`

## 代码生成器

访问 http://localhost:8080/tool/gen (需要先启动 ruoyi-gen 模块)

1. 在数据库中创建业务表
2. 在代码生成页面导入表
3. 配置生成信息
4. 生成代码并解压到项目
5. 重启对应的服务模块

## 开发调试

### 热部署

后端使用 Spring Boot Devtools 实现热部署：
- IDEA: 修改代码后按 `Ctrl+F9` 重新编译
- 前端: Vue CLI 自动热重载

### 日志查看

- 后端日志: 控制台输出或 `{服务}/logs/`
- 前端日志: 浏览器开发者工具 Console

### API 文档

启动后访问 Swagger 文档：
- Gateway: http://localhost:8080/swagger-ui.html
- 各服务也有独立的 Swagger 文档

## 常见问题

**JDK 版本不兼容：**
```
问题: 项目需要 JDK 17+
解决: 安装 JDK 17 并设置 JAVA_HOME
```

**Nacos 连接失败：**
```
问题: java.net.ConnectException: Connection refused
解决: 确保先启动 Nacos (./startup.sh -m standalone)
```

**端口冲突：**
```
问题: Web server failed to start. Port 8080 was already in use
解决: 修改对应服务的 bootstrap.yml 中的 server.port
```

**前端 API 调用失败：**
```
问题: Network Error / CORS
解决: 检查 ruoyi-ui/vue.config.js 中的 proxy 配置
```

## Maven 多模块管理

```bash
# 查看模块依赖关系
mvn dependency:tree

# 只构建特定模块
mvn clean package -pl ruoyi-gateway -am

# 跳过测试打包
mvn clean package -DskipTests

# 安装到本地仓库
mvn clean install -DskipTests
```
