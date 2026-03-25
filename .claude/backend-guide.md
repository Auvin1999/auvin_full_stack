# 后端项目运行与部署指南

## 项目概述

这是一个基于 Spring Boot + MyBatis 的若依(RuoYi)后端项目，采用模块化架构设计。

### 模块结构

```
ruoyi-parent
├── ruoyi-admin      # 主应用模块（启动入口）
├── ruoyi-framework  # 框架核心（安全、配置、拦截器）
├── ruoyi-system     # 系统模块（用户、角色、菜单等）
├── ruoyi-common     # 通用工具（注解、常量、工具类）
├── ruoyi-generator  # 代码生成器
└── ruoyi-quartz     # 定时任务
```

## 环境要求

| 组件 | 版本要求 | 说明 |
|------|----------|------|
| JDK | 1.8+ | Java开发环境 |
| Maven | 3.3+ | 项目构建工具 |
| MySQL | 5.7+ 或 8.0+ | 数据库 |
| Redis | 3.0+ | 缓存服务（必须） |

## 本地开发环境搭建

### 1. 安装 JDK

```bash
# 检查 Java 版本
java -version

# 如果未安装，下载 JDK 8:
# Windows: https://www.oracle.com/java/technologies/javase/javase8-archive-downloads.html
# 配置 JAVA_HOME 环境变量
```

### 2. 安装 Maven

```bash
# 检查 Maven 版本
mvn -version

# 如果未安装:
# 下载: https://maven.apache.org/download.cgi
# 配置 settings.xml (建议使用阿里云镜像)
```

**Maven 阿里云镜像配置 (`settings.xml`)**:

```xml
<mirrors>
  <mirror>
    <id>aliyun</id>
    <mirrorOf>central</mirrorOf>
    <name>Aliyun Maven</name>
    <url>https://maven.aliyun.com/repository/public</url>
  </mirror>
</mirrors>
```

### 3. 安装 MySQL

```bash
# Windows: 下载 MySQL Installer
# Linux: sudo apt install mysql-server

# 创建数据库
CREATE DATABASE `ry-vue` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

# 导入 SQL 脚本
mysql -u root -p ry-vue < sql/ry_2021xxxx.sql
mysql -u root -p ry-vue < sql/quartz.sql
```

### 4. 安装 Redis

#### Windows:
```bash
# 下载 Redis for Windows
# https://github.com/microsoftarchive/redis/releases
# 解压后运行 redis-server.exe
```

#### Linux:
```bash
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis

# 测试连接
redis-cli ping
# 返回 PONG 表示成功
```

#### 使用 Docker (推荐):
```bash
docker run -d -p 6379:6379 --name redis redis:latest
```

### 5. 配置项目

#### 数据库配置

编辑 `ruoyi-admin/src/main/resources/application-druid.yml`:

```yaml
spring:
  datasource:
    type: com.alibaba.druid.pool.DruidDataSource
    driverClassName: com.mysql.cj.jdbc.Driver
    druid:
      master:
        url: jdbc:mysql://localhost:3306/ry-vue?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=true&serverTimezone=GMT%2B8
        username: root
        password: 你的密码
```

#### Redis 配置

编辑 `ruoyi-admin/src/main/resources/application.yml`:

```yaml
spring:
  redis:
    host: localhost
    port: 6379
    database: 0
    password:      # 如果有密码则填写
    timeout: 10s
```

## 运行项目

### 方式一：IDEA 运行（推荐开发使用）

1. 用 IntelliJ IDEA 打开项目
2. 等待 Maven 依赖下载完成
3. 找到 `RuoYiApplication.java` 文件
4. 右键 → Run 'RuoYiApplication'

**启动类位置**: `ruoyi-admin/src/main/java/com/ruoyi/RuoYiApplication.java`

启动成功后，控制台会显示:
```
  ____   ___    _____   _    _    ____
 |  _ \ / _ \  |_   _| | |  | |  |___ \
 | |_) | | | |   | |   | |__| |    __) |
 |  _ <| | | |   | |   |  __  |   |__ <
 | |_) | |_| |  _| |_  | |  | |  ___) |
 |____/ \___/  |_____| |_|  |_| |____/
:: RuoYi Boot ::  (v3.8.8)

... 省略日志 ...

Started RuoYiApplication in xx.xxx seconds
```

