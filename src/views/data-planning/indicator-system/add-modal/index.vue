<template>
  <BlockModal :model-config="modelConfig">
    <el-tabs v-model="activeTab" class="indicator-tabs">
      <!-- Tab 1: 业务属性 -->
      <el-tab-pane label="业务属性" name="business">
        <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-width="140px"
            class="indicator-form"
        >
          <el-form-item label="指标名称" prop="indicator_name">
            <el-input
                v-model="formData.indicator_name"
                placeholder="请输入指标名称（必填）"
                maxlength="500"
                show-word-limit
            />
          </el-form-item>

          <el-form-item label="来源系统">
            <el-input
                v-model="formData.source_system"
                placeholder="请输入来源系统"
                maxlength="255"
            />
          </el-form-item>

          <el-form-item label="业务领域">
            <el-select
                v-model="formData.business_domain"
                placeholder="请选择或输入业务领域"
                filterable
                allow-create
                clearable
                style="width: 100%"
            >
              <el-option
                  v-for="item in businessDomainList"
                  :key="item"
                  :label="item"
                  :value="item"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="业务主题">
            <el-input
                v-model="formData.business_theme"
                placeholder="请输入业务主题"
                maxlength="255"
            />
          </el-form-item>

          <el-form-item label="指标类别">
            <el-select
                v-model="formData.indicator_category"
                placeholder="请选择或输入指标类别"
                filterable
                allow-create
                clearable
                style="width: 100%"
            >
              <el-option
                  v-for="item in indicatorCategoryList"
                  :key="item"
                  :label="item"
                  :value="item"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="指标说明">
            <el-input
                v-model="formData.indicator_description"
                type="textarea"
                :rows="4"
                placeholder="请输入指标说明"
                maxlength="1000"
                show-word-limit
            />
          </el-form-item>

          <el-form-item label="备注">
            <el-input
                v-model="formData.remark"
                type="textarea"
                :rows="3"
                placeholder="请输入备注信息"
                maxlength="500"
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- Tab 2: 技术属性 -->
      <el-tab-pane label="技术属性" name="technical">
        <el-form
            :model="formData"
            label-width="140px"
            class="indicator-form"
        >
          <el-form-item label="指标类型">
            <el-select
                v-model="formData.indicator_type"
                placeholder="请选择指标类型"
                clearable
                style="width: 100%"
            >
              <el-option
                  v-for="item in IndicatorTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="数据标准技术分类">
            <el-input
                v-model="formData.tech_classification"
                placeholder="请输入数据标准技术分类"
                maxlength="255"
            />
          </el-form-item>

          <el-form-item label="数据类型">
            <el-select
                v-model="formData.data_type"
                placeholder="请选择数据类型"
                clearable
                style="width: 100%"
            >
              <el-option
                  v-for="item in DataTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="数据长度">
            <el-input-number
                v-model="formData.data_length"
                :min="0"
                :max="99999"
                placeholder="请输入数据长度"
                style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="数据格式">
            <el-input
                v-model="formData.data_format"
                placeholder="请输入数据格式，如：YYYY-MM-DD、整数、两位小数等"
                maxlength="255"
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- Tab 3: 管理属性 -->
      <el-tab-pane label="管理属性" name="management">
        <el-form
            :model="formData"
            label-width="140px"
            class="indicator-form"
        >
          <el-form-item label="权责部门">
            <el-input
                v-model="formData.responsible_dept"
                placeholder="请输入权责部门"
                maxlength="255"
            />
          </el-form-item>

          <el-form-item label="采集频率">
            <el-select
                v-model="formData.collection_frequency"
                placeholder="请选择采集频率"
                clearable
                style="width: 100%"
            >
              <el-option
                  v-for="item in CollectionFrequencyOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="采集时点">
            <el-input
                v-model="formData.collection_time"
                placeholder="请输入采集时点，如：每日23:59、每月1日等"
                maxlength="255"
            />
          </el-form-item>

          <el-form-item label="共享类型">
            <el-select
                v-model="formData.share_type"
                placeholder="请选择共享类型"
                clearable
                style="width: 100%"
            >
              <el-option
                  v-for="item in ShareTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="开放属性">
            <el-select
                v-model="formData.open_attribute"
                placeholder="请选择开放属性"
                clearable
                style="width: 100%"
            >
              <el-option
                  v-for="item in OpenAttributeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- Tab 4: 扩展属性 -->
      <el-tab-pane label="扩展属性" name="extra">
        <el-form
            :model="formData"
            label-width="140px"
            class="indicator-form"
        >
          <el-form-item label="标签">
            <el-select
                v-model="formData.tags"
                multiple
                filterable
                allow-create
                placeholder="请输入标签，回车添加"
                style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="是否启用">
            <el-switch
                v-model="formData.is_active"
                active-text="启用"
                inactive-text="停用"
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </BlockModal>
</template>

<script lang="ts" setup>
import { ref, reactive, defineEmits } from 'vue'
import BlockModal from '@/components/block-modal/index.vue'
import { ElMessage } from 'element-plus'
import {
  CreateIndicator,
  UpdateIndicator,
  GetBusinessDomains,
  GetIndicatorCategories
} from '@/services/indicator-system.service'
import {
  IndicatorTypeOptions,
  DataTypeOptions,
  CollectionFrequencyOptions,
  ShareTypeOptions,
  OpenAttributeOptions
} from '../data.config'

