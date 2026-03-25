# 生产环境部署指南

## 部署架构

```
                    ┌─────────────┐
                    │   Nginx     │
                    │  (反向代理)  │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────▼─────┐ ┌───▼────┐ ┌────▼─────┐
        │  前端 Vue  │ │后端API  │ │  Redis   │
        │  (静态文件) │ │(JAR包)  │ │  (缓存)  │
        └───────────┘ └───┬────┘ └──────────┘
                           │
                    ┌──────▼──────┐
                    │    MySQL    │
                    │   (数据库)   │
                    └─────────────┘
```

## 服务器环境要求

### 推荐配置

| 组件 | 最低配置 | 推荐配置 |
|------|----------|----------|
| CPU | 2核 | 4核+ |
| 内存 | 4GB | 8GB+ |
| 硬盘 | 40GB | 100GB+ SSD |
| 操作系统 | CentOS 7+ / Ubuntu 18+ | CentOS 7+ / Ubuntu 20+ |

### 软件环境

| 软件 | 版本 |
|------|------|
| JDK | 1.8+ |
| MySQL | 5.7+ 或 8.0+ |
| Redis | 5.0+ |
| Nginx | 1.18+ |

## 一、服务器初始化

### 1. 更新系统

```bash
# CentOS
yum update -y

# Ubuntu
apt update && apt upgrade -y
```

### 2. 安装常用工具

```bash
# CentOS
yum install -y vim wget curl git

# Ubuntu
apt install -y vim wget curl git
```

### 3. 配置防火墙

```bash
# CentOS (firewalld)
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp
firewall-cmd --permanent --add-port=8080/tcp
firewall-cmd --reload

# Ubuntu (ufw)
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 8080/tcp
```

## 二、安装 JDK

```bash
# 检查是否已安装
java -version

# 安装 OpenJDK 8
# CentOS
yum install -y java-1.8.0-openjdk java-1.8.0-openjdk-devel

# Ubuntu
apt install -y openjdk-8-jdk

# 配置环境变量
echo 'export JAVA_HOME=/usr/lib/jvm/java-1.8.0-openjdk' >> /etc/profile
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> /etc/profile
source /etc/profile

# 验证
java -version
```

## 三、安装 MySQL

### 1. 安装 MySQL

```bash
# CentOS 7
yum localinstall -y https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm
yum install -y mysql-server

# Ubuntu
apt install -y mysql-server
```

### 2. 启动 MySQL

```bash
systemctl start mysqld
systemctl enable mysqld
```

### 3. 初始化配置

```bash
# 获取临时密码 (MySQL 8.0)
grep 'temporary password' /var/log/mysqld.log

# 运行安全配置
mysql_secure_installation
```

### 4. 创建数据库

```bash
mysql -u root -p

CREATE DATABASE `ry-vue` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
CREATE USER 'ruoyi'@'%' IDENTIFIED BY 'YourStrongPassword123!';
GRANT ALL PRIVILEGES ON `ry-vue`.* TO 'ruoyi'@'%';
FLUSH PRIVILEGES;
EXIT;

# 导入数据
mysql -u ruoyi -p ry-vue < /path/to/sql/ry_2021xxxx.sql
mysql -u ruoyi -p ry-vue < /path/to/sql/quartz.sql
```

## 四、安装 Redis

```bash
# CentOS
yum install -y redis

# Ubuntu
apt install -y redis-server

# 启动 Redis
systemctl start redis
systemctl enable redis

# 设置密码 (可选)
vim /etc/redis.conf
# 找到 # requirepass foobared
# 改为 requirepass YourRedisPassword

systemctl restart redis

# 测试连接
redis-cli
# 如果有密码: AUTH YourRedisPassword
# PING
```

## 五、安装 Nginx

```bash
# CentOS
yum install -y epel-release
yum install -y nginx

# Ubuntu
apt install -y nginx

# 启动 Nginx
systemctl start nginx
systemctl enable nginx

# 验证
curl http://localhost
```

## 六、部署后端

### 1. 上传 JAR 包

```bash
# 创建应用目录
mkdir -p /opt/ruoyi
cd /opt/ruoyi

# 上传 ruoyi-admin.jar 到服务器
# 使用 scp 或 FTP 工具
```

### 2. 配置文件

创建 `application-prod.yml`:

