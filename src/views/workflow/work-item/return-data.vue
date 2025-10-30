<template>
  <div class="return-data-container">
    <LoadingPage class="log-loading" :visible="loading">
      <!-- 表格显示 -->
      <div v-if="tableConfig.tableData.length > 0" class="result-table-wrapper">
        <div class="result-summary">
          <span class="summary-text">查询成功，返回 <strong>{{ tableConfig.tableData.length }}</strong> 行数据</span>
        </div>
        <BlockTable class="result-table-log" :table-config="tableConfig"/>
      </div>

      <!-- JSON/文本显示 -->
      <div v-else-if="strData || jsonData" class="log-content">
        <pre class="log-text">{{ strData || jsonData }}</pre>
      </div>

      <!-- 空状态 -->
      <EmptyPage v-else>
        <template #description>
          <span>暂无数据</span>
        </template>
      </EmptyPage>
    </LoadingPage>

    <span v-if="showParse && (strData || jsonData)" class="zqy-json-parse" @click="getJsonParseResult">结果解析</span>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, defineEmits, defineProps } from 'vue'
import BlockTable from '@/components/block-table/index.vue'
import LoadingPage from '@/components/loading/index.vue'
import EmptyPage from '@/components/empty-page/index.vue'
import { GetResultItemDetail } from '@/services/workflow.service'
import { ElMessage } from 'element-plus'
const emit = defineEmits(['getJsonParseResult'])

const props = defineProps<{
  showParse: boolean
}>()

const tableConfig = reactive({
  tableData: [],
  colConfigs: [],
  seqType: 'seq',
  loading: false
})
const jsonData = ref()
const strData = ref()
const loading = ref<boolean>(false)

function initData(id: string): void {
  console.log('初始化运行结果, instanceId:', id)
  getResultDatalist(id)
}

function getJsonParseResult() {
  emit('getJsonParseResult')
}

// 获取结果
function getResultDatalist(id: string) {
  console.log('getResultDatalist 被调用')
  console.log('参数id:', id)
  console.log('参数类型:', typeof id)

  // 严格检查ID
  if (!id || id === 'undefined' || id === 'null' || typeof id !== 'string' || id.length < 10) {
    console.error('instanceId无效:', id)
    ElMessage.error('实例ID无效，无法获取运行结果')
    tableConfig.colConfigs = []
    tableConfig.tableData = []
    tableConfig.loading = false
    loading.value = false
    return
  }

  tableConfig.loading = true
  loading.value = true

  console.log('调用接口: /api/v1/job-work/instance/' + id)

  GetResultItemDetail({
    instanceId: id
  })
      .then((res: any) => {
        console.log('运行结果响应:', res)

        loading.value = false
        tableConfig.loading = false

        const resultData = res.data.resultData

        if (!resultData || !resultData.data) {
          console.log('没有结果数据')
          tableConfig.colConfigs = []
          tableConfig.tableData = []
          return
        }

        // JDBC查询结果格式
        if (resultData.data.columns && resultData.data.rows) {
          const columns = resultData.data.columns
          const rows = resultData.data.rows

          console.log('查询结果: 列数=' + columns.length + ', 行数=' + rows.length)

          // 构建表格列配置
          tableConfig.colConfigs = columns.map((column: string) => ({
            prop: column,
            title: column,
            minWidth: 120,
            showHeaderOverflow: true,
            showOverflowTooltip: true
          }))

          // 设置表格数据
          tableConfig.tableData = rows
        }
        else if (typeof resultData.data === 'string') {
          strData.value = resultData.data
        } else {
          jsonData.value = JSON.stringify(resultData.data, null, 2)
        }
      })
      .catch((error) => {
        console.error('获取结果数据失败:', error)
        ElMessage.error('获取运行结果失败')
        tableConfig.colConfigs = []
        tableConfig.tableData = []
        tableConfig.loading = false
        loading.value = false
      })
}

defineExpose({
  initData
})
</script>

<style lang="scss" scoped>
.return-data-container {
  height: 100%;
  position: relative;

  .result-table-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;

    .result-summary {
      padding: 8px 12px;
      background-color: #f0f9ff;
      border-left: 3px solid #409eff;
      margin-bottom: 12px;

      .summary-text {
        color: #606266;
        font-size: 14px;

        strong {
          color: #409eff;
          font-weight: 600;
        }
      }
    }

    .result-table-log {
      flex: 1;
      overflow: auto;
    }
  }

  .log-content {
    height: 100%;
    overflow: auto;
    background-color: #ffffff;
    padding: 12px;
    border-radius: 4px;
    border: 1px solid #e4e7ed;

    .log-text {
      color: #303133;
      font-family: 'Courier New', Courier, monospace;
      font-size: 13px;
      line-height: 1.8;
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  }
}

.log-loading {
  &.zqy-loading {
    position: static;
    height: 100% !important;
    padding: 0 !important;
    margin-top: 0 !important;
    overflow: auto;
  }
}

.zqy-json-parse {
  font-size: 12px;
  color: var(--el-color-primary);
  cursor: pointer;
  position: absolute;
  right: 40px;
  top: 12px;
  &:hover {
    text-decoration: underline;
  }
}
</style>