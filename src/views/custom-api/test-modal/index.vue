<!-- src/views/custom-api/test-modal/index.vue -->

<template>
  <BlockModal :model-config="modelConfig">
    <el-alert
        title="API测试工具"
        type="info"
        :closable="false"
        style="margin-bottom: 16px"
    >
      <template #default>
        在此配置请求参数并测试API功能,确保接口正常工作
      </template>
    </el-alert>

    <el-form
        ref="formRef"
        class="test-api-form"
        label-position="top"
        :model="formData"
    >
      <!-- API基本信息 -->
      <el-card shadow="never" class="info-card">
        <template #header>
          <div class="card-header">
            <span>API信息</span>
            <el-tag :type="methodTagType[formData.method] || 'info'" size="small">
              {{ formData.method }}
            </el-tag>
          </div>
        </template>

        <el-form-item label="请求路径">
          <el-input v-model="formData.path" disabled>
            <template #append>
              <el-button :icon="DocumentCopy" @click="copyUrl">
                复制
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="API名称">
          <el-input v-model="apiInfo.apiName" disabled/>
        </el-form-item>

        <el-form-item label="数据源">
          <el-input v-model="apiInfo.dataSourceName" disabled/>
        </el-form-item>
      </el-card>

      <!-- 请求配置 -->
      <el-card shadow="never" class="config-card">
        <template #header>
          <div class="card-header">
            <span>请求配置</span>
            <el-button
                type="text"
                size="small"
                @click="resetRequestConfig"
            >
              重置
            </el-button>
          </div>
        </template>

        <!-- 请求头配置 -->
        <el-form-item>
          <template #label>
            <div class="label-with-action">
              <span>请求头 (Headers)</span>
              <el-button
                  type="primary"
                  size="small"
                  text
                  :icon="Plus"
                  @click="addHeader"
              >
                添加
              </el-button>
            </div>
          </template>
          <div class="form-options__list">
            <div
                v-for="(header, index) in formData.headerConfig"
                :key="'header-' + index"
                class="form-options__item"
            >
              <el-input
                  v-model="header.label"
                  placeholder="Header键,例如: Authorization"
                  size="small"
                  class="input-key"
              />
              <span class="separator">:</span>
              <el-input
                  v-model="header.value"
                  placeholder="Header值,例如: Bearer token"
                  size="small"
                  class="input-value"
              />
              <el-button
                  v-if="formData.headerConfig.length > 1"
                  type="danger"
                  size="small"
                  text
                  :icon="Delete"
                  @click="removeHeader(index)"
              />
            </div>
          </div>
        </el-form-item>

        <!-- GET请求参数 -->
        <el-form-item v-if="formData.method === 'GET'">
          <template #label>
            <div class="label-with-action">
              <span>查询参数 (Query Parameters)</span>
              <el-button
                  type="primary"
                  size="small"
                  text
                  :icon="Plus"
                  @click="addParam"
              >
                添加
              </el-button>
            </div>
          </template>
          <div class="form-options__list">
            <div
                v-for="(param, index) in formData.bodyConfig"
                :key="'param-' + index"
                class="form-options__item"
            >
              <el-input
                  v-model="param.label"
                  placeholder="参数键"
                  size="small"
                  class="input-key"
              />
              <span class="separator">=</span>
              <el-input
                  v-model="param.value"
                  placeholder="参数值"
                  size="small"
                  class="input-value"
              />
              <el-button
                  v-if="formData.bodyConfig.length > 1"
                  type="danger"
                  size="small"
                  text
                  :icon="Delete"
                  @click="removeParam(index)"
              />
            </div>
          </div>
        </el-form-item>

        <!-- POST请求体 -->
        <el-form-item v-if="formData.method === 'POST'">
          <template #label>
            <div class="label-with-action">
              <span>请求体 (Request Body)</span>
              <el-button
                  type="primary"
                  size="small"
                  text
                  @click="formatJson"
              >
                格式化
              </el-button>
            </div>
          </template>
          <div class="json-editor-wrapper">
            <code-mirror
                v-model="formData.bodyParams"
                :lang="jsonLang"
                basic
                placeholder='{"key": "value"}'
            />
          </div>
        </el-form-item>
      </el-card>

      <!-- 响应结果 -->
      <el-card shadow="never" class="response-card">
        <template #header>
          <div class="card-header">
            <span>响应结果</span>
            <div class="response-status">
              <span>HTTP状态码:</span>
              <el-tag
                  v-if="httpStatus"
                  :type="httpStatus === 200 ? 'success' : 'danger'"
                  size="small"
              >
                {{ httpStatus }}
              </el-tag>
              <el-tag v-else type="info" size="small">-</el-tag>

              <el-divider direction="vertical"/>

              <span>响应时间:</span>
              <el-tag v-if="responseTime" type="success" size="small">
                {{ responseTime }}ms
              </el-tag>
              <el-tag v-else type="info" size="small">-</el-tag>
            </div>
          </div>
        </template>

        <el-form-item>
          <div class="response-wrapper">
            <code-mirror
                v-model="formData.returnConfig"
                :lang="jsonLang"
                :disabled="true"
                basic
                placeholder="点击'测试'按钮执行API调用,查看响应结果"
            />
          </div>
        </el-form-item>

        <!-- 响应统计信息 -->
        <el-form-item v-if="responseStats">
          <div class="response-stats">
            <el-descriptions :column="3" size="small" border>
              <el-descriptions-item label="数据行数">
                {{ responseStats.totalCount || 0 }}
              </el-descriptions-item>
              <el-descriptions-item label="执行SQL">
                <el-tooltip :content="responseStats.executedSql" placement="top">
                  <span class="sql-preview">
                    {{ responseStats.executedSql?.substring(0, 50) }}...
                  </span>
                </el-tooltip>
              </el-descriptions-item>
              <el-descriptions-item label="缓存状态">
                <el-tag :type="responseStats.cached ? 'success' : 'info'" size="small">
                  {{ responseStats.cached ? '已缓存' : '未缓存' }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-form-item>
      </el-card>
    </el-form>

    <!-- 自定义底部按钮 -->
    <template #customLeft>
      <el-button @click="closeEvent">关闭</el-button>
      <el-button
          type="warning"
          :loading="testLoading"
          :icon="VideoPlay"
          @click="testApi"
      >
        {{ testLoading ? '测试中...' : '测试' }}
      </el-button>
      <el-button
          v-if="httpStatus === 200"
          type="success"
          @click="exportResult"
      >
        导出结果
      </el-button>
    </template>
  </BlockModal>
</template>

<script lang="ts" setup>
import {nextTick, reactive, ref} from 'vue'
import {ElMessage} from 'element-plus'
import {
  DocumentCopy,
  Plus,
  Delete,
  VideoPlay
} from '@element-plus/icons-vue'
import Clipboard from 'clipboard'
import {json} from '@codemirror/lang-json'

import BlockModal from '@/components/block-modal/index.vue'
import {
  GetCustomApiDetailData,
  TestCustomApiData
} from '@/services/custom-api.service'
import {customApiAdapter} from '@/services/custom-api.adapter'
import {defaultTestFormData} from '../costom-api.config'
import type {TestFormData, ApiExecutionResult} from '@/types/custom-api.types'
import {useAuthStore} from '@/store/useAuth'
import {jsonFormatter} from "@/utils/formatter"

// 定义 Option 接口
interface Option {
  label: string
  value: string
}

// ==================== 响应式数据 ====================

const authStore = useAuthStore()

const formRef = ref()
const jsonLang = ref<any>(json())

const testLoading = ref(false)
const httpStatus = ref<number | null>(null)
const responseTime = ref<number | null>(null)
const responseStats = ref<any>(null)

const apiInfo = reactive({
  apiName: '',
  dataSourceName: '',
  description: ''
})

const modelConfig = reactive({
  title: 'API测试',
  visible: false,
  width: '900px',
  okConfig: {
    title: '确定',
    ok: () => {
    },
    disabled: true,
    loading: false
  },
  cancelConfig: {
    title: '取消',
    cancel: closeEvent,
    disabled: false
  },
  needScale: false,
  zIndex: 1100,
  closeOnClickModal: false
})

const formData = reactive<{
  id: string
  path: string
  method: string
  headerConfig: Option[]
  bodyConfig: Option[]
  bodyParams: any
  returnConfig: any
}>({
  id: '',
  path: '',
  method: '',
  headerConfig: [],
  bodyConfig: [],
  bodyParams: null,
  returnConfig: null
})

const methodTagType: Record<string, string> = {
  GET: 'success',
  POST: 'warning',
  PUT: 'primary',
  DELETE: 'danger'
}

// ==================== 对外方法 ====================

/**
 * 显示测试弹窗
 */
async function showModal(apiId: number): void {
  modelConfig.visible = true
  formData.id = apiId.toString()
  getApiDetailData(apiId)
  httpStatus.value = null
  responseTime.value = null
  responseStats.value = null
  formData.headerConfig = [{label: '', value: ''}]
  formData.bodyConfig = [{label: '', value: ''}]
  formData.bodyParams = null
  formData.returnConfig = null
  nextTick(() => {
    formRef.value?.resetFields()  // 改为 formRef
  })
}

async function getApiDetailData(apiId: number) {
  GetCustomApiDetailData(apiId).then((res: any) => {
    if (res.data) {
      const api = res.data

      // 设置API信息到 apiInfo 对象
      apiInfo.apiName = api.apiName || api.api_name || ''
      apiInfo.dataSourceName = api.dataSource?.name || api.data_source?.name || '-'
      apiInfo.description = api.description || ''

      // 设置API路径
      const apiPath = api.apiPath || api.api_path || ''
      formData.path = `${location.origin}/api${apiPath}`

      // 设置请求方法
      formData.method = api.httpMethod || api.http_method || 'GET'

      // 设置请求头
      if (api.parameters && api.parameters.length > 0) {
        formData.headerConfig = [{label: 'Content-Type', value: 'application/json'}]
      }

      // 设置请求参数
      if (formData.method === 'POST') {
        const bodyObj: any = {}
        api.parameters?.forEach((param: any) => {
          const paramName = param.paramName || param.param_name
          const defaultValue = param.defaultValue || param.default_value || ''
          bodyObj[paramName] = defaultValue
        })
        formData.bodyParams = jsonFormatter(JSON.stringify(bodyObj))
      } else {
        formData.bodyConfig = api.parameters?.map((param: any) => ({
          label: param.paramName || param.param_name,
          value: param.defaultValue || param.default_value || ''
        })) || [{label: '', value: ''}]
      }
    }
  }).catch((error) => {
    console.error('获取API详情失败:', error)
    ElMessage.error('加载API信息失败')
  })
}

defineExpose({showModal})

// ==================== 数据加载 ====================

/**
 * 加载API详情
 */
async function loadApiDetail(apiId: number) {
  try {
    const res = await GetCustomApiDetailData(apiId)
    if (res.data) {
      const api = res.data

      // 设置API信息
      apiInfo.apiName = api.apiName
      apiInfo.dataSourceName = api.dataSource?.name || '-'
      apiInfo.description = api.description || ''

      // 设置测试表单
      formData.id = api.id
      formData.method = api.httpMethod
      formData.path = `${location.origin}/${authStore.tenantId}${api.apiPath}`

      // 初始化请求头
      formData.headerConfig = [
        {label: 'Content-Type', value: 'application/json'}
      ]

      // 根据参数初始化请求数据
      if (api.httpMethod === 'GET') {
        formData.bodyConfig = api.parameters.map(p => ({
          label: p.paramName,
          value: p.defaultValue || ''
        }))
        if (formData.bodyConfig.length === 0) {
          formData.bodyConfig = [{label: '', value: ''}]
        }
      } else if (api.httpMethod === 'POST') {
        const bodyObj: Record<string, any> = {}
        api.parameters.forEach(p => {
          bodyObj[p.paramName] = p.defaultValue || ''
        })
        formData.bodyParams = JSON.stringify(bodyObj, null, 2)
      }

      formData.returnConfig = ''
    }
  } catch (error) {
    console.error('加载API详情失败:', error)
    ElMessage.error('加载API详情失败')
  }
}

// ==================== 测试相关 ====================

/**
 * 测试API
 */
async function testApi() {
  // 验证POST请求的JSON格式
  if (formData.method === 'POST' && formData.bodyParams) {
    try {
      JSON.parse(formData.bodyParams)
    } catch (e) {
      ElMessage.warning('请求体JSON格式错误,请检查')
      return
    }
  }

  testLoading.value = true
  httpStatus.value = null
  responseTime.value = null
  responseStats.value = null

  const startTime = Date.now()

  try {
    const testRequest = customApiAdapter.convertTestFormToRequest(formData)
    const res = await TestCustomApiData(testRequest)

    responseTime.value = Date.now() - startTime
    httpStatus.value = res.data?.httpStatus || 200

    if (res.data) {
      // 设置响应内容
      if (res.data.body) {
        formData.returnConfig = JSON.stringify(res.data.body, null, 2)
      } else {
        formData.returnConfig = res.data.msg || '测试完成'
      }

      // 设置响应统计
      responseStats.value = {
        totalCount: res.data.totalCount || 0,
        executedSql: res.data.executedSql || '-',
        cached: res.data.cached || false,
        responseTimeMs: res.data.responseTimeMs || responseTime.value
      }

      ElMessage.success('测试成功')
    }
  } catch (error: any) {
    console.error('测试失败:', error)
    responseTime.value = Date.now() - startTime
    httpStatus.value = error.status || 500

    formData.returnConfig = JSON.stringify(
        {
          success: false,
          error: error.message || '测试失败',
          details: error.response?.data || error.data
        },
        null,
        2
    )

    ElMessage.error('测试失败: ' + (error.message || '未知错误'))
  } finally {
    testLoading.value = false
  }
}

/**
 * 导出结果
 */
function exportResult() {
  try {
    const dataStr = formData.returnConfig
    const dataBlob = new Blob([dataStr], {type: 'application/json'})
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `api-test-result-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// ==================== 表单操作 ====================

/**
 * 复制URL
 */
function copyUrl() {
  const clipboard = new Clipboard('.el-button', {
    text: () => formData.path
  })

  clipboard.on('success', () => {
    ElMessage.success('URL已复制到剪贴板')
    clipboard.destroy()
  })

  clipboard.on('error', () => {
    ElMessage.error('复制失败')
    clipboard.destroy()
  })
}

/**
 * 格式化JSON
 */
function formatJson() {
  try {
    if (formData.bodyParams) {
      const jsonObj = JSON.parse(formData.bodyParams)
      formData.bodyParams = JSON.stringify(jsonObj, null, 2)
      ElMessage.success('格式化成功')
    }
  } catch (e) {
    ElMessage.warning('JSON格式错误,无法格式化')
  }
}

/**
 * 重置请求配置
 */
function resetRequestConfig() {
  formData.headerConfig = [
    {label: 'Content-Type', value: 'application/json'}
  ]
  if (formData.method === 'GET') {
    formData.bodyConfig = [{label: '', value: ''}]
  } else {
    formData.bodyParams = '{}'
  }
  httpStatus.value = null
  responseTime.value = null
  responseStats.value = null
  formData.returnConfig = ''
  ElMessage.success('已重置')
}

/**
 * 添加请求头
 */
function addHeader() {
  formData.headerConfig.push({label: '', value: ''})
}

/**
 * 删除请求头
 */
function removeHeader(index: number) {
  formData.headerConfig.splice(index, 1)
}

/**
 * 添加参数
 */
function addParam() {
  formData.bodyConfig.push({label: '', value: ''})
}

/**
 * 删除参数
 */
function removeParam(index: number) {
  formData.bodyConfig.splice(index, 1)
}

/**
 * 重置表单
 */
function resetForm() {
  Object.assign(formData, {...defaultTestFormData})
  Object.assign(apiInfo, {
    apiName: '',
    dataSourceName: '',
    description: ''
  })
  httpStatus.value = null
  responseTime.value = null
  responseStats.value = null
}

/**
 * 关闭弹窗
 */
function closeEvent() {
  modelConfig.visible = false
  resetForm()
}
</script>

<style lang="scss" scoped>
.test-api-form {
  padding: 0;

  .info-card,
  .config-card,
  .response-card {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }

  .label-with-action {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .form-options__list {
    width: 100%;

    .form-options__item {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 8px;

      .input-key {
        flex: 0 0 35%;
      }

      .separator {
        flex: 0 0 20px;
        text-align: center;
        color: var(--el-text-color-secondary);
        font-weight: 600;
      }

      .input-value {
        flex: 1;
      }
    }
  }

  .json-editor-wrapper {
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    min-height: 200px;
    max-height: 400px;
    overflow: auto;
  }

  .response-wrapper {
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    min-height: 300px;
    max-height: 500px;
    overflow: auto;
  }

  .response-status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: normal;

    span {
      color: var(--el-text-color-secondary);
    }
  }

  .response-stats {
    margin-top: 12px;

    .sql-preview {
      font-family: monospace;
      font-size: 12px;
      color: var(--el-color-primary);
      cursor: pointer;
    }
  }
}

:deep(.el-form-item__content) { 
 display: block !important;
}
</style>