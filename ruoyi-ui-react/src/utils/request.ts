import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { message, Modal, notification } from 'antd'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import { tansParams, blobValidate } from '@/utils/ruoyi'
import { saveAs } from 'file-saver'
import { useUserStore } from '@/store/useUserStore'

// 是否显示重新登录
export const isRelogin = { show: false }

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 10000
})

// request拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 是否需要设置 token
    const isToken = (config.headers || {}).isToken === false
    // 是否需要防止数据重复提交
    const isRepeatSubmit = (config.headers || {}).repeatSubmit === false
    // 间隔时间(ms)
    const interval = Number((config.headers || {}).interval) || 1000

    if (getToken() && !isToken) {
      config.headers['Authorization'] = 'Bearer ' + getToken()
    }

    // get请求映射params参数
    if (config.method === 'get' && config.params) {
      let url = config.url + '?' + tansParams(config.params)
      url = url.slice(0, -1)
      config.params = {}
      config.url = url
    }

    // 防重复提交
    if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
      const requestObj = {
        url: config.url,
        data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
        time: new Date().getTime()
      }
      const requestSize = Object.keys(JSON.stringify(requestObj)).length
      const limitSize = 5 * 1024 * 1024
      if (requestSize >= limitSize) {
        console.warn(`[${config.url}]: 请求数据大小超出允许的5M限制，无法进行防重复提交验证。`)
        return config
      }
      const sessionStr = sessionStorage.getItem('sessionObj')
      const sessionObj = sessionStr ? JSON.parse(sessionStr) : null
      if (!sessionObj) {
        sessionStorage.setItem('sessionObj', JSON.stringify(requestObj))
      } else {
        const s_url = sessionObj.url
        const s_data = sessionObj.data
        const s_time = sessionObj.time
        if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
          const msg = '数据正在处理，请勿重复提交'
          console.warn(`[${s_url}]: ${msg}`)
          return Promise.reject(new Error(msg))
        } else {
          sessionStorage.setItem('sessionObj', JSON.stringify(requestObj))
        }
      }
    }

    return config
  },
  (error) => {
    console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (res: AxiosResponse) => {
    const code = res.data.code || 200
    const msg = errorCode[code] || res.data.msg || errorCode['default']

    // 二进制数据则直接返回
    if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
      return res.data
    }

    if (code === 401) {
      if (!isRelogin.show) {
        isRelogin.show = true
        Modal.confirm({
          title: '系统提示',
          content: '登录状态已过期，您可以继续留在该页面，或者重新登录',
          okText: '重新登录',
          cancelText: '取消',
          onOk() {
            isRelogin.show = false
            useUserStore.getState().logOut().then(() => {
              location.href = '/index'
            })
          },
          onCancel() {
            isRelogin.show = false
          }
        })
      }
      return Promise.reject(new Error('无效的会话，或者会话已过期，请重新登录。'))
    } else if (code === 500) {
      message.error(msg)
      return Promise.reject(new Error(msg))
    } else if (code === 601) {
      message.warning(msg)
      return Promise.reject(new Error(msg))
    } else if (code !== 200) {
      notification.error({ message: msg })
      return Promise.reject(new Error('error'))
    } else {
      return Promise.resolve(res.data)
    }
  },
  (error) => {
    console.log('err' + error)
    let { message: msg } = error
    if (msg === 'Network Error') {
      msg = '后端接口连接异常'
    } else if (msg.includes('timeout')) {
      msg = '系统接口请求超时'
    } else if (msg.includes('Request failed with status code')) {
      msg = '系统接口' + msg.slice(-3) + '异常'
    }
    message.error({ content: msg, duration: 5 * 1000 })
    return Promise.reject(error)
  }
)

/** 通用下载方法 */
export function download(url: string, params: Record<string, any>, filename: string, config?: Record<string, any>) {
  const hide = message.loading('正在下载数据，请稍候...')
  return service
    .post(url, params, {
      transformRequest: [(params: Record<string, any>) => tansParams(params)],
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      responseType: 'blob',
      ...config
    })
    .then(async (data: any) => {
      const isBlob = blobValidate(data)
      if (isBlob) {
        const blob = new Blob([data])
        saveAs(blob, filename)
      } else {
        const resText = await data.text()
        const rspObj = JSON.parse(resText)
        const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default']
        message.error(errMsg)
      }
      hide()
    })
    .catch((r: any) => {
      console.error(r)
      message.error('下载文件出现错误，请联系管理员！')
      hide()
    })
}

export default service
