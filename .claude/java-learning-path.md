# Java 学习路径（基于廖雪峰教程 + 若依项目实战）

> 学习网址: https://liaoxuefeng.com/books/java/introduction/index.html

## 学习路线图

```
第一阶段：Java 基础 (第1-10章)
        ↓
第二阶段：面向对象 (第11-16章)
        ↓
第三阶段：核心类库 (第17-23章)
        ↓
第四阶段：IO 与 异常 (第24-28章)
        ↓
第五阶段：日期与时间 (第29-30章)
        ↓
第六阶段：集合框架 (第31-35章)
        ↓
第七阶段：反射与注解 (第36-38章) → 在若依项目中大量使用
        ↓
第八阶段：泛型 (第39章)
        ↓
第九阶段：JDBC 与 数据库 (第40-42章)
        ↓
第十阶段：Maven 与 Spring 入门 (第43-45章)
```

---

## 第一阶段：Java 基础入门

### 第1章：Java 简介

**学习目标**: 了解 Java 历史、特点

**若依项目对应**:
- 项目使用 Java 8 (JDK 1.8)
- 位置: `pom.xml` 中 `<java.version>1.8</java.version>`

---

### 第2章：Java 程序基础

**学习重点**: 变量、数据类型、运算符

**若依项目实战**:

```java
// 查看: ruoyi-common/src/main/java/com/ruoyi/common/core/domain/AjaxResult.java
public class AjaxResult {
    public static final int SUCCESS = 200;    // 常量定义
    public static final int ERROR = 500;

    private int code;          // 基本类型
    private String msg;        // 引用类型
    private Object data;       // 对象类型
}
```

**练习**: 在 `ruoyi-common` 中添加一个常量类

---

### 第3章：流程控制

**学习重点**: if-else、switch、for、while

**若依项目实战**:

```java
// 查看: ruoyi-common/src/main/java/com/ruoyi/common/utils/StringUtils.java
public static boolean isEmpty(String str) {
    return str == null || "".equals(str.trim());  // if-else 简化写法
}

// 查看: ruoyi-admin/src/main/java/com/ruoyi/web/controller/system/SysUserController.java
public AjaxResult getInfo(Long userId) {
    if (StringUtils.isNotNull(userId)) {        // 条件判断
        SysUser user = userService.selectUserById(userId);
        return AjaxResult.success(user);
    }
    return AjaxResult.success();
}
```

---

### 第4章：数组操作

**学习重点**: 数组定义、遍历、排序

**若依项目实战**:

```java
// 查看: ruoyi-framework/src/main/java/com/ruoyi/framework/config/SecurityConfig.java
// 数组用于配置权限
String[] permitUrls = { "/login", "/register", "/captcha" };

// 查看: ruoyi-system/src/main/java/com/ruoyi/system/mapper/SysUserMapper.java
// 批量删除使用数组参数
int deleteUserByIds(Long[] userIds);
```

---

### 第5章：输入输出

**学习重点**: Scanner、System.out.println

**若依项目实战**:

```java
// 查看: ruoyi-common/src/main/java/com/ruoyi/common/utils/SecurityUtils.java
// 输出日志到控制台
logger.info("当前用户: {}", getUsername());

// 查看日志输出
Console.log("用户登录成功");
```

---

## 第二阶段：面向对象编程

### 第11章：面向对象基础

**学习重点**: 类、对象、方法

**若依项目实战**:

```java
// 查看: ruoyi-common/src/main/java/com/ruoyi/common/core/domain/entity/SysUser.java
public class SysUser extends BaseEntity {    // 类定义
    private Long userId;                      // 属性
    private String userName;

    public Long getUserId() {                 // getter 方法
        return userId;
    }

    public void setUserId(Long userId) {      // setter 方法
        this.userId = userId;
    }
}

// 使用: ruoyi-system/src/main/java/com/ruoyi/system/service/impl/SysUserServiceImpl.java
SysUser user = new SysUser();                 // 创建对象
user.setUserName("admin");                    // 调用方法
```

