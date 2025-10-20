<!-- src/views/custom-api/add-modal/index.vue -->

<template>
  <BlockModal :model-config="modelConfig">
    <!-- 步骤条 -->
    <el-steps class="custom-api-form__step" :active="stepIndex" finish-status="success" align-center>
      <el-step title="基础配置" description="配置API基本信息"/>
      <el-step title="SQL配置" description="编写SQL查询模板"/>
      <el-step title="接口测试" description="测试API功能"/>
    </el-steps>

    <!-- 第一步: 基础配置 -->
    <el-form
        v-if="stepIndex === 0"
        ref="formRef"
        class="custom-api-form"
        label-position="top"
        :model="formData"
        :rules="formRules"
    >
      <el-form-item label="API名称" prop="name">
        <el-tooltip content="API名称只能包含字母、数字、下划线,且必须以字母或下划线开头" placement="top">
          <el-icon class="tooltip-icon">
            <QuestionFilled/>
          </el-icon>
        </el-tooltip>
        <el-input
            v-model="formData.name"
            maxlength="100"
            placeholder="例如: user_list_api"
            clearable
        />
      </el-form-item>

      <el-form-item label="请求方式" prop="apiType">
        <el-select v-model="formData.apiType" placeholder="请选择HTTP请求方式">
          <el-option label="GET" value="GET">
            <span style="color: #67C23A">GET</span> - 查询数据
          </el-option>
          <el-option label="POST" value="POST">
            <span style="color: #E6A23C">POST</span> - 提交数据
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="API路径" prop="path">
        <el-tooltip
            content="路径格式: /api/custom/your-path, 只能包含字母、数字、下划线、连字符和斜线"
            placement="top"
        >
          <el-icon class="tooltip-icon">
            <QuestionFilled/>
          </el-icon>
        </el-tooltip>
        <el-input
            v-model="formData.path"
            maxlength="200"
            placeholder="例如: /api/custom/users"
            clearable
        >
          <template #prepend>/api/custom/</template>
        </el-input>
      </el-form-item>

      <el-form-item label="数据源" prop="dataSourceId">
        <el-select
            v-model="formData.dataSourceId"
            placeholder="请选择数据源"
            filterable
            :disabled="isEdit"
            @visible-change="getDataSourceList"
        >
          <el-option
              v-for="item in dataSourceList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="描述">
        <el-input
            v-model="formData.remark"
            type="textarea"
            maxlength="1000"
            :autosize="{ minRows: 3, maxRows: 6 }"
            placeholder="请输入API的功能描述"
            show-word-limit
        />
      </el-form-item>
    </el-form>

    <!-- 第二步: SQL配置 -->
    <el-form
        v-if="stepIndex === 1"
        ref="formRef"
        class="custom-api-form"
        label-position="top"
        :model="formData"
        :rules="formRules"
    >
      <el-form-item label="SQL查询模板" prop="sqlTemp">
        <el-tooltip
            content="支持Jinja2模板语法,使用 {{ param_name }} 定义参数"
            placement="top"
        >
          <el-icon class="tooltip-icon">
            <QuestionFilled/>
          </el-icon>
        </el-tooltip>
        <div class="sql-editor-wrapper">
          <code-mirror
              v-model="formData.sqlTemp"
              :lang="sqlLang"
              basic
              :extensions="[sql()]"
              placeholder="请输入SQL查询语句,例如: SELECT * FROM users WHERE id = {{ user_id }}"
          />
        </div>
      </el-form-item>

      <el-form-item label="响应格式">
        <el-radio-group v-model="formData.responseFormat">
          <el-radio label="json">JSON</el-radio>
          <el-radio label="csv">CSV</el-radio>
          <el-radio label="excel">Excel</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="缓存时间">
            <el-select v-model="formData.cacheTtl" placeholder="请选择">
              <el-option
                  v-for="item in cacheTtlOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="频率限制">
            <el-select v-model="formData.rateLimit" placeholder="请选择">
              <el-option
                  v-for="item in rateLimitOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">参数配置</el-divider>

      <div class="parameter-config">
        <el-button
            type="primary"
            size="small"
            :icon="Plus"
            @click="addParameter"
        >
          添加参数
        </el-button>

        <div v-if="formData.parameters.length > 0" class="parameter-list">
          <div
              v-for="(param, index) in formData.parameters"
              :key="index"
              class="parameter-item"
          >
            <el-row :gutter="10">
              <el-col :span="6">
                <el-input
                    v-model="param.paramName"
                    placeholder="参数名"
                    size="small"
                />
              </el-col>
              <el-col :span="5">
                <el-select
                    v-model="param.paramType"
                    placeholder="类型"
                    size="small"
                >
                  <el-option
                      v-for="type in parameterTypeConfig"
                      :key="type.value"
                      :label="type.label"
                      :value="type.value"
                  />
                </el-select>
              </el-col>
              <el-col :span="4">
                <el-switch
                    v-model="param.isRequired"
                    active-text="必填"
                    inactive-text="可选"
                    size="small"
                />
              </el-col>
              <el-col :span="5">
                <el-input
                    v-model="param.defaultValue"
                    placeholder="默认值"
                    size="small"
                />
              </el-col>
              <el-col :span="4">
                <el-button
                    type="danger"
                    size="small"
                    :icon="Delete"
                    @click="removeParameter(index)"
                >
                  删除
                </el-button>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>
    </el-form>

    <!-- 第三步: 接口测试 -->
    <el-form
        v-if="stepIndex === 2"
        ref="formTestRef"
        class="custom-api-form custom-api-test-form"
        label-position="top"
        :model="formDataTest"
    >
      <el-alert
          title="测试说明"
          type="info"
          :closable="false"
          style="margin-bottom: 16px"
      >
        <template #default>
          API已保存,您可以配置测试参数进行功能测试
        </template>
      </el-alert>

      <el-form-item label="请求路径">
        <el-input v-model="formDataTest.path" disabled>
          <template #append>
            <el-button
                :icon="DocumentCopy"
                @click="copyUrl"
            >
              复制
            </el-button>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="请求头">
        <div class="form-options__list">
          <div
              v-for="(header, index) in formDataTest.headerConfig"
              :key="index"
              class="form-options__item"
          >
            <el-input
                v-model="header.label"
                placeholder="Header键"
                size="small"
                style="width: 40%"
            />
            <el-input
                v-model="header.value"
                placeholder="Header值"
                size="small"
                style="width: 50%"
            />
            <el-button
                v-if="formDataTest.headerConfig.length > 1"
                type="danger"
                size="small"
                :icon="Delete"
                @click="removeTestHeader(index)"
            />
          </div>
          <el-button
              type="text"
              size="small"
              :icon="Plus"
              @click="addTestHeader"
          >
            添加请求头
          </el-button>
        </div>
      </el-form-item>

      <el-form-item v-if="formDataTest.method === 'GET'" label="查询参数">
        <div class="form-options__list">
          <div
              v-for="(param, index) in formDataTest.bodyConfig"
              :key="index"
              class="form-options__item"
          >
            <el-input
                v-model="param.label"
                placeholder="参数键"
                size="small"
                style="width: 40%"
            />
            <el-input
                v-model="param.value"
                placeholder="参数值"
                size="small"
                style="width: 50%"
            />
            <el-button
                v-if="formDataTest.bodyConfig.length > 1"
                type="danger"
                size="small"
                :icon="Delete"
                @click="removeTestParam(index)"
            />
          </div>
          <el-button
              type="text"
              size="small"
              :icon="Plus"
              @click="addTestParam"
          >
            添加参数
          </el-button>
        </div>
      </el-form-item>

      <el-form-item v-if="formDataTest.method === 'POST'" label="请求体(JSON)">
        <code-mirror
            v-model="formDataTest.bodyParams"
            :lang="jsonLang"
            basic
            placeholder='{"key": "value"}'
        />
      </el-form-item>

      <el-form-item label="响应结果">
        <div class="response-header">
          <span>HTTP状态码:</span>
          <el-tag
              :type="httpStatus === 200 ? 'success' : 'danger'"
              size="small"
          >
            {{ httpStatus || '-' }}
          </el-tag>
        </div>
        <code-mirror
            v-model="formDataTest.returnConfig"
            :lang="jsonLang"
            :disabled="true"
            basic
            placeholder="点击'测试'按钮执行API调用"
        />
      </el-form-item>
    </el-form>

    <!-- 自定义底部按钮 -->
    <template #customLeft>
      <!-- 第一步按钮 -->
      <template v-if="stepIndex === 0">
        <el-button @click="closeEvent">取消</el-button>
        <el-button type="primary" @click="nextStep">下一步</el-button>
      </template>

      <!-- 第二步按钮 -->
      <template v-if="stepIndex === 1">
        <el-button @click="prevStep">上一步</el-button>
        <el-button
            type="primary"
            :loading="saveLoading"
            @click="saveAndNext"
        >
          保存并继续
        </el-button>
      </template>

      <!-- 第三步按钮 -->
      <template v-if="stepIndex === 2">
        <el-button @click="prevStep">上一步</el-button>
        <el-button
            type="warning"
            :loading="testLoading"
            @click="testApi"
        >
          测试
        </el-button>
        <el-button type="primary" @click="complete">完成</el-button>
      </template>
    </template>
  </BlockModal>
