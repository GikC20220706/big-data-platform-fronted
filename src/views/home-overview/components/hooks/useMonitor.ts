import { computed, onUnmounted, ref, type Ref } from "vue"
import { http } from '@/utils/http'
import type { ColonyInfo } from "../component"
import type { Frequency } from "./useFrequency"

export interface MonitorInfo {
  type: 'cpuPercent' | 'usedMemorySize' | 'diskIoWriteSpeed' | 'usedStorageSize'
  name: string
  value: number
  unit: '%' | 'GB' | 'KB/s' | 'MB/s'
  color: string
  data: Array<number>
}

export function useMonitor(currentColony: Ref<ColonyInfo | undefined>, currentFrequency: Ref<Frequency | undefined>) {
  const dateTimeList = ref<Array<string>>([])
  const cpuMonitorDataList = ref<Array<number>>([])
  const memoryMonitorDataList = ref<Array<number>>([])
  const diskIoMonitorList = ref<Array<number>>([])
  const storageMonitorDataList = ref<Array<number>>([])
  const currentInfo = ref<Record<MonitorInfo['type'], number>>({
    cpuPercent: 0,
    usedMemorySize: 0,
    diskIoWriteSpeed: 0,
    usedStorageSize: 0
  })

  const monitorDataList = computed<Array<MonitorInfo>>(() => {
    console.log('计算monitorDataList，currentInfo.value:', currentInfo.value)
    const result = [
      {
        type: 'cpuPercent',
        name: 'CPU',
        value: currentInfo.value.cpuPercent || 0,
        unit: '%',
        color: '#2a82e485',
        data: cpuMonitorDataList.value
      },
      {
        type: 'usedMemorySize',
        name: '内存',
        value: currentInfo.value.usedMemorySize || 0,
        unit: 'GB',
        color: '#FF8D1A85',
        data: memoryMonitorDataList.value
      },
      {
        type: 'usedStorageSize',
        name: '存储',
        value: currentInfo.value.usedStorageSize || 0,
        unit: 'GB',
        color: '#D4303085',
        data: storageMonitorDataList.value
      },
      {
        type: 'diskIoWriteSpeed',
        name: 'IO读写',
        value: currentInfo.value.diskIoWriteSpeed || 0,
        unit: 'MB/s',
        color: '#D580FF85',
        data: diskIoMonitorList.value
      }
    ]
    console.log('计算后的monitorDataList:', result)
    return result
  })

  // 新的监控数据查询函数
  async function queryMonitorData() {
  try {
    const response = await http.request({
      method: 'get',
      url: '/api/v1/cluster/metrics',
      params: {
        cluster_type: 'hadoop',
        include_history: true,
        history_hours: 24
      }
    })

    console.log('API响应:', response)

    if (response.success && response.data) {
      const metricsData = response.data
      
      // 更新当前值（取最后一个值）
      const cpuData = metricsData.cpu_usage || []
      const memoryData = metricsData.memory_usage || []
      const diskData = metricsData.disk_usage || []
      const networkData = metricsData.network_io || []
      
      currentInfo.value = {
        cpuPercent: cpuData[cpuData.length - 1] || 0,
        usedMemorySize: memoryData[memoryData.length - 1] || 0,
        diskIoWriteSpeed: networkData[networkData.length - 1] || 0,
        usedStorageSize: diskData[diskData.length - 1] || 0
      }
      
      // 更新历史数据用于图表
      dateTimeList.value = metricsData.time_series || []
      cpuMonitorDataList.value = metricsData.cpu_usage || []
      memoryMonitorDataList.value = metricsData.memory_usage || []
      storageMonitorDataList.value = metricsData.disk_usage || []
      diskIoMonitorList.value = metricsData.network_io || []
      
      console.log('更新后的currentInfo:', currentInfo.value)
      console.log('历史数据长度:', dateTimeList.value.length)
    }
  } catch (error) {
    console.error('获取监控数据失败:', error)
  }
}

  function parseMonitorData(data?: string) {
    // 保留原有的解析逻辑，如果需要的话
    return data ? JSON.parse(data) : []
  }

  return {
    monitorDataList,
    dateTimeList,
    queryMonitorData,
    parseMonitorData
  }
}