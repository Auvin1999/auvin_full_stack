export default {
  // 通用按钮
  search: '搜索',
  reset: '重置',
  add: '新增',
  edit: '修改',
  delete: '删除',
  confirm: '确定',
  cancel: '取消',
  save: '保存',
  submit: '提交',
  export: '导出',
  import: '导入',
  refresh: '刷新',
  refreshCache: '刷新缓存',
  clean: '清空',
  detail: '详情',
  back: '返回',
  close: '关闭',
  yes: '是',
  no: '否',

  // 通用提示
  confirmDelete: '确认删除？',
  deleteSuccess: '删除成功',
  addSuccess: '新增成功',
  editSuccess: '修改成功',
  operationSuccess: '操作成功',
  pleaseSelectData: '请选择要删除的数据',
  loading: '加载中...',
  noData: '暂无数据',

  // 状态
  status: '状态',
  normal: '正常',
  disabled: '停用',
  enable: '启用',

  // 分页
  total: '共 {{count}} 条',
  itemsPerPage: '{{count}} 条/页',

  // 通用字段
  createTime: '创建时间',
  createBy: '创建者',
  updateTime: '更新时间',
  remark: '备注',
  operation: '操作',
  serialNo: '序号',

  // 登录
  login: {
    title: '若依管理系统',
    username: '账号',
    password: '密码',
    captcha: '验证码',
    rememberMe: '记住密码',
    loginBtn: '登 录',
    loggingIn: '登 录中...',
    register: '立即注册',
    usernameRequired: '请输入您的账号',
    passwordRequired: '请输入您的密码',
    captchaRequired: '请输入验证码',
    loginFailed: '登录失败',
    sessionExpired: '登录状态已过期',
    relogin: '重新登录',
  },

  // Navbar
  navbar: {
    home: '首页',
    profile: '个人中心',
    layoutSettings: '布局设置',
    logout: '退出登录',
    fullscreen: '全屏',
    exitFullscreen: '退出全屏',
    darkMode: '深色模式',
    lightMode: '浅色模式',
    switchLang: '切换语言',
  },

  // TagsView
  tagsView: {
    refreshPage: '刷新页面',
    closeCurrent: '关闭当前',
    closeOthers: '关闭其他',
    closeLeft: '关闭左侧',
    closeRight: '关闭右侧',
    closeAll: '全部关闭',
  },

  // 菜单
  menu: {
    system: '系统管理',
    monitor: '系统监控',
    tool: '系统工具',
    user: '用户管理',
    role: '角色管理',
    menu: '菜单管理',
    dept: '部门管理',
    dict: '字典管理',
    dictData: '字典数据',
    config: '参数设置',
    notice: '通知公告',
    post: '岗位管理',
    operlog: '操作日志',
    logininfor: '登录日志',
    job: '定时任务',
    jobLog: '调度日志',
    online: '在线用户',
    gen: '代码生成',
    build: '表单构建',
    profile: '个人中心',
  },

  // 首页
  dashboard: {
    title: '若依管理系统 React 版',
    subtitle: '一套基于 React 18 + Ant Design 5 + TypeScript 的后台管理系统前端解决方案',
    freeOpenSource: '免费开源',
    techStack: '技术栈',
    backendTech: '后端技术',
    frontendTech: '前端技术',
    features: '功能特性',
    changelog: '更新日志',
    website: '官方网站',
    techExchange: '技术交流',
    repo: '前端仓库',
  },

  // 用户管理
  user: {
    userId: '用户编号',
    userName: '用户名称',
    nickName: '用户昵称',
    dept: '部门',
    phone: '手机号码',
    email: '邮箱',
    sex: '用户性别',
    male: '男',
    female: '女',
    resetPwd: '重置',
    resetPwdConfirm: '确认重置密码为 admin123？',
    assignRole: '分配角色',
    addUser: '添加用户',
    editUser: '修改用户',
    password: '用户密码',
  },

  // 角色管理
  role: {
    roleId: '角色编号',
    roleName: '角色名称',
    roleKey: '权限字符',
    roleSort: '角色排序',
    menuPerm: '菜单权限',
    addRole: '添加角色',
    editRole: '修改角色',
    menuPermUpdateSuccess: '菜单权限更新成功',
  },

  // 菜单管理
  menuMgmt: {
    menuName: '菜单名称',
    icon: '图标',
    sort: '排序',
    perms: '权限标识',
    component: '组件路径',
    menuType: '菜单类型',
    directory: '目录',
    menu: '菜单',
    button: '按钮',
    routePath: '路由地址',
    parentMenu: '上级菜单',
    addMenu: '添加菜单',
    editMenu: '修改菜单',
  },

  // 部门管理
  dept: {
    deptName: '部门名称',
    parentDept: '上级部门',
    sort: '显示排序',
    leader: '负责人',
    phone: '联系电话',
    addDept: '添加部门',
    editDept: '修改部门',
  },

  // 字典管理
  dictMgmt: {
    dictId: '字典编号',
    dictName: '字典名称',
    dictType: '字典类型',
    dictCode: '字典编码',
    dictLabel: '字典标签',
    dictValue: '字典键值',
    dictSort: '字典排序',
    addType: '添加字典类型',
    editType: '修改字典类型',
    addData: '添加字典数据',
    editData: '修改字典数据',
  },

  // 参数配置
  configMgmt: {
    configId: '参数主键',
    configName: '参数名称',
    configKey: '参数键名',
    configValue: '参数键值',
    systemBuiltIn: '系统内置',
    addConfig: '添加参数',
    editConfig: '修改参数',
  },

  // 通知公告
  noticeMgmt: {
    noticeId: '序号',
    noticeTitle: '公告标题',
    noticeType: '公告类型',
    noticeContent: '内容',
    addNotice: '添加公告',
    editNotice: '修改公告',
  },

  // 岗位管理
  postMgmt: {
    postId: '岗位编号',
    postCode: '岗位编码',
    postName: '岗位名称',
    postSort: '岗位排序',
    addPost: '添加岗位',
    editPost: '修改岗位',
  },

  // 操作日志
  operlog: {
    operId: '日志编号',
    title: '系统模块',
    businessType: '操作类型',
    requestMethod: '请求方式',
    operName: '操作人员',
    operIp: '操作地址',
    operTime: '操作日期',
    costTime: '消耗时间',
    milliseconds: '{{time}}毫秒',
    detail: '操作日志详情',
    operUrl: '请求URL',
    operParam: '请求参数',
    jsonResult: '返回参数',
    errorMsg: '错误信息',
  },

  // 登录日志
  logininfor: {
    infoId: '访问编号',
    userName: '用户名称',
    loginStatus: '登录状态',
    description: '描述',
    accessTime: '访问时间',
    unlock: '解锁',
    unlockConfirm: '确认解锁用户 {{name}}？',
    unlockSuccess: '用户 {{name}} 解锁成功',
  },

  // 在线用户
  online: {
    tokenId: '会话编号',
    loginName: '登录名称',
    host: '主机',
    loginTime: '登录时间',
    forceLogout: '强退',
    forceLogoutConfirm: '确认强退用户 {{name}}？',
  },

  // 定时任务
  job: {
    jobId: '任务编号',
    jobName: '任务名称',
    jobGroup: '任务组名',
    invokeTarget: '调用目标字符串',
    cronExpression: 'cron执行表达式',
    addJob: '添加任务',
    editJob: '修改任务',
    pause: '暂停',
    resume: '恢复',
    runOnce: '执行一次',
    misfirePolicy: '执行策略',
    immediate: '立即执行',
    executeOnce: '执行一次',
    abandon: '放弃执行',
    concurrent: '是否并发',
    allow: '允许',
    forbid: '禁止',
  },

  // 调度日志
  jobLog: {
    jobLogId: '日志编号',
    jobMessage: '日志信息',
    execStatus: '执行状态',
    execTime: '执行时间',
  },

  // 代码生成
  gen: {
    tableName: '表名称',
    tableComment: '表描述',
    className: '实体类名称',
    preview: '预览',
    sync: '同步',
    generate: '生成',
    codePreview: '代码预览',
    importTable: '导入表',
    importSuccess: '导入成功',
    generateSuccess: '生成成功',
    syncSuccess: '同步成功',
  },
}
