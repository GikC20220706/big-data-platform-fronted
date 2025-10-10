<template>
  <Breadcrumb :bread-crumb-list="breadCrumbList" />
  <div class="zqy-seach-table data-asset">
    <div class="zqy-table-top">
      <div class="btn-container">
        <el-button type="primary" @click="addData">
          新建资产
        </el-button>
        <el-button @click="importFromSource">
          从数据源导入
        </el-button>
      </div>
      <div class="zqy-seach">
        <el-input
            v-model="keyword"
            placeholder="请输入资产名称或编码搜索"
            :maxlength="200"
            clearable
            @input="inputEvent"
            @keyup.enter="handleCurrentChange(1)"
        />
      </div>
    </div>
    <LoadingPage :visible="loading" :network-error="networkError" @loading-refresh="initData(false)">
      <div class="zqy-table">
        <BlockTable
            :table-config="tableConfig"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        >
          <template #statusSlot="scopeSlot">
            <el-tag :type="getStatusType(scopeSlot.row.status)">
              {{ getStatusText(scopeSlot.row.status) }}
            </el-tag>
          </template>
          <template #options="scopeSlot">
            <div class="btn-group btn-group-msg">
              <span @click="viewDetail(scopeSlot.row)">详情</span>
              <span @click="editData(scopeSlot.row)">编辑</span>
              <span @click="deleteData(scopeSlot.row)">删除</span>
            </div>
          </template>
        </BlockTable>
      </div>
    </LoadingPage>
    <AddModal ref="addModalRef" @refresh="initData" />
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue'
import Breadcrumb from '@/layout/bread-crumb/index.vue'
import LoadingPage from '@/components/loading/index.vue'
import AddModal from './add-modal/index.vue'
import { BreadCrumbList, TableConfig } from './list.config'
import { GetAssetList, DeleteAsset } from '@/services/data-asset.service'
import { ElMessage, ElMessageBox } from 'element-plus'

const breadCrumbList = reactive(BreadCrumbList)
const tableConfig: any = reactive(TableConfig)
const keyword = ref('')
const loading = ref(false)
const networkError = ref(false)
const addModalRef = ref<any>(null)

function initData(tableLoading?: boolean) {
  loading.value = tableLoading ? false : true
  networkError.value = networkError.value || false

  GetAssetList({
    page: tableConfig.pagination.currentPage,
    page_size: tableConfig.pagination.pageSize,
    keyword: keyword.value
  }).then((res: any) => {
    if (res.success && res.data) {
      tableConfig.tableData = res.data.items || []
      tableConfig.pagination.total = res.data.total || 0
    }
    loading.value = false
    tableConfig.loading = false
    networkError.value = false
  }).catch(() => {
    tableConfig.tableData = []
    tableConfig.pagination.total = 0
    loading.value = false
    tableConfig.loading = false
    networkError.value = true
  })
}

function addData() {
  addModalRef.value.showModal(null)
}

function importFromSource() {
  ElMessage.info('从数据源导入功能开发中')
}

function editData(data: any) {
  addModalRef.value.showModal(data)
}

function viewDetail(data: any) {
  ElMessage.info('详情功能开发中')
}

function deleteData(data: any) {
  ElMessageBox.confirm('确定删除该资产吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    DeleteAsset(data.id, false).then((res: any) => {
      if (res.success) {
        ElMessage.success(res.message || '删除成功')
        initData()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    }).catch(() => {
      ElMessage.error('删除失败')
    })
  })
}

function getStatusType(status: string) {
  const typeMap: any = {
    'normal': 'success',
    'offline': 'info',
    'maintenance': 'warning',
    'deprecated': 'danger'
  }
  return typeMap[status] || 'info'
}

function getStatusText(status: string) {
  const textMap: any = {
    'normal': '正常',
    'offline': '已下线',
    'maintenance': '维护中',
    'deprecated': '已废弃'
  }
  return textMap[status] || status
}

function inputEvent(e: string) {
  if (e === '') {
    handleCurrentChange(1)
  }
}

function handleSizeChange(e: number) {
  tableConfig.pagination.pageSize = e
  initData()
}

function handleCurrentChange(e: number) {
  tableConfig.pagination.currentPage = e
  initData()
}

onMounted(() => {
  tableConfig.pagination.currentPage = 1
  tableConfig.pagination.pageSize = 10
  initData()
})
</script>

<style lang="scss">
.data-asset {
  &.zqy-seach-table {
    .zqy-table {
      .btn-group-msg {
        justify-content: space-around;
      }
    }
  }
}
</style>