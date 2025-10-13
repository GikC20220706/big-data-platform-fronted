<template>
  <BlockModal :model-config="modelConfig" @close-event="closeEvent">
    <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
    >
      <el-form-item label="选择数据源" prop="data_source_id">
        <el-select
            v-model="formData.data_source_id"
            placeholder="请选择数据源"
            filterable
            style="width: 100%"
            @change="dataSourceChange"
        >
          <el-option
              v-for="item in dataSourceList"
              :key="item.name"
              :label="`${item.name} (${item.type})`"
              :value="item.name"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="目标目录" prop="catalog_id">
        <el-select
            v-model="formData.catalog_id"
            placeholder="请选择目标数据集目录"
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
      </el-form-item>

      <el-form-item label="数据库名" prop="database_name">
        <el-input
            v-model="formData.database_name"
            placeholder="请输入数据库名（可选）"
            :maxlength="100"
        />
        <div style="color: #999; font-size: 12px; margin-top: 5px;">
          某些数据源需要指定数据库名
        </div>
      </el-form-item>

      <el-form-item label="表导入方式">
        <el-radio-group v-model="importMode">
          <el-radio label="pattern">按模式匹配</el-radio>
          <el-radio label="manual">手动选择表</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 模式匹配方式 -->
      <el-form-item
          label="表名匹配规则"
          v-if="importMode === 'pattern'"
      >
        <el-select
            v-model="formData.table_patterns"
            placeholder="请输入表名匹配规则（可选）"
            multiple
            filterable
            allow-create
            style="width: 100%"
        >
          <el-option label="全部导入" value="" />
          <el-option label="cus_%" value="cus_%" />
          <el-option label="order_%" value="order_%" />
          <el-option label="t_%_log" value="t_%_log" />
        </el-select>
        <div style="color: #999; font-size: 12px; margin-top: 5px;">
          使用SQL LIKE语法，如 cus_% 匹配所有cus_开头的表，留空导入全部
        </div>
      </el-form-item>

      <!-- 手动选择表 -->
      <el-form-item
          label="选择表"
          v-if="importMode === 'manual'"
      >
        <div style="margin-bottom: 10px;">
          <el-button
              size="small"
              @click="loadTables(true)"
              :loading="loadingTables"
              :disabled="!formData.data_source_id"
          >
            {{ loadingTables ? '加载中...' : '加载表列表' }}
          </el-button>
          <span style="margin-left: 10px; color: #999; font-size: 12px;">
        已加载 {{ tableList.length }} / {{ totalCount }} 张表
        <span v-if="loadingMore">（正在加载更多...）</span>
        <span v-else-if="hasMore">（向下滚动加载更多）</span>
        <span v-else-if="tableList.length > 0">（已全部加载）</span>
      </span>
        </div>

        <el-select
            v-model="formData.selected_tables"
            placeholder="请选择要导入的表"
            multiple
            filterable
            collapse-tags
            collapse-tags-tooltip
            :max-collapse-tags="3"
            style="width: 100%"
            :loading="loadingTables"
            popper-class="infinite-select-dropdown"
            @visible-change="handleSelectVisibleChange"
        >
          <template v-for="table in tableList" :key="table.table_name">
            <el-option
                :label="table.table_name + (table.comment ? ` (${table.comment})` : '')"
                :value="table.table_name"
            />
          </template>

          <!-- 加载提示 -->
          <template v-if="loadingMore">
            <div style="text-align: center; padding: 10px; color: #409EFF;">
              <el-icon class="is-loading" style="margin-right: 5px;"><Loading /></el-icon>
              加载中...
            </div>
          </template>
          <template v-else-if="!hasMore && tableList.length > 0">
            <div style="text-align: center; padding: 10px; color: #999; font-size: 12px;">
              已全部加载（共 {{ tableList.length }} 张表）
            </div>
          </template>
        </el-select>

        <div style="color: #999; font-size: 12px; margin-top: 5px;">
          已选择 {{ formData.selected_tables?.length || 0 }} 张表
        </div>
      </el-form-item>

      <el-form-item label="导入字段信息" prop="include_columns">
        <el-switch v-model="formData.include_columns" />
        <span style="margin-left: 10px; color: #999; font-size: 12px;">
                    开启后会同时导入表字段信息（耗时较长）
                </span>
      </el-form-item>

      <el-alert
          title="提示"
          type="warning"
          :closable="false"
          style="margin-top: 10px;"
      >
        <ul style="margin: 0; padding-left: 20px;">
          <li>导入操作会创建新的数据资产记录</li>
          <li>如果资产编码已存在会跳过该表</li>
          <li v-if="importMode === 'pattern'">按模式匹配最多导入1000张表</li>
          <li v-if="importMode === 'manual'">手动选择最多可选择100张表</li>
          <li>大量导入可能需要较长时间，请耐心等待</li>
        </ul>
      </el-alert>
    </el-form>
  </BlockModal>
