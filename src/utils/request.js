import { useUserStore } from '@/stores/index'
import axios from 'axios'
import router from '@/router'
import { ElMessage } from 'element-plus'

const baseURL = 'http://big-event-vue-api-t.itheima.net'

const instance = axios.create({
  baseURL,
  timeout: 100000
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = userStore.token
    }
    return config
  },
  (err) => Promise.reject(err)
)

// 响应拦截器
instance.interceptors.response.use(
  (res) => {
    if (res.data.code === 0) {
      return res
        }
    // 处理业务失败，给出错误提示
    ElMessage({ message: res.data.message || '服务异常', type: 'error' })
    return Promise.reject(res.data)
  },
    (err) => {
        // 错误特殊情况 =>401权限不足或者token过期
    if (err.response?.status === 401) {
      router.push('/login')
    }
    //   错误的默认情况 =>只需要给提示就行
    ElMessage({ message: err.response.data.message || '服务异常', type: 'error' })
        console.log(err)
        
    return Promise.reject(err)
  }
)

export default instance
export { baseURL }