</template>

<script lang="ts" setup>
import {reactive, ref, nextTick} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import type {FormInstance, FormRules} from 'element-plus'
import {
  QuestionFilled,
  Plus,
  Delete,
  DocumentCopy
} from '@element-plus/icons-vue'
import Clipboard from 'clipboard'
import {sql} from '@codemirror/lang-sql'
import {json} from '@codemirror/lang-json'

import BlockModal from '@/components/block-modal/index.vue'
import {GetDatasourceList} from '@/services/datasource.service'
import {
  CreateCustomApiData,
  UpdateCustomApiData,
  GetCustomApiDetailData,
  TestCustomApiData
} from '@/services/custom-api.service'
import {customApiAdapter} from '@/services/custom-api.adapter'
import {
  formRules,
  defaultFormData,
  defaultTestFormData,
  cacheTtlOptions,
  rateLimitOptions,
  parameterTypeConfig
} from '../costom-api.config'
import type {
  ApiFormData,
  TestFormData,
  CreateApiRequest
} from '@/types/custom-api.types'
import {useAuthStore} from '@/store/useAuth'

// ==================== 响应式数据 ====================

const authStore = useAuthStore()
const emit = defineEmits(['refresh'])

const formRef = ref<FormInstance>()
const formTestRef = ref<FormInstance>()
const sqlLang = ref<any>(sql())
const jsonLang = ref<any>(json())

