import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Card, Button, Space, Form, Input, Select, Switch, Slider, InputNumber,
  Radio, Checkbox, Rate, DatePicker, Upload, ColorPicker, Row, Col, Tabs,
  Modal, message, Tooltip, Divider, Tree, Collapse,
} from 'antd'
import {
  PlusOutlined, DeleteOutlined, CopyOutlined, DownloadOutlined,
  CodeOutlined, ClearOutlined, EditOutlined, DragOutlined,
} from '@ant-design/icons'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { saveAs } from 'file-saver'
import {
  formConf, inputComponents, selectComponents, layoutComponents, trigger,
  type ComponentConfig, type FormConf,
} from '@/utils/generator/config'
import { getDefaultDrawingList } from '@/utils/generator/drawingDefault'

let idGlobal = 100

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/** 克隆组件配置，分配新 ID */
function cloneComponent(origin: ComponentConfig): ComponentConfig {
  const clone = deepClone(origin)
  clone.formId = ++idGlobal
  clone.renderKey = Date.now()
  if (clone.layout === 'rowFormItem') {
    clone.componentName = `row${clone.formId}`
    clone.children = clone.children || []
  } else {
    clone.vModel = `field${clone.formId}`
  }
  return clone
}

/** 动态渲染画布上的组件预览 */
function CanvasComponent({ config }: { config: ComponentConfig }) {
  const { tag, disabled, placeholder, style, options, defaultValue } = config
  const commonProps: any = { disabled, style, placeholder, size: 'small' }

  switch (tag) {
    case 'Input':
      return <Input {...commonProps} defaultValue={defaultValue} />
    case 'Input.TextArea':
      return <Input.TextArea {...commonProps} rows={config.autosize?.minRows || 4} defaultValue={defaultValue} />
    case 'Input.Password':
      return <Input.Password {...commonProps} defaultValue={defaultValue} />
    case 'InputNumber':
      return <InputNumber {...commonProps} min={config.min} max={config.max} step={config.step} defaultValue={defaultValue} style={{ width: '100%' }} />
    case 'Select':
      return (
        <Select {...commonProps} defaultValue={defaultValue} allowClear={config.clearable}>
          {(options || []).map((o) => <Select.Option key={o.value} value={o.value}>{o.label}</Select.Option>)}
        </Select>
      )
    case 'Radio.Group':
      return (
        <Radio.Group disabled={disabled} defaultValue={defaultValue}>
          {(options || []).map((o) => <Radio key={o.value} value={o.value}>{o.label}</Radio>)}
        </Radio.Group>
      )
    case 'Checkbox.Group':
      return (
        <Checkbox.Group disabled={disabled} defaultValue={defaultValue}>
          {(options || []).map((o) => <Checkbox key={o.value} value={o.value}>{o.label}</Checkbox>)}
        </Checkbox.Group>
      )
    case 'Switch':
      return <Switch disabled={disabled} defaultChecked={defaultValue} />
    case 'Slider':
      return <Slider disabled={disabled} min={config.min} max={config.max} range={config.range} />
    case 'DatePicker':
      return <DatePicker {...commonProps} style={{ width: '100%' }} />
    case 'DatePicker.RangePicker':
      return <DatePicker.RangePicker disabled={disabled} style={{ width: '100%' }} />
    case 'Rate':
      return <Rate disabled={disabled} defaultValue={defaultValue} />
    case 'ColorPicker':
      return <ColorPicker disabled={disabled} defaultValue={defaultValue} />
    case 'Button':
      return <Button type={config.type as any} icon={config.icon ? undefined : undefined}>{config.default || '按钮'}</Button>
    default:
      return <Input placeholder={placeholder || '未知组件'} disabled />
  }
}

/** 可排序的画布项 */
function SortableCanvasItem({
  config, isActive, onSelect, onCopy, onDelete,
}: {
  config: ComponentConfig
  isActive: boolean
  onSelect: () => void
  onCopy: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: config.formId! })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`canvas-item ${isActive ? 'canvas-item-active' : ''}`}
      onClick={(e) => { e.stopPropagation(); onSelect() }}
    >
      <div className="canvas-item-actions">
        <Tooltip title="复制"><CopyOutlined onClick={(e) => { e.stopPropagation(); onCopy() }} /></Tooltip>
        <Tooltip title="删除"><DeleteOutlined onClick={(e) => { e.stopPropagation(); onDelete() }} /></Tooltip>
        <div {...attributes} {...listeners} style={{ cursor: 'grab', marginLeft: 4 }}><DragOutlined /></div>
      </div>
      <Form.Item
        label={config.label}
        required={config.required}
        style={{ marginBottom: 8 }}
      >
        <CanvasComponent config={config} />
      </Form.Item>
    </div>
  )
}