---

### 第12章：方法重载与重写

**学习重点**: overload、override

**若依项目实战**:

```java
// 方法重载: 同一类中，方法名相同，参数不同
// ruoyi-common/src/main/java/com/ruoyi/common/core/controller/BaseController.java
public AjaxResult success() {
    return AjaxResult.success();
}
public AjaxResult success(String message) {   // 重载
    return AjaxResult.success(message);
}
public AjaxResult success(Object data) {      // 重载
    return AjaxResult.success(data);
}

// 方法重写: 子类重写父类方法
// service 接口和实现类
public interface ISysUserService {
    List<SysUser> selectUserList(SysUser user);
}
public class SysUserServiceImpl implements ISysUserService {
    @Override                                 // 重写
    public List<SysUser> selectUserList(SysUser user) {
        return userMapper.selectUserList(user);
    }
}
```

---

### 第13章：继承与多态

**学习重点**: extends、super、多态

**若依项目实战**:

```java
// 继承: 所有实体类继承 BaseEntity
// ruoyi-common/src/main/java/com/ruoyi/common/core/domain/BaseEntity.java
public class BaseEntity implements Serializable {
    private String createBy;
    private Date createTime;
    private String updateBy;
    private Date updateTime;
    private String remark;
}

// ruoyi-common/src/main/java/com/ruoyi/common/core/domain/entity/SysUser.java
public class SysUser extends BaseEntity {      // 继承 BaseEntity
    // 继承了 createBy、createTime 等字段
    private Long userId;
    private String userName;
}

// 多态: 接口引用指向实现类对象
ISysUserService userService = new SysUserServiceImpl();  // 多态
List<SysUser> list = userService.selectUserList(user);
```

---

### 第14章：抽象类与接口

**学习重点**: abstract、interface

**若依项目实战**:

```java
// 接口定义
// ruoyi-system/src/main/java/com/ruoyi/system/service/ISysUserService.java
public interface ISysUserService {             // 接口
    List<SysUser> selectUserList(SysUser user);
    SysUser selectUserById(Long userId);
}

// 抽象类 (框架层使用)
// ruoyi-common/src/main/java/com/ruoyi/common/core/controller/BaseController.java
public class BaseController {                  // 基类控制器
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    public AjaxResult success() {              // 通用方法
        return AjaxResult.success();
    }
}

// 所有控制器继承 BaseController
// ruoyi-admin/src/main/java/com/ruoyi/web/controller/system/SysUserController.java
public class SysUserController extends BaseController {
    // 继承了 success()、error() 等方法
}
```

---

### 第15章：static 关键字

**学习重点**: 静态变量、静态方法、静态代码块

**若依项目实战**:

```java
// 静态常量
// ruoyi-common/src/main/java/com/ruoyi/common/constant/HttpStatus.java
public class HttpStatus {
    public static final int SUCCESS = 200;
    public static final int ERROR = 500;
}

// 静态方法
// ruoyi-common/src/main/java/com/ruoyi/common/utils/StringUtils.java
public class StringUtils {
    public static boolean isEmpty(String str) {  // 静态方法
        return str == null || "".equals(str.trim());
    }

    public static boolean isNotEmpty(String str) {
        return !isEmpty(str);
    }
}

// 使用
if (StringUtils.isNotEmpty(userName)) {  // 直接调用静态方法
    // ...
}
```

---

### 第16章：final 关键字

**学习重点**: final 变量、final 方法、final 类

**若依项目实战**:

```java
// final 常量
// ruoyi-common/src/main/java/com/ruoyi/common/core/domain/AjaxResult.java
public class AjaxResult {
    public static final String DATA_TAG = "data";  // final 常量

    // final 方法，防止被子类重写
    public final int getCode() {
        return code;
    }
}

// final 类，不能被继承
public final String getMessage() {
    return msg;
}
```

