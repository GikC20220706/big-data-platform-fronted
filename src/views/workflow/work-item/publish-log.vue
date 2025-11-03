<template>
  <div id="content" class="publish-log">
    <LoadingPage :visible="loading">
      <div v-if="logMsg" class="log-content">
        <pre class="log-text">{{ logMsg }}</pre>
      </div>
      <EmptyPage v-else>
        <template #description>
          <span>暂无日志数据</span>
        </template>
      </EmptyPage>
    </LoadingPage>
    <span v-if="runId" class="zqy-log-refrash" @click="refrashEvent">刷新</span>
  </div>
</template>

<script lang="ts" setup>
import { ref, onUnmounted } from 'vue'
import { GetSubmitLogData } from '@/services/workflow.service'
import EmptyPage from '@/components/empty-page/index.vue'
import LoadingPage from '@/components/loading/index.vue'

const logMsg = ref('')
const timer = ref<any>(null)
const runId = ref('')
const status = ref(false)
const callback = ref<any>()
const loading = ref<boolean>(false)

function initData(id: string, cb: any): void {
  console.log('提交日志初始化, instanceId:', id)
  runId.value = id
  callback.value = cb
  loading.value = true
  getLogData(runId.value)

  // 启动轮询
  if (!timer.value) {
    timer.value = setInterval(() => {
      getLogData(runId.value)
    }, 3000)
  }
}

function refrashEvent() {
  loading.value = true
  getLogData(runId.value)
}

// 获取日志
function getLogData(id: string) {
  if (!id) {
    console.warn('instanceId为空，无法获取日志')
    loading.value = false
    return
  }

  GetSubmitLogData({
    instanceId: id,
    logType: 'submit'
  })
      .then((res: any) => {
        console.log('获取日志响应:', res)

        // ✅ 正确提取日志内容
        const submitLog = res.data?.logs?.submitLog || res.data?.submitLog || res.data?.log || ''
        logMsg.value = submitLog

        const currentStatus = res.data?.status || 'PENDING'
        console.log('当前状态:', currentStatus, '日志长度:', submitLog.length)

        // 判断是否完成
        status.value = ['FAIL', 'SUCCESS', 'ABORT'].includes(currentStatus)

        if (status.value) {
          // 执行完成，停止轮询
          if (timer.value) {
            clearInterval(timer.value)
            timer.value = null
          }

          // 回调通知父组件
          if (callback.value) {
            callback.value(currentStatus)
          }
        }

        setTimeout(() => {
          loading.value = false
        }, 300)
      })
      .catch((err: any) => {
        console.error('获取日志失败:', err)
        logMsg.value = ''
        setTimeout(() => {
          loading.value = false
        }, 300)
      })
}

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
})

defineExpose({
  initData
})
</script>

<style lang="scss" scoped>
.publish-log {
  height: 100%;
  position: relative;

  .log-content {
    height: 100%;
    overflow: auto;
    background-color: #ffffff;  /* ✅ 改为白色背景 */
    padding: 12px;
    border-radius: 4px;
    border: 1px solid #e4e7ed;

    .log-text {
      color: #303133;  /* ✅ 改为深色文字 */
      font-family: 'Courier New', Courier, monospace;
      font-size: 13px;
      line-height: 1.8;
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  }

  .zqy-log-refrash {
    font-size: 12px;
    color: var(--el-color-primary);
    cursor: pointer;
    position: absolute;
    right: 100px;
    top: 12px;
    z-index: 10;

    &:hover {
      text-decoration: underline;
    }
  }
}

.zqy-loading {
  position: static;
  height: 100% !important;
  padding: 0 !important;
  margin-top: 0 !important;
  overflow: auto;
}

.empty-page {
  height: 100%;
}
</style>