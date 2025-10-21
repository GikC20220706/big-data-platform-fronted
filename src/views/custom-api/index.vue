<!-- src/views/custom-api/index.vue -->

<template>
  <div class="custom-api-page">
    <Breadcrumb :bread-crumb-list="breadCrumbList"/>
    <div class="zqy-seach-table driver-table">
      <div class="zqy-table-top">
        <el-button type="primary" @click="addData">
          <el-icon>
            <Plus/>
          </el-icon>
          添加API
        </el-button>
        <div class="zqy-seach">
          <el-input
              v-model="keyword"
              placeholder="请输入API名称/描述 回车进行搜索"
              :maxlength="200"
              clearable
              @input="inputEvent"
              @keyup.enter="initData(false)"
          >
            <template #prefix>
              <el-icon>
                <Search/>
              </el-icon>
            </template>
          </el-input>
        </div>
      </div>
      <LoadingPage :visible="loading" :network-error="networkError" @loading-refresh="initData(false)">
        <div class="zqy-table">
          <BlockTable
              :table-config="tableConfig"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
          >
            <!-- 状态标签插槽 -->
            <template #statusTag="scopeSlot">
              <el-tag
                  :type="statusTagConfig[scopeSlot.row.status]?.type || 'info'"
                  size="small"
              >
                {{ statusTagConfig[scopeSlot.row.status]?.text || '未知' }}
              </el-tag>
            </template>

            <!-- 操作列插槽 -->
            <template #options="scopeSlot">
              <div class="btn-group">
                <!-- 发布/下线按钮 -->
                <span
                    v-if="scopeSlot.row.status === 'OFFLINE'"
                    class="operation-btn operation-btn-publish"
                    @click="publishApi(scopeSlot.row)"
                >
                  发布
                </span>
                <span
                    v-else
                    class="operation-btn operation-btn-offline"
                    @click="underlineApi(scopeSlot.row)"
                >
                  下线
                </span>

                <!-- 更多操作下拉菜单 -->
                <el-dropdown trigger="click" @command="handleCommand($event, scopeSlot.row)">
                  <span class="click-show-more">更多</span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">
                        <el-icon>
                          <Edit/>
                        </el-icon>
                        编辑
                      </el-dropdown-item>
                      <el-dropdown-item command="test">
                        <el-icon>
                          <VideoPlay/>
                        </el-icon>
                        测试
                      </el-dropdown-item>
                      <el-dropdown-item command="detail">
                        <el-icon>
                          <View/>
                        </el-icon>
                        详情
                      </el-dropdown-item>
                      <el-dropdown-item
                          v-if="scopeSlot.row.status === 'OFFLINE'"
                          command="delete"
                          divided
                      >
                        <el-icon>
                          <Delete/>
                        </el-icon>
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
    </div>

    <!-- 添加/编辑弹窗 -->
    <AddModal ref="addModalRef" @refresh="initData(true)"/>

    <!-- 测试弹窗 -->
    <TestModal ref="testModalRef"/>
  </div>
</template>

<script lang="ts" setup>
import {reactive, ref, onMounted} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {Plus, Search, Edit, Delete, VideoPlay, View} from '@element-plus/icons-vue'

import Breadcrumb from '@/layout/bread-crumb/index.vue'
import BlockTable from '@/components/block-table/index.vue'
import LoadingPage from '@/components/loading/index.vue'
import AddModal from './add-modal/index.vue'
import TestModal from './test-modal/index.vue'

import {
  BreadCrumbList,
  TableConfig,
  statusTagConfig
} from './costom-api.config'

import {
  QueryCustomApiList,
  DeleteCustomApiData,
  PublishCustomApiData,
  OfflineCustomApiData,
  GetCustomApiDetailData
} from '@/services/custom-api.service'

import {customApiAdapter} from '@/services/custom-api.adapter'
import type {ApiTableRow} from '@/types/custom-api.types'
import {http} from "@/utils/http";

// ==================== 响应式数据 ====================

const breadCrumbList = reactive(BreadCrumbList)
const tableConfig: any = reactive(TableConfig)
const keyword = ref('')
const loading = ref(false)
const networkError = ref(false)
const addModalRef = ref<any>(null)
const testModalRef = ref<any>(null)

// ==================== 生命周期 ====================

onMounted(() => {
  initData()
})

// ==================== 数据初始化 ====================

/**
 * 初始化数据
 */