---

## 第三阶段：核心类库

### 第17章：Java 核心类

**学习重点**: String、StringBuilder、包装类

**若依项目实战**:

```java
// String 操作
// ruoyi-common/src/main/java/com/ruoyi/common/utils/StringUtils.java
public static String nvl(String value, String defaultValue) {
    return isEmpty(value) ? defaultValue : value;
}

// 字符串拼接
String sql = "SELECT * FROM sys_user WHERE user_name = '" + userName + "'";

// StringBuilder 高效拼接
StringBuilder sb = new StringBuilder();
sb.append("SELECT * FROM sys_user");
if (StringUtils.isNotEmpty(userName)) {
    sb.append(" WHERE user_name = '").append(userName).append("'");
}

// 包装类
Long userId = 1L;           // 自动装箱
long id = userId.longValue(); // 拆箱
```

---

### 第18章：枚举

**学习重点**: enum、枚举方法

**若依项目实战**:

```java
// ruoyi-common/src/main/java/com/ruoyi/common/enums/BusinessType.java
public enum BusinessType {           // 枚举
    /**
     * 其它
     */
    OTHER,

    /**
     * 新增
     */
    INSERT,

    /**
     * 修改
     */
    UPDATE,

    /**
     * 删除
     */
    DELETE,

    /**
     * 授权
     */
    GRANT;

    public String getValue() {
        return this.name();
    }
}

// 使用注解时引用枚举
@Log(title = "用户管理", businessType = BusinessType.INSERT)
```

---

### 第19章：大整数和大浮点数

**学习重点**: BigInteger、BigDecimal

**若依项目实战**:

```java
// 金额计算（涉及金钱必须用 BigDecimal）
// ruoyi-system 中如果涉及订单、金额等会用到
BigDecimal amount = new BigDecimal("100.50");
BigDecimal tax = amount.multiply(new BigDecimal("0.13"));
```

---

## 第四阶段：异常处理

### 第24章：Java 异常处理

**学习重点**: try-catch、throw、throws、自定义异常

**若依项目实战**:

```java
// 自定义异常
// ruoyi-common/src/main/java/com/ruoyi/common/exception/ServiceException.java
public class ServiceException extends RuntimeException {
    private Integer code;
    private String message;

    public ServiceException(String message) {
        this.message = message;
    }
}

// 抛出异常
// ruoyi-system/src/main/java/com/ruoyi/system/service/impl/SysUserServiceImpl.java
if (!userService.checkUserNameUnique(user)) {
    throw new ServiceException("新增用户'" + user.getUserName() + "'失败，登录账号已存在");
}

// 捕获异常
// ruoyi-framework/src/main/java/com/ruoyi/framework/web/exception/GlobalExceptionHandler.java
@ExceptionHandler(ServiceException.class)
public AjaxResult handleServiceException(ServiceException e) {
    logger.error("业务异常: {}", e.getMessage());
    return AjaxResult.error(e.getMessage());
}

// 声明抛出异常
public void readFile() throws IOException {
    // ...
}
```

---

## 第五阶段：日期与时间

### 第29章：日期和时间

**学习重点**: Date、Calendar、LocalDateTime

**若依项目实战**:

```java
// 日期工具类
// ruoyi-common/src/main/java/com/ruoyi/common/utils/DateUtils.java
public class DateUtils {
    public static final String YYYY = "yyyy";
    public static final String YYYY_MM_DD = "yyyy-MM-dd";

    public static String getDate() {
        return formatDate(new Date(), YYYY_MM_DD);
    }

    public static String formatDate(Date date, String pattern) {
        SimpleDateFormat sdf = new SimpleDateFormat(pattern);
        return sdf.format(date);
    }

    public static Date parseDate(String str) {
        return parseDate(str, YYYY_MM_DD);
    }
}

// 使用
String currentDate = DateUtils.getDate();  // 获取当前日期
Date createTime = new Date();              // 创建时间

// BaseEntity 中的日期字段
// ruoyi-common/src/main/java/com/ruoyi/common/core/domain/BaseEntity.java
private Date createTime;   // 创建时间
private Date updateTime;   // 更新时间
```