```yaml
# 生产环境配置
server:
  port: 8080

spring:
  datasource:
    type: com.alibaba.druid.pool.DruidDataSource
    driverClassName: com.mysql.cj.jdbc.Driver
    druid:
      master:
        url: jdbc:mysql://localhost:3306/ry-vue?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=true&serverTimezone=GMT%2B8
        username: ruoyi
        password: YourStrongPassword123!
  redis:
    host: localhost
    port: 6379
    password: YourRedisPassword  # 如果有密码
    database: 0

# 日志配置
logging:
  level:
    com.ruoyi: info
    org.springframework: warn
  file:
    path: /opt/ruoyi/logs
```

### 3. 创建启动脚本

创建 `start.sh`:

```bash
#!/bin/bash

APP_NAME="ruoyi-admin"
JAR_NAME="$APP_NAME.jar"
PID=$(ps -ef | grep $JAR_NAME | grep -v grep | awk '{print $2}')

# 停止旧进程
if [ -n "$PID" ]; then
  echo "Stopping $APP_NAME (PID: $PID)..."
  kill -15 $PID
  sleep 3
fi

# 启动新进程
echo "Starting $APP_NAME..."
nohup java -jar \
  -Xms512m \
  -Xmx1024m \
  -XX:MetaspaceSize=256m \
  -XX:MaxMetaspaceSize=512m \
  -Dspring.profiles.active=prod \
  $JAR_NAME \
  > /dev/null 2>&1 &

echo "$APP_NAME started!"
```

创建 `stop.sh`:

```bash
#!/bin/bash

APP_NAME="ruoyi-admin"
PID=$(ps -ef | grep "$APP_NAME.jar" | grep -v grep | awk '{print $2}')

if [ -n "$PID" ]; then
  echo "Stopping $APP_NAME (PID: $PID)..."
  kill -15 $PID
  sleep 2
  echo "$APP_NAME stopped!"
else
  echo "$APP_NAME is not running!"
fi
```

```bash
# 添加执行权限
chmod +x start.sh stop.sh

# 启动应用
./start.sh

# 查看日志
tail -f logs/ruoyi.log
```

### 4. 配置为系统服务

创建 `/etc/systemd/system/ruoyi.service`:

```ini
[Unit]
Description=RuoYi Application
After=network.target mysql.service redis.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/ruoyi
ExecStart=/usr/bin/java -jar -Xms512m -Xmx1024m -Dspring.profiles.active=prod ruoyi-admin.jar
ExecStop=/bin/kill -15 $MAINPID
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# 重载 systemd
systemctl daemon-reload

# 启动服务
systemctl start ruoyi
systemctl enable ruoyi

# 查看状态
systemctl status ruoyi
```

## 七、部署前端

### 1. 打包前端

```bash
# 在本地执行
cd ruoyi-ui-vue2
npm run build:prod
```

### 2. 上传到服务器

```bash
# 在服务器创建目录
mkdir -p /var/www/ruoyi

# 上传 dist 目录内容到服务器
# 使用 scp 或 FTP 工具
```

### 3. 配置 Nginx

编辑 `/etc/nginx/conf.d/ruoyi.conf`:

```nginx
# 后端 API
server {
    listen 8080;
    server_name _;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# 前端页面
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/ruoyi;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # 前端路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /prod-api/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
    }
}
```

```bash
# 测试配置
nginx -t

# 重载配置
nginx -s reload
```

## 八、配置 SSL (HTTPS)

### 使用 Let's Encrypt 免费证书

```bash
# 安装 certbot
# CentOS
yum install -y certbot python3-certbot-nginx

# Ubuntu
apt install -y certbot python3-certbot-nginx

# 自动配置 SSL
certbot --nginx -d your-domain.com

# 自动续期
certbot renew --dry-run
```

### Nginx SSL 配置示例

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # ... 其他配置
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## 九、监控与日志

### 1. 应用监控

```bash
# 查看应用状态
systemctl status ruoyi

# 查看日志
tail -f /opt/ruoyi/logs/ruoyi.log

# 查看错误日志
grep ERROR /opt/ruoyi/logs/ruoyi.log
```

### 2. Nginx 日志

```bash
# 访问日志
tail -f /var/log/nginx/access.log

# 错误日志
tail -f /var/log/nginx/error.log
```

