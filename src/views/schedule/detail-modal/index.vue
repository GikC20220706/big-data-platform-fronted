<template>
  <BlockModal :model-config="modelConfig" @close="closeEvent">
    <LoadingPage class="log-loading" :visible="loading">
      <div id="content" class="content-box">
        <!-- 日志展示 -->
        <template v-if="['log', 'yarnLog'].includes(modalType)">
          <LogContainer v-if="logMsg" :logMsg="logMsg" :status="true"></LogContainer>
          <template v-else>
            <empty-page label="暂无日志"></empty-page>
          </template>
        </template>
        <!-- 结果展示 -->
        <template v-else-if="modalType === 'result'">
          <LogContainer v-if="strData || jsonData" :logMsg="strData || jsonData" :showResult="true" :status="true">
          </LogContainer>
          <template v-else>
            <BlockTable :table-config="tableConfig" />
          </template>
        </template>
      </div>
    </LoadingPage>
  </BlockModal>
</template>

<script lang="ts" setup>
import { reactive, ref, nextTick, onUnmounted } from 'vue'
import BlockModal from '@/components/block-modal/index.vue'
import BlockTable from '@/components/block-table/index.vue'
import LoadingPage from '@/components/loading/index.vue'
import { GetLogData, GetYarnLogData, GetResultData } from '@/services/schedule.service'

const callback = ref<any>()
const logMsg = ref('')
const info = ref('')
const modalType = ref('')
const timer = ref(null)

const jsonData = ref()
const strData = ref()
const loading = ref<boolean>(false)

const tableConfig = reactive({
  tableData: [],
  colConfigs: [],
  seqType: 'seq',
  loading: false
})
const modelConfig = reactive({
  title: '日志',
  visible: false,
  width: '820px',
  cancelConfig: {
    title: '关闭',
    cancel: closeEvent,
    disabled: false
  },
  needScale: false,
  zIndex: 1100,
  customClass: 'zqy-log-modal zqy-log-modal__s',
  closeOnClickModal: false
})

function showModal(cb: () => void, data: any, type: string): void {
  callback.value = cb
  info.value = data.instanceId || data.id
  modalType.value = type

  logMsg.value = ''
  jsonData.value = null
  strData.value = null
  tableConfig.colConfigs = []
  tableConfig.tableData = []

  if (modalType.value === 'log') {
    loading.value = true
    getLogData()
    if (!timer.value) {
      timer.value = setInterval(() => {
        getLogData()
      }, 3000)
    }
    modelConfig.title = '日志'
  } else if (modalType.value === 'result') {
    getResultDatalist()
    modelConfig.width = '64%'
    modelConfig.title = '结果'
  } else if (modalType.value === 'yarnLog') {
    modelConfig.title = '运行日志'
    getYarnLogData()
  }
  modelConfig.visible = true
}

// 获取日志
function getLogData() {
  GetLogData({
    instanceId: info.value
  })
    .then((res: any) => {
      loading.value = false
      logMsg.value = res.data.log
    })
    .catch(() => {
      logMsg.value = ''
      loading.value = false
    })
}

// 获取yarn日志
function getYarnLogData() {
  loading.value = true
  GetYarnLogData({
    instanceId: info.value
  })
    .then((res: any) => {
      loading.value = false
      logMsg.value = res.data.yarnLog
    })
    .catch(() => {
      loading.value = false
      logMsg.value = ''
    })
}

// 获取结果
// 获取结果
function getResultDatalist() {
  loading.value = true
  tableConfig.loading = true

  GetResultData({
    instanceId: info.value
  })
      .then((res: any) => {
        console.log('运行结果响应:', res)

        loading.value = false
        tableConfig.loading = false

        // 正确提取resultData
        const resultData = res.data.resultData

        console.log('resultData结构:', resultData)

        // 处理空数据情况
        if (!resultData) {
          console.log('没有结果数据')
          tableConfig.colConfigs = []
          tableConfig.tableData = []
          return
        }

        // 情况1: resultData直接包含columns和rows (JDBC查询结果)
        if (resultData.columns && resultData.rows) {
          const columns = resultData.columns
          const rows = resultData.rows

          console.log(`查询结果: 列数=${columns.length}, 行数=${rows.length}`)

          // 构建表格列配置
          tableConfig.colConfigs = columns.map((column: string) => ({
            prop: column,
            title: column,
            minWidth: 120,
            showHeaderOverflow: true,
            showOverflowTooltip: true
          }))

          // 直接使用rows作为表格数据(已经是对象数组格式)
          tableConfig.tableData = rows
        }
        // 情况2: resultData.data包含columns和rows
        else if (resultData.data && resultData.data.columns && resultData.data.rows) {
          const columns = resultData.data.columns
          const rows = resultData.data.rows

          console.log(`查询结果: 列数=${columns.length}, 行数=${rows.length}`)

          tableConfig.colConfigs = columns.map((column: string) => ({
            prop: column,
            title: column,
            minWidth: 120,
            showHeaderOverflow: true,
            showOverflowTooltip: true
          }))

          tableConfig.tableData = rows
        }
        // 情况3: resultData是数组(直接就是查询结果)
        else if (Array.isArray(resultData) && resultData.length > 0) {
          console.log('数组格式结果,行数=' + resultData.length)

          // 从第一行数据提取列名
          const columns = Object.keys(resultData[0])

          tableConfig.colConfigs = columns.map((column: string) => ({
            prop: column,
            title: column,
            minWidth: 120,
            showHeaderOverflow: true,
            showOverflowTooltip: true
          }))

          tableConfig.tableData = resultData
        }
        // 情况4: 字符串类型(脚本输出等)
        else if (typeof resultData === 'string') {
          console.log('字符串格式结果')
          strData.value = resultData
          jsonData.value = resultData
          tableConfig.colConfigs = []
          tableConfig.tableData = []
        }
        // 情况5: 其他对象类型,显示JSON
        else {
          console.log('JSON对象格式结果')
          jsonData.value = JSON.stringify(resultData, null, 2)
          strData.value = jsonData.value
          tableConfig.colConfigs = []
          tableConfig.tableData = []
        }
      })
      .catch((error) => {
        console.error('获取结果数据失败:', error)
        tableConfig.colConfigs = []
        tableConfig.tableData = []
        tableConfig.loading = false
        loading.value = false
      })
}

function closeEvent() {
  if (timer.value) {
    clearInterval(timer.value)
  }
  timer.value = null
  modelConfig.visible = false
}

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
  timer.value = null
})

defineExpose({
  showModal
})
</script>

<style lang="scss">
.zqy-log-modal__s {
  .content-box {
    position: static;
  }
}
</style>