function initData(tableLoading?: boolean) {
  loading.value = tableLoading ? false : true
  networkError.value = false
  tableConfig.loading = !tableLoading

  QueryCustomApiList({
    page: tableConfig.pagination.currentPage - 1,
    pageSize: tableConfig.pagination.pageSize,
    searchKeyWord: keyword.value
  })
      .then((res: any) => {
        if (res.data && res.data.content) {
          // 转换为表格行数据
          const apiList = res.data.content.map((item: any) => {
            const converted = customApiAdapter.convertApiListItemToFrontend(item)
            return converted
          })
          tableConfig.tableData = customApiAdapter.convertApiListToTableRows(apiList)
          tableConfig.pagination.total = res.data.totalElements || 0
        } else {
          tableConfig.tableData = []
          tableConfig.pagination.total = 0
        }

        loading.value = false
        tableConfig.loading = false
        networkError.value = false
      })

      .catch((error) => {
        console.error('查询API列表失败:', error)
        tableConfig.tableData = []
        tableConfig.pagination.total = 0
        loading.value = false
        tableConfig.loading = false
        networkError.value = true
      })
}

/**
 * 输入事件(防抖)
 */
let inputTimer: any = null

function inputEvent() {
  if (inputTimer) {
    clearTimeout(inputTimer)
  }
  inputTimer = setTimeout(() => {
    tableConfig.pagination.currentPage = 1
    initData(false)
  }, 500)
}

// ==================== 表格操作 ====================

/**
 * 分页大小改变
 */
function handleSizeChange(val: number) {
  tableConfig.pagination.pageSize = val
  tableConfig.pagination.currentPage = 1
  initData(true)
}

/**
 * 当前页改变
 */
function handleCurrentChange(val: number) {
  tableConfig.pagination.currentPage = val
  initData(true)
}

// ==================== API操作 ====================

/**
 * 添加API
 */
function addData() {
  addModalRef.value?.showModal()
}

/**
 * 编辑API
 */
function editData(row: ApiTableRow) {
  addModalRef.value?.showModal(row.id)
}

/**
 * 查看详情
 */
function viewDetail(row: ApiTableRow) {
  if (!row || !row.id) {
    ElMessage.error('无法查看详情,数据无效')
    return
  }

  GetCustomApiDetailData(row.id)
      .then((res: any) => {
        if (res.data) {
          const api = res.data
          const detailHtml = `
          <div style="text-align: left; max-height: 60vh; overflow-y: auto; padding: 0 10px;">
            <h3 style="margin-top: 0; color: #303133;">API基本信息</h3>
            <p><strong>API名称:</strong> ${api.apiName || api.api_name}</p>
            <p><strong>API路径:</strong> ${api.apiPath || api.api_path}</p>
            <p><strong>请求方式:</strong> <span style="color: #67C23A; font-weight: bold;">${api.httpMethod || api.http_method}</span></p>
            <p><strong>响应格式:</strong> ${api.responseFormat || api.response_format}</p>
            <p><strong>状态:</strong> ${(api.isActive !== undefined ? api.isActive : api.is_active) ? '<span style="color: #67C23A;">已发布</span>' : '<span style="color: #909399;">未发布</span>'}</p>
            <p><strong>描述:</strong> ${api.description || '-'}</p>

            <h3 style="margin-top: 20px; color: #303133;">数据源信息</h3>
            <p><strong>数据源:</strong> ${api.dataSource?.name || api.data_source?.name || '-'}</p>
            <p><strong>数据源类型:</strong> ${api.dataSource?.type || api.data_source?.type || '-'}</p>

            <h3 style="margin-top: 20px; color: #303133;">SQL模板</h3>
            <pre style="background: #f5f7fa; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 12px;">${api.sqlTemplate || api.sql_template}</pre>

            <h3 style="margin-top: 20px; color: #303133;">性能配置</h3>
            <p><strong>缓存时间:</strong> ${api.cacheTtl || api.cache_ttl}秒</p>
            <p><strong>频率限制:</strong> ${api.rateLimit || api.rate_limit}次/分钟</p>

            <h3 style="margin-top: 20px; color: #303133;">统计信息</h3>
            <p><strong>总调用次数:</strong> ${api.statistics?.totalCalls || api.statistics?.total_calls || 0}</p>
            <p><strong>成功次数:</strong> ${api.statistics?.successCalls || api.statistics?.success_calls || 0}</p>
            <p><strong>成功率:</strong> ${(api.statistics?.successRate || api.statistics?.success_rate || 0).toFixed(2)}%</p>
            <p><strong>最后调用时间:</strong> ${api.statistics?.lastCallTime || api.statistics?.last_call_time || '-'}</p>

            ${api.parameters && api.parameters.length > 0 ? `
              <h3 style="margin-top: 20px; color: #303133;">参数列表</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="background: #f5f7fa;">
                    <th style="padding: 8px; border: 1px solid #ebeef5; text-align: left;">参数名</th>
                    <th style="padding: 8px; border: 1px solid #ebeef5; text-align: left;">类型</th>
                    <th style="padding: 8px; border: 1px solid #ebeef5; text-align: center;">必填</th>
                    <th style="padding: 8px; border: 1px solid #ebeef5; text-align: left;">默认值</th>
                    <th style="padding: 8px; border: 1px solid #ebeef5; text-align: left;">描述</th>
                  </tr>
                </thead>
                <tbody>
                  ${api.parameters.map((p: any) => `
                    <tr>
                      <td style="padding: 8px; border: 1px solid #ebeef5;">${p.paramName || p.param_name}</td>
                      <td style="padding: 8px; border: 1px solid #ebeef5;">${p.paramType || p.param_type}</td>
                      <td style="padding: 8px; border: 1px solid #ebeef5; text-align: center;">${(p.isRequired !== undefined ? p.isRequired : p.is_required) ? '<span style="color: #F56C6C;">是</span>' : '否'}</td>
                      <td style="padding: 8px; border: 1px solid #ebeef5;">${p.defaultValue || p.default_value || '-'}</td>
                      <td style="padding: 8px; border: 1px solid #ebeef5;">${p.description || '-'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p style="color: #909399;">暂无参数</p>'}

            <h3 style="margin-top: 20px; color: #303133;">其他信息</h3>
            <p><strong>创建人:</strong> ${api.createdBy || api.created_by || '-'}</p>
            <p><strong>创建时间:</strong> ${api.createdAt || api.created_at}</p>
            <p><strong>更新时间:</strong> ${api.updatedAt || api.updated_at}</p>
          </div>
        `

          ElMessageBox.alert(detailHtml, 'API详情', {
            dangerouslyUseHTMLString: true,
            confirmButtonText: '关闭',
            customClass: 'api-detail-dialog'
          })
        }
      })
      .catch((error) => {
        console.error('获取API详情失败:', error)
        ElMessage.error('获取API详情失败')
      })
}

/**
 * 测试API
 */
function testApi(row: ApiTableRow) {
  testModalRef.value?.showModal(row.id)
}

/**
 * 发布API
 */
function publishApi(row: ApiTableRow) {
  ElMessageBox.confirm('确定要发布该API吗?', '确认发布', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    http.request({
      method: 'post',
      url: `/api/v1/custom-api/custom-api/${row.id}/toggle`
    }).then((res: any) => {
      ElMessage.success('发布成功')
      initData() // 刷新列表
    }).catch((error: any) => {
      console.error('发布失败:', error)
      ElMessage.error('发布失败')
    })
  })
}

/**
 * 下线API
 */
function underlineApi(row: ApiTableRow) {
  ElMessageBox.confirm('确定要下线该API吗?下线后将无法访问', '确认下线', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 使用 toggle 接口切换状态为 false
    http.request({
      method: 'post',
      url: `/api/v1/custom-api/custom-api/${row.id}/toggle`
    }).then((res: any) => {
      ElMessage.success('下线成功')
      initData() // 刷新列表
    }).catch((error: any) => {
      console.error('下线失败:', error)
      ElMessage.error('下线失败')
    })
  })
}

