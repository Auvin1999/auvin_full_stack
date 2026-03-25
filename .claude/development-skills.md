# 开发技能速查手册

## Java 后端开发

### Spring Boot 常用注解

```java
// REST Controller
@RestController          // 组合 @Controller + @ResponseBody
@RequestMapping("/api")  // 类级别路径映射
@GetMapping("/users")    // GET 请求映射
@PostMapping("/users")   // POST 请求映射
@PutMapping("/users")    // PUT 请求映射
@DeleteMapping("/users") // DELETE 请求映射

// 依赖注入
@Autowired              // 自动装配
@Service               // 标记服务层
@Repository            // 标记数据访问层
@Component             // 通用组件

// 配置
@Configuration          // 标记配置类
@Bean                  // 定义 Bean
@Value("${prop}")      // 读取配置值
@PropertySource        // 加载配置文件

// 验证
@Valid                 // 触发验证
@NotNull               // 不能为 null
@NotEmpty              // 不能为空
@Size(min=1, max=10)   // 字符串长度
@Email                 // 邮箱格式
@Pattern(regexp="")    // 正则匹配

// 事务
@Transactional         // 事务管理

// 异常处理
@ExceptionHandler      // 异常处理器
@RestControllerAdvice  // 全局异常处理

// 其他
@Lazy                  // 延迟加载
@Scope("prototype")    // 作用域
@PostConstruct         // 初始化后执行
@PreDestroy            // 销毁前执行
```

### MyBatis 常用写法

```java
// Mapper 接口
public interface UserMapper {
    // 基本查询
    List<User> selectAll();
    User selectById(Long id);
    List<User> selectList(User user);

    // 增删改
    int insert(User user);
    int update(User user);
    int deleteById(Long id);
    int batchDelete(Long[] ids);

    // 使用 @Param
    User selectByNameAndStatus(
        @Param("userName") String userName,
        @Param("status") String status
    );
}
```

```xml
<!-- MyBatis XML 映射 -->
<mapper namespace="com.ruoyi.system.mapper.UserMapper">

    <!-- 结果映射 -->
    <resultMap id="BaseResult" type="User">
        <id property="userId" column="user_id"/>
        <result property="userName" column="user_name"/>
        <result property="email" column="email"/>
    </resultMap>

    <!-- 查询 -->
    <select id="selectAll" resultMap="BaseResult">
        SELECT * FROM sys_user
    </select>

    <!-- 动态查询 -->
    <select id="selectList" parameterType="User" resultMap="BaseResult">
        SELECT * FROM sys_user
        <where>
            <if test="userName != null and userName != ''">
                AND user_name LIKE CONCAT('%', #{userName}, '%')
            </if>
            <if test="status != null and status != ''">
                AND status = #{status}
            </if>
        </where>
        ORDER BY create_time DESC
    </select>

    <!-- 插入 -->
    <insert id="insert" parameterType="User">
        INSERT INTO sys_user (
            user_name, email, status
        ) VALUES (
            #{userName}, #{email}, #{status}
        )
    </insert>

    <!-- 更新 -->
    <update id="update" parameterType="User">
        UPDATE sys_user
        <set>
            <if test="userName != null">user_name = #{userName},</if>
            <if test="email != null">email = #{email},</if>
            <if test="status != null">status = #{status},</if>
        </set>
        WHERE user_id = #{userId}
    </update>

    <!-- 删除 -->
    <delete id="deleteById">
        DELETE FROM sys_user WHERE user_id = #{userId}
    </delete>

    <!-- 批量删除 -->
    <delete id="batchDelete">
        DELETE FROM sys_user
        WHERE user_id IN
        <foreach item="id" collection="array" open="(" separator="," close=")">
            #{id}
        </foreach>
    </delete>

</mapper>
```

### 常用工具类

```java
// 字符串工具
StringUtils.isEmpty(str)        // 为空判断
StringUtils.isNotEmpty(str)     // 非空判断
StringUtils.trim(str)           // 去除首尾空格

// 集合工具
CollectionUtils.isEmpty(coll)   // 集合为空
CollectionUtils.isNotEmpty(coll)

// 日期工具
DateUtils.now()                 // 当前时间
DateUtils.formatDate(date)      // 格式化日期
DateUtils.parseDate(str)        // 解析日期

// JSON 工具
JSON.toJSONString(obj)          // 对象转 JSON
JSON.parseObject(str, clazz)    // JSON 转对象

// 安全工具
SecurityUtils.getUserId()       // 获取用户 ID
SecurityUtils.getUsername()     // 获取用户名
SecurityUtils.encryptPassword(pwd) // 加密密码

// Bean 工具
BeanUtils.copyProperties(source, target) // 属性复制
```

### 分页查询

```java
// Controller 中
@GetMapping("/list")
public TableDataInfo list(User user) {
    startPage();              // 开始分页
    List<User> list = userService.selectList(user);
    return getDataTable(list); // 返回分页数据
}

// 分页参数 (前端传递)
pageNum: 1       // 页码
pageSize: 10     // 每页数量
orderBy: "user_id ASC"  // 排序
```

