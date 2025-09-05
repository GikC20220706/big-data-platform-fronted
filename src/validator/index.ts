/*
 * @Author: fanciNate
 * @Date: 2023-04-29 17:44:44
 * @LastEditTime: 2023-04-29 21:21:56
 * @LastEditors: fanciNate
 * @Description: In User Settings Edit
 * @FilePath: /zqy-web/src/validator/index.ts
 */
import { isFunction } from '@/utils/checkType'
import HostValidator from './host.validator'
import PortValidator from './port.validator'

export const Validator = {
  HostValidator,
  PortValidator
}

export function _validate(type: any, message: string, trigger: string[]) {
  // 生成验证器
  const validator = {
    trigger: trigger,
    validator: null
  }
  if (isFunction(type)) {
    validator.validator = type
  }

  return validator
}

// 数据源连接参数验证器
export function createDataSourceValidator(type: string) {
  const validators: Record<string, any> = {
    mysql: {
      host: { required: true, message: '请输入主机地址' },
      port: { required: true, type: 'number', min: 1, max: 65535, message: '请输入有效的端口号' },
      database: { required: true, message: '请输入数据库名' },
      username: { required: true, message: '请输入用户名' },
      password: { required: true, message: '请输入密码' }
    },
    hive: {
      host: { required: true, message: '请输入HiveServer2地址' },
      port: { required: true, type: 'number', min: 1, max: 65535, message: '请输入有效的端口号' },
      username: { required: true, message: '请输入用户名' }
    },
    doris: {
      host: { required: true, message: '请输入FE地址' },
      port: { required: true, type: 'number', min: 1, max: 65535, message: '请输入有效的端口号' },
      database: { required: true, message: '请输入数据库名' },
      username: { required: true, message: '请输入用户名' },
      password: { required: true, message: '请输入密码' }
    },
    kingbase: {
      host: { required: true, message: '请输入主机地址' },
      port: { required: true, type: 'number', min: 1, max: 65535, message: '请输入有效的端口号' },
      database: { required: true, message: '请输入数据库名' },
      username: { required: true, message: '请输入用户名' },
      password: { required: true, message: '请输入密码' }
    },
    dm: {
      host: { required: true, message: '请输入主机地址' },
      port: { required: true, type: 'number', min: 1, max: 65535, message: '请输入有效的端口号' },
      database: { required: true, message: '请输入数据库名' },
      username: { required: true, message: '请输入用户名' },
      password: { required: true, message: '请输入密码' }
    },
    tidb: {
      host: { required: true, message: '请输入主机地址' },
      port: { required: true, type: 'number', min: 1, max: 65535, message: '请输入有效的端口号' },
      database: { required: true, message: '请输入数据库名' },
      username: { required: true, message: '请输入用户名' },
      password: { required: true, message: '请输入密码' }
    }
  }
  
  return validators[type] || {}
}

// API参数验证器
export function createApiParamValidator() {
  return {
    apiName: { required: true, message: '请输入API名称' },
    apiPath: { 
      required: true, 
      message: '请输入API路径',
      pattern: /^\/[a-zA-Z0-9\/_-]*$/,
      trigger: 'blur'
    },
    dataSourceId: { required: true, message: '请选择数据源' },
    sqlTemplate: { required: true, message: '请输入SQL模板' }
  }
}

// 工作流验证器
export function createWorkflowValidator() {
  return {
    name: { required: true, message: '请输入工作流名称' },
    displayName: { required: true, message: '请输入显示名称' }
  }
}