访问地址: http://localhost:8080

### 方式二：命令行运行

```bash
# 进入项目根目录
cd d:/auvin/work/maintain/admin/auvin_learn_full_stack

# 编译项目
mvn clean compile

# 运行主模块
cd ruoyi-admin
mvn spring-boot:run
```

### 方式三：打包后运行

```bash
# 编译打包
mvn clean package -DskipTests

# 运行 JAR
java -jar ruoyi-admin/target/ruoyi-admin.jar

# 指定配置文件运行
java -jar ruoyi-admin/target/ruoyi-admin.jar --spring.config.name=application
```

## 项目打包

### 开发环境打包

```bash
# 不跳过测试（完整流程）
mvn clean package

# 跳过测试（快速打包）
mvn clean package -DskipTests
```

打包后的文件位于各模块的 `target/` 目录下：
- `ruoyi-admin/target/ruoyi-admin.jar` - 主应用 JAR
- `ruoyi-system/target/ruoyi-system.jar` - 系统模块 JAR
- 其他模块...

### 生产环境打包

```bash
# 清理并打包
mvn clean package -DskipTests -Pprod

# 生成的文件
ruoyi-admin/target/ruoyi-admin.jar  # 可执行的 JAR 包
```

**注意**: 生成的 JAR 包已经包含了所有依赖，可以直接运行。

## 常见问题排查

### 1. 端口冲突

**错误**: `Web server failed to start. Port 8080 was already in use.`

**解决方案**:
```yaml
# 修改 application.yml 中的端口
server:
  port: 8081  # 改为其他端口
```

### 2. 数据库连接失败

**错误**: `Could not get JDBC Connection`

**检查项**:
1. MySQL 服务是否启动
2. 用户名密码是否正确
3. 数据库是否已创建
4. 防火墙是否放行 3306 端口

### 3. Redis 连接失败

**错误**: `Unable to connect to Redis`

**解决方案**:
```bash
# 检查 Redis 是否运行
redis-cli ping

# 启动 Redis
# Windows: 运行 redis-server.exe
# Linux: sudo systemctl start redis
```

### 4. Maven 依赖下载失败

**解决方案**:
```bash
# 清理本地仓库
rm -rf ~/.m2/repository/*

# 重新下载
mvn clean install -U

# 或使用阿里云镜像（见上方配置）
```

## 开发调试

### 热部署配置

1. 添加依赖（已配置）:
```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-devtools</artifactId>
</dependency>
```

2. IDEA 设置:
   - `File → Settings → Build, Execution, Deployment → Compiler`
   - 勾选 `Build project automatically`
   - 按 `Ctrl+Alt+Shift+/` → Registry → 勾选 `compiler.automake.allow.when.app.running`

### 日志配置

日志级别配置在 `application.yml`:

```yaml
logging:
  level:
    com.ruoyi: debug      # 项目日志级别
    org.springframework: warn
```

### 接口测试

项目集成 Swagger，启动后访问:
- Swagger UI: http://localhost:8080/swagger-ui.html
- API 文档: http://localhost:8080/doc.html

## API 测试工具推荐

1. **Swagger** - 项目已集成
2. **Postman** - 功能强大的 API 测试工具
3. **Apifox** - 国产 API 管理工具
4. **curl** - 命令行工具

**curl 示例**:
```bash
# 登录
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 数据库维护

### 备份数据库

```bash
# 备份
mysqldump -u root -p ry-vue > backup_$(date +%Y%m%d).sql

# 恢复
mysql -u root -p ry-vue < backup_20240101.sql
```

### 常用 SQL

```sql
-- 查看所有用户
SELECT * FROM sys_user;

-- 重置管理员密码
UPDATE sys_user SET password='$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE/sW7Ha80jAi2' WHERE user_name='admin';

-- 清空操作日志
DELETE FROM sys_oper_log WHERE create_time < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

## 性能优化建议

1. **JVM 参数优化**:
```bash
java -Xms512m -Xmx1024m -XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=512m -jar ruoyi-admin.jar
```

2. **数据库优化**:
   - 添加适当索引
   - 定期清理日志表
   - 优化慢查询

3. **Redis 缓存**:
   - 合理设置缓存过期时间
   - 使用 Redis 连接池

## 生产环境部署

详见 [deployment-guide.md](./deployment-guide.md)
