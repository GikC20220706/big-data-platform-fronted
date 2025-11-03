<template>
  <div id="content" class="running-log">
    <LoadingPage :visible="loading">
      <div v-if="logMsg" class="log-content">
        <pre class="log-text">{{ logMsg }}</pre>
      </div>
      <EmptyPage v-else>
        <template #description>
          <span>暂无运行日志</span>
        </template>
      </EmptyPage>
    </LoadingPage>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import EmptyPage from '@/components/empty-page/index.vue'
import LoadingPage from '@/components/loading/index.vue'
import { GetSubmitLogData } from '@/services/workflow.service'

const logMsg = ref('')
const pubId = ref('')
const loading = ref<boolean>(false)

const props = defineProps<{
  showParse: boolean
}>()

function initData(id: string): void {
  console.log('运行日志初始化, instanceId:', id)
  pubId.value = id
  getLogData(pubId.value)
}

// 获取日志
function getLogData(id: string) {
  if (!id) {
    logMsg.value = ''
    loading.value = false
    return
  }
  loading.value = true

  GetSubmitLogData({
    instanceId: id,
    logType: 'running'
  }).then((res: any) => {
    console.log('运行日志响应:', res)
    logMsg.value = res.data?.logs?.runningLog || res.data?.runningLog || res.data?.log || ''
    loading.value = false
  }).catch((err) => {
    console.error('获取运行日志失败:', err)
    logMsg.value = ''
    loading.value = false
  })
}

defineExpose({
  initData
})
</script>

<style lang="scss" scoped>
.running-log {
  height: 100%;

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

  .empty-page {
    height: 100%;
  }

  .zqy-loading {
    position: static;
    height: 100% !important;
    padding: 0 !important;
    margin-top: 0 !important;
    overflow: auto;
  }
}
</style>