/** 左侧组件面板项 */
function PaletteItem({ config, onAdd }: { config: ComponentConfig; onAdd: () => void }) {
  return (
    <div className="palette-item" onClick={onAdd}>
      <span>{config.label}</span>
    </div>
  )
}

/** 选项编辑器（用于 Select/Radio/Checkbox） */
function OptionsEditor({
  options, onChange,
}: {
  options: Array<{ label: string; value: any }>
  onChange: (opts: Array<{ label: string; value: any }>) => void
}) {
  const add = () => onChange([...options, { label: `选项${options.length + 1}`, value: options.length + 1 }])
  const remove = (idx: number) => onChange(options.filter((_, i) => i !== idx))
  const update = (idx: number, key: string, val: any) => {
    const next = [...options]
    ;(next[idx] as any)[key] = val
    onChange(next)
  }

  return (
    <div>
      {options.map((opt, idx) => (
        <div key={idx} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
          <Input size="small" value={opt.label} onChange={(e) => update(idx, 'label', e.target.value)} placeholder="标签" style={{ flex: 1 }} />
          <Input size="small" value={opt.value} onChange={(e) => update(idx, 'value', e.target.value)} placeholder="值" style={{ flex: 1 }} />
          <Button size="small" danger onClick={() => remove(idx)}>删</Button>
        </div>
      ))}
      <Button size="small" type="dashed" block onClick={add}>添加选项</Button>
    </div>
  )
}

/** 代码生成器 */
function generateCode(drawingList: ComponentConfig[], conf: FormConf): string {
  const fields: string[] = []
  const rules: string[] = []
  const formItems: string[] = []

  drawingList.forEach((item) => {
    if (item.layout === 'rowFormItem') {
      const children = (item.children || []).map((child) => {
        if (child.vModel) fields.push(`  ${child.vModel}: ${JSON.stringify(child.defaultValue ?? '')},`)
        return `          <Col span={${child.span || 12}}>
            <Form.Item name="${child.vModel}" label="${child.label}"${child.required ? ' rules={[{ required: true }]}' : ''}>
              <${child.tag} placeholder="${child.placeholder || ''}" />
            </Form.Item>
          </Col>`
      }).join('\n')
      formItems.push(`        <Row gutter={${conf.gutter}}>\n${children}\n        </Row>`)
    } else {
      if (item.vModel) fields.push(`  ${item.vModel}: ${JSON.stringify(item.defaultValue ?? '')},`)
      formItems.push(`        <Form.Item name="${item.vModel}" label="${item.label}"${item.required ? ' rules={[{ required: true }]}' : ''}>
          <${item.tag} placeholder="${item.placeholder || ''}" />
        </Form.Item>`)
    }

    if (item.required && item.vModel && item.tag && trigger[item.tag]) {
      rules.push(`  ${item.vModel}: [{ required: true, message: '请输入${item.label}', trigger: '${trigger[item.tag]}' }],`)
    }
  })

  return `import { useState } from 'react'
import { Form, Input, Select, Button, Row, Col, message } from 'antd'

export default function GeneratedForm() {
  const [form] = Form.useForm()
  const [formData] = useState({
${fields.join('\n')}
  })

  const rules = {
${rules.join('\n')}
  }

  const handleSubmit = (values: any) => {
    console.log('表单数据:', values)
    message.success('提交成功')
  }

  return (
    <Form form={form} initialValues={formData} onFinish={handleSubmit}
      labelCol={{ span: ${Math.round(conf.labelWidth / 10)} }} wrapperCol={{ span: ${24 - Math.round(conf.labelWidth / 10)} }}>
${formItems.join('\n')}
${conf.formBtns ? `      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">提交</Button>
          <Button onClick={() => form.resetFields()}>重置</Button>
        </Space>
      </Form.Item>` : ''}
    </Form>
  )
}`
}

