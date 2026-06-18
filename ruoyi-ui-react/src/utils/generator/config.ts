/** 表单全局配置 */
export const formConf: FormConf = {
  formRef: 'formRef',
  formModel: 'formData',
  size: 'middle',
  labelPosition: 'right',
  labelWidth: 100,
  formRules: 'rules',
  gutter: 15,
  disabled: false,
  span: 24,
  formBtns: true,
}

export interface FormConf {
  formRef: string
  formModel: string
  size: string
  labelPosition: string
  labelWidth: number
  formRules: string
  gutter: number
  disabled: boolean
  span: number
  formBtns: boolean
}

export interface ComponentConfig {
  label: string
  tag?: string
  tagIcon: string
  type?: string
  placeholder?: string
  defaultValue?: any
  span?: number
  labelWidth?: number | null
  style?: Record<string, any>
  clearable?: boolean
  disabled?: boolean
  required?: boolean
  readonly?: boolean
  maxlength?: number | null
  showWordLimit?: boolean
  prepend?: string
  append?: string
  prefixIcon?: string
  suffixIcon?: string
  autosize?: { minRows: number; maxRows: number }
  min?: number
  max?: number
  step?: number
  stepStrictly?: boolean
  precision?: number
  controlsPosition?: string
  filterable?: boolean
  multiple?: boolean
  options?: Array<{ label: string; value: any }>
  optionType?: string
  border?: boolean
  size?: string
  activeText?: string
  inactiveText?: string
  activeValue?: any
  inactiveValue?: any
  showStops?: boolean
  range?: boolean
  format?: string
  valueFormat?: string
  showAlpha?: boolean
  colorFormat?: string
  action?: string
  accept?: string
  name?: string
  autoUpload?: boolean
  showTip?: boolean
  buttonText?: string
  fileSize?: number
  sizeUnit?: string
  listType?: string
  tip?: string
  default?: string
  icon?: string
  // layout
  layout?: string
  layoutTree?: boolean
  justify?: string
  align?: string
  children?: ComponentConfig[]
  // meta
  formId?: number
  renderKey?: number
  vModel?: string
  componentName?: string
  changeTag?: boolean
  regList?: Array<{ pattern: string; message: string }>
  document?: string
}

/** 输入型组件 */
export const inputComponents: ComponentConfig[] = [
  {
    label: '单行文本',
    tag: 'Input',
    tagIcon: 'input',
    type: 'text',
    placeholder: '请输入',
    defaultValue: undefined,
    span: 24,
    labelWidth: null,
    style: { width: '100%' },
    clearable: true,
    prepend: '',
    append: '',
    prefixIcon: '',
    suffixIcon: '',
    maxlength: null,
    showWordLimit: false,
    readonly: false,
    disabled: false,
    required: true,
    regList: [],
    changeTag: true,
  },
  {
    label: '多行文本',
    tag: 'Input.TextArea',
    tagIcon: 'textarea',
    type: 'textarea',
    placeholder: '请输入',
    defaultValue: undefined,
    span: 24,
    labelWidth: null,
    autosize: { minRows: 4, maxRows: 4 },
    style: { width: '100%' },
    maxlength: null,
    showWordLimit: false,
    readonly: false,
    disabled: false,
    required: true,
    regList: [],
    changeTag: true,
  },
  {
    label: '密码',
    tag: 'Input.Password',
    tagIcon: 'password',
    type: 'password',
    placeholder: '请输入',
    defaultValue: undefined,
    span: 24,
    labelWidth: null,
    style: { width: '100%' },
    clearable: true,
    disabled: false,
    required: true,
    regList: [],
    changeTag: true,
  },
  {
    label: '数字输入',
    tag: 'InputNumber',
    tagIcon: 'number',
    placeholder: '',
    defaultValue: undefined,
    span: 24,
    labelWidth: null,
    min: undefined,
    max: undefined,
    step: 1,
    precision: undefined,
    disabled: false,
    required: true,
    regList: [],
    changeTag: true,
  },
]