### 统一响应格式

```java
// 成功响应
AjaxResult.success()
AjaxResult.success("操作成功")
AjaxResult.success(data)

// 失败响应
AjaxResult.error()
AjaxResult.error("操作失败")

// 自定义响应
AjaxResult result = AjaxResult.builder()
    .code(200)
    .msg("查询成功")
    .put("data", data)
    .put("total", total);
```

### 异常处理

```java
// 抛出业务异常
throw new ServiceException("用户不存在");

// 抛出参数异常
throw new IllegalArgumentException("参数错误");

// 自定义异常
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}
```

## Vue 前端开发

### Vue2 Composition

```javascript
// 组件定义
export default {
  name: 'UserList',
  components: { UserCard },
  props: {
    userId: Number
  },
  data() {
    return {
      list: [],
      loading: false
    }
  },
  computed: {
    filteredList() {
      return this.list.filter(item => item.status === '1')
    }
  },
  watch: {
    userId(newVal) {
      this.loadData()
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      const { data } = await getList(this.queryParams)
      this.list = data.rows
      this.loading = false
    },
    handleAdd() {
      this.$refs.form.resetFields()
    }
  }
}
```

### Vue3 Composition API

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 响应式数据
const list = ref([])
const loading = ref(false)

// 计算属性
const total = computed(() => list.value.length)

// 生命周期
onMounted(() => {
  loadData()
})

// 方法
async function loadData() {
  loading.value = true
  const { data } = await getList()
  list.value = data.rows
  loading.value = false
}
</script>
```

### Vue Router

```javascript
// 定义路由
const routes = [
  {
    path: '/system/user',
    component: Layout,
    redirect: '/system/user/list',
    children: [
      {
        path: 'list',
        name: 'UserList',
        component: () => import('@/views/system/user/index'),
        meta: { title: '用户管理', icon: 'user' }
      }
    ]
  }
]

// 路由跳转
this.$router.push('/system/user')
this.$router.push({ name: 'UserList', params: { id: 1 } })
this.$router.back()

// 获取参数
this.$route.params.id
this.$route.query.keyword
```

### Vuex Store

```javascript
// 定义 Store
const store = new Vuex.Store({
  state: {
    token: '',
    userInfo: null
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
      setToken(token)
    }
  },
  actions: {
    Login({ commit }, loginForm) {
      return new Promise((resolve, reject) => {
        login(loginForm).then(res => {
          commit('SET_TOKEN', res.token)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    }
  },
  getters: {
    isLoggedIn: state => !!state.token
  }
})

// 使用 Store
this.$store.commit('SET_TOKEN', token)
this.$store.dispatch('Login', loginForm)
this.$store.getters.isLoggedIn
```

### Element UI 组件

```vue
<template>
  <!-- 表格 -->
  <el-table :data="list" v-loading="loading">
    <el-table-column prop="userName" label="用户名" />
    <el-table-column label="操作">
      <template #default="{ row }">
        <el-button size="small" @click="handleEdit(row)">编辑</el-button>
      </template>
    </el-table-column>
  </el-table>

  <!-- 表单 -->
  <el-form ref="form" :model="form" :rules="rules">
    <el-form-item prop="userName" label="用户名">
      <el-input v-model="form.userName" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
    </el-form-item>
  </el-form>

  <!-- 对话框 -->
  <el-dialog v-model="visible" title="编辑">
    <el-form>...</el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>
```

### 请求拦截器

```javascript
// request.js
import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 10000
})

// 请求拦截
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截
service.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      ElMessage.error(res.msg || '请求失败')
      return Promise.reject(new Error(res.msg))
    }
    return res
  },
  error => {
    ElMessage.error(error.message)
    return Promise.reject(error)
  }
)

export default service
```

### 权限指令

```javascript
// v-hasPermi 指令
const hasPermi = {
  mounted(el, binding) {
    const { value } = binding
    const permissions = store.getters.permissions

    if (value && value instanceof Array) {
      const hasPermission = permissions.some(permission => {
        return value.includes(permission)
      })
      if (!hasPermission) {
        el.parentNode?.removeChild(el)
      }
    }
  }
}

// 使用
<el-button v-hasPermi="['system:user:add']">新增</el-button>
```

## Git 常用命令

```bash
# 基本操作
git init                    # 初始化仓库
git clone <url>             # 克隆仓库
git status                  # 查看状态
git add .                   # 添加所有更改
git commit -m "message"     # 提交更改
git push                    # 推送到远程
git pull                    # 拉取更新

# 分支操作
git branch                  # 查看分支
git branch <name>           # 创建分支
git checkout <name>         # 切换分支
git checkout -b <name>      # 创建并切换
git merge <name>            # 合并分支
git branch -d <name>        # 删除分支

# 撤销操作
git reset --hard HEAD       # 撤销工作区更改
git reset --soft HEAD~1     # 撤销上次提交
git revert <commit>         # 撤销指定提交

# 查看历史
git log                     # 查看提交历史
git diff                    # 查看更改
git show <commit>           # 查看提交详情
```

## 数据库常用 SQL

```sql
-- 查询
SELECT * FROM sys_user WHERE user_name = 'admin';
SELECT COUNT(*) FROM sys_user;

