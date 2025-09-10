<template>
  <div class="sys-info">
    <div class="sys-info__header">
      <span class="sys-info__title">系统监控</span>
      <div class="sys-info__ops">
        <el-icon class="sys-info__icon" @click="querySysInfoData"><RefreshRight /></el-icon>
        <!-- <el-icon class="sys-info__icon"><Setting /></el-icon> -->
      </div>
    </div>
    <div class="sys-info__body">
      <template v-for="sysInfo in sysInfoData" :key="sysInfo.type">
        <sys-chart :chart-data="sysInfo"></sys-chart>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import SysChart from './sys-chart.vue'
import { ChartInfo } from './component'
import { onMounted, ref } from 'vue'
import { querySystemBaseInfo } from '../services/computer-group';
import { http } from '@/utils/http'

const sysInfoData = ref<Array<ChartInfo>>([
  {
    type: 'clusterMonitor',
    title: '计算集群',
    mix: undefined,
    total: 100,
    color: '#ED7B09'
  },
  {
    type: 'datasourceMonitor',
    title: '数据源',
    mix: undefined,
    total: 100,
    color: '#1967BF'
  },
  {
    type: 'workflowMonitor',
    title: '发布作业',
    mix: undefined,
    total: 100,
    color: '#03A89D'
  },
  {
    type: 'apiMonitor',
    title: '发布接口',
    mix: undefined,
    total: 100,
    color: '#4B19BF'
  }
])

function updateSysInfoItem(type: string, activeNum: number, total: number) {
  const item = sysInfoData.value.find(info => info.type === type)
  if (item) {
    item.mix = activeNum
    item.total = Math.max(total, 1) // 避免除0错误
  }
}

async function querySysInfoData() {
  try {
    // 并行获取所有统计数据
    const [clusterRes, datasourceRes, workflowRes, apiRes] = await Promise.allSettled([
      // 集群统计
      http.request({
        method: 'get',
        url: '/api/v1/cluster/'
      }),
      // 数据源统计
      http.request({
        method: 'get',
        url: '/api/v1/integration/sources',
        params: {
          include_table_count: false,
          table_count_limit: 1000,
          fast_mode: true
        }
      }),
      // 工作流统计
      http.request({
        method: 'get', 
        url: '/api/v1/workflows/',
        params: { page: 1, page_size: 1000 }
      }),
      // API统计
      http.request({
        method: 'get',
        url: '/api/v1/custom-api/',
        params: { page: 1, page_size: 1000 }
      })
    ])

    // 处理集群统计
    if (clusterRes.status === 'fulfilled' && clusterRes.value?.success) {
      const clusters = clusterRes.value.data?.items || clusterRes.value.data?.clusters || []
      const activeCount = clusters.filter((cluster: any) => 
        cluster.status === 'active' || cluster.active_nodes > 0
      ).length
      updateSysInfoItem('clusterMonitor', activeCount, clusters.length)
    }

    // 处理数据源统计
    if (datasourceRes.status === 'fulfilled' && datasourceRes.value?.success) {
      const { connected, total } = datasourceRes.value.data
      updateSysInfoItem('datasourceMonitor', connected, total)
    }

    // 处理工作流统计
    if (workflowRes.status === 'fulfilled' && workflowRes.value?.success) {
      const workflows = workflowRes.value.data?.items || workflowRes.value.data?.workflows || []
      const publishedCount = workflows.filter((wf: any) => 
        wf.status === 'active' || wf.status === 'PUBLISHED' || wf.is_active === true
      ).length
      updateSysInfoItem('workflowMonitor', publishedCount, workflows.length)
    }

    // 处理API统计
    if (apiRes.status === 'fulfilled' && apiRes.value?.success) {
      const apis = apiRes.value.data?.items || []
      const activeCount = apis.filter((api: any) => api.is_active === true).length
      updateSysInfoItem('apiMonitor', activeCount, apis.length)
    }

  } catch (error) {
    console.error('获取系统统计信息失败:', error)
    // 设置默认值，确保界面正常显示
    sysInfoData.value.forEach(item => {
      if (item.mix === undefined) {
        item.mix = 0
        item.total = Math.max(item.total, 1)
      }
    })
  }
}

onMounted(() => {
  querySysInfoData()
})

</script>

<style lang="scss">
.sys-info {
  margin-bottom: 24px;
  .sys-info__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
  }

  .sys-info__body {
    margin-top: 24px;
    display: flex;
    justify-content: space-between;

    .sys-chart {
      margin-right: 24px;
      &:last-child {
        margin-right: 0;
      }
    }
  }

  .sys-info__title {
    font-size: getCssVar('font-size', 'medium');
    font-weight: bold;
  }

  .sys-info__icon {
    margin-right: 12px;
    cursor: pointer;

    &:hover {
      color: getCssVar('color', 'primary');
    }

    &:last-child {
      margin-right: 0;
    }
  }
}
</style>