const stepIndex = ref(0)
const isEdit = ref(false)
const saveLoading = ref(false)
const testLoading = ref(false)
const httpStatus = ref<number | null>(null)

const dataSourceList = ref<Array<{ label: string; value: number }>>([])

const modelConfig = reactive({
  title: '添加API',
  visible: false,
  width: '900px',  // 从 800px 改为 900px
  okConfig: {
    title: '确定',
    ok: () => {},
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

const formData = reactive<ApiFormData>({...defaultFormData})
const formDataTest = reactive<TestFormData>({...defaultTestFormData})

// ==================== 对外方法 ====================

/**
 * 显示弹窗
 */
async function showModal(apiId?: number) {
  resetForm()
  stepIndex.value = 0
  httpStatus.value = null

  if (apiId) {
    // 编辑模式
    isEdit.value = true
    modelConfig.title = '编辑API'
    await loadApiDetail(apiId)
  } else {
    // 新建模式
    isEdit.value = false
    modelConfig.title = '添加API'
  }

  modelConfig.visible = true
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
      const apiDetail = customApiAdapter.convertApiToFormData(res.data)
      Object.assign(formData, apiDetail)
    }
  } catch (error) {
    console.error('加载API详情失败:', error)
    ElMessage.error('加载数据失败')
  }
}

/**
 * 获取数据源列表
 */
async function getDataSourceList(visible: boolean) {
  if (!visible || dataSourceList.value.length > 0) return

  try {
    const res = await GetDatasourceList({
      page: 0,
      pageSize: 100,
      searchKeyWord: ''
    })
    if (res.data && res.data.content) {
      dataSourceList.value = res.data.content.map((item: any) => ({
        label: item.name,
        value: item.id
      }))
    }
  } catch (error) {
    console.error('获取数据源列表失败:', error)
    ElMessage.error('获取数据源列表失败')
  }
}

// ==================== 步骤控制 ====================

/**
 * 下一步
 */
async function nextStep() {
  const valid = await formRef.value?.validate()
  if (valid) {
    stepIndex.value++
  } else {
    ElMessage.warning('请完整填写表单')
  }
}

/**
 * 上一步
 */
function prevStep() {
  stepIndex.value--
}

/**
 * 保存并继续
 */
async function saveAndNext() {
  const valid = await formRef.value?.validate()
  if (!valid) {
    ElMessage.warning('请完整填写表单')
    return
  }

  saveLoading.value = true

  try {
    // 转换表单数据为创建请求
    const createRequest = customApiAdapter.convertFormDataToCreateRequest(formData)

    let res: any
    if (formData.id) {
      // 更新API
      res = await UpdateCustomApiData(formData.id, createRequest)
    } else {
      // 创建API
      res = await CreateCustomApiData(createRequest)
      formData.id = res.data?.id
    }

    ElMessage.success(res.msg || '保存成功')

    // 准备测试数据
    prepareTestData()

    // 进入下一步
    stepIndex.value++
  } catch (error: any) {
    console.error('保存API失败:', error)
    ElMessage.error(error.message || '保存失败')
  } finally {
    saveLoading.value = false
  }
}

/**
 * 准备测试数据
 */
function prepareTestData() {
  if (!formData.id) return

  formDataTest.id = formData.id
  formDataTest.method = formData.apiType
  formDataTest.path = `${location.origin}/${authStore.tenantId}${formData.path}`

  // 初始化请求头
  formDataTest.headerConfig = [{label: 'Content-Type', value: 'application/json'}]

  // 根据请求方式初始化参数
  if (formData.apiType === 'GET' && formData.reqGetTemp) {
    formDataTest.bodyConfig = [...formData.reqGetTemp]
  } else if (formData.apiType === 'POST' && formData.reqJsonTemp) {
    formDataTest.bodyParams = formData.reqJsonTemp
  }

  formDataTest.returnConfig = ''
}

/**
 * 完成
 */
function complete() {
  ElMessage.success('API配置完成')
  closeEvent()
  emit('refresh')
}

// ==================== 测试相关 ====================

/**
 * 测试API
 */
async function testApi() {
  testLoading.value = true
  httpStatus.value = null

  try {
    const testRequest = customApiAdapter.convertTestFormToRequest(formDataTest)
    const res = await TestCustomApiData(testRequest)

    httpStatus.value = res.data?.httpStatus || 200

    if (res.data && res.data.body) {
      formDataTest.returnConfig = JSON.stringify(res.data.body, null, 2)
      ElMessage.success('测试成功')
    } else {
      formDataTest.returnConfig = res.data?.msg || '测试完成'
    }
  } catch (error: any) {
    console.error('测试失败:', error)
    httpStatus.value = error.status || 500
    formDataTest.returnConfig = JSON.stringify(
        {
          error: error.message || '测试失败',
          details: error.response?.data
        },
        null,
        2
    )
    ElMessage.error('测试失败')
  } finally {
    testLoading.value = false
  }
}

/**
 * 复制URL
 */
function copyUrl() {
  const clipboard = new Clipboard('.el-button', {
    text: () => formDataTest.path
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

// ==================== 参数管理 ====================

/**
 * 添加参数
 */
function addParameter() {
  if (!formData.parameters) {
    formData.parameters = []
  }
  formData.parameters.push({
    paramName: '',
    paramType: 'string',
    isRequired: false,
    defaultValue: '',
    description: '',
    validationRule: null
  })
}

/**
 * 删除参数
 */
function removeParameter(index: number) {
  formData.parameters.splice(index, 1)
}

/**
 * 添加测试请求头
 */
function addTestHeader() {
  formDataTest.headerConfig.push({label: '', value: ''})
}

/**
 * 删除测试请求头
 */
function removeTestHeader(index: number) {
  formDataTest.headerConfig.splice(index, 1)
}

/**
 * 添加测试参数
 */
function addTestParam() {
  formDataTest.bodyConfig.push({label: '', value: ''})
}

/**
 * 删除测试参数
 */
function removeTestParam(index: number) {
  formDataTest.bodyConfig.splice(index, 1)
}

// ==================== 表单操作 ====================

/**
 * 重置表单
 */
function resetForm() {
  Object.assign(formData, {...defaultFormData})
  Object.assign(formDataTest, {...defaultTestFormData})
  formRef.value?.resetFields()
  formTestRef.value?.resetFields()
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
.custom-api-form {
  padding: 20px 30px;

  &__step {
    margin-bottom: 30px;
  }

  .tooltip-icon {
    position: absolute;
    right: -20px;
    top: 2px;
    color: var(--el-color-info);
    cursor: help;
  }

  .sql-editor-wrapper {
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    min-height: 200px;
  }

  .parameter-config {
    .parameter-list {
      margin-top: 12px;

      .parameter-item {
        margin-bottom: 8px;
        padding: 12px;
        background-color: var(--el-fill-color-light);
        border-radius: 4px;
      }
    }
  }

  .form-options__list {
    width: 100%;

    .form-options__item {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 8px;
    }
  }

  .response-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 14px;
  }
}

.custom-api-test-form {
  max-height: 600px;
  overflow-y: auto;
}
</style>