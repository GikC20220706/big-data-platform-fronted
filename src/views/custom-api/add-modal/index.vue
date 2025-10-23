<!-- src/views/custom-api/add-modal/index.vue -->

<template>
  <BlockModal :model-config="modelConfig">
    <!-- 步骤条 -->
    <el-steps
        class="custom-api-form__step"
        :active="stepIndex"
        finish-status="success"
        align-center
    >
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
        <el-tooltip
            content="API名称只能包含字母、数字、下划线,且必须以字母或下划线开头"
            placement="top"
        >
          <el-icon class="tooltip-icon">
            <QuestionFilled/>
          </el-icon>
        </el-tooltip>
        <el-input
            v-model="formData.name"
            maxlength="100"
            placeholder="例如: get_user_list"
            clearable
        />
      </el-form-item>
      <el-form-item label="请求方式" prop="apiType">
        <el-select v-model="formData.apiType" placeholder="请选择HTTP请求方式">
          <el-option label="GET" value="GET">
            <span style="color: #67C23A; font-weight: bold">GET</span>
            <span style="margin-left: 8px; color: #909399">查询数据</span>
          </el-option>
          <el-option label="POST" value="POST">
            <span style="color: #E6A23C; font-weight: bold">POST</span>
            <span style="margin-left: 8px; color: #909399">提交数据</span>
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
          <template #prepend>
            <span style="color: #909399">/api/custom/</span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="数据源" prop="dataSourceId">
        <el-select
            v-model="formData.dataSourceId"
            placeholder="请选择数据源"
            filterable
            :disabled="false"
            @visible-change="loadDataSourceList"
        >
          <el-option
              v-for="item in dataSourceList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
            <span>{{ item.label }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">
              {{ item.type }}
            </span>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="描述" prop="remark">
        <el-input
            v-model="formData.remark"
            type="textarea"
            maxlength="1000"
            :autosize="{ minRows: 3, maxRows: 6 }"
            placeholder="请输入API的功能描述"
            show-word-limit
        />
      </el-form-item>
      <!-- 🔧 添加访问权限配置 -->
      <el-divider content-position="left">
        <span style="font-size: 16px; font-weight: 600">访问权限</span>
      </el-divider>

      <el-form-item label="访问级别" prop="accessLevel">
        <el-radio-group v-model="formData.accessLevel" @change="handleAccessLevelChange">
          <el-radio label="public">
            <span style="font-weight: 600">公开访问</span>
            <div style="font-size: 12px; color: #909399; margin-left: 24px">
              任何人都可以访问，无需API密钥
            </div>
          </el-radio>
          <el-radio label="authenticated">
            <span style="font-weight: 600">需要认证</span>
            <div style="font-size: 12px; color: #909399; margin-left: 24px">
              需要有效的API密钥，任何认证用户都可以访问
            </div>
          </el-radio>
          <el-radio label="restricted">
            <span style="font-weight: 600">限定用户</span>
            <div style="font-size: 12px; color: #909399; margin-left: 24px">
              只有指定的用户可以访问
            </div>
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 如果选择了"限定用户"，显示用户选择器 -->
      <el-form-item
          v-if="formData.accessLevel === 'restricted'"
          label="允许访问的用户"
          prop="allowedUserIds"
      >
        <el-select
            v-model="formData.allowedUserIds"
            multiple
            filterable
            placeholder="请选择允许访问的用户"
            style="width: 100%"
            @visible-change="loadApiUserList"
        >
          <el-option
              v-for="user in apiUserList"
              :key="user.id"
              :label="`${user.display_name} (@${user.username})`"
              :value="user.id"
          >
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>{{ user.display_name }}</span>
              <span style="font-size: 12px; color: #909399">@{{ user.username }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <!-- 第二步: SQL配置 + 参数配置 -->
    <el-form
        v-if="stepIndex === 1"
        ref="formRef"
        class="custom-api-form"
        label-position="top"
        :model="formData"
        :rules="formRules"
    >
      <!-- SQL模板 -->
      <el-form-item label="SQL查询模板" prop="sqlTemp">
        <template #label>
          <div class="form-item-label">
            <span>SQL查询模板</span>
            <el-tooltip placement="top" width="400">
              <template #content>
                <div style="line-height: 1.6">
                  <p style="margin: 0 0 8px 0; font-weight: bold">SQL模板规则:</p>
                  <p v-for="(hint, index) in sqlTemplateHints" :key="index" style="margin: 4px 0">
                    {{ hint }}
                  </p>
                </div>
              </template>
              <el-icon class="tooltip-icon" style="position: relative; top: 0; right: 0; margin-left: 8px">
                <QuestionFilled/>
              </el-icon>
            </el-tooltip>
          </div>
        </template>

        <div class="sql-editor-wrapper">
          <div class="sql-toolbar">
            <el-button
                size="small"
                @click="formatSql"
            >
              格式化SQL
            </el-button>
            <el-dropdown trigger="click" @command="insertSqlTemplate">
              <el-button size="small">
                插入模板
                <el-icon class="el-icon--right">
                  <arrow-down/>
                </el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="simple">简单查询</el-dropdown-item>
                  <el-dropdown-item command="withMultipleParams">多参数查询</el-dropdown-item>
                  <el-dropdown-item command="withDateRange">日期范围查询</el-dropdown-item>
                  <el-dropdown-item command="withPagination">分页查询</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button
                size="small"
                type="primary"
                @click="extractParameters"
            >
              提取参数
            </el-button>
          </div>
          <code-mirror
              v-model="formData.sqlTemp"
              :lang="sqlLang"
              basic
              placeholder="请输入SQL查询语句&#10;例如: SELECT * FROM users WHERE id = {{ user_id }}"
              style="width: 100%; min-height: 200px"
          />
        </div>
      </el-form-item>

      <!-- 参数配置 -->
      <el-divider content-position="left">
        <span style="font-size: 16px; font-weight: 600">参数配置</span>
      </el-divider>

      <el-alert
          title="参数说明"
          type="info"
          :closable="false"
          style="margin-bottom: 16px"
      >
        <template #default>
          <div style="font-size: 13px; line-height: 1.8">
            <p style="margin: 0">1. 参数名必须与SQL模板中的变量名一致 (如: &#123;&#123; user_id &#125;&#125; 对应参数名 user_id)</p>
            <p style="margin: 4px 0 0 0">2. 可以点击"提取参数"按钮自动从SQL模板中提取参数</p>
          </div>
        </template>
      </el-alert>

      <div class="parameter-config">
        <el-button
            type="primary"
            size="small"
            :icon="Plus"
            @click="addParameter"
        >
          添加参数
        </el-button>

        <div v-if="formData.parameters && formData.parameters.length > 0" class="parameter-list">
          <el-card
              v-for="(param, index) in formData.parameters"
              :key="index"
              class="parameter-item"
              shadow="hover"
          >
            <template #header>
              <div class="parameter-item-header">
                <span style="font-weight: 600">参数 {{ index + 1 }}</span>
                <el-button
                    type="danger"
                    size="small"
                    text
                    :icon="Delete"
                    @click="removeParameter(index)"
                >
                  删除
                </el-button>
              </div>
            </template>

            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item
                    label="参数名"
                    :prop="`parameters.${index}.paramName`"
                    :rules="[
                    { required: true, message: '请输入参数名', trigger: 'blur' },
                    {
                      pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
                      message: '参数名只能包含字母、数字、下划线',
                      trigger: 'blur'
                    }
                  ]"
                >
                  <el-input
                      v-model="param.paramName"
                      placeholder="例如: user_id"
                      clearable
                  />
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item
                    label="参数类型"
                    :prop="`parameters.${index}.paramType`"
                    :rules="[{ required: true, message: '请选择参数类型', trigger: 'change' }]"
                >
                  <el-select
                      v-model="param.paramType"
                      placeholder="请选择类型"
                  >
                    <el-option
                        v-for="type in parameterTypeConfig"
                        :key="type.value"
                        :label="type.label"
                        :value="type.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="默认值">
                  <el-input
                      v-model="param.defaultValue"
                      placeholder="可选,如: 1"
                      clearable
                  />
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="是否必填">
                  <el-switch
                      v-model="param.isRequired"
                      active-text="必填"
                      inactive-text="可选"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="参数描述">
              <el-input
                  v-model="param.description"
                  placeholder="参数说明,例如: 用户ID"
                  maxlength="200"
                  clearable
              />
            </el-form-item>
          </el-card>
        </div>

        <el-empty
            v-else
            description="暂无参数,请添加或从SQL模板中提取"
            :image-size="100"
        />
      </div>

      <!-- 高级配置 -->
      <el-divider content-position="left">
        <span style="font-size: 16px; font-weight: 600">高级配置</span>
      </el-divider>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="响应格式">
            <el-select v-model="formData.responseFormat" placeholder="请选择">
              <el-option
                  v-for="item in responseFormatConfig"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="8">
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

        <el-col :span="8">
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
    </el-form>

    <!-- 第三步: 接口测试 -->
    <div v-if="stepIndex === 2" class="custom-api-test-form">
      <el-alert
          title="测试说明"
          type="success"
          :closable="false"
          style="margin-bottom: 16px"
      >
        <template #default>
          <div>
            <p>API已保存成功! API ID: <strong>{{ formData.id }}</strong></p>
            <p style="margin-top: 8px; font-size: 13px; color: #909399">
              提示：支持分页查询，可添加 <code>page</code> 和 <code>page_size</code> 参数实现分页
            </p>
          </div>
        </template>
      </el-alert>

      <el-form
          ref="formTestRef"
          class="custom-api-form"
          label-position="top"
          :model="formDataTest"
      >
        <el-form-item label="请求信息">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="API名称">
              {{ formData.name }}
            </el-descriptions-item>
            <el-descriptions-item label="请求方式">
              <el-tag :type="formData.apiType === 'GET' ? 'success' : 'warning'" size="small">
                {{ formData.apiType }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="请求路径" :span="2">
              <div style="display: flex; align-items: center; gap: 8px">
                <el-input
                    v-model="formDataTest.path"
                    readonly
                    size="small"
                />
                <el-button
                    size="small"
                    :icon="DocumentCopy"
                    @click="copyUrl"
                >
                  复制
                </el-button>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </el-form-item>

        <!-- 请求头配置 -->
        <el-form-item label="请求头 (Headers)">
          <div class="form-options-list">
            <div
                v-for="(header, index) in formDataTest.headerConfig"
                :key="index"
                class="form-options-item"
            >
              <el-input
                  v-model="header.label"
                  placeholder="Header键"
                  size="small"
              />
              <span class="separator">:</span>
              <el-input
                  v-model="header.value"
                  placeholder="Header值"
                  size="small"
              />
              <el-button
                  v-if="formDataTest.headerConfig.length > 1"
                  type="danger"
                  size="small"
                  text
                  :icon="Delete"
                  @click="removeTestHeader(index)"
              />
            </div>
          </div>
          <el-button
              type="primary"
              size="small"
              text
              :icon="Plus"
              @click="addTestHeader"
          >
            添加请求头
          </el-button>
        </el-form-item>

        <!-- GET请求参数 -->
        <el-form-item v-if="formDataTest.method === 'GET'" label="查询参数 (Query Parameters)">
          <div class="form-options-list">
            <div
                v-for="(param, index) in formDataTest.bodyConfig"
                :key="index"
                class="form-options-item"
            >
              <el-input
                  v-model="param.label"
                  placeholder="参数键"
                  size="small"
              />
              <span class="separator">=</span>
              <el-input
                  v-model="param.value"
                  placeholder="参数值"
                  size="small"
              />
              <el-button
                  v-if="formDataTest.bodyConfig.length > 1"
                  type="danger"
                  size="small"
                  text
                  :icon="Delete"
                  @click="removeTestParam(index)"
              />
            </div>
          </div>
          <el-button
              type="primary"
              size="small"
              text
              :icon="Plus"
              @click="addTestParam"
          >
            添加参数
          </el-button>
        </el-form-item>

        <!-- POST请求体 -->
        <el-form-item v-if="formDataTest.method === 'POST'" label="请求体 (Request Body JSON)">
          <div class="json-editor-wrapper">
            <div class="sql-toolbar">
              <el-button size="small" @click="formatTestJson">格式化JSON</el-button>
            </div>
            <code-mirror
                v-model="formDataTest.bodyParams"
                :lang="jsonLang"
                basic
                placeholder='{"key": "value"}'
            />
          </div>
        </el-form-item>

        <!-- 响应结果 -->
        <el-form-item label="响应结果">
          <div class="response-header">
            <el-space>
              <span>HTTP状态码:</span>
              <el-tag
                  :type="getHttpStatusType(httpStatus)"
                  size="small"
              >
                {{ httpStatus || '-' }}
              </el-tag>

              <el-divider direction="vertical"/>

              <span>响应时间:</span>
              <el-tag
                  v-if="responseTime"
                  type="success"
                  size="small"
              >
                {{ responseTime }}ms
              </el-tag>
              <el-tag v-else type="info" size="small">-</el-tag>
            </el-space>
          </div>

          <div class="response-wrapper">
            <code-mirror
                v-model="formDataTest.returnConfig"
                :lang="jsonLang"
                :disabled="true"
                basic
                placeholder="点击'测试'按钮执行API调用,查看响应结果"
            />
          </div>
        </el-form-item>
      </el-form>
    </div>

    <!-- 自定义底部按钮 -->
    <template #customLeft>
      <!-- 第一步按钮 -->
      <template v-if="stepIndex === 0">
        <el-button @click="closeEvent">取消</el-button>
        <el-button type="primary" @click="nextStep">
          下一步
          <el-icon class="el-icon--right">
            <ArrowRight/>
          </el-icon>
        </el-button>
      </template>

      <!-- 第二步按钮 -->
      <template v-if="stepIndex === 1">
        <el-button @click="prevStep">
          <el-icon class="el-icon--left">
            <ArrowLeft/>
          </el-icon>
          上一步
        </el-button>
        <el-button
            type="primary"
            :loading="saveLoading"
            @click="saveAndNext"
        >
          {{ saveLoading ? '保存中...' : '保存并继续' }}
        </el-button>
      </template>

      <!-- 第三步按钮 -->
      <template v-if="stepIndex === 2">
        <el-button @click="prevStep">
          <el-icon class="el-icon--left">
            <ArrowLeft/>
          </el-icon>
          上一步
        </el-button>
        <el-button
            type="warning"
            :loading="testLoading"
            :icon="VideoPlay"
            @click="testApi"
        >
          {{ testLoading ? '测试中...' : '测试API' }}
        </el-button>
        <el-button type="success" @click="complete">
          完成
        </el-button>
      </template>
    </template>
  </BlockModal>
</template>

<script lang="ts" setup>
import {reactive, ref, nextTick} from 'vue'
import {ElMessage} from 'element-plus'
import type {FormInstance} from 'element-plus'
import {
  QuestionFilled,
  Plus,
  Delete,
  DocumentCopy,
  VideoPlay,
  ArrowRight,
  ArrowLeft,
  ArrowDown
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
  defaultApiFormData,
  defaultTestFormData,
  defaultApiParameter,
  cacheTtlOptions,
  rateLimitOptions,
  parameterTypeConfig,
  responseFormatConfig,
  sqlTemplateExamples,
  sqlTemplateHints
} from '../costom-api.config'
import {useAuthStore} from '@/store/useAuth'
import { GetAPIUserList, GrantAPIPermissions } from '@/services/api-user.service'

// ==================== 响应式数据 ====================

const authStore = useAuthStore()
const emit = defineEmits(['refresh'])

const formRef = ref<FormInstance>()
const formTestRef = ref<FormInstance>()
const sqlLang = ref(sql())
const jsonLang = ref(json())

const stepIndex = ref(0)
const isEdit = ref(false)
const saveLoading = ref(false)
const testLoading = ref(false)
const httpStatus = ref<number | null>(null)
const responseTime = ref<number | null>(null)

const dataSourceList = ref<Array<{ label: string; value: number; type: string }>>([])

const modelConfig = reactive({
  title: '添加API',
  visible: false,
  width: '1000px',
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

const formData = reactive({
  ...defaultApiFormData,
  accessLevel: 'authenticated',  // 🔧 添加访问级别
  allowedUserIds: [] as number[]  // 🔧 添加允许的用户ID列表
})
const formDataTest = reactive({...defaultTestFormData})
const apiUserList = ref<Array<{ id: number; username: string; display_name: string }>>([])

// ==================== 对外方法 ====================

/**
 * 显示弹窗
 */
async function showModal(apiId?: number) {
  resetForm()
  stepIndex.value = 0
  httpStatus.value = null
  responseTime.value = null
  await loadDataSourceList(true);
  if (apiId) {
    isEdit.value = true
    modelConfig.title = '编辑API'
    await loadApiDetail(apiId)
  } else {
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
    console.log('API详情响应:', res) // 添加调试日志
    if (res.data) {
      const api = res.data
      console.log('API数据:', api)

      // 设置基本信息
      formData.id = apiId
      formData.name = api.apiName || api.api_name
      formData.path = api.apiPath || api.api_path
      formData.remark = api.description
      formData.dataSourceId = api.data_source.id
      formData.apiType = api.httpMethod || api.http_method
      formData.sqlTemp = api.sqlTemplate || api.sql_template
      formData.responseFormat = api.responseFormat || api.response_format || 'json'
      formData.cacheTtl = api.cacheTtl || api.cache_ttl || 300
      formData.rateLimit = api.rateLimit || api.rate_limit || 100
      formData.accessLevel = api.accessLevel || api.access_level || 'authenticated'
      if (formData.accessLevel === 'restricted') {
        await loadApiPermissions(apiId)
      }
      console.log('赋值后的 formData.id:', formData.id)

      // 设置参数列表
      if (api.parameters && api.parameters.length > 0) {
        formData.parameters = api.parameters.map((p: any) => ({
          paramName: p.paramName || p.param_name,
          paramType: p.paramType || p.param_type,
          isRequired: p.isRequired !== undefined ? p.isRequired : p.is_required,
          defaultValue: p.defaultValue || p.default_value || '',
          description: p.description || '',
          validationRule: p.validationRule || p.validation_rule || null
        }))
      }
    }
  } catch (error) {
    console.error('加载API详情失败:', error)
    ElMessage.error('加载数据失败')
  }
}

/**
 * 获取数据源列表
 */
async function loadDataSourceList(visible: boolean) {
  if (!visible || dataSourceList.value.length > 0) return

  try {
    const res = await GetDatasourceList({
      page: 1,
      page_size: 100,
      searchKeyWord: ''
    })

    if (res.data && res.data.sources) {
      dataSourceList.value = res.data.sources.map((item: any) => {
        // 根据实际字段调整
        return {
          label: item.name,
          value: item.id || item.source_id || item.name,  // 尝试多个可能的ID字段
          type: item.type || item.source_type
        }
      })
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
  try {
    const valid = await formRef.value?.validate()
    if (valid) {
      // 如果路径不是以 /api/custom/ 开头,自动补全
      if (!formData.path.startsWith('/api/custom/')) {
        formData.path = `/api/custom/${formData.path.replace(/^\/+/, '')}`
      }

      stepIndex.value++
    }
  } catch (error) {
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
  try {
    const valid = await formRef.value?.validate()
    if (!valid) {
      ElMessage.warning('请完整填写表单')
      return
    }

    saveLoading.value = true

    // 构建请求数据
    if (formData.id) {
      // 🔧 编辑模式：只发送允许更新的字段
      const apiRequest = {
        description: formData.remark || null,
        sqlTemplate: formData.sqlTemp,
        responseFormat: formData.responseFormat,
        cacheTtl: formData.cacheTtl,
        rateLimit: formData.rateLimit,
        parameters: formData.parameters.map(p => ({
          paramName: p.paramName,
          paramType: p.paramType,
          isRequired: p.isRequired,
          defaultValue: p.defaultValue || null,
          description: p.description || null,
          validationRule: p.validationRule || null
        })),
        accessLevel: formData.accessLevel
      }

      const res = await UpdateCustomApiData(formData.id, apiRequest)
      if (formData.accessLevel === 'restricted' && formData.allowedUserIds.length > 0) {
        await GrantAPIPermissions({
          api_id: formData.id,
          user_ids: formData.allowedUserIds
        })
      }
      ElMessage.success(res.message || res.msg || '更新成功')
    } else {
      // 🔧 新增模式：发送完整字段
      const apiRequest = {
        apiName: formData.name,
        apiPath: formData.path,
        description: formData.remark || null,
        dataSourceId: formData.dataSourceId,
        sqlTemplate: formData.sqlTemp,
        httpMethod: formData.apiType,
        responseFormat: formData.responseFormat,
        cacheTtl: formData.cacheTtl,
        rateLimit: formData.rateLimit,
        accessLevel: formData.accessLevel,
        parameters: formData.parameters.map(p => ({
          paramName: p.paramName,
          paramType: p.paramType,
          isRequired: p.isRequired,
          defaultValue: p.defaultValue || null,
          description: p.description || null,
          validationRule: p.validationRule || null
        }))
      }

      const res = await CreateCustomApiData(apiRequest)
      if (res.data && res.data.api_id) {
        formData.id = res.data.api_id
        if (formData.accessLevel === 'restricted' && formData.allowedUserIds.length > 0) {
          await GrantAPIPermissions({
            api_id: formData.id,
            user_ids: formData.allowedUserIds
          })
        }
      }
      ElMessage.success(res.message || res.msg || '创建成功')
    }

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
  formDataTest.path = `${location.origin}${formData.path}`

  // 初始化请求头
  formDataTest.headerConfig = [
    {label: 'Content-Type', value: 'application/json'}
  ]

  // 根据参数初始化测试数据
  if (formData.apiType === 'GET') {
    formDataTest.bodyConfig = formData.parameters.map(p => ({
      label: p.paramName,
      value: p.defaultValue || ''
    }))
    if (formDataTest.bodyConfig.length === 0) {
      formDataTest.bodyConfig = [{label: '', value: ''}]
    }
  } else if (formData.apiType === 'POST') {
    const bodyObj: Record<string, any> = {}
    formData.parameters.forEach(p => {
      bodyObj[p.paramName] = p.defaultValue || ''
    })
    formDataTest.bodyParams = JSON.stringify(bodyObj, null, 2)
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

// ==================== SQL操作 ====================

/**
 * 格式化SQL
 */
function formatSql() {
  if (!formData.sqlTemp) {
    ElMessage.warning('请先输入SQL语句')
    return
  }

  try {
    // 简单的SQL格式化
    let formatted = formData.sqlTemp
        .replace(/\s+/g, ' ')
        .replace(/\s*,\s*/g, ',\n  ')
        .replace(/\bSELECT\b/gi, 'SELECT\n  ')
        .replace(/\bFROM\b/gi, '\nFROM')
        .replace(/\bWHERE\b/gi, '\nWHERE\n  ')
        .replace(/\bAND\b/gi, '\n  AND')
        .replace(/\bOR\b/gi, '\n  OR')
        .replace(/\bORDER BY\b/gi, '\nORDER BY')
        .replace(/\bLIMIT\b/gi, '\nLIMIT')
        .trim()

    formData.sqlTemp = formatted
    ElMessage.success('SQL格式化成功')
  } catch (error) {
    console.error('SQL格式化失败:', error)
    ElMessage.error('SQL格式化失败')
  }
}

/**
 * 插入SQL模板
 */
function insertSqlTemplate(command: string) {
  const template = sqlTemplateExamples[command as keyof typeof sqlTemplateExamples]
  if (template) {
    formData.sqlTemp = template
    ElMessage.success('已插入模板')
  }
}

/**
 * 从SQL模板中提取参数
 */
function extractParameters() {
  if (!formData.sqlTemp) {
    ElMessage.warning('请先输入SQL模板')
    return
  }

  // 使用正则提取 {{ param_name }} 格式的参数
  const regex = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g
  const matches = formData.sqlTemp.matchAll(regex)
  const paramNames = new Set<string>()

  for (const match of matches) {
    paramNames.add(match[1])
  }

  if (paramNames.size === 0) {
    ElMessage.warning('未找到参数,请使用 {{ param_name }} 格式定义参数')
    return
  }

  // 检查已存在的参数
  const existingParams = new Set(formData.parameters.map(p => p.paramName))
  let addedCount = 0

  paramNames.forEach(paramName => {
    if (!existingParams.has(paramName)) {
      formData.parameters.push({
        ...defaultApiParameter,
        paramName
      })
      addedCount++
    }
  })

  if (addedCount > 0) {
    ElMessage.success(`成功提取 ${addedCount} 个参数`)
  } else {
    ElMessage.info('所有参数已存在')
  }
}

// ==================== 测试相关 ====================

/**
 * 测试API
 */
async function testApi() {
  // 验证POST请求的JSON格式
  if (formDataTest.method === 'POST' && formDataTest.bodyParams) {
    try {
      JSON.parse(formDataTest.bodyParams)
    } catch (e) {
      ElMessage.warning('请求体JSON格式错误,请检查')
      return
    }
  }

  testLoading.value = true
  httpStatus.value = null
  responseTime.value = null

  const startTime = Date.now()

  try {
    // 构建请求参数
    const headerParams: Record<string, string> = {}
    formDataTest.headerConfig.forEach(h => {
      if (h.label && h.value) {
        headerParams[h.label] = h.value
      }
    })

    let requestBody: Record<string, any> = {}
    if (formDataTest.method === 'GET') {
      formDataTest.bodyConfig.forEach(p => {
        if (p.label) {
          requestBody[p.label] = p.value || ''
        }
      })
    } else if (formDataTest.method === 'POST' && formDataTest.bodyParams) {
      requestBody = JSON.parse(formDataTest.bodyParams)
    }

    const testRequest = {
      id: formDataTest.id,
      headerParams,
      requestBody
    }

    const res = await TestCustomApiData(testRequest)

    responseTime.value = Date.now() - startTime
    httpStatus.value = res.data?.httpStatus || res.data?.http_status || 200

    if (res.data) {
      if (res.data.body || res.data.data) {
        const responseData = res.data.body || res.data.data
        formDataTest.returnConfig = JSON.stringify(responseData, null, 2)
      } else {
        formDataTest.returnConfig = JSON.stringify(res.data, null, 2)
      }
      ElMessage.success('测试成功')
    }
  } catch (error: any) {
    console.error('测试失败:', error)
    responseTime.value = Date.now() - startTime
    httpStatus.value = error.status || error.response?.status || 500

    formDataTest.returnConfig = JSON.stringify(
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
 * 格式化测试JSON
 */
function formatTestJson() {
  try {
    if (formDataTest.bodyParams) {
      const jsonObj = JSON.parse(formDataTest.bodyParams)
      formDataTest.bodyParams = JSON.stringify(jsonObj, null, 2)
      ElMessage.success('格式化成功')
    }
  } catch (e) {
    ElMessage.warning('JSON格式错误,无法格式化')
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

/**
 * 获取HTTP状态码类型
 */
function getHttpStatusType(status: number | null): string {
  if (!status) return 'info'
  if (status >= 200 && status < 300) return 'success'
  if (status >= 400 && status < 500) return 'warning'
  if (status >= 500) return 'danger'
  return 'info'
}

// ==================== 参数管理 ====================

/**
 * 添加参数
 */
function addParameter() {
  if (!formData.parameters) {
    formData.parameters = []
  }
  formData.parameters.push({...defaultApiParameter})
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
  if (formDataTest.headerConfig.length > 1) {
    formDataTest.headerConfig.splice(index, 1)
  }
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
  if (formDataTest.bodyConfig.length > 1) {
    formDataTest.bodyConfig.splice(index, 1)
  }
}

// ==================== 表单操作 ====================

/**
 * 重置表单
 */
function resetForm() {
  Object.assign(formData, {...defaultApiFormData,
    accessLevel: 'authenticated',  // 🔧 添加
    allowedUserIds: [] })
  Object.assign(formDataTest, {...defaultTestFormData})
  formRef.value?.resetFields()
  formTestRef.value?.resetFields()
  stepIndex.value = 0
  httpStatus.value = null
  responseTime.value = null
}

/**
 * 关闭弹窗
 */
function closeEvent() {
  modelConfig.visible = false
  setTimeout(() => {
    resetForm()
  }, 300)
}

// 添加加载API用户列表的方法
async function loadApiUserList(visible: boolean) {
  if (!visible || apiUserList.value.length > 0) return

  try {
    const res = await GetAPIUserList({
      skip: 0,
      limit: 100,
      is_active: true
    })

    if (res.data && res.data.users) {
      apiUserList.value = res.data.users.map((item: any) => ({
        id: item.id,
        username: item.username,
        display_name: item.display_name
      }))
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

// 添加访问级别变化处理
function handleAccessLevelChange(value: string) {
  if (value !== 'restricted') {
    formData.allowedUserIds = []
  }
}

async function loadApiPermissions(apiId: number) {
  try {
    const { GetAPIPermissions } = await import('@/services/api-user.service')
    const res = await GetAPIPermissions(apiId)

    if (res.data && res.data.permissions) {
      formData.allowedUserIds = res.data.permissions.map((p: any) => p.user_id)
    }
  } catch (error) {
    console.error('加载权限失败:', error)
  }
}
</script>

<style lang="scss" scoped>

.custom-api-form__step {
  padding: 20px 80px;
  margin-bottom: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.custom-api-form {
  padding: 20px 30px;
  // max-height: 600px;
  overflow-y: auto;

  .tooltip-icon {
    position: absolute;
    right: -24px;
    top: 2px;
    color: var(--el-color-info);
    cursor: help;
    font-size: 16px;
  }

  .form-item-label {
    display: flex;
    align-items: center;
  }

  .sql-editor-wrapper {
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    overflow: hidden;
    width: 100%;

    .sql-toolbar {
      display: flex;
      gap: 8px;
      padding: 8px;
      background-color: #f5f7fa;
      border-bottom: 1px solid var(--el-border-color);
    }
  }

  .json-editor-wrapper {
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    overflow: hidden;

    .sql-toolbar {
      display: flex;
      gap: 8px;
      padding: 8px;
      background-color: #f5f7fa;
      border-bottom: 1px solid var(--el-border-color);
    }
  }

  .parameter-config {
    .parameter-list {
      margin-top: 16px;

      .parameter-item {
        margin-bottom: 16px;

        .parameter-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        :deep(.el-card__body) {
          padding-top: 12px;
        }
      }
    }
  }

  .form-options-list {
    width: 100%;

    .form-options-item {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 8px;

      .separator {
        flex: 0 0 24px;
        text-align: center;
        color: var(--el-text-color-secondary);
        font-weight: 600;
      }
    }
  }
}

.custom-api-test-form {
  padding: 20px 30px;
  // max-height: 600px;
  overflow-y: auto;

  .response-header {
    padding: 12px;
    background-color: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 8px;
  }

  .response-wrapper {
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    // min-height: 300px;
    // max-height: 400px;
    overflow: auto;
  }

  .form-options-list {
    width: 100%;

    .form-options-item {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 8px;

      .separator {
        flex: 0 0 24px;
        text-align: center;
        color: var(--el-text-color-secondary);
        font-weight: 600;
      }
    }
  }
}

:deep(.el-step__title) {
  font-size: 14px;
}

:deep(.el-step__description) {
  font-size: 12px;
}
:deep(.el-form-item__content) { 
 display: block !important;
}

// 滚动条美化
:deep(.custom-api-form::-webkit-scrollbar),
:deep(.custom-api-test-form::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

:deep(.custom-api-form::-webkit-scrollbar-thumb),
:deep(.custom-api-test-form::-webkit-scrollbar-thumb) {
  background-color: #dcdfe6;
  border-radius: 3px;
}

:deep(.custom-api-form::-webkit-scrollbar-thumb:hover),
:deep(.custom-api-test-form::-webkit-scrollbar-thumb:hover) {
  background-color: #c0c4cc;
}
</style>