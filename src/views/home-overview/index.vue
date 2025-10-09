<template>
  <div class="computer-group">
    <div class="computer-group__left">
      <sys-info ref="sysInfoRef"></sys-info>
      <vm-chart ref="vmChartRef"></vm-chart>
      <vm-list ref="vmListRef"></vm-list>
    </div>
    <div class="computer-group__right">
      <monitor-info ref="monitorInfoRef"></monitor-info>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'
import VmChart from './components/vm-chart.vue'
import VmList from './components/vm-list.vue'
import MonitorInfo from './components/monitor-info.vue'
import SysInfo from './components/sys-info.vue'

// 组件引用
const sysInfoRef = ref()
const vmChartRef = ref()
const vmListRef = ref()
const monitorInfoRef = ref()
// 定时器
const realtimeTimer = ref<NodeJS.Timeout | null>(null)

// 实时数据更新函数
function updateRealtimeData() {
  try {
    // 更新系统监控数据
    if (sysInfoRef.value && typeof sysInfoRef.value.querySysInfoData === 'function') {
      sysInfoRef.value.querySysInfoData()
    }
    
    // 更新虚拟机列表数据 (静默更新)
    if (vmListRef.value && typeof vmListRef.value.queryVmlistData === 'function') {
      vmListRef.value.queryVmlistData(true) // true表示静默加载
    }
    
    // 更新监控面板数据
    // if (monitorInfoRef.value && typeof monitorInfoRef.value.queryMonitorData === 'function') {
    //   monitorInfoRef.value.queryMonitorData()
    // }
  } catch (error) {
    console.error('实时数据更新失败:', error)
  }
}

// 启动实时数据更新
function startRealtimeUpdate() {
  // 清除现有定时器
  if (realtimeTimer.value) {
    clearInterval(realtimeTimer.value)
  }
  
  // 设置3秒间隔的实时更新
  realtimeTimer.value = setInterval(() => {
    updateRealtimeData()
  }, 3000)
}

// 停止实时数据更新
function stopRealtimeUpdate() {
  if (realtimeTimer.value) {
    clearInterval(realtimeTimer.value)
    realtimeTimer.value = null
  }
}

onMounted(() => {
  // 启动实时数据更新
  startRealtimeUpdate()
})

onUnmounted(() => {
  // 清理定时器
  stopRealtimeUpdate()
})
</script>

<style lang="scss">
.computer-group {
  display: flex;
  padding: 24px;
  overflow-x: hidden;
  overflow-y: auto;
  box-sizing: border-box;
  height: 100%;

  &__left {
    flex: 1;
    margin-right: 32px;
  }

  &__right {
    width: 340px;
  }
}
</style>