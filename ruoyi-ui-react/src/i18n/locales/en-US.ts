export default {
  // Common buttons
  search: 'Search',
  reset: 'Reset',
  add: 'Add',
  edit: 'Edit',
  delete: 'Delete',
  confirm: 'OK',
  cancel: 'Cancel',
  save: 'Save',
  submit: 'Submit',
  export: 'Export',
  import: 'Import',
  refresh: 'Refresh',
  refreshCache: 'Refresh Cache',
  clean: 'Clean',
  detail: 'Detail',
  back: 'Back',
  close: 'Close',
  yes: 'Yes',
  no: 'No',

  // Common messages
  confirmDelete: 'Are you sure to delete?',
  deleteSuccess: 'Deleted successfully',
  addSuccess: 'Added successfully',
  editSuccess: 'Updated successfully',
  operationSuccess: 'Operation successful',
  pleaseSelectData: 'Please select data to delete',
  loading: 'Loading...',
  noData: 'No data',

  // Status
  status: 'Status',
  normal: 'Normal',
  disabled: 'Disabled',
  enable: 'Enable',

  // Pagination
  total: 'Total {{count}} items',
  itemsPerPage: '{{count}} / page',

  // Common fields
  createTime: 'Created At',
  createBy: 'Created By',
  updateTime: 'Updated At',
  remark: 'Remark',
  operation: 'Actions',
  serialNo: 'No.',

  // Login
  login: {
    title: 'RuoYi Management System',
    username: 'Username',
    password: 'Password',
    captcha: 'Captcha',
    rememberMe: 'Remember me',
    loginBtn: 'Sign In',
    loggingIn: 'Signing in...',
    register: 'Register now',
    usernameRequired: 'Please enter your username',
    passwordRequired: 'Please enter your password',
    captchaRequired: 'Please enter the captcha',
    loginFailed: 'Login failed',
    sessionExpired: 'Session expired',
    relogin: 'Re-login',
  },

  // Navbar
  navbar: {
    home: 'Home',
    profile: 'Profile',
    layoutSettings: 'Layout Settings',
    logout: 'Logout',
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit Fullscreen',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    switchLang: 'Switch Language',
  },

  // TagsView
  tagsView: {
    refreshPage: 'Refresh',
    closeCurrent: 'Close Current',
    closeOthers: 'Close Others',
    closeLeft: 'Close Left',
    closeRight: 'Close Right',
    closeAll: 'Close All',
  },

  // Menu
  menu: {
    system: 'System',
    monitor: 'Monitor',
    tool: 'Tools',
    user: 'User',
    role: 'Role',
    menu: 'Menu',
    dept: 'Department',
    dict: 'Dictionary',
    dictData: 'Dict Data',
    config: 'Config',
    notice: 'Notice',
    post: 'Post',
    operlog: 'Operation Log',
    logininfor: 'Login Log',
    job: 'Job',
    jobLog: 'Job Log',
    online: 'Online Users',
    gen: 'Code Gen',
    build: 'Form Builder',
    profile: 'Profile',
  },

  // Dashboard
  dashboard: {
    title: 'RuoYi React Admin',
    subtitle: 'A full-stack admin solution based on React 18 + Ant Design 5 + TypeScript',
    freeOpenSource: 'Open Source',
    techStack: 'Tech Stack',
    backendTech: 'Backend',
    frontendTech: 'Frontend',
    features: 'Features',
    changelog: 'Changelog',
    website: 'Website',
    techExchange: 'Community',
    repo: 'Repository',
  },

  // User
  user: {
    userId: 'User ID',
    userName: 'Username',
    nickName: 'Nickname',
    dept: 'Department',
    phone: 'Phone',
    email: 'Email',
    sex: 'Gender',
    male: 'Male',
    female: 'Female',
    resetPwd: 'Reset Pwd',
    resetPwdConfirm: 'Reset password to admin123?',
    assignRole: 'Assign Role',
    addUser: 'Add User',
    editUser: 'Edit User',
    password: 'Password',
  },

  // Role
  role: {
    roleId: 'Role ID',
    roleName: 'Role Name',
    roleKey: 'Role Key',
    roleSort: 'Sort',
    menuPerm: 'Menu Permission',
    addRole: 'Add Role',
    editRole: 'Edit Role',
    menuPermUpdateSuccess: 'Menu permission updated',
  },

  // Menu management
  menuMgmt: {
    menuName: 'Menu Name',
    icon: 'Icon',
    sort: 'Sort',
    perms: 'Permission',
    component: 'Component',
    menuType: 'Menu Type',
    directory: 'Directory',
    menu: 'Menu',
    button: 'Button',
    routePath: 'Route Path',
    parentMenu: 'Parent Menu',
    addMenu: 'Add Menu',
    editMenu: 'Edit Menu',
  },

  // Department
  dept: {
    deptName: 'Department Name',
    parentDept: 'Parent Department',
    sort: 'Sort',
    leader: 'Leader',
    phone: 'Phone',
    addDept: 'Add Department',
    editDept: 'Edit Department',
  },

  // Dictionary
  dictMgmt: {
    dictId: 'Dict ID',
    dictName: 'Dict Name',
    dictType: 'Dict Type',
    dictCode: 'Dict Code',
    dictLabel: 'Dict Label',
    dictValue: 'Dict Value',
    dictSort: 'Sort',
    addType: 'Add Dict Type',
    editType: 'Edit Dict Type',
    addData: 'Add Dict Data',
    editData: 'Edit Dict Data',
  },

  // Config
  configMgmt: {
    configId: 'Config ID',
    configName: 'Config Name',
    configKey: 'Config Key',
    configValue: 'Config Value',
    systemBuiltIn: 'Built-in',
    addConfig: 'Add Config',
    editConfig: 'Edit Config',
  },

  // Notice
  noticeMgmt: {
    noticeId: 'ID',
    noticeTitle: 'Title',
    noticeType: 'Type',
    noticeContent: 'Content',
    addNotice: 'Add Notice',
    editNotice: 'Edit Notice',
  },

  // Post
  postMgmt: {
    postId: 'Post ID',
    postCode: 'Post Code',
    postName: 'Post Name',
    postSort: 'Sort',
    addPost: 'Add Post',
    editPost: 'Edit Post',
  },

  // Operation log
  operlog: {
    operId: 'Log ID',
    title: 'Module',
    businessType: 'Type',
    requestMethod: 'Method',
    operName: 'Operator',
    operIp: 'IP Address',
    operTime: 'Time',
    costTime: 'Duration',
    milliseconds: '{{time}}ms',
    detail: 'Log Detail',
    operUrl: 'Request URL',
    operParam: 'Request Params',
    jsonResult: 'Response',
    errorMsg: 'Error Message',
  },

  // Login log
  logininfor: {
    infoId: 'Log ID',
    userName: 'Username',
    loginStatus: 'Status',
    description: 'Description',
    accessTime: 'Access Time',
    unlock: 'Unlock',
    unlockConfirm: 'Unlock user {{name}}?',
    unlockSuccess: 'User {{name}} unlocked',
  },

  // Online users
  online: {
    tokenId: 'Token ID',
    loginName: 'Username',
    host: 'Host',
    loginTime: 'Login Time',
    forceLogout: 'Force Logout',
    forceLogoutConfirm: 'Force logout user {{name}}?',
  },

  // Job
  job: {
    jobId: 'Job ID',
    jobName: 'Job Name',
    jobGroup: 'Job Group',
    invokeTarget: 'Invoke Target',
    cronExpression: 'Cron Expression',
    addJob: 'Add Job',
    editJob: 'Edit Job',
    pause: 'Pause',
    resume: 'Resume',
    runOnce: 'Run Once',
    misfirePolicy: 'Misfire Policy',
    immediate: 'Immediate',
    executeOnce: 'Execute Once',
    abandon: 'Abandon',
    concurrent: 'Concurrent',
    allow: 'Allow',
    forbid: 'Forbid',
  },

  // Job log
  jobLog: {
    jobLogId: 'Log ID',
    jobMessage: 'Message',
    execStatus: 'Status',
    execTime: 'Time',
  },

  // Code generator
  gen: {
    tableName: 'Table Name',
    tableComment: 'Comment',
    className: 'Class Name',
    preview: 'Preview',
    sync: 'Sync',
    generate: 'Generate',
    codePreview: 'Code Preview',
    importTable: 'Import Table',
    importSuccess: 'Import successful',
    generateSuccess: 'Generate successful',
    syncSuccess: 'Sync successful',
  },
}
