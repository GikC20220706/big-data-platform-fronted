<template>
  <BlockModal :model-config="modelConfig" @close-event="closeEvent">
    <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
    >
      <el-form-item label="资产名称" prop="asset_name">
        <el-input
            v-model="formData.asset_name"
            placeholder="请输入资产名称"
            :maxlength="100"
        />
      </el-form-item>

      <el-form-item label="资产编码" prop="asset_code">
        <el-input
            v-model="formData.asset_code"
            placeholder="请输入资产编码（唯一标识）"
            :maxlength="100"
            :disabled="isEdit"
        />
        <div style="color: #999; font-size: 12px; margin-top: 5px;">
          资产编码创建后不可修改
        </div>
      </el-form-item>

      <el-form-item label="所属目录" prop="catalog_id">
        <el-select
            v-model="formData.catalog_id"
            placeholder="请选择数据集目录"
            filterable
            style="width: 100%"
        >
          <el-option
              v-for="item in catalogList"
              :key="item.id"
              :label="item.catalog_name"
              :value="item.id"
          />
        </el-select>
        <div style="color: #999; font-size: 12px; margin-top: 5px;">
          只显示数据集层级（level=3）的目录
        </div>
      </el-form-item>

      <el-form-item label="数据源" prop="data_source_id">
        <el-select
            v-model="formData.data_source_id"
            placeholder="请选择数据源"
            filterable
            style="width: 100%"
        >
          <el-option
              v-for="item in dataSourceList"
              :key="item.name"
              :label="`${item.name} (${item.type})`"
              :value="item.name"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="数据库名" prop="database_name">
        <el-input
            v-model="formData.database_name"
            placeholder="请输入数据库名"
            :maxlength="100"
        />
      </el-form-item>

      <el-form-item label="表名" prop="table_name">
        <el-input
            v-model="formData.table_name"
            placeholder="请输入表名"
            :maxlength="100"
        />
      </el-form-item>

      <el-form-item label="资产类型" prop="asset_type">
        <el-select
            v-model="formData.asset_type"
            placeholder="请选择资产类型"
            style="width: 100%"
        >
          <el-option label="数据表" value="table" />
          <el-option label="视图" value="view" />
          <el-option label="外部表" value="external" />
          <el-option label="临时表" value="temp" />
        </el-select>
      </el-form-item>

      <el-form-item label="质量等级" prop="quality_level">
        <el-select
            v-model="formData.quality_level"
            placeholder="请选择质量等级"
            style="width: 100%"
        >
          <el-option label="A - 优秀" value="A" />
          <el-option label="B - 良好" value="B" />
          <el-option label="C - 一般" value="C" />
          <el-option label="D - 较差" value="D" />
        </el-select>
      </el-form-item>

      <el-form-item label="业务描述" prop="business_description">
        <el-input
            v-model="formData.business_description"
            type="textarea"
            :rows="3"
            placeholder="请输入业务描述"
            :maxlength="500"
        />
      </el-form-item>

      <el-form-item label="技术说明" prop="technical_description">
        <el-input
            v-model="formData.technical_description"
            type="textarea"
            :rows="3"
            placeholder="请输入技术说明"
            :maxlength="500"
        />
      </el-form-item>

      <el-form-item label="业务负责人" prop="business_owner">
        <el-input
            v-model="formData.business_owner"
            placeholder="请输入业务负责人"
            :maxlength="100"
        />
      </el-form-item>

      <el-form-item label="技术负责人" prop="technical_owner">
        <el-input
            v-model="formData.technical_owner"
            placeholder="请输入技术负责人"
            :maxlength="100"
        />
      </el-form-item>

      <el-form-item label="标签" prop="tags">
        <el-select
            v-model="formData.tags"
            placeholder="请选择或输入标签"
            multiple
            filterable
            allow-create
            style="width: 100%"
        >
          <el-option label="核心" value="核心" />
          <el-option label="重要" value="重要" />
          <el-option label="普通" value="普通" />
        </el-select>
      </el-form-item>

      <el-form-item label="是否公开" prop="is_public">
        <el-switch v-model="formData.is_public" />
        <span style="margin-left: 10px; color: #999; font-size: 12px;">
                    公开后其他用户可查看
                </span>
      </el-form-item>

      <el-form-item label="允许下载" prop="allow_download">
        <el-switch v-model="formData.allow_download" />
      </el-form-item>

      <el-form-item label="最大下载行数" prop="max_download_rows" v-if="formData.allow_download">
        <el-input-number
            v-model="formData.max_download_rows"
            :min="100"
            :max="1000000"
            :step="1000"
            style="width: 200px"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="closeEvent">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="submitLoading">
        {{ isEdit ? '更新' : '创建' }}
      </el-button>
    </template>
  </BlockModal>
</template>

<script lang="ts" setup>
import { ref, reactive, defineEmits } from 'vue'
import BlockModal from '@/components/block-modal/index.vue'
import { ElMessage } from 'element-plus'
import { CreateAsset, UpdateAsset } from '@/services/data-asset.service'
import { GetCatalogTree } from '@/services/data-catalog.service'
import { GetDatasourceList } from '@/services/datasource.service'

const emit = defineEmits(['refresh'])