-- 插入
INSERT INTO sys_user (user_name, password) VALUES ('test', '123456');

-- 更新
UPDATE sys_user SET email = 'test@example.com' WHERE user_id = 1;

-- 删除
DELETE FROM sys_user WHERE user_id = 1;

-- 批量删除
DELETE FROM sys_user WHERE user_id IN (1, 2, 3);

-- 模糊查询
SELECT * FROM sys_user WHERE user_name LIKE '%admin%';

-- 分页查询
SELECT * FROM sys_user LIMIT 0, 10;

-- 排序
SELECT * FROM sys_user ORDER BY create_time DESC;

-- 连接查询
SELECT u.*, d.dept_name
FROM sys_user u
LEFT JOIN sys_dept d ON u.dept_id = d.dept_id;

-- 子查询
SELECT * FROM sys_user
WHERE dept_id IN (SELECT dept_id FROM sys_dept WHERE status = '0');
```

## Docker 常用命令

```bash
# 镜像操作
docker images                    # 查看镜像
docker pull <image>              # 拉取镜像
docker build -t <name> .         # 构建镜像
docker rmi <image>               # 删除镜像

# 容器操作
docker ps                       # 查看运行中的容器
docker ps -a                    # 查看所有容器
docker run -d -p 80:80 nginx    # 运行容器
docker stop <container>          # 停止容器
docker start <container>         # 启动容器
docker rm <container>            # 删除容器

# 进入容器
docker exec -it <container> /bin/bash

# 查看日志
docker logs -f <container>

# 清理
docker system prune -a          # 清理所有未使用的资源
```

## 调试技巧

### Java 远程调试

```bash
# 启动时添加调试参数
java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005 -jar app.jar

# IDEA 配置
Run → Edit Configurations → Remote → JVM Debug
```

### 前端调试

```javascript
// 断点
debugger

// 控制台输出
console.log(data)
console.table(array)
console.error(error)

// 性能分析
console.time('timer')
// ... 代码
console.timeEnd('timer')
```

### 日志输出

```java
// 后端日志
logger.info("用户登录: {}", username);
logger.error("操作失败", e);

// 使用 Lombok
@Slf4j
public class UserService {
    public void method() {
        log.info("日志信息");
    }
}
```

## 性能优化

### 前端优化

1. **路由懒加载**: `component: () => import('@/views/...')`
2. **按需引入**: Element UI 按需引入
3. **图片压缩**: TinyPNG
4. **代码分割**: Webpack SplitChunks
5. **缓存策略**: Service Worker

### 后端优化

1. **SQL 优化**: 添加索引、避免全表扫描
2. **缓存**: Redis 缓存热点数据
3. **异步**: @Async 异步处理
4. **批量**: 批量插入/更新
5. **连接池**: Druid 配置优化

### 数据库优化

```sql
-- 添加索引
CREATE INDEX idx_user_name ON sys_user(user_name);

-- 查看执行计划
EXPLAIN SELECT * FROM sys_user WHERE user_name = 'admin';

-- 分析表
ANALYZE TABLE sys_user;

-- 优化表
OPTIMIZE TABLE sys_user;
```

## 代码规范

### Java 命名规范

```java
// 类名：大驼峰
public class UserService {}

// 方法名：小驼峰
public void getUserList() {}

// 常量：全大写下划线
public static final String USER_TYPE = "admin";

// 变量：小驼峰
private String userName;
```

### Vue 命名规范

```javascript
// 组件名：大驼峰
export default {
  name: 'UserList'
}

// 文件名：kebab-case
// user-list.vue

// 方法名：小驼峰
methods: {
  handleAdd() {}
}

// 常量：全大写
const API_URL = 'http://...'
```

## 常用快捷键

### IDEA

| 快捷键 | 功能 |
|--------|------|
| Ctrl + D | 复制行 |
| Ctrl + Y | 删除行 |
| Ctrl + / | 注释 |
| Ctrl + Alt + L | 格式化 |
| Alt + Enter | 导入包 |
| Ctrl + N | 查找类 |
| Ctrl + Shift + N | 查找文件 |
| Ctrl + Shift + F | 全局查找 |

### VS Code

| 快捷键 | 功能 |
|--------|------|
| Ctrl + ` | 打开终端 |
| Ctrl + P | 快速打开文件 |
| Ctrl + Shift + F | 全局查找 |
| Alt + Shift + F | 格式化 |
| Ctrl + / | 注释 |
| F12 | 转到定义 |

## 问题排查清单

遇到问题时按以下顺序排查：

1. **检查日志**: 后端日志、前端控制台
2. **检查网络**: Network 面板查看请求
3. **检查配置**: 环境变量、配置文件
4. **检查权限**: 用户权限、文件权限
5. **检查依赖**: npm install、mvn clean install
6. **重启服务**: 后端重启、前端重新 npm run dev
7. **清除缓存**: 浏览器缓存、IDE 缓存
8. **搜索错误**: Google/Stack Overflow 搜索错误信息