</template>

<script lang="ts" setup>
import { ref, reactive, defineEmits } from 'vue'
import BlockModal from '@/components/block-modal/index.vue'
import { Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { GetCatalogTree } from '@/services/data-catalog.service'
import { GetDatasourceList } from '@/services/datasource.service'
import { ImportFromDataSource, GetSourceTables } from '@/services/data-asset.service'

const emit = defineEmits(['refresh'])

const modelConfig = reactive({
  title: '从数据源导入表',
  visible: false,
  width: '750px',
  okConfig: {
    title: '开始导入',
    ok: submitForm,
    disabled: false,
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

const formRef = ref<any>(null)
const submitLoading = ref(false)
const loadingTables = ref(false)
const importMode = ref('pattern')  // pattern: 模式匹配, manual: 手动选择

const formData = ref({
  data_source_id: null,
  catalog_id: null,
  database_name: '',
  table_patterns: [],
  selected_tables: [],
  include_columns: true
})

const rules = {
  data_source_id: [
    { required: true, message: '请选择数据源', trigger: 'change' }
  ],
  catalog_id: [
    { required: true, message: '请选择目标目录', trigger: 'change' }
  ]
}

const catalogList = ref<any[]>([])
const dataSourceList = ref<any[]>([])
const tableList = ref<any[]>([])
const loadingMore = ref(false)  // 新增：是否正在加载更多
const currentOffset = ref(0)    // 新增：当前偏移量
const hasMore = ref(false)      // 新增：是否还有更多数据
const totalCount = ref(0)       // 新增：总数量

function showModal() {
  modelConfig.visible = true
  resetForm()
  loadCatalogList()
  loadDataSourceList()
}

function resetForm() {
  formData.value = {
    data_source_id: null,
    catalog_id: null,
    database_name: '',
    table_patterns: [],
    selected_tables: [],
    include_columns: true
  }

  importMode.value = 'pattern'
  tableList.value = []

  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

function loadCatalogList() {
  GetCatalogTree({
    include_inactive: false
  }).then((res: any) => {
    if (res.success && res.data) {
      catalogList.value = flattenTree(res.data)
    }
  }).catch(() => {
    catalogList.value = []
  })
}

function flattenTree(tree: any[], parentPath: string = ''): any[] {
  let result: any[] = []
  tree.forEach((node: any) => {
    const currentPath = parentPath
        ? `${parentPath} / ${node.catalog_name}`
        : node.catalog_name

    if (node.level === 3) {
      result.push({
        id: node.id,
        catalog_name: currentPath,
        level: node.level
      })
    }

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
    if (res.code === 200 && res.data && res.data.sources) {
      dataSourceList.value = res.data.sources
    } else {
      dataSourceList.value = []
    }
  }).catch(() => {
    dataSourceList.value = []
  })
}

function dataSourceChange() {
  formData.value.database_name = ''
  formData.value.selected_tables = []
  tableList.value = []
  currentOffset.value = 0
  hasMore.value = false
  totalCount.value = 0
}

async function loadTables(reset = true) {
  if (!formData.value.data_source_id) {
    ElMessage.warning('请先选择数据源')
    return
  }

  // 如果是重置，清空数据
  if (reset) {
    loadingTables.value = true
    tableList.value = []
    currentOffset.value = 0
  } else {
    loadingMore.value = true
  }

  try {
    const response = await fetch(
        `/api/v1/integration/sources/${formData.value.data_source_id}/tables?` +
        `database=${formData.value.database_name || ''}&limit=100&offset=${currentOffset.value}`
    )

    const result = await response.json()

    console.log('表列表响应:', result)

    if (result.code === 200 && result.data && result.data.tables) {
      // 追加数据
      if (reset) {
        tableList.value = result.data.tables
      } else {
        tableList.value = [...tableList.value, ...result.data.tables]
      }

      // 更新状态
      hasMore.value = result.data.has_more
      totalCount.value = result.data.total_count
      currentOffset.value += result.data.tables.length

      if (reset) {
        ElMessage.success(
            `加载成功，共 ${result.data.total_count} 张表，已显示 ${tableList.value.length} 张`
        )
      }
    } else {
      ElMessage.error(result.message || '加载表列表失败')
    }
  } catch (error) {
    console.error('加载表列表失败:', error)
    ElMessage.error('加载表列表失败')
  } finally {
    loadingTables.value = false
    loadingMore.value = false
  }
}

function submitForm() {
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      // 验证数据源
      if (!formData.value.data_source_id) {
        ElMessage.warning('请选择数据源')
        return
      }

      // 验证导入方式
      if (importMode.value === 'manual') {
        if (!formData.value.selected_tables || formData.value.selected_tables.length === 0) {
          ElMessage.warning('请至少选择一张表')
          return
        }

        if (formData.value.selected_tables.length > 100) {
          ElMessage.warning('手动选择最多只能导入100张表')
          return
        }
      }

      modelConfig.okConfig.loading = true
      submitLoading.value = true

      // 构建提交数据
      const submitData: any = {
        data_source_id: formData.value.data_source_id,  // 实际是 name
        catalog_id: Number(formData.value.catalog_id),
        include_columns: Boolean(formData.value.include_columns)
      }

      // 数据库名（可选）
      if (formData.value.database_name && formData.value.database_name.trim()) {
        submitData.database_name = formData.value.database_name.trim()
      }

      // 根据导入方式设置 table_patterns
      if (importMode.value === 'pattern') {
        // 模式匹配
        if (formData.value.table_patterns && formData.value.table_patterns.length > 0) {
          // 过滤空值
          const patterns = formData.value.table_patterns.filter((p: string) => p && p.trim())
          if (patterns.length > 0) {
            submitData.table_patterns = patterns
          }
          // 如果过滤后为空，不传 table_patterns（后端会导入全部）
        }
        // 如果用户没有填写任何规则，不传 table_patterns（后端会导入全部）
      } else {
        // 手动选择
        submitData.table_patterns = formData.value.selected_tables
      }

      console.log('最终提交参数:', submitData)

      ImportFromDataSource(submitData).then((res: any) => {
        console.log('导入响应:', res)

        if (res.success || res.code === 200) {
          const result = res.data || res
          const successCount = result.success_count || 0
          const failedCount = result.failed_count || 0

          ElMessage.success(
              `导入完成！成功: ${successCount}，失败: ${failedCount}`
          )
          closeEvent()
          emit('refresh')
        } else {
          ElMessage.error(res.message || '导入失败')
        }
      }).catch((error: any) => {
        console.error('导入失败:', error)
        ElMessage.error(error.message || '导入失败')
      }).finally(() => {
        submitLoading.value = false
        modelConfig.okConfig.loading = false
      })
    }
  })
}

let scrollElement: HTMLElement | null = null

function handleSelectVisibleChange(visible: boolean) {
  if (visible) {
    // 下拉框打开时，找到滚动容器并监听滚动
    setTimeout(() => {
      const dropdown = document.querySelector('.infinite-select-dropdown .el-select-dropdown__wrap')
      if (dropdown) {
        scrollElement = dropdown as HTMLElement
        scrollElement.addEventListener('scroll', handleDropdownScroll)
      }
    }, 100)
  } else {
    // 下拉框关闭时，移除监听
    if (scrollElement) {
      scrollElement.removeEventListener('scroll', handleDropdownScroll)
      scrollElement = null
    }
  }
}

function handleDropdownScroll(event: Event) {
  const target = event.target as HTMLElement
  const { scrollTop, scrollHeight, clientHeight } = target

  // 距离底部50px时触发加载
  if (scrollHeight - scrollTop - clientHeight < 50) {
    if (hasMore.value && !loadingMore.value && !loadingTables.value) {
      console.log('触发加载更多')
      loadTables(false)
    }
  }
}



function closeEvent() {
  // 清理滚动监听
  if (scrollElement) {
    scrollElement.removeEventListener('scroll', handleDropdownScroll)
    scrollElement = null
  }

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
:deep(.el-form-item__label) {
  font-weight: normal;
}

// 自定义下拉框样式
:deep(.infinite-select-dropdown) {
  .el-select-dropdown__wrap {
    max-height: 400px;
  }
}
</style>