/** 选择型组件 */
export const selectComponents: ComponentConfig[] = [
  {
    label: '下拉选择',
    tag: 'Select',
    tagIcon: 'select',
    placeholder: '请选择',
    defaultValue: undefined,
    span: 24,
    labelWidth: null,
    style: { width: '100%' },
    clearable: true,
    disabled: false,
    required: true,
    filterable: false,
    multiple: false,
    options: [
      { label: '选项一', value: 1 },
      { label: '选项二', value: 2 },
    ],
    regList: [],
    changeTag: true,
  },
  {
    label: '单选框组',
    tag: 'Radio.Group',
    tagIcon: 'radio',
    defaultValue: 0,
    span: 24,
    labelWidth: null,
    style: {},
    optionType: 'default',
    border: false,
    disabled: false,
    required: true,
    options: [
      { label: '选项一', value: 1 },
      { label: '选项二', value: 2 },
    ],
    regList: [],
    changeTag: true,
  },
  {
    label: '多选框组',
    tag: 'Checkbox.Group',
    tagIcon: 'checkbox',
    defaultValue: [],
    span: 24,
    labelWidth: null,
    style: {},
    optionType: 'default',
    border: false,
    disabled: false,
    required: true,
    options: [
      { label: '选项一', value: 1 },
      { label: '选项二', value: 2 },
    ],
    regList: [],
    changeTag: true,
  },
  {
    label: '开关',
    tag: 'Switch',
    tagIcon: 'switch',
    defaultValue: false,
    span: 24,
    labelWidth: null,
    style: {},
    disabled: false,
    required: true,
    activeText: '',
    inactiveText: '',
    activeValue: true,
    inactiveValue: false,
    regList: [],
    changeTag: true,
  },
  {
    label: '滑块',
    tag: 'Slider',
    tagIcon: 'slider',
    defaultValue: null,
    span: 24,
    labelWidth: null,
    disabled: false,
    required: true,
    min: 0,
    max: 100,
    step: 1,
    showStops: false,
    range: false,
    regList: [],
    changeTag: true,
  },
  {
    label: '日期选择',
    tag: 'DatePicker',
    tagIcon: 'date',
    placeholder: '请选择',
    defaultValue: null,
    type: 'date',
    span: 24,
    labelWidth: null,
    style: { width: '100%' },
    disabled: false,
    clearable: true,
    required: true,
    format: 'YYYY-MM-DD',
    valueFormat: 'YYYY-MM-DD',
    regList: [],
    changeTag: true,
  },
  {
    label: '日期范围',
    tag: 'DatePicker.RangePicker',
    tagIcon: 'date-range',
    defaultValue: null,
    span: 24,
    labelWidth: null,
    style: { width: '100%' },
    disabled: false,
    clearable: true,
    required: true,
    format: 'YYYY-MM-DD',
    valueFormat: 'YYYY-MM-DD',
    regList: [],
    changeTag: true,
  },
  {
    label: '评分',
    tag: 'Rate',
    tagIcon: 'rate',
    defaultValue: 0,
    span: 24,
    labelWidth: null,
    style: {},
    max: 5,
    disabled: false,
    required: true,
    regList: [],
    changeTag: true,
  },
  {
    label: '颜色选择',
    tag: 'ColorPicker',
    tagIcon: 'color',
    defaultValue: null,
    labelWidth: null,
    disabled: false,
    required: true,
    regList: [],
    changeTag: true,
  },
  {
    label: '上传',
    tag: 'Upload',
    tagIcon: 'upload',
    action: 'https://jsonplaceholder.typicode.com/posts/',
    defaultValue: null,
    labelWidth: null,
    disabled: false,
    required: true,
    accept: '',
    name: 'file',
    autoUpload: true,
    showTip: false,
    buttonText: '点击上传',
    fileSize: 2,
    sizeUnit: 'MB',
    listType: 'text',
    multiple: false,
    regList: [],
    changeTag: true,
    tip: '只能上传不超过 2MB 的文件',
    style: { width: '100%' },
  },
]

/** 布局组件 */
export const layoutComponents: ComponentConfig[] = [
  {
    layout: 'rowFormItem',
    tagIcon: 'row',
    type: 'default',
    justify: 'start',
    align: 'top',
    label: '行容器',
    layoutTree: true,
    children: [],
  },
  {
    layout: 'colFormItem',
    label: '按钮',
    changeTag: true,
    labelWidth: null,
    tag: 'Button',
    tagIcon: 'button',
    span: 24,
    default: '主要按钮',
    type: 'primary',
    icon: 'Search',
    size: 'middle',
    disabled: false,
  },
]

/** 组件验证触发方式 */
export const trigger: Record<string, string> = {
  'Input': 'onBlur',
  'InputNumber': 'onBlur',
  'Select': 'onChange',
  'Radio.Group': 'onChange',
  'Checkbox.Group': 'onChange',
  'DatePicker': 'onChange',
  'DatePicker.RangePicker': 'onChange',
  'Rate': 'onChange',
}
