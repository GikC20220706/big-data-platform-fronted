<template>
  <Breadcrumb :bread-crumb-list="breadCrumbList" />
  <div class="zqy-seach-table">
    <div class="zqy-table-top">
      <el-button type="primary" @click="addData">
        添加数据源
      </el-button>
      <div class="zqy-tenant__select">
        <el-select 
          v-model="datasourceType" 
          placeholder="请选择数据源类型" 
          filterable
          clearable
          @change="handleChnage"
        >
          <el-option
            v-for="item in datasourceTypeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>
      <div class="zqy-seach">
        <el-input v-model="keyword" placeholder="请输入名称/类型/连接信息/用户名/备注 回车进行搜索" :maxlength="200" clearable
          @input="inputEvent" @keyup.enter="initData(false)" />
      </div>
    </div>
    <LoadingPage :visible="loading" :network-error="networkError" @loading-refresh="initData(false)">
      <div class="zqy-table">
        <BlockTable :table-config="tableConfig" @size-change="handleSizeChange" @current-change="handleCurrentChange">
          <template #statusTag="scopeSlot">
            <ZStatusTag :status="scopeSlot.row.status"></ZStatusTag>
          </template>
          <template #options="scopeSlot">
            <div class="btn-group">

              <span v-if="!scopeSlot.row.checkLoading" @click="checkData(scopeSlot.row)">检测</span>
              <el-icon
                  v-else
                  class="is-loading"
              >
                <Loading />
              </el-icon>
              <el-dropdown trigger="click">
                <span class="click-show-more">更多</span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="showLog(scopeSlot.row)">
                      日志
                    </el-dropdown-item>
                    <el-dropdown-item @click="editData(scopeSlot.row)">
                      编辑
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
    <ShowLog ref="showLogRef" />
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue'
import Breadcrumb from '@/layout/bread-crumb/index.vue'
import BlockTable from '@/components/block-table/index.vue'
import LoadingPage from '@/components/loading/index.vue'
import AddModal from './add-modal/index.vue'
import ShowLog from '../computer-group/computer-pointer/show-log/index.vue'

import { BreadCrumbList, TableConfig, FormData, typeList } from './datasource.config'
import { GetDatasourceList, AddDatasourceData, UpdateDatasourceData, CheckDatasourceData, DeleteDatasourceData } from '@/services/datasource.service'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

const keyword = ref('')
const loading = ref(false)
const networkError = ref(false)
const addModalRef = ref(null)
const showLogRef = ref(null)
const datasourceType = ref('')
const datasourceTypeList = ref(typeList)

const breadCrumbList = reactive(BreadCrumbList)
const tableConfig: any = reactive(TableConfig)

function initData(tableLoading?: boolean) {
  loading.value = tableLoading || false
  tableConfig.loading = true
  networkError.value = false

  const params = {
    page: tableConfig.pagination.currentPage,
    page_size: tableConfig.pagination.pageSize,
    include_table_count: false,
    fast_mode: true
  }

  GetDatasourceList(params).then((res: any) => {
    if (res.code === 200) {
      tableConfig.tableData = res.data.sources.map((item: any) => ({
        ...item,
        status: item.status === 'connected' ? 'ACTIVE' : 'NO_ACTIVE',
        checkLoading: false
      }))

      // 更新分页信息
      tableConfig.pagination.total = res.data.total
      tableConfig.pagination.currentPage = res.data.page
      tableConfig.pagination.pageSize = res.data.page_size
    } else {
      ElMessage.error(res.message || '获取数据源列表失败')
    }
    tableConfig.loading = false
    loading.value = false
  }).catch((err: any) => {
    tableConfig.loading = false
    loading.value = false
    networkError.value = true
    ElMessage.error('获取数据源列表失败')
  })
}

function addData() {
  addModalRef.value?.showModal((params: any) => {
    return new Promise((resolve, reject) => {
      AddDatasourceData(params).then((res: any) => {
        if (res.success) {
          ElMessage.success(res.message || '添加成功')
          initData(false)
          resolve(res)
        } else {
          ElMessage.error(res.message || '添加失败')
          reject(res)
        }
      }).catch((err: any) => {
        ElMessage.error(err.message || '添加失败')
        reject(err)
      })
    })
  })
}

// 查看日志
function showLog(e: any) {
  showLogRef.value.showModal(e.connectLog)
}

function editData(data: any) {
  addModalRef.value?.showModal((params: any, isEdit: string) => {
    return new Promise((resolve, reject) => {
      if (isEdit) {
        // 编辑模式，使用原数据源名称作为路径参数
        UpdateDatasourceData(data.name, params).then((res: any) => {
          if (res.success) {
            ElMessage.success(res.message || '更新成功')
            initData(false)
            resolve(res)
          } else {
            ElMessage.error(res.message || '更新失败')
            reject(res)
          }
        }).catch((err: any) => {
          ElMessage.error(err.message || '更新失败')
          reject(err)
        })
      }
    })
  }, data)
}

// 检测
function checkData(data: any) {
  data.checkLoading = true
  CheckDatasourceData(data.name).then((res: any) => {
    data.checkLoading = false
    if (res.success) {
      ElMessage.success('数据源健康检测完成')
      // 可以根据检测结果更新状态显示
      initData(false)
    } else {
      ElMessage.warning(res.message || '健康检测完成，但发现问题')
    }
  }).catch((err: any) => {
    data.checkLoading = false
    ElMessage.error(err.message || '健康检测失败')
  })
}

// 删除
function deleteData(data: any) {
  ElMessageBox.confirm('此操作将永久删除该数据源, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    DeleteDatasourceData(data.name).then((res: any) => {
      if (res.success) {
        ElMessage.success(res.message || '删除成功')
        initData(false)
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    }).catch((err: any) => {
      ElMessage.error(err.message || '删除失败')
    })
  })
}

function inputEvent(e: string) {
  if (e === '') {
    initData()
  }
}

function handleSizeChange(e: number) {
  tableConfig.pagination.pageSize = e
  tableConfig.pagination.currentPage = 1 // 重置到第一页
  initData(true)
}

function handleCurrentChange(e: number) {
  tableConfig.pagination.currentPage = e
  initData(true)
}

function handleChnage() {
  initData()
}

onMounted(() => {
  tableConfig.pagination.currentPage = 1
  tableConfig.pagination.pageSize = 10
  initData()
})
</script>