### 3. 系统监控

```bash
# CPU 和内存
top -c

# 磁盘使用
df -h

# 网络连接
netstat -tunlp

# 进程监控
ps aux | grep java
```

## 十、备份策略

### 1. 数据库备份

```bash
# 创建备份脚本
vim /opt/backup/mysql_backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backup/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

mysqldump -u ruoyi -p'YourPassword' ry-vue | gzip > $BACKUP_DIR/ry-vue_$DATE.sql.gz

# 保留最近 7 天的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

```bash
# 添加到 crontab (每天凌晨 2 点执行)
chmod +x /opt/backup/mysql_backup.sh
crontab -e
# 添加: 0 2 * * * /opt/backup/mysql_backup.sh
```

### 2. 应用备份

```bash
# 备份 JAR 包
cp /opt/ruoyi/ruoyi-admin.jar /opt/backup/ruoyi-admin_$(date +%Y%m%d).jar

# 备份前端
tar -czf /opt/backup/dist_$(date +%Y%m%d).tar.gz /var/www/ruoyi
```

## 十一、常见问题排查

### 1. 后端启动失败

```bash
# 检查端口占用
netstat -tunlp | grep 8080

# 查看详细日志
java -jar ruoyi-admin.jar

# 检查数据库连接
mysql -u ruoyi -p -h localhost ry-vue

# 检查 Redis 连接
redis-cli ping
```

### 2. 前端访问 404

- 检查 Nginx 配置
- 检查静态文件路径
- 查看 Nginx 错误日志

### 3. API 跨域

- 检查 Nginx 代理配置
- 后端添加 `@CrossOrigin` 注解

### 4. 内存不足

```bash
# 查看内存使用
free -h

# 调整 JVM 参数
java -Xms256m -Xmx512m -jar ruoyi-admin.jar
```

## 十二、性能优化建议

### 1. 数据库优化

```sql
-- 添加索引
CREATE INDEX idx_user_name ON sys_user(user_name);

-- 优化查询
EXPLAIN SELECT * FROM sys_user WHERE user_name = 'admin';

-- 定期清理日志
DELETE FROM sys_oper_log WHERE create_time < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

### 2. Redis 缓存

```bash
# 设置最大内存
vim /etc/redis.conf
maxmemory 512mb
maxmemory-policy allkeys-lru
```

### 3. Nginx 优化

```nginx
# 开启缓存
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g;

location /prod-api/ {
    proxy_cache my_cache;
    proxy_cache_valid 200 5m;
    # ... 其他配置
}
```

### 4. JVM 调优

```bash
# 生产环境推荐参数
java -server \
  -Xms1g \
  -Xmx2g \
  -XX:MetaspaceSize=256m \
  -XX:MaxMetaspaceSize=512m \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \
  -XX:+HeapDumpOnOutOfMemoryError \
  -XX:HeapDumpPath=/opt/ruoyi/logs/heapdump.hprof \
  -jar ruoyi-admin.jar
```

## 十三、安全加固

### 1. 修改默认端口

```yaml
# application-prod.yml
server:
  port: 8888  # 改为非标准端口
```

### 2. 配置防火墙

```bash
# 只开放必要端口
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
# 不对外开放数据库端口
firewall-cmd --reload
```

### 3. 定期更新

```bash
# 系统更新
yum update -y

# 检查安全漏洞
yum check-update --security
```

### 4. 配置 fail2ban

```bash
# 安装 fail2ban
yum install -y fail2ban

# 配置防暴力破解
vim /etc/fail2ban/jail.local
```

## 十四、部署检查清单

部署前检查:

- [ ] JDK 版本正确
- [ ] MySQL 数据库已创建并导入数据
- [ ] Redis 服务正常运行
- [ ] 后端配置文件已修改 (数据库、Redis 密码)
- [ ] 前端 API 地址已配置
- [ ] Nginx 配置已测试
- [ ] 防火墙端口已开放
- [ ] SSL 证书已配置 (如需要)
- [ ] 备份脚本已设置
- [ ] 监控已配置

部署后验证:

- [ ] 后端 API 可访问
- [ ] 前端页面正常加载
- [ ] 登录功能正常
- [ ] 数据读写正常
- [ ] 日志正常输出
- [ ] 服务开机自启
