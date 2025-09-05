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
    return [
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
  })

  // 新的监控数据查询函数
  async function queryMonitorData() {
    try {
      const response = await http.request({
        method: 'get',
        url: '/api/v1/clusters/monitoring',
        params: {
          cluster_id: currentColony.value?.id,
          time_range: currentFrequency.value?.value,
          metrics: ['cpu', 'memory', 'disk_io', 'storage']
        }
      })

      if (response.success && response.data) {
        const monitoringData = response.data
        
        // 更新时间轴数据
        dateTimeList.value = monitoringData.timestamps || []
        
        // 更新各类监控数据
        if (monitoringData.cpu) {
          cpuMonitorDataList.value = monitoringData.cpu.values || []
          currentInfo.value.cpuPercent = monitoringData.cpu.current || 0
        }
        
        if (monitoringData.memory) {
          memoryMonitorDataList.value = monitoringData.memory.values || []
          currentInfo.value.usedMemorySize = monitoringData.memory.current || 0
        }
        
        if (monitoringData.disk_io) {
          diskIoMonitorList.value = monitoringData.disk_io.values || []
          currentInfo.value.diskIoWriteSpeed = monitoringData.disk_io.current || 0
        }
        
        if (monitoringData.storage) {
          storageMonitorDataList.value = monitoringData.storage.values || []
          currentInfo.value.usedStorageSize = monitoringData.storage.current || 0
        }
      }
    } catch (error) {
      console.error('获取监控数据失败:', error)
      // 设置默认数据
      dateTimeList.value = Array.from({length: 10}, (_, i) => 
        new Date(Date.now() - (9-i) * 60000).toLocaleTimeString()
      )
      cpuMonitorDataList.value = new Array(10).fill(0)
      memoryMonitorDataList.value = new Array(10).fill(0)
      diskIoMonitorList.value = new Array(10).fill(0)
      storageMonitorDataList.value = new Array(10).fill(0)
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