const emit = defineEmits(['refresh'])

const modelConfig = reactive({
  title: '新建指标',
  visible: false,
  width: '800px',
  needScale: false,
  zIndex: 1100,
  closeOnClickModal: false,
  okConfig: {
    title: '确定',
    ok: submitForm,
    disabled: false,
    loading: false
  },
  cancelConfig: {
    title: '取消',
    cancel: closeEvent,
    disabled: false
  }
})

const formRef = ref<any>(null)
const submitLoading = ref(false)
const isEdit = ref(false)
const editId = ref<number | null>(null)
const activeTab = ref('business')

const formData = ref({
  // 业务属性
  indicator_name: '',
  source_system: '',
  business_domain: '',
  business_theme: '',
  indicator_category: '',
  indicator_description: '',
  remark: '',

  // 技术属性
  indicator_type: '',
  tech_classification: '',
  data_type: '',
  data_length: null as number | null,
  data_format: '',

  // 管理属性
  responsible_dept: '',
  collection_frequency: '',
  collection_time: '',
  share_type: '',
  open_attribute: '',

  // 扩展属性
  tags: [] as string[],
  is_active: true
})

const rules = {
  indicator_name: [
    { required: true, message: '请输入指标名称', trigger: 'blur' }
  ]
}

// 下拉选项
const businessDomainList = ref<string[]>([])
const indicatorCategoryList = ref<string[]>([])

function showModal(data?: any) {
  modelConfig.visible = true
  activeTab.value = 'business'

  if (data) {
    // 编辑模式
    isEdit.value = true
    editId.value = data.id
    modelConfig.title = '编辑指标'

    // 填充表单数据
    formData.value = {
      indicator_name: data.indicator_name || '',
      source_system: data.source_system || '',
      business_domain: data.business_domain || '',
      business_theme: data.business_theme || '',
      indicator_category: data.indicator_category || '',
      indicator_description: data.indicator_description || '',
      remark: data.remark || '',
      indicator_type: data.indicator_type || '',
      tech_classification: data.tech_classification || '',
      data_type: data.data_type || '',
      data_length: data.data_length || null,
      data_format: data.data_format || '',
      responsible_dept: data.responsible_dept || '',
      collection_frequency: data.collection_frequency || '',
      collection_time: data.collection_time || '',
      share_type: data.share_type || '',
      open_attribute: data.open_attribute || '',
      tags: data.tags || [],
      is_active: data.is_active !== false
    }
  } else {
    // 新建模式
    isEdit.value = false
    editId.value = null
    modelConfig.title = '新建指标'
    resetForm()
  }

  // 加载下拉数据
  loadBusinessDomains()
  loadIndicatorCategories()
}

function resetForm() {
  formData.value = {
    indicator_name: '',
    source_system: '',
    business_domain: '',
    business_theme: '',
    indicator_category: '',
    indicator_description: '',
    remark: '',
    indicator_type: '',
    tech_classification: '',
    data_type: '',
    data_length: null,
    data_format: '',
    responsible_dept: '',
    collection_frequency: '',
    collection_time: '',
    share_type: '',
    open_attribute: '',
    tags: [],
    is_active: true
  }

  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

function loadBusinessDomains() {
  GetBusinessDomains()
      .then((res: any) => {
        if (res.success && res.data) {
          businessDomainList.value = res.data.domains || []
        }
      })
      .catch(() => {
        businessDomainList.value = []
      })
}

function loadIndicatorCategories() {
  GetIndicatorCategories()
      .then((res: any) => {
        if (res.success && res.data) {
          indicatorCategoryList.value = res.data.categories || []
        }
      })
      .catch(() => {
        indicatorCategoryList.value = []
      })
}

function submitForm() {
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      modelConfig.okConfig.loading = true  // 改这里

      const submitData = {
        ...formData.value
      }

      const promise = isEdit.value
          ? UpdateIndicator(editId.value!, submitData)
          : CreateIndicator(submitData)

      promise
          .then((res: any) => {
            if (res.success) {
              ElMessage.success(res.message || (isEdit.value ? '更新成功' : '创建成功'))
              closeEvent()
              emit('refresh')
            } else {
              ElMessage.error(res.message || (isEdit.value ? '更新失败' : '创建失败'))
            }
          })
          .catch(() => {
            ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
          })
          .finally(() => {
            modelConfig.okConfig.loading = false  // 改这里
          })
    } else {
      ElMessage.warning('请完善必填信息')
    }
  })
}

function closeEvent() {
  modelConfig.visible = false
  resetForm()
}

defineExpose({
  showModal
})
</script>

<style lang="scss" scoped>
.indicator-tabs {
  :deep(.el-tabs__content) {
    max-height: 500px;
    overflow-y: auto;
  }
}

.indicator-form {
  padding: 20px;

  :deep(.el-form-item) {
    margin-bottom: 18px;
  }

  :deep(.el-textarea) {
    textarea {
      resize: vertical;
    }
  }
}
</style>