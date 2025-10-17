/*
 * @Author: fanciNate
 * @Date: 2023-05-23 17:00:06
 * @LastEditTime: 2023-06-05 22:32:18
 * @LastEditors: fanciNate
 * @Description: In User Settings Edit
 * @FilePath: /spark-yun/spark-yun-website/src/utils/http/index.ts
 */
import { createAxios } from '@/plugins/http-request'
import router from '@/router'
import { merge } from '../checkType'
import { ElMessage } from 'element-plus'
import * as process from 'process'
import { useAuthStore } from '@/store/useAuth'

const message = ElMessage

const whiteList = ['/vip/auth/open/querySsoAuth']

export const httpOption = {
  transform: {
    requestInterceptors: (config: any) => {
      const authStore = useAuthStore()
      config.headers['authorization'] = config.headers['authorization'] || authStore.token
      config.headers['tenant'] = config.headers['tenant'] || authStore.tenantId
      
      // 添加内容类型和接受类型
      if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json'
      }
      config.headers['Accept'] = 'application/json'

      return config
    },
    responseInterceptors: (config: any): any => {
      // 处理响应数据格式统一化
      if (config && config.data) {
        const responseData = config.data
        
        // 标准化响应格式
        const standardResponse = {
          code: responseData.code || responseData.status || 200,
          data: responseData.data || responseData.result || responseData,
          msg: responseData.message || responseData.msg || 'success',
          success: (responseData.code || responseData.status || 200) === 200,
          timestamp: responseData.timestamp || new Date().toISOString()
        }
        
        // 处理分页数据格式转换
        if (standardResponse.data && (standardResponse.data.items || standardResponse.data.content)) {
          standardResponse.data = {
            ...standardResponse.data,
            content: standardResponse.data.items || standardResponse.data.content,
            totalElements: standardResponse.data.total || standardResponse.data.total_count || 0,
            currentPage: standardResponse.data.page || standardResponse.data.current_page || 1,
            pageSize: standardResponse.data.page_size || standardResponse.data.per_page || 20
          }
        }
        
        config.data = standardResponse
      }

      return config
    }
  },
  requestOptions: {
    // urlPrefix: import.meta.env.VITE_VUE_APP_BASE_DOMAIN,
    urlPrefix: '',
    showSuccessMessage: (msg: string): void => {
      message.success(msg)
    },
    showErrorMessage: (msg: string): void => {
      message.error(msg)
    },
    checkStatus: (status: number, msg: string, showMsg: any, response: any): void => {
      try {
        if (status == 401) {
          router.push({
            name: 'login'
          })
        } else if (status == 403) {
          message.error('权限不足，请联系管理员')
        } else if (status == 404) {
          message.error('接口不存在，请检查接口路径')
        } else if (status >= 500) {
          message.error('服务器错误，请稍后重试')
        } else {
          showMsg(msg)
        }
      } catch (error) {
        console.error('状态检查错误:', error)
      }
    }
  },
  timeout: 30 * 1000
}

export const createHttp = (option = {
}) => {
  return createAxios(
    merge(
      {
      },
      {
        ...httpOption
      },
      {
        ...option
      }
    )
  )
}

export const http = createHttp()
