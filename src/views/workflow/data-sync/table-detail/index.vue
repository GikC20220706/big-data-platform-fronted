<template>
  <BlockModal :model-config="modelConfig" @close="closeEvent">
    <div id="content" class="content-box">
      <BlockTable :table-config="tableConfig" />
    </div>
  </BlockModal>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import BlockModal from '@/components/block-modal/index.vue'
import BlockTable from '@/components/block-table/index.vue'
import { GetSourceTablesDetail } from '@/services/data-sync.service'
import { ElMessage } from 'element-plus'

interface Param {
  dataSourceId?: string
  dataSourceName?: string
  tableName: string
  database?: string
}

const info = ref<Param>()
const tableConfig = reactive({
  tableData: [],
  seqType: 'seq',
  colConfigs: [],
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
  zIndex: 1000,
  customClass: 'zqy-table-detail',
  closeOnClickModal: false
})

function showModal(data: Param): void {
  info.value = data
  getResultDatalist()
  modelConfig.width = '64%'
  modelConfig.title = '数据预览'
  modelConfig.visible = true
}

// 获取结果
function getResultDatalist() {
  tableConfig.loading = true

  GetSourceTablesDetail(info.value)
      .then((res: any) => {
        if (res.code === 200 && res.data) {
          // 适配新接口返回格式
          const previewData = res.data.preview_data || res.data.data || []

          if (previewData.length === 0) {
            ElMessage.warning('该表没有数据')
            tableConfig.colConfigs = []
            tableConfig.tableData = []
            tableConfig.loading = false
            return
          }

          // 从第一行数据中提取列名
          const firstRow = previewData[0]
          const columns = Object.keys(firstRow)

          // 生成列配置
          tableConfig.colConfigs = columns.map((column: string) => {
            return {
              prop: column,
              title: column,
              minWidth: 120,
              showHeaderOverflow: true,
              showOverflowTooltip: true
            }
          })

          // 直接使用预览数据(已经是对象数组格式)
          tableConfig.tableData = previewData

          tableConfig.loading = false
        } else {
          ElMessage.error('数据预览失败')
          tableConfig.colConfigs = []
          tableConfig.tableData = []
          tableConfig.loading = false
        }
      })
      .catch((err) => {
        console.error('数据预览失败:', err)
        ElMessage.error('数据预览失败')
        tableConfig.colConfigs = []
        tableConfig.tableData = []
        tableConfig.loading = false
      })
}

function closeEvent() {
  modelConfig.visible = false
}

defineExpose({
  showModal
})
</script>

<style lang="scss">
.zqy-table-detail {
  .modal-content {
    .content-box {
      min-height: 300px;
      max-height: 60vh;
      padding: 12px 20px;
      box-sizing: border-box;
      overflow: auto;
    }
  }
}
</style>