const modelConfig = reactive({
  title: '新建数据资产',
  visible: false,
  width: '700px'
})

const formRef = ref<any>(null)
const submitLoading = ref(false)
const isEdit = ref(false)
const editId = ref<number | null>(null)

const formData = ref({
  asset_name: '',
  asset_code: '',
  catalog_id: null,
  data_source_id: null,
  database_name: '',
  table_name: '',
  asset_type: 'table',
  quality_level: 'C',
  business_description: '',
  technical_description: '',
  business_owner: '',
  technical_owner: '',
  tags: [],
  is_public: true,
  allow_download: true,
  max_download_rows: 10000
})

const rules = {
  asset_name: [
    { required: true, message: '请输入资产名称', trigger: 'blur' }
  ],
  asset_code: [
    { required: true, message: '请输入资产编码', trigger: 'blur' }
  ],
  catalog_id: [
    { required: true, message: '请选择目录', trigger: 'change' }
  ],
  data_source_id: [
    { required: true, message: '请选择数据源', trigger: 'change' }
  ],
  table_name: [
    { required: true, message: '请输入表名', trigger: 'blur' }
  ]
}

const catalogList = ref<any[]>([])
const dataSourceList = ref<any[]>([])

function showModal(data: any) {
  modelConfig.visible = true

  if (data) {
    // 编辑模式
    isEdit.value = true
    editId.value = data.id
    modelConfig.title = '编辑数据资产'

    // 填充表单数据
    formData.value = {
      asset_name: data.asset_name || '',
      asset_code: data.asset_code || '',
      catalog_id: data.catalog_id || null,
      data_source_id: data.data_source_id || null,
      database_name: data.database_name || '',
      table_name: data.table_name || '',
      asset_type: data.asset_type || 'table',
      quality_level: data.quality_level || 'C',
      business_description: data.business_description || '',
      technical_description: data.technical_description || '',
      business_owner: data.business_owner || '',
      technical_owner: data.technical_owner || '',
      tags: data.tags || [],
      is_public: data.is_public !== false,
      allow_download: data.allow_download !== false,
      max_download_rows: data.max_download_rows || 10000
    }
  } else {
    // 新建模式
    isEdit.value = false
    editId.value = null
    modelConfig.title = '新建数据资产'
    resetForm()
  }

  // 加载下拉数据
  loadCatalogList()
  loadDataSourceList()
}

function resetForm() {
  formData.value = {
    asset_name: '',
    asset_code: '',
    catalog_id: null,
    data_source_id: null,
    database_name: '',
    table_name: '',
    asset_type: 'table',
    quality_level: 'C',
    business_description: '',
    technical_description: '',
    business_owner: '',
    technical_owner: '',
    tags: [],
    is_public: true,
    allow_download: true,
    max_download_rows: 10000
  }

  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

function loadCatalogList() {
  GetCatalogTree({
    include_inactive: false
  }).then((res: any) => {
    if (res.success && res.data) {
      // 只显示level=3的数据集
      catalogList.value = flattenTree(res.data)
      if (catalogList.value.length === 0) {
        ElMessage.warning('暂无数据集目录，请先创建数据集（层级3）')
      }
    }
  }).catch(() => {
    catalogList.value = []
  })
}

function flattenTree(tree: any[], parentPath: string = ''): any[] {
  let result: any[] = []
  tree.forEach((node: any) => {
    // 构建完整路径
    const currentPath = parentPath
        ? `${parentPath} / ${node.catalog_name}`
        : node.catalog_name

    // 只添加 level=3 的数据集
    if (node.level === 3) {
      result.push({
        id: node.id,
        catalog_name: currentPath,  // 显示完整路径
        level: node.level
      })
    }

    // 递归处理子节点
    if (node.children && node.children.length > 0) {
      result = result.concat(flattenTree(node.children, currentPath))
    }
  })
  return result
}

function loadDataSourceList() {
  GetDatasourceList({
    page: 1,
    page_size: 100,
    include_table_count: false,
    fast_mode: true
  }).then((res: any) => {
    console.log('数据源列表响应:', res)
    if (res.code === 200 && res.data && res.data.sources) {
      dataSourceList.value = res.data.sources
    } else {
      dataSourceList.value = []
      ElMessage.warning('未获取到数据源列表')
    }
  }).catch((err) => {
    console.error('加载数据源失败:', err)
    dataSourceList.value = []
    ElMessage.error('加载数据源失败')
  })
}

function dataSourceChange() {
  // 数据源变更时可以做一些处理
  formData.value.database_name = ''
  formData.value.table_name = ''
}

function submitForm() {
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      submitLoading.value = true

      const submitData = {
        ...formData.value
      }

      const promise = isEdit.value
          ? UpdateAsset(editId.value!, submitData)
          : CreateAsset(submitData)

      promise.then((res: any) => {
        if (res.success) {
          ElMessage.success(res.message || (isEdit.value ? '更新成功' : '创建成功'))
          closeEvent()
          emit('refresh')
        } else {
          ElMessage.error(res.message || (isEdit.value ? '更新失败' : '创建失败'))
        }
      }).catch(() => {
        ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
      }).finally(() => {
        submitLoading.value = false
      })
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
:deep(.el-form-item__label) {
  font-weight: normal;
}
</style>