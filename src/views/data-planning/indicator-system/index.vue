<template>
  <Breadcrumb :breadCrumbList="BreadCrumbList" />
  <div class="zqy-seach-table">
    <div class="zqy-table-top">
      <div class="zqy-table-top-left">
        <!-- 主操作组 -->
        <div class="button-group">
          <el-button type="primary" @click="addData">
            新建指标
          </el-button>
          <el-button
              type="danger"
              :disabled="selectedIds.length === 0"
              @click="batchDelete"
          >
            批量删除 ({{ selectedIds.length }})
          </el-button>
        </div>

        <!-- 导入导出组 -->
        <div class="button-group">
          <el-button @click="showImportModal">
            批量导入
          </el-button>
          <el-button @click="downloadTemplate">
            下载模板
          </el-button>
          <el-button @click="batchExport" :loading="exportLoading">
            导出数据
          </el-button>
        </div>
      </div>

      <div class="zqy-seach">
        <el-input
            v-model="keyword"
            placeholder="请输入指标名称、指标说明或来源系统"
            :maxlength="200"
            clearable
            @input="inputEvent"
            @keyup.enter="initData(false)"
        />
        <el-button type="primary" @click="initData(false)">
          搜索
        </el-button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="zqy-filter-bar">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="业务领域">
          <el-select
              v-model="filterForm.business_domain"
              placeholder="请选择"
              clearable
              @change="initData(false)"
          >
            <el-option
                v-for="item in businessDomainList"
                :key="item"
                :label="item"
                :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="指标类别">
          <el-select
              v-model="filterForm.indicator_category"
              placeholder="请选择"
              clearable
              @change="initData(false)"
          >
            <el-option
                v-for="item in indicatorCategoryList"
                :key="item"
                :label="item"
                :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="采集频率">
          <el-select
              v-model="filterForm.collection_frequency"
              placeholder="请选择"
              clearable
              @change="initData(false)"
          >
            <el-option
                v-for="item in CollectionFrequencyOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
              v-model="filterForm.is_active"
              placeholder="请选择"
              clearable
              @change="initData(false)"
          >
            <el-option label="全部" :value="null" />
            <el-option label="启用" :value="true" />
            <el-option label="停用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <LoadingPage
        :visible="loading"
        :network-error="networkError"
        @loading-refresh="initData(false)"
    >
      <!-- 🆕 将 zqy-table 包裹改为两层 -->
      <div class="table-wrapper">
        <div class="zqy-table">
          <BlockTable
              :table-config="tableConfigWithoutPagination"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              @selection-change="handleSelectionChange"
          >
            <!-- 🆕 添加复选框列 -->
            <template #selection>
              <el-table-column type="selection" width="55" />
            </template>
            <template #statusSlot="scopeSlot">
              <el-tag v-if="scopeSlot.row.is_active" type="success">
                启用
              </el-tag>
              <el-tag v-else type="info">
                停用
              </el-tag>
            </template>
            <template #options="scopeSlot">
              <div class="btn-group">
                <span @click="viewDetail(scopeSlot.row)">查看</span>
                <span @click="editData(scopeSlot.row)">编辑</span>
                <span @click="manageAssets(scopeSlot.row)">关联资产</span>
                <span
                    class="delete-btn"
                    @click="softDeleteData(scopeSlot.row)"
                >
                  {{ scopeSlot.row.is_active ? '停用' : '启用' }}
                </span>
              </div>
            </template>
          </BlockTable>
        </div>

        <!-- 🆕 分页器移到外面 -->
        <div class="custom-pagination-wrapper">
          <el-pagination
              v-model:current-page="tableConfig.pagination!.currentPage"
              v-model:page-size="tableConfig.pagination!.pageSize"
              :page-sizes="[20, 50, 100]"
              :total="tableConfig.pagination!.total"
              layout="total, sizes, prev, pager, next, jumper"
              background
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </LoadingPage>
  </div>

  <!-- 新增/编辑弹窗 -->
  <add-modal ref="addModalRef" @refresh="initData(false)" />

  <!-- 导入弹窗 -->
  <import-modal ref="importModalRef" @refresh="initData(false)" />

  <!-- 详情抽屉 -->
  <detail-drawer ref="detailDrawerRef" @refresh="initData(false)" />

  <!-- 关联资产弹窗 -->
  <asset-link-modal ref="assetLinkModalRef" @refresh="initData(false)" />
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import Breadcrumb from '@/layout/bread-crumb/index.vue'
import LoadingPage from '@/components/loading/index.vue'
import BlockTable from '@/components/block-table/index.vue'
import AddModal from './add-modal/index.vue'
import ImportModal from './import-modal/index.vue'
import DetailDrawer from './detail-drawer/index.vue'
import AssetLinkModal from './asset-link-modal/index.vue'
import { BreadCrumbList, TableConfig } from './list.config'
import { CollectionFrequencyOptions } from './data.config'
import {
  GetIndicatorList,
  DeleteIndicator,
  GetBusinessDomains,
  GetIndicatorCategories,
  DownloadTemplate,
  BatchExportIndicators
} from '@/services/indicator-system.service'
import { computed } from 'vue'

