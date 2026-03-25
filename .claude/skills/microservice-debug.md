# 微服务调试指南

这个技能帮助你调试和解决若依微服务架构中的常见问题。

## 常见问题排查

### 1. 服务注册问题

**问题**: 服务无法注册到 Nacos

```bash
# 检查服务是否正确注册
curl http://localhost:8848/nacos/v1/ns/instance/list?serviceName=ruoyi-gateway

# 查看 Nacos 日志
tail -f /Users/cheang/nacos/logs/startup.log

# 检查服务配置
cat ruoyi-gateway/src/main/resources/bootstrap.yml
```

**解决方案**:
- 确保 Nacos 先启动（`./startup.sh -m standalone`）
- 检查 `bootstrap.yml` 中的 Nacos 配置
- 确认服务名（spring.application.name）正确

### 2. 网关路由问题

**问题**: Gateway 无法转发请求

```bash
# 检查 Gateway 路由配置
curl http://localhost:8080/actuator/gateway/routes

# 查看 Gateway 日志
tail -f logs/Gateway.log

# 测试路由是否正常
curl -v http://localhost:8080/code/gen/list
```

**常见路由问题**:

1. **路径前缀问题**
   ```yaml
   # 正确配置：保留路径前缀
   filters:
     - StripPrefix: false  # 或 0
   ```

2. **服务名不匹配**
   ```yaml
   # 确保服务名与 Nacos 中注册的一致
   uri: lb://ruoyi-gen  # 必须与 spring.application.name 相同
   ```

### 3. 服务间调用问题

**问题**: 服务 A 无法调用服务 B

```bash
# 检查服务是否在 Nacos 中注册
curl http://localhost:8848/nacos/v1/ns/instance/list?serviceName=ruoyi-system

# 使用服务名直接测试
curl http://localhost:9201/system/user/list

# 通过 Gateway 测试
curl http://localhost:8080/system/user/list
```

**解决方案**:
- 检查 `@EnableDiscoveryClient` 注解
- 确认服务名正确
- 使用 `@LoadBalanced` 的 RestTemplate 或 OpenFeign

### 4. 配置中心问题

**问题**: 配置不生效

```bash
# 检查配置是否在 Nacos 中
curl http://localhost:8848/nacos/v1/cs/configs?dataId=ruoyi-gateway-dev.yml&group=DEFAULT_GROUP

# 查看配置刷新日志
grep "Refresh" logs/*.log

# 强制刷新配置
curl -X POST http://localhost:8080/actuator/refresh
```

## 调试技巧

### 1. 查看服务状态

```bash
# 查看所有运行的服务
ps aux | grep java | grep spring-boot

# 查看端口占用
lsof -i :8080
lsof -i :9200
lsof -i :9201
lsof -i :9202

# 查看服务注册情况
curl http://localhost:8848/nacos/v1/ns/instance/list
```

### 2. 日志查看

```bash
# 查看所有服务日志
tail -f logs/*.log

# 实时查看日志
tail -f logs/Gateway.log -f logs/Auth.log

# 搜索特定错误
grep "ERROR" logs/*.log
grep "Exception" logs/*.log
```

### 3. 健康检查

```bash
# 检查服务健康状态
curl http://localhost:8080/actuator/health
curl http://localhost:9200/actuator/health
curl http://localhost:9201/actuator/health

# 查看详细信息
curl http://localhost:8080/actuator/health?details=true
```

## 常见错误解决方案

### 1. Connection refused

```bash
# 问题: java.net.ConnectException: Connection refused
# 解决: 确保对应服务已启动
lsof -i :8080  # 检查端口
```

### 2. 服务未找到

```bash
# 问题: com.alibaba.cloud.nacos.client.naming.exception.NacosNamingException
# 解决: 检查 Nacos 配置
curl http://localhost:8848/nacos/v1/ns/instance/list?serviceName=ruoyi-gateway
```

### 3. 路径不匹配

```bash
# 问题: 404 Not Found
# 解决: 检查 Gateway 路由配置
curl http://localhost:8080/actuator/gateway/routes | jq '.[] | select(.predicates | contains("/code"))'
```

### 4. 权限问题

```bash
# 问题: 403 Forbidden
# 解决: 检查 Token 和权限
# 1. 登录获取 Token
# 2. 在请求头中添加: Authorization: Bearer <token>
```

## 性能监控

### 1. 使用 Actuator 端点

```bash
# 查看所有端点
curl http://localhost:8080/actuator

# 查看内存信息
curl http://localhost:8080/actuator/metrics/jvm.memory.used

# 查看请求指标
curl http://localhost:8080/actuator/metrics/http.server.requests
```

### 2. 集成 Spring Boot Admin

```bash
# 访问监控页面
http://localhost:9100

# 查看服务详情、日志、指标等
```

## 开发工具推荐

1. **IDEA 插件**:
   - Spring Boot Dashboard
   - Nacos Config Plugin
   - Spring Cloud Alibaba Toolkit

2. **浏览器插件**:
   - Postman（测试 API）
   - Nacos Config Browser（查看配置）

3. **命令行工具**:
   - `curl`（测试 API）
   - `jq`（解析 JSON）
   - `watch`（监控变化）

## 快速重启服务

```bash
# 停止单个服务
./stop-all.sh

# 启动单个服务
cd ruoyi-gateway && mvn spring-boot:run

# 使用 Maven 重新编译后启动
mvn clean spring-boot:run
```

## 调试模式

```bash
# 启用调试模式
java -Xdebug -Xrunjdwp:transport=dt_socket,address=5005,server=y,suspend=n

# IDEA 配置远程调试
# 1. 添加 Remote Debug 配置
# 2. Host: localhost, Port: 5005
# 3. Debug 按钮
```

## 总结

微服务调试的关键点：
1. **服务注册**: 确保所有服务正确注册到 Nacos
2. **网关路由**: 检查 Gateway 的路由配置
3. **配置同步**: 确保配置中心配置生效
4. **日志监控**: 查看详细日志定位问题
5. **健康检查**: 使用 Actuator 端点检查服务状态

记住：一步一步排查，从底层到上层：
1. 基础设施（Nacos、MySQL、Redis）
2. 服务注册和发现
3. 配置中心
4. 网关路由
5. 业务逻辑