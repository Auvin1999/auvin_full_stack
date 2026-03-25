# 若依微服务全栈项目文档

欢迎！这里是若依微服务版 (RuoYi-Cloud) 完整开发文档。

## 📚 文档导航

### 快速开始
- [项目总览](#项目总览)
- [环境要求](#环境要求)
- [快速启动](#快速启动)
- [项目结构](#项目结构)

### 开发指南
| 文档 | 说明 |
|------|------|
| [后端开发指南](./backend-guide.md) | 🚀 Spring Boot 4.x 微服务架构 |
| [Vue2 前端指南](./vue2-frontend-guide.md) | 🎨 Vue2 + Element UI 前端开发 |
| [Vue3 前端指南](./vue3-frontend-guide.md) | 🎨 Vue3 + Element Plus 前端开发 |
| [代码生成器指南](./code-generator-guide.md) | 🛠️ 代码生成工具使用说明 |
| [部署运维指南](./deployment-guide.md) | 🌐 生产环境部署指南 |
| [常见问题解答](./faq.md) | ❓ 常见问题与解决方案 |
| [开发技能速查](./development-skills.md) | 💡 常用代码和技巧 |

---

## 项目总览

### 技术架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        前端层                                    │
├─────────────────────────────────────────────────────────────────┤
│  Vue2/3 + Element UI/Plus  │  Vue Router  │  Vuex/Pinia  │ Axios │
│                    HTTP API 调用 ↓                            │
├─────────────────────────────────────────────────────────────────┤
│                        网关层 (Gateway)                         │
├─────────────────────────────────────────────────────────────────┤
│  认证中心 (Auth)  │  系统模块 (System)  │  代码生成 (Gen)  │      │
│  定时任务 (Job)   │  文件服务 (File)    │  API模块 (Api)  │      │
│                          ↓ 微服务调用                           │
├─────────────────────────────────────────────────────────────────┤
│                        基础服务层                               │
├─────────────────────────────────────────────────────────────────┤
│     Nacos 3.x (注册中心/配置中心)  │  MySQL 5.7+  │  Redis 3.0+   │
└─────────────────────────────────────────────────────────────────┘
```

### 核心特性
- 🎯 **微服务架构**: Spring Boot 4.x + Spring Cloud 2025.1.0 + Spring Cloud Alibaba 2025.1.0.0
- 📦 **前后端分离**: Vue2/3 + Spring Boot，独立部署
- 🔐 **统一认证**: 基于 Spring Security + JWT 的认证授权
- 🛠️ **代码生成**: 内置代码生成器，支持 CRUD 快速开发
- 📊 **监控告警**: 集成 Sentinel + Actuator 服务监控
- 🚀 **容器化支持**: Docker + Docker Compose 一键部署

---

## 环境要求

| 软件 | 版本要求 | 说明 |
|------|----------|------|
| JDK | 17+ | **必须**，项目使用 Spring Boot 4.x |
| Maven | 3.3+ | 构建工具 |
| MySQL | 5.7+ 或 8.0+ | 数据库 |
| Redis | 3.0+ | 缓存服务 |
| Nacos | 3.x | 注册中心和配置中心（必须） |
| Node.js | 14-16 | 前端开发 |

### 环境配置
1. **Java 环境**
```bash
# 设置 JAVA_HOME
export JAVA_HOME=/path/to/jdk-17
export PATH=$JAVA_HOME/bin:$PATH
```

2. **Maven 配置**
```xml
<!-- settings.xml 配置镜像 -->
<mirrors>
    <mirror>
        <id>aliyun</id>
        <mirrorOf>central</mirrorOf>
        <url>https://maven.aliyun.com/repository/central</url>
    </mirror>
</mirrors>
```

3. **Node.js 配置**
```bash
# 使用淘宝镜像加速
npm config set registry https://registry.npmmirror.com
```

---

## 快速启动

### 1. 一键启动（推荐）

```bash
# 克隆项目
git clone <repository-url>
cd ruoyi-cloud

# 执行启动脚本
./start-all.sh
```

启动成功后：
- **前端地址**: http://localhost:1024 (默认Vue2版本)
- **Nacos管理**: http://localhost:8848/nacos (nacos/nacos)
- **Gateway**: http://localhost:8080
- **默认账号**: admin / admin123

### 2. 手动启动

#### 启动 Nacos（必须先启动）
```bash
cd /path/to/nacos/bin
./startup.sh -m standalone
# Windows: startup.cmd -m standalone
```

#### 启动后端服务
```bash
# 启动顺序很重要！
cd ruoyi-gateway && mvn spring-boot:run
cd ruoyi-auth && mvn spring-boot:run
cd ruoyi-modules/ruoyi-system && mvn spring-boot:run
cd ruoyi-modules/ruoyi-gen && mvn spring-boot:run
# 其他模块...
```

#### 启动前端
```bash
# Vue2 版本（默认）
cd ruoyi-ui-vue2
npm install
npm run dev

# Vue3 版本
cd ruoyi-ui-vue3
npm install
npm run dev
```

---

## 项目结构

```
ruoyi-cloud/
├── ruoyi-ui-vue2/           # Vue2 前端项目（默认启动）
├── ruoyi-ui-vue3/           # Vue3 前端项目
├── ruoyi-gateway/           # 网关模块 [端口: 8080]
├── ruoyi-auth/              # 认证中心 [端口: 9200]
├── ruoyi-api/               # 接口模块
│   └── ruoyi-api-system/    # 系统接口
├── ruoyi-common/            # 通用模块
│   ├── ruoyi-common-core/   # 核心工具类
│   ├── ruoyi-common-datascope/ # 数据权限
│   ├── ruoyi-common-datasource/ # 数据源
│   ├── ruoyi-common-log/    # 日志处理
│   ├── ruoyi-common-redis/  # Redis 缓存
│   ├── ruoyi-common-seata/  # 分布式事务
│   ├── ruoyi-common-security/ # 安全框架
│   ├── ruoyi-common-sensitive/ # 敏感信息
│   └── ruoyi-common-swagger/ # API文档
├── ruoyi-modules/           # 业务模块
│   ├── ruoyi-system/        # 系统管理 [端口: 9201]
│   ├── ruoyi-gen/           # 代码生成 [端口: 9202]
│   ├── ruoyi-job/           # 定时任务 [端口: 9203]
│   └── ruoyi-file/          # 文件服务 [端口: 9300]
├── ruoyi-visual/            # 图形化管理
│   └── ruoyi-visual-monitor/ # 监控中心 [端口: 9100]
├── sql/                     # 数据库脚本
└── docker/                  # Docker 部署文件
```

---

## 开发流程

### 新增功能开发

```
1. 数据库设计
   ↓ 创建表、字段设计

2. 代码生成（推荐）
   访问 http://localhost:1024/tool/gen
   配置表信息 → 生成代码 → 下载解压

3. 后端验证
   重启对应服务模块

4. 前端开发
   修改/创建页面组件 → 配置路由

5. 联调测试
   完整功能测试
```

### 分支管理

- `master` - 主分支，生产环境
- `develop` - 开发分支，合并功能
- `feature/*` - 功能分支
- `hotfix/*` - 紧急修复分支

---

## 常见问题

### 服务启动问题

**问题**: 端口冲突
```bash
# 解决方案1: 修改端口
# 编辑对应服务的 bootstrap.yml
server:
  port: 9201

# 解决方案2: 查看占用端口
lsof -i :8080
```

**问题**: Nacos 连接失败
```bash
# 错误: java.net.ConnectException: Connection refused
# 解决: 确保先启动 Nacos
cd /path/to/nacos/bin && ./startup.sh -m standalone
```

**问题**: MySQL 连接失败
```bash
# 解决: 确保 MySQL 启动并创建数据库
mysql -u root -p
CREATE DATABASE `ry-cloud` DEFAULT CHARACTER SET utf8mb4;
```

### 前端问题

**问题**: npm install 失败
```bash
# 清除缓存重试
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**问题**: API 调用失败
```bash
# 检查代理配置
# ruoyi-ui-vue2/vue.config.js
devServer: {
  proxy: {
    '/dev-api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      pathRewrite: { '^/dev-api': '' }
    }
  }
}
```

### 网关路由问题

**问题**: 404 Not Found
```bash
# 检查路由配置
curl http://localhost:8080/actuator/gateway/routes

# 查看网关日志
tail -f logs/Gateway.log
```

---

## 工具使用

### 1. 代码生成器

访问 http://localhost:1024/tool/gen

1. **导入表**: 从数据库选择要生成的表
2. **配置信息**: 设置包名、模块名等
3. **生成代码**: 点击生成并下载压缩包
4. **部署使用**: 解压到对应模块，重启服务

### 2. API 文档

访问各服务的 Swagger 文档：
- Gateway: http://localhost:8080/swagger-ui.html
- Auth: http://localhost:9200/swagger-ui.html
- System: http://localhost:9201/swagger-ui.html

### 3. 监控中心

访问 http://localhost:9100 查看服务状态、日志等监控信息。

---

## 部署指南

详见 [部署运维指南](./deployment-guide.md)

### Docker 快速部署

```bash
# 启动所有服务
cd docker
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

---

## 贡献指南

### 开发规范

1. **代码风格**
   - Java: 遵循阿里巴巴 Java 开发手册
   - Vue: 遵循 Vue 风格指南，使用 ESLint + Prettier
   - Git: 使用 commitizen 规范提交信息

2. **分支策略**
   - `master` - 生产环境，只发布稳定版本
   - `develop` - 开发集成分支
   - `feature/*` - 新功能开发

3. **Code Review**
   - 所有代码必须经过至少一人 Review
   - 使用 GitHub Pull Request 进行代码审查

### 提交规范

```bash
# 提交格式
<type>(<scope>): <description>

# 示例
feat(api): add user query API
fix(auth): resolve login timeout issue
docs(readme): update deployment guide
```

---

## 相关链接

- [若依官网](http://ruoyi.vip)
- [若依文档](http://doc.ruoyi.vip)
- [Spring Boot 官方文档](https://spring.io/projects/spring-boot)
- [Vue 官方文档](https://vuejs.org/)
- [Nacos 官方文档](https://nacos.io/zh-cn/)

---

## 更新日志

| 日期 | 内容 |
|------|------|
| 2026-03-23 | 更新为微服务架构文档 |
| 2024-03-13 | 初始化文档中心 |

---

**祝你开发愉快！如有问题请查阅文档或提交 Issue 🚀**