/** 主页面 */
export default function FormBuilder() {
  const [drawingList, setDrawingList] = useState<ComponentConfig[]>(getDefaultDrawingList())
  const [activeId, setActiveId] = useState<number | null>(getDefaultDrawingList()[0]?.formId || null)
  const [conf, setConf] = useState<FormConf>({ ...formConf })
  const [activeTab, setActiveTab] = useState('field')
  const [codeModalOpen, setCodeModalOpen] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const activeData = drawingList.find((d) => d.formId === activeId) || null

  /** 添加组件到画布 */
  const addComponent = useCallback((config: ComponentConfig) => {
    const newComp = cloneComponent(config)
    setDrawingList((prev) => [...prev, newComp])
    setActiveId(newComp.formId!)
  }, [])

  /** 拖拽排序 */
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setDrawingList((prev) => {
      const oldIndex = prev.findIndex((d) => d.formId === active.id)
      const newIndex = prev.findIndex((d) => d.formId === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }, [])

  /** 复制组件 */
  const copyItem = useCallback((config: ComponentConfig) => {
    const newComp = cloneComponent(config)
    setDrawingList((prev) => [...prev, newComp])
    setActiveId(newComp.formId!)
  }, [])

  /** 删除组件 */
  const deleteItem = useCallback((formId: number) => {
    setDrawingList((prev) => {
      const next = prev.filter((d) => d.formId !== formId)
      if (activeId === formId) {
        setActiveId(next.length > 0 ? next[next.length - 1].formId! : null)
      }
      return next
    })
  }, [activeId])

  /** 更新当前选中组件的属性 */
  const updateActiveData = useCallback((key: string, value: any) => {
    if (!activeId) return
    setDrawingList((prev) =>
      prev.map((d) => d.formId === activeId ? { ...d, [key]: value } : d)
    )
  }, [activeId])

  /** 清空画布 */
  const clearAll = () => {
    setDrawingList([])
    setActiveId(null)
  }

  /** 生成代码 */
  const handleGenerate = () => {
    const code = generateCode(drawingList, conf)
    setGeneratedCode(code)
    setCodeModalOpen(true)
  }

  /** 下载代码 */
  const handleDownload = () => {
    const code = generateCode(drawingList, conf)
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, `generated-form.tsx`)
    message.success('下载成功')
  }

  /** 复制代码 */
  const handleCopy = async () => {
    const code = generateCode(drawingList, conf)
    await navigator.clipboard.writeText(code)
    message.success('已复制到剪贴板')
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 100px)', gap: 0, background: '#f5f5f5', borderRadius: 8, overflow: 'hidden' }}>
      {/* 左侧：组件面板 */}
      <div style={{ width: 260, background: '#fff', borderRight: '1px solid #e8e8e8', overflow: 'auto', padding: 12 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: '#333' }}>输入型组件</div>
        <div className="palette-grid">
          {inputComponents.map((c, i) => (
            <PaletteItem key={`input-${i}`} config={c} onAdd={() => addComponent(c)} />
          ))}
        </div>

        <Divider style={{ margin: '12px 0' }} />
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: '#333' }}>选择型组件</div>
        <div className="palette-grid">
          {selectComponents.map((c, i) => (
            <PaletteItem key={`select-${i}`} config={c} onAdd={() => addComponent(c)} />
          ))}
        </div>

        <Divider style={{ margin: '12px 0' }} />
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: '#333' }}>布局组件</div>
        <div className="palette-grid">
          {layoutComponents.map((c, i) => (
            <PaletteItem key={`layout-${i}`} config={c} onAdd={() => addComponent(c)} />
          ))}
        </div>
      </div>

      {/* 中间：画布 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f0f2f5' }}>
        {/* 操作栏 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#fff', borderBottom: '1px solid #e8e8e8' }}>
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleDownload}>导出文件</Button>
            <Button icon={<CopyOutlined />} onClick={handleCopy}>复制代码</Button>
            <Button icon={<ClearOutlined />} danger onClick={clearAll}>清空</Button>
          </Space>
          <span style={{ color: '#999', fontSize: 13 }}>共 {drawingList.length} 个组件</span>
        </div>

        {/* 画布区域 */}
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          <div style={{ minHeight: 400, background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            {drawingList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: '#bbb' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>+</div>
                <div>从左侧拖入组件或点击添加</div>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={drawingList.map((d) => d.formId!)} strategy={verticalListSortingStrategy}>
                  {drawingList.map((config) => (
                    <SortableCanvasItem
                      key={config.formId}
                      config={config}
                      isActive={config.formId === activeId}
                      onSelect={() => setActiveId(config.formId!)}
                      onCopy={() => copyItem(config)}
                      onDelete={() => deleteItem(config.formId!)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </div>

      {/* 右侧：属性面板 */}
      <div style={{ width: 350, background: '#fff', borderLeft: '1px solid #e8e8e8', overflow: 'auto' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'field',
              label: '组件属性',
              children: activeData ? (
                <div style={{ padding: '0 12px 12px' }}>
                  <Form layout="vertical" size="small">
                    {activeData.changeTag && (
                      <Form.Item label="组件类型">
                        <Select value={activeData.tag} onChange={(val) => updateActiveData('tag', val)}>
                          {[...inputComponents, ...selectComponents].filter((c) => c.changeTag).map((c) => (
                            <Select.Option key={c.tag} value={c.tag}>{c.label}</Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    )}
                    {activeData.vModel !== undefined && (
                      <Form.Item label="字段名"><Input value={activeData.vModel} onChange={(e) => updateActiveData('vModel', e.target.value)} /></Form.Item>
                    )}
                    <Form.Item label="标题"><Input value={activeData.label} onChange={(e) => updateActiveData('label', e.target.value)} /></Form.Item>
                    {activeData.placeholder !== undefined && (
                      <Form.Item label="占位符"><Input value={activeData.placeholder} onChange={(e) => updateActiveData('placeholder', e.target.value)} /></Form.Item>
                    )}
                    {activeData.span !== undefined && (
                      <Form.Item label={`栅栏宽度: ${activeData.span}`}><Slider min={1} max={24} value={activeData.span} onChange={(v) => updateActiveData('span', v)} /></Form.Item>
                    )}
                    {activeData.defaultValue !== undefined && (
                      <Form.Item label="默认值"><Input value={String(activeData.defaultValue ?? '')} onChange={(e) => updateActiveData('defaultValue', e.target.value)} /></Form.Item>
                    )}
                    {activeData.maxlength !== undefined && (
                      <Form.Item label="最大长度"><InputNumber value={activeData.maxlength ?? undefined} onChange={(v) => updateActiveData('maxlength', v)} style={{ width: '100%' }} /></Form.Item>
                    )}
                    {activeData.min !== undefined && activeData.tag === 'InputNumber' && (
                      <Form.Item label="最小值"><InputNumber value={activeData.min} onChange={(v) => updateActiveData('min', v)} style={{ width: '100%' }} /></Form.Item>
                    )}
                    {activeData.max !== undefined && activeData.tag === 'InputNumber' && (
                      <Form.Item label="最大值"><InputNumber value={activeData.max} onChange={(v) => updateActiveData('max', v)} style={{ width: '100%' }} /></Form.Item>
                    )}
                    {activeData.step !== undefined && (
                      <Form.Item label="步长"><InputNumber value={activeData.step} onChange={(v) => updateActiveData('step', v)} style={{ width: '100%' }} /></Form.Item>
                    )}
                    {activeData.options && (
                      <Form.Item label="选项配置"><OptionsEditor options={activeData.options} onChange={(v) => updateActiveData('options', v)} /></Form.Item>
                    )}
                    <Divider style={{ margin: '8px 0' }} />
                    {activeData.clearable !== undefined && <Form.Item label="可清空"><Switch checked={activeData.clearable} onChange={(v) => updateActiveData('clearable', v)} /></Form.Item>}
                    {activeData.disabled !== undefined && <Form.Item label="禁用"><Switch checked={activeData.disabled} onChange={(v) => updateActiveData('disabled', v)} /></Form.Item>}
                    {activeData.required !== undefined && <Form.Item label="必填"><Switch checked={activeData.required} onChange={(v) => updateActiveData('required', v)} /></Form.Item>}
                    {activeData.readonly !== undefined && <Form.Item label="只读"><Switch checked={activeData.readonly} onChange={(v) => updateActiveData('readonly', v)} /></Form.Item>}
                    {activeData.showWordLimit !== undefined && <Form.Item label="字数统计"><Switch checked={activeData.showWordLimit} onChange={(v) => updateActiveData('showWordLimit', v)} /></Form.Item>}
                    {activeData.multiple !== undefined && <Form.Item label="多选"><Switch checked={activeData.multiple} onChange={(v) => updateActiveData('multiple', v)} /></Form.Item>}
                    {activeData.filterable !== undefined && <Form.Item label="可搜索"><Switch checked={activeData.filterable} onChange={(v) => updateActiveData('filterable', v)} /></Form.Item>}
                    {activeData.range !== undefined && <Form.Item label="范围选择"><Switch checked={activeData.range} onChange={(v) => updateActiveData('range', v)} /></Form.Item>}
                  </Form>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: '#bbb' }}>请在画布中选择一个组件</div>
              ),
            },
            {
              key: 'form',
              label: '表单属性',
              children: (
                <div style={{ padding: '0 12px 12px' }}>
                  <Form layout="vertical" size="small">
                    <Form.Item label="表单引用"><Input value={conf.formRef} onChange={(e) => setConf((c) => ({ ...c, formRef: e.target.value }))} /></Form.Item>
                    <Form.Item label="数据模型"><Input value={conf.formModel} onChange={(e) => setConf((c) => ({ ...c, formModel: e.target.value }))} /></Form.Item>
                    <Form.Item label="组件尺寸">
                      <Select value={conf.size} onChange={(v) => setConf((c) => ({ ...c, size: v }))}>
                        <Select.Option value="large">大</Select.Option>
                        <Select.Option value="middle">中</Select.Option>
                        <Select.Option value="small">小</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item label="标签位置">
                      <Radio.Group value={conf.labelPosition} onChange={(e) => setConf((c) => ({ ...c, labelPosition: e.target.value }))}>
                        <Radio value="left">左</Radio>
                        <Radio value="right">右</Radio>
                        <Radio value="top">顶部</Radio>
                      </Radio.Group>
                    </Form.Item>
                    <Form.Item label={`标签宽度: ${conf.labelWidth}`}><Slider min={0} max={200} value={conf.labelWidth} onChange={(v) => setConf((c) => ({ ...c, labelWidth: v }))} /></Form.Item>
                    <Form.Item label={`栅栏间隔: ${conf.gutter}`}><Slider min={0} max={40} value={conf.gutter} onChange={(v) => setConf((c) => ({ ...c, gutter: v }))} /></Form.Item>
                    <Form.Item label="禁用表单"><Switch checked={conf.disabled} onChange={(v) => setConf((c) => ({ ...c, disabled: v }))} /></Form.Item>
                    <Form.Item label="显示按钮"><Switch checked={conf.formBtns} onChange={(v) => setConf((c) => ({ ...c, formBtns: v }))} /></Form.Item>
                  </Form>
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* 代码预览弹窗 */}
      <Modal
        title="代码预览"
        open={codeModalOpen}
        onCancel={() => setCodeModalOpen(false)}
        width={900}
        footer={[
          <Button key="copy" icon={<CopyOutlined />} onClick={handleCopy}>复制代码</Button>,
          <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>下载文件</Button>,
        ]}
      >
        <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4, maxHeight: 500, overflow: 'auto', fontSize: 13, lineHeight: 1.6 }}>
          {generatedCode}
        </pre>
      </Modal>

      {/* 样式 */}
      <style>{`
        .palette-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .palette-item {
          padding: 8px 12px;
          background: #f5f7fa;
          border: 1px solid #e4e7ed;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          text-align: center;
          transition: all 0.2s;
          color: #333;
        }
        .palette-item:hover {
          background: #ecf5ff;
          border-color: #409eff;
          color: #409eff;
        }
        .canvas-item {
          position: relative;
          padding: 12px;
          margin-bottom: 8px;
          border: 1px dashed #d9d9d9;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .canvas-item:hover { border-color: #409eff; }
        .canvas-item-active { border-color: #409eff; border-style: solid; background: #ecf5ff; }
        .canvas-item-actions {
          position: absolute;
          top: -12px;
          right: 8px;
          display: none;
          gap: 4px;
          background: #409eff;
          border-radius: 4px;
          padding: 2px 6px;
          color: #fff;
          font-size: 12px;
          z-index: 10;
        }
        .canvas-item:hover .canvas-item-actions, .canvas-item-active .canvas-item-actions {
          display: flex;
        }
        .canvas-item-actions .anticon { cursor: pointer; padding: 2px; }
        .canvas-item-actions .anticon:hover { opacity: 0.8; }
      `}</style>
    </div>
  )
}