const keyword = ref('')
const loading = ref(false)
const networkError = ref(false)
const tableConfig = reactive(TableConfig)
const selectedIds = ref<number[]>([])
const selectedRows = ref<any[]>([])

// 筛选表单
const filterForm = reactive({
  business_domain: '',
  indicator_category: '',
  collection_frequency: '',
  is_active: null as boolean | null
})

// 下拉选项
const businessDomainList = ref<string[]>([])
const indicatorCategoryList = ref<string[]>([])

// 组件引用
const addModalRef = ref<any>(null)
const importModalRef = ref<any>(null)
const detailDrawerRef = ref<any>(null)
const assetLinkModalRef = ref<any>(null)
const tableConfigWithoutPagination = computed(() => {
  const { pagination, ...rest } = tableConfig
  return rest
})

onMounted(() => {
  initData(true)
  loadBusinessDomains()
  loadIndicatorCategories()
})

function initData(tableLoading: boolean) {
  loading.value = tableLoading ? false : true
  networkError.value = false

  const params: any = {
    page: tableConfig.pagination!.currentPage,
    page_size: tableConfig.pagination!.pageSize
  }

  if (keyword.value) {
    params.keyword = keyword.value
  }
  if (filterForm.business_domain) {
    params.business_domain = filterForm.business_domain
  }
  if (filterForm.indicator_category) {
    params.indicator_category = filterForm.indicator_category
  }
  if (filterForm.collection_frequency) {
    params.collection_frequency = filterForm.collection_frequency
  }
  if (filterForm.is_active !== null) {
    params.is_active = filterForm.is_active
  }

  GetIndicatorList(params)
      .then((res: any) => {
        if (res.success && res.data) {
          tableConfig.tableData = res.data.items || []
          tableConfig.pagination!.total = res.data.total || 0
        } else {
          tableConfig.tableData = []
          tableConfig.pagination!.total = 0
        }
        loading.value = false
        networkError.value = false
      })
      .catch(() => {
        tableConfig.tableData = []
        tableConfig.pagination!.total = 0
        loading.value = false
        networkError.value = true
      })
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

function inputEvent(e: string) {
  if (e === '') {
    initData(false)
  }
}

function resetFilter() {
  filterForm.business_domain = ''
  filterForm.indicator_category = ''
  filterForm.collection_frequency = ''
  filterForm.is_active = null
  initData(false)
}

function handleSizeChange(e: number) {
  tableConfig.pagination!.pageSize = e
  initData(false)
}

function handleCurrentChange(e: number) {
  tableConfig.pagination!.currentPage = e
  initData(false)
}

function addData() {
  addModalRef.value.showModal()
}

function viewDetail(row: any) {
  detailDrawerRef.value.showDrawer(row.id)
}

function editData(row: any) {
  addModalRef.value.showModal(row)
}

function manageAssets(row: any) {
  assetLinkModalRef.value.showModal(row.id)
}

function deleteData(row: any) {
  ElMessageBox.confirm(
      `确定要删除指标"${row.indicator_name}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  )
      .then(() => {
        DeleteIndicator(row.id, false)
            .then((res: any) => {
              if (res.success) {
                ElMessage.success('删除成功')
                initData(false)
              } else {
                ElMessage.error(res.message || '删除失败')
              }
            })
            .catch(() => {
              ElMessage.error('删除失败')
            })
      })
      .catch(() => {
        // 用户取消
      })
}

function showImportModal() {
  importModalRef.value.showModal()
}

// 🆕 处理表格选择变化
function handleSelectionChange(selection: any[]) {
  selectedRows.value = selection
  selectedIds.value = selection.map(row => row.id)
}

// 🆕 批量删除（软删除）
function batchDelete() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的指标')
    return
  }

  ElMessageBox.confirm(
      `确定要停用选中的 ${selectedIds.value.length} 个指标吗？`,
      '批量停用确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  )
      .then(async () => {
        const loading = ElMessage({
          message: '正在处理...',
          type: 'info',
          duration: 0
        })

        let successCount = 0
        let failCount = 0

        // 逐个删除（软删除）
        for (const id of selectedIds.value) {
          try {
            const res = await DeleteIndicator(id, false)
            if (res.success) {
              successCount++
            } else {
              failCount++
            }
          } catch (error) {
            failCount++
          }
        }

        loading.close()

        if (failCount === 0) {
          ElMessage.success(`成功停用 ${successCount} 个指标`)
        } else {
          ElMessage.warning(`成功 ${successCount} 个，失败 ${failCount} 个`)
        }

        // 刷新列表
        initData(false)
        selectedIds.value = []
        selectedRows.value = []
      })
      .catch(() => {
        // 用户取消
      })
}

// 🆕 软删除单个指标（切换启用/停用状态）
function softDeleteData(row: any) {
  const action = row.is_active ? '停用' : '启用'

  ElMessageBox.confirm(
      `确定要${action}指标"${row.indicator_name}"吗？`,
      `${action}确认`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  )
      .then(() => {
        // 这里需要调用更新状态的接口
        // 暂时使用删除接口（软删除）
        DeleteIndicator(row.id, false)
            .then((res: any) => {
              if (res.success) {
                ElMessage.success(`${action}成功`)
                initData(false)
              } else {
                ElMessage.error(res.message || `${action}失败`)
              }
            })
            .catch(() => {
              ElMessage.error(`${action}失败`)
            })
      })
      .catch(() => {
        // 用户取消
      })
}

function batchExport() {
  const loadingMsg = ElMessage({
    message: '正在生成导出文件...',
    type: 'info',
    duration: 0
  })

  // 构建导出参数
  const params: any = {}

  if (keyword.value) {
    params.keyword = keyword.value
  }
  if (filterForm.business_domain) {
    params.business_domain = filterForm.business_domain
  }
  if (filterForm.indicator_category) {
    params.indicator_category = filterForm.indicator_category
  }
  if (filterForm.collection_frequency) {
    params.collection_frequency = filterForm.collection_frequency
  }
  if (filterForm.is_active !== null) {
    params.is_active = filterForm.is_active
  }

  BatchExportIndicators(params)
      .then((response: any) => {
        loadingMsg.close()

        // 🔥 提取真正的 Blob
        let blob = response

        // 如果响应被包装了，尝试提取 data
        if (response && response.data) {
          blob = response.data
        }

        // 验证是否为 Blob
        if (!(blob instanceof Blob)) {
          console.error('响应不是 Blob 对象:', blob)
          ElMessage.error('导出失败：文件格式错误')
          return
        }

        // 创建下载链接
        try {
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url

          const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
          link.download = `指标体系数据_${timestamp}.xlsx`

          link.style.display = 'none'
          document.body.appendChild(link)
          link.click()

          // 清理
          setTimeout(() => {
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
          }, 100)

          ElMessage.success('导出成功')
        } catch (error) {
          console.error('创建下载链接失败:', error)
          ElMessage.error('导出失败：无法创建下载链接')
        }
      })
      .catch((error: any) => {
        loadingMsg.close()
        console.error('导出失败:', error)
        ElMessage.error('导出失败，请稍后重试')
      })
}

function downloadTemplate() {
  const loadingMsg = ElMessage({
    message: '正在生成模板...',
    type: 'info',
    duration: 0
  })

  DownloadTemplate()
      .then((response: any) => {
        loadingMsg.close()

        // 检查响应数据
        if (!response) {
          ElMessage.error('下载失败：未获取到文件数据')
          return
        }

        // 如果响应被包装了，需要提取实际的blob
        let blob = response
        if (response.data) {
          blob = response.data
        }

        // 确保是Blob对象
        if (!(blob instanceof Blob)) {
          console.error('响应不是Blob对象:', blob)
          ElMessage.error('下载失败：文件格式错误')
          return
        }

        // 创建下载链接
        try {
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = '指标体系导入模板.xlsx'
          link.style.display = 'none'
          document.body.appendChild(link)
          link.click()

          // 清理
          setTimeout(() => {
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
          }, 100)

          ElMessage.success('模板下载成功')
        } catch (error) {
          console.error('创建下载链接失败:', error)
          ElMessage.error('下载失败：无法创建下载链接')
        }
      })
      .catch((error: any) => {
        loadingMsg.close()
        console.error('下载模板失败:', error)
        ElMessage.error('模板下载失败，请稍后重试')
      })
}
</script>

<style lang="scss" scoped>
.zqy-seach-table {
  height: calc(100vh - 120px);  // 🆕 减去顶部导航栏高度
  display: flex;
  flex-direction: column;

  .zqy-table-top {
    flex-shrink: 0;
  }

  .zqy-filter-bar {
    flex-shrink: 0;
    padding: 16px 20px;
    background: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 16px;

    .filter-form {
      margin-bottom: 0;

      :deep(.el-form-item) {
        margin-bottom: 0;
      }
    }
  }
}

.table-wrapper {
  background: #fff;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 320px);  // 🆕 减去顶部导航、面包屑、筛选栏等高度

  .zqy-table {
    flex: 1;
    overflow: auto;  // 🆕 允许滚动

    :deep(.el-pagination) {
      display: none !important;
    }
  }

  .custom-pagination-wrapper {
    flex-shrink: 0;  // 🆕 分页器不缩小
    display: flex;
    justify-content: flex-end;
    padding: 16px 20px;
    border-top: 1px solid #ebeef5;
  }
}

.btn-group {
  span {
    cursor: pointer;
    color: #409eff;
    margin: 0 8px;

    &:hover {
      opacity: 0.8;
    }

    &.delete-btn {
      color: #f56c6c;
    }
  }
}
.zqy-table-top-left {
  display: flex;
  gap: 20px;  // 组之间的间距
  align-items: center;

  .button-group {
    display: flex;
    gap: 8px;  // 组内按钮间距
  }
}
</style>