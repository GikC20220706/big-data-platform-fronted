<template>
  <div class="vm-chart">
    <div class="vm-chart__header">
      <span class="vm-chart__title">实例图</span>
      <div class="vm-chart__ops">
        <el-icon class="vm-chart__icon" @click="queryVmChartData"><RefreshRight /></el-icon>
        <el-date-picker v-model="currentDate" type="date" value-format="YYYY-MM-DD" @change="queryVmChartData" :clearable="false"></el-date-picker>
      </div>
    </div>
    <div class="vm-chart__body">
      <div ref="chartContainerRef" class="vm-chart__container"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts/core';
import {
  TooltipComponent,
  TooltipComponentOption,
  GridComponent,
  GridComponentOption,
  LegendComponent,
  LegendComponentOption
} from 'echarts/components';
import { LineChart, LineSeriesOption } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { queryVmChartInfo } from '../services/computer-group';
import { useAuthStore } from '@/store/useAuth';
import { http } from '@/utils/http'
import dayjs from 'dayjs'
import { transformExecutionData } from '@/utils/data-transform'

echarts.use([
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  CanvasRenderer,
  UniversalTransition
])

type EChartsOption = echarts.ComposeOption<
  | TooltipComponentOption
  | GridComponentOption
  | LegendComponentOption
  | LineSeriesOption
>

const chartVm = ref<echarts.ECharts>()

const currentDate = ref<string>(dayjs().format('YYYY-MM-DD'))
const chartContainerRef = ref<HTMLDivElement>()

const chartSuccessData = ref<number[]>([])
const chartRunningData = ref<number[]>([])
const chartFailData = ref<number[]>([])
const chartXAxisData = ref<string[]>([])

const options = computed<EChartsOption>(() => {
  return {
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'cross',
        label: {
          show: true,
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      top: '6%',
      right: '4%',
      data: ['成功', '失败', '运行中']
    },
    grid: {
      left: '4%',
      right: '4%',
      bottom: '16%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      offset: 16,
      data: chartXAxisData.value,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '成功',
        type: 'line',
        color: '#43CF7C',
        smooth: true,
        data: chartSuccessData.value
      },
      {
        name: '失败',
        type: 'line',
        color: '#FA541C',
        smooth: true,
        data: chartFailData.value
      },
      {
        name: '运行中',
        type: 'line',
        color: '#2A82E4',
        smooth: true,
        data: chartRunningData.value
      }
    ]
  }
})

const authStore = useAuthStore()

watch(() => authStore.isCollapse, () => {
  setTimeout(() => {
    if (chartVm.value) {
      chartVm.value.resize()
    }
  }, 300) // 菜单收起动画的执行时间
})

watch(() => options.value, (val) => {
  if (chartVm.value) {
    chartVm.value.setOption(options.value)
  }
})

function queryVmChartData() {
  // 调用新的调度历史接口获取当天的执行统计
  const currentDate = dayjs().format('YYYY-MM-DD')
  
  http.request({
    method: 'get',
    url: '/api/v1/scheduler/task-statistics',
    params: {
      start_date: currentDate,
      end_date: currentDate,
      group_by: 'hour' // 按小时分组统计
    }
  }).then((response: any) => {
    if (response.success && response.data) {
      const hourlyStats = response.data.hourly_statistics || []
      
      let successData: number[] = []
      let runningData: number[] = []
      let failData: number[] = []
      let timeLabels: string[] = []
      
      // 生成24小时的数据
      for (let hour = 0; hour < 24; hour++) {
        const hourStr = hour.toString().padStart(2, '0') + ':00'
        timeLabels.push(hourStr)
        
        const stat = hourlyStats.find((s: any) => s.hour === hour) || 
                    { success_count: 0, running_count: 0, failed_count: 0 }
        
        successData.push(stat.success_count || 0)
        runningData.push(stat.running_count || 0)  
        failData.push(stat.failed_count || 0)
      }
      
      chartSuccessData.value = successData
      chartRunningData.value = runningData
      chartFailData.value = failData
      chartXAxisData.value = timeLabels
    }
  }).catch((error: any) => {
    console.error('获取图表数据失败:', error)
    // 设置默认空数据
    chartSuccessData.value = new Array(24).fill(0)
    chartRunningData.value = new Array(24).fill(0)
    chartFailData.value = new Array(24).fill(0)
    chartXAxisData.value = Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`)
  })
}

onMounted(() => {
  if (chartContainerRef.value) {
    chartVm.value = echarts.init(chartContainerRef.value)
    chartVm.value.setOption(options.value)

    window.addEventListener('resize', resizeChart)
  }

  queryVmChartData()
})

function resizeChart() {
  chartVm.value?.resize()
}

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
})

</script>

<style lang="scss">
.vm-chart {
  margin-bottom: 24px;
  .vm-chart__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
  }

  .vm-chart__title {
    font-size: getCssVar('font-size', 'medium');
    font-weight: bold;
  }

  .vm-chart__body {
    height: 280px;
    margin-top: 24px;
    border-radius: 8px;
    background-color: getCssVar('color', 'white');
    box-shadow: getCssVar('box-shadow', 'lighter');

    .vm-chart__container {
      width: 100%;
      height: 100%;
      position: relative;
    }
  }

  .vm-chart__ops {
    display: flex;
    align-items: center;

    .vm-chart__icon {
      margin-right: 12px;
      cursor: pointer;

      &:hover {
        color: getCssVar('color', 'primary');
      }

      &:last-child {
        margin-right: 0;
      }
    }

    .el-date-editor {
      --el-date-editor-width: 160px
    }
  }
}
</style>