---

## 第六阶段：集合框架

### 第31章：Java 集合

**学习重点**: List、Set、Map

**若依项目实战**:

```java
// List 使用
// ruoyi-admin/src/main/java/com/ruoyi/web/controller/system/SysUserController.java
public AjaxResult getInfo(Long userId) {
    List<SysRole> roles = roleService.selectRoleAll();  // List 集合
    ajax.put("roles", roles);

    List<Long> roleIds = sysUser.getRoles().stream()
        .map(SysRole::getRoleId)
        .collect(Collectors.toList());                 // Stream 转换
    return ajax;
}

// Map 使用
// ruoyi-common/src/main/java/com/ruoyi/common/core/domain/AjaxResult.java
public class AjaxResult {
    private Map<String, Object> data = new HashMap<>();

    public AjaxResult put(String key, Object value) {  // Map 操作
        data.put(key, value);
        return this;
    }
}

// 使用
AjaxResult result = AjaxResult.success();
result.put("user", user);
result.put("roles", roles);
```

---

### 第32章：List 和 ArrayList

**若依项目实战**:

```java
// 定义 List
List<SysUser> userList = new ArrayList<>();

// 添加元素
userList.add(user);

// 遍历
for (SysUser user : userList) {
    System.out.println(user.getUserName());
}

// Stream 操作
userList.stream()
    .filter(u -> "0".equals(u.getStatus()))    // 过滤
    .sorted(Comparator.comparing(SysUser::getUserId))  // 排序
    .collect(Collectors.toList());
```

---

### 第33章：Map 和 HashMap

**若依项目实战**:

```java
// HashMap 使用
Map<String, Object> params = new HashMap<>();
params.put("userName", "admin");
params.put("status", "0");

// 遍历
params.forEach((key, value) -> {
    System.out.println(key + "=" + value);
});

// BaseEntity 中的 params (用于 MyBatis 动态 SQL)
// ruoyi-common/src/main/java/com/ruoyi/common/core/domain/BaseEntity.java
private Map<String, Object> params;

public Map<String, Object> getParams() {
    if (params == null) {
        params = new HashMap<>();
    }
    return params;
}
```

---

## 第七阶段：反射与注解（重要！）

### 第36章：反射

**学习重点**: Class、Method、Field 反射

**若依项目实战**:

```java
// 获取类信息
Class<?> clazz = Class.forName("com.ruoyi.system.domain.SysUser");

// 获取方法
Method method = clazz.getMethod("getUserId");

// 调用方法
Object result = method.invoke(user);

// 获取字段
Field field = clazz.getDeclaredField("userName");
field.setAccessible(true);
String value = (String) field.get(user);

// 实际应用：MyBatis 反射设置值
// BeanUtils 属性复制
BeanUtils.copyProperties(source, target);  // 内部使用反射
```

---

### 第37章：注解

**学习重点**: @Override、自定义注解、注解处理器

**若依项目实战（重点！）**:

```java
// 1. 定义注解
// ruoyi-common/src/main/java/com/ruoyi/common/annotation/Log.java
@Target({ ElementType.PARAMETER, ElementType.METHOD })
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Log {                     // 自定义注解
    String title() default "";              // 注解属性
    BusinessType businessType() default BusinessType.OTHER;
}

// 2. 使用注解
// ruoyi-admin/src/main/java/com/ruoyi/web/controller/system/SysUserController.java
@Log(title = "用户管理", businessType = BusinessType.INSERT)
@PostMapping
public AjaxResult add(@RequestBody SysUser user) {
    return toAjax(userService.insertUser(user));
}

// 3. 处理注解（AOP）
// ruoyi-framework/src/main/java/com/ruoyi/framework/aspectj/LogAspect.java
@Aspect
@Component
public class LogAspect {
    // 配置织入点
    @Pointcut("@annotation(com.ruoyi.common.annotation.Log)")
    public void logPointCut() {}

    // 处理完请求后执行
    @AfterReturning(pointcut = "logPointCut()", returning = "jsonResult")
    public void doAfterReturning(JoinPoint joinPoint, Object jsonResult) {
        handleLog(joinPoint, null, jsonResult);
    }

    private void handleLog(JoinPoint joinPoint, Exception e, Object jsonResult) {
        try {
            // 获得注解
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Log controllerLog = signature.getMethod().getAnnotation(Log.class);
            String title = controllerLog.title();       // 获取注解属性
            // ... 处理日志记录
        } catch (Exception exp) {
            // 记录本地异常日志
            logger.error("==前置通知异常==");
            logger.error("异常信息:{}", exp.getMessage());
        }
    }
}
```

---

### 第38章：泛型

**学习重点**: 泛型类、泛型方法、通配符

**若依项目实战**:

```java
// 泛型类
// ruoyi-common/src/main/java/com/ruoyi/common/utils/poi/ExcelUtil.java
public class ExcelUtil<T> {                    // 泛型类
    private Class<T> clazz;

    public ExcelUtil(Class<T> clazz) {
        this.clazz = clazz;
    }

    public List<T> importExcel(InputStream is) {
        // 使用反射创建泛型对象
        List<T> list = new ArrayList<>();
        Field[] fields = clazz.getFields();
        // ...
        return list;
    }
}

// 泛型方法
// ruoyi-common/src/main/java/com/ruoyi/common/core/controller/BaseController.java
protected <T> T getEntity(Class<T> clazz, Long id) {
    return clazz.newInstance();
}

// 使用
ExcelUtil<SysUser> util = new ExcelUtil<>(SysUser.class);
List<SysUser> userList = util.importExcel(file.getInputStream());
```

---

## 第八阶段：数据库操作

### 第40章：JDBC

**学习重点**: Connection、Statement、PreparedStatement

**若依项目实战**:

```java
// 项目使用 MyBatis，但底层仍是 JDBC
// ruoyi-system/src/main/java/com/ruoyi/system/mapper/SysUserMapper.java
public interface SysUserMapper {
    // MyBatis 将 SQL 与 Java 接口映射
    List<SysUser> selectUserList(SysUser user);
}

// XML 中的 SQL（底层使用 PreparedStatement）
// ruoyi-system/src/main/resources/mapper/system/SysUserMapper.xml
<select id="selectUserList" parameterType="SysUser" resultMap="SysUserResult">
    SELECT * FROM sys_user
    WHERE user_name = #{userName}      -- PreparedStatement 参数
</select>
```

---

### 第41章：SQL 基础

**学习重点**: SELECT、INSERT、UPDATE、DELETE

**若依项目实战**:

```xml
<!-- 查询 -->
<select id="selectUserList" resultMap="SysUserResult">
    SELECT user_id, user_name, email, phonenumber
    FROM sys_user
    WHERE status = '0'
</select>

<!-- 插入 -->
<insert id="insertUser">
    INSERT INTO sys_user (user_name, email)
    VALUES (#{userName}, #{email})
</insert>

<!-- 更新 -->
<update id="updateUser">
    UPDATE sys_user
    SET email = #{email}
    WHERE user_id = #{userId}
</update>

<!-- 删除 -->
<delete id="deleteUserById">
    DELETE FROM sys_user WHERE user_id = #{userId}
</delete>
```

---

## 第九阶段：Maven 与 Spring

### 第43章：Maven 基础

**学习重点**: pom.xml、依赖管理

**若依项目实战**:

```xml
<!-- 根 pom.xml -->
<project>
    <groupId>com.ruoyi</groupId>
    <artifactId>ruoyi</artifactId>
    <version>3.8.8</version>
    <packaging>pom</packaging>

    <!-- 依赖版本管理 -->
    <properties>
        <java.version>1.8</java.version>
        <spring-boot.version>2.5.15</spring-boot.version>
    </properties>

    <!-- 依赖声明 -->
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>2.5.15</version>
                <type>pom</type>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <!-- 模块声明 -->
    <modules>
        <module>ruoyi-admin</module>
        <module>ruoyi-system</module>
        <module>ruoyi-common</module>
    </modules>
</project>
```

---

### 第44章：Spring 基础

**学习重点**: IoC、DI、Bean

**若依项目实战**:

```java
// 依赖注入（DI）
// ruoyi-system/src/main/java/com/ruoyi/system/service/impl/SysUserServiceImpl.java
@Service                                 // 声明为 Bean
public class SysUserServiceImpl implements ISysUserService {

    @Autowired                            // 自动注入
    private SysUserMapper userMapper;

    @Autowired
    private ISysRoleService roleService;
}

// Controller 使用
// ruoyi-admin/src/main/java/com/ruoyi/web/controller/system/SysUserController.java
@RestController
@RequestMapping("/system/user")
public class SysUserController extends BaseController {

    @Autowired                            // 注入 Service
    private ISysUserService userService;

    @GetMapping("/list")
    public TableDataInfo list(SysUser user) {
        startPage();
        List<SysUser> list = userService.selectUserList(user);
        return getDataTable(list);
    }
}
```

---

### 第45章：Spring Boot

**学习重点**: 自动配置、Embedded Server

**若依项目实战**:

```java
// 启动类
// ruoyi-admin/src/main/java/com/ruoyi/RuoYiApplication.java
@SpringBootApplication                  // Spring Boot 核心注解
public class RuoYiApplication {
    public static void main(String[] args) {
        SpringApplication.run(RuoYiApplication.class, args);
    }
}

// 配置文件
# application.yml
server:
  port: 8080                            # 内嵌 Tomcat 端口

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/ry-vue
    username: root
```

---

## 学习建议

### 学习顺序

1. **每天 1-2 章**，不要贪多
2. **每学一章，在若依项目中找对应代码**
3. **动手实践**：修改代码、添加功能
4. **记录笔记**：写博客或 Markdown

### 实践项目

学完相应章节后，在若依项目中：

| 学习阶段 | 实践任务 |
|----------|----------|
| 基础语法 | 添加一个工具类方法 |
| 面向对象 | 创建一个实体类 |
| 集合框架 | 添加一个列表查询功能 |
| 注解反射 | 理解 @PreAuthorize 如何工作 |
| Spring | 添加一个 Controller 接口 |

### 推荐工具

- **IDE**: IntelliJ IDEA
- **调试**: 学会打断点、查看变量
- **Git**: 提交代码、对比变更
- **Maven**: 理解依赖管理

---

## 学习检查清单

### Java 基础
- [ ] 能理解变量、数据类型
- [ ] 能使用 if-else、for、while
- [ ] 能定义和使用数组
- [ ] 能理解类和对象

### 面向对象
- [ ] 能创建类和对象
- [ ] 理解继承、封装、多态
- [ ] 能使用接口和抽象类
- [ ] 理解 static 和 final

### 核心类库
- [ ] 能使用 String、StringBuilder
- [ ] 能使用 List、Map 集合
- [ ] 能使用日期工具类
- [ ] 能处理异常

### 进阶内容
- [ ] 理解反射原理
- [ ] 理解注解和使用
- [ ] 理解泛型
- [ ] 能使用 MyBatis 操作数据库

### Spring
- [ ] 理解 IoC 和 DI
- [ ] 能使用 @Autowired
- [ ] 能创建 Controller
- [ ] 能配置 application.yml

---

**记住：理论学习 + 项目实践 = 快速掌握！**
