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
import { GetExcelDataPreviewDetail } from '@/services/data-sync.service'

interface Param {
    dataSourceId: string
    tableName: string
}

const info = ref<Param>()
const tableConfig = reactive({
    tableData: [],
    colConfigs: [],
    loading: false
})
const modelConfig = reactive({
    title: '数据预览',
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
    GetExcelDataPreviewDetail(info.value).then((res: any) => {
        const col = res.data.columns
        const tableData = res.data.rows
        tableConfig.colConfigs = col.map((column: any) => {
          return {
            prop: column.code,   // ✅ 用 code 作为属性名
            title: column.name,  // ✅ 用 name 作为表头显示
            minWidth: 100,
            showHeaderOverflow: true,
            showOverflowTooltip: true
          }
        })

      tableConfig.tableData = res.data.rows
        tableConfig.loading = false
    })
    .catch(() => {
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
  