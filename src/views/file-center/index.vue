<template>
  <Breadcrumb :bread-crumb-list="breadCrumbList" />
  <div class="zqy-seach-table">
    <div class="zqy-table-top">
      <el-button
        type="primary"
        @click="addData"
      >
        上传资源
      </el-button>
      <div class="zqy-tenant__select">
        <el-select
          v-model="type"
          clearable
          placeholder="请选择类型进行搜索"
          @change="initData(false)"
        >
          <el-option
            v-for="item in typeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <div class="zqy-seach">
        <el-input
          v-model="keyword"
          placeholder="请输入备注 回车进行搜索"
          :maxlength="200"
          clearable
          @input="inputEvent"
          @keyup.enter="initData(false)"
        />
      </div>
    </div>
    <LoadingPage
      :visible="loading"
      :network-error="networkError"
      @loading-refresh="initData(false)"
    >
      <div class="zqy-table">
        <BlockTable
          :table-config="tableConfig"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        >
          <template #options="scopeSlot">
            <div class="btn-group">
              <span
                v-if="!scopeSlot.row.downloadLoading"
                @click="downloadFile(scopeSlot.row, true)"
              >下载</span>
              <el-icon v-else class="is-loading">
                <Loading />
              </el-icon>
              <el-dropdown trigger="click">
                <span class="click-show-more">更多</span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="editData(scopeSlot.row)">
                      备注
                    </el-dropdown-item>
                    <el-dropdown-item @click="deleteData(scopeSlot.row)">
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </BlockTable>
      </div>
    </LoadingPage>
    <AddModal ref="addModalRef" />
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue'
import Breadcrumb from '@/layout/bread-crumb/index.vue'
import BlockTable from '@/components/block-table/index.vue'
import LoadingPage from '@/components/loading/index.vue'
import AddModal from './add-modal/index.vue'

import { BreadCrumbList, TableConfig } from './file-center.config'
import { GetFileCenterList, UploadFileData, DeleteFileData, DownloadFileData, UpdateFileData } from '@/services/file-center.service'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

const breadCrumbList = reactive(BreadCrumbList)
const tableConfig: any = reactive(TableConfig)
const keyword = ref('')
const type = ref('')
const loading = ref(false)
const networkError = ref(false)
const addModalRef = ref<any>(null)
const typeList = ref([
  {
    label: '作业',
    value: 'JOB',
  },
  {
    label: '函数',
    value: 'FUNC',
  },
  {
    label: '依赖',
    value: 'LIB',
  },
  {
    label: 'Excel',
    value: 'EXCEL',
  }
])

function initData(tableLoading?: boolean) {
  loading.value = tableLoading ? false : true
  networkError.value = networkError.value || false

  GetFileCenterList({
    page: tableConfig.pagination.currentPage - 1, // 前端页码从1开始，传给后端需要-1
    page_size: tableConfig.pagination.pageSize,
    keyword: keyword.value,
    type: type.value
  })
      .then((res: any) => {
        // 🆕 适配新的响应格式
        const data = res.data

        // 后端返回的是 items 数组
        tableConfig.tableData = data.items || []

        // 后端返回的是 total
        tableConfig.pagination.total = data.total || 0

        loading.value = false
        tableConfig.loading = false
        networkError.value = false
      })
      .catch(() => {
        tableConfig.tableData = []
        tableConfig.pagination.total = 0
        loading.value = false
        tableConfig.loading = false
        networkError.value = true
      })
}

function addData() {
  addModalRef.value.showModal((data: any) => {
    return new Promise((resolve: any, reject: any) => {
      const formData = new FormData()
      formData.append('type', data.type)
      formData.append('remark', data.remark || '')
      formData.append('file', data.fileData)

      UploadFileData(formData).then((res: any) => {
        // 🆕 适配新的响应格式
        ElMessage.success(res.message || '上传成功')
        initData()
        resolve()
      }).catch((error: any) => {
        reject(error)
      })
    })
  })
}

function editData(data: any) {
  addModalRef.value.showModal((formData: any) => {
    return new Promise((resolve: any, reject: any) => {
      UpdateFileData({
        id: formData.id,
        remark: formData.remark
      }).then((res: any) => {
        // 🆕 适配新的响应格式
        ElMessage.success(res.message || '更新成功')
        initData()
        resolve()
      }).catch((error: any) => {
        reject(error)
      })
    })
  }, data)
}

// 下载
function downloadFile(data: any) {
  data.downloadLoading = true

  DownloadFileData({
    id: data.id
  }).then((res: any) => {
    // 🆕 修改：处理blob响应
    const blob = new Blob([res], { type: 'application/octet-stream' })
    const blobURL = URL.createObjectURL(blob)

    // 创建一个链接元素并模拟点击下载
    const link = document.createElement('a')
    link.href = blobURL
    link.download = data.originalFilename || data.fileName // 使用原始文件名
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()

    // 清理
    document.body.removeChild(link)
    URL.revokeObjectURL(blobURL)

    data.downloadLoading = false
    ElMessage.success('下载成功')
  }).catch((error) => {
    data.downloadLoading = false
    ElMessage.error('下载失败')
    console.error('下载错误:', error)
  })
}

// 删除
function deleteData(data: any) {
  ElMessageBox.confirm('确定删除该文件吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    DeleteFileData({
      id: data.id,
      force: false
    }).then((res: any) => {
      ElMessage.success(res.message || '删除成功')
      // 🆕 修改：立即刷新列表，传true保持当前loading状态为false
      initData(true)  // 改为 true，避免页面loading遮罩
    })
        .catch((error: any) => {
          // 如果是因为被引用而无法删除，提示用户
          if (error.response?.status === 400) {
            ElMessage.warning(error.response.data.detail || '删除失败')
          } else {
            ElMessage.error('删除失败')
          }
        })
  }).catch(() => {
    // 用户取消删除
    console.log('取消删除')
  })
}

function inputEvent(e: string) {
  if (e === '') {
    initData()
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