/**
 * 删除API
 */
function deleteData(row: ApiTableRow) {
  ElMessageBox.confirm(
      `确定要删除API "${row.name}" 吗?删除后数据将无法恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
  )
      .then(() => {
        DeleteCustomApiData(row.id)
            .then((res: any) => {
              ElMessage.success(res.msg || '删除成功')
              // 如果当前页没有数据了，返回上一页
              if (tableConfig.tableData.length === 1 && tableConfig.pagination.currentPage > 1) {
                tableConfig.pagination.currentPage--
              }
              initData(true)
            })
            .catch((error) => {
              console.error('删除API失败:', error)
              ElMessage.error('删除失败，请重试')
            })
      })
      .catch(() => {
        // 用户取消
      })
}

/**
 * 处理下拉菜单命令
 */
function handleCommand(command: string, row: ApiTableRow) {
  switch (command) {
    case 'edit':
      editData(row)
      break
    case 'test':
      testApi(row)
      break
    case 'detail':
      viewDetail(row)
      break
    case 'delete':
      deleteData(row)
      break
    default:
      console.warn('未知操作:', command)
  }
}
</script>

<style lang="scss" scoped>
.custom-api-page {
  height: 100%;
  display: flex;
  flex-direction: column;

  .zqy-seach-table {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .zqy-table-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background-color: #fff;
      border-bottom: 1px solid var(--el-border-color-light);

      .zqy-seach {
        width: 300px;
      }
    }

    .zqy-table {
      flex: 1;
      overflow: hidden;
    }
  }

  .btn-group {
    display: flex;
    align-items: center;
    gap: 8px;

    .operation-btn {
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      transition: all 0.3s;

      &:hover {
        opacity: 0.8;
      }

      &-publish {
        color: var(--el-color-warning);

        &:hover {
          background-color: var(--el-color-warning-light-9);
        }
      }

      &-offline {
        color: var(--el-color-info);

        &:hover {
          background-color: var(--el-color-info-light-9);
        }
      }
    }

    .api-detail-dialog {
      width: 800px !important;
      max-width: 90vw;

      .el-message-box__message {
        padding-right: 20px;
      }
    }

    .click-show-more {
      cursor: pointer;
      color: var(--el-color-primary);
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.3s;

      &:hover {
        background-color: var(--el-color-primary-light-9);
      }
    }
  }
}
</style>