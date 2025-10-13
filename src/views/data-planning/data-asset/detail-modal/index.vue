<template>
  <BlockModal :model-config="modelConfig" @close-event="closeEvent">
    <el-tabs v-model="activeTab">
      <!-- 基本信息 -->
      <el-tab-pane label="基本信息" name="basic">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="资产名称">
            {{ assetData.asset_name }}
          </el-descriptions-item>
          <el-descriptions-item label="资产编码">
            {{ assetData.asset_code }}
          </el-descriptions-item>
          <el-descriptions-item label="所属目录">
            {{ assetData.catalog_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="数据源">
            {{ assetData.data_source_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="数据库名">
            {{ assetData.database_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="表名">
            {{ assetData.table_name }}
          </el-descriptions-item>
          <el-descriptions-item label="资产类型">
            {{ getAssetTypeText(assetData.asset_type) }}
          </el-descriptions-item>
          <el-descriptions-item label="质量等级">
            <el-tag :type="getQualityType(assetData.quality_level)">
              {{ assetData.quality_level || '-' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(assetData.status)">
              {{ getStatusText(assetData.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="是否公开">
            {{ assetData.is_public ? '是' : '否' }}
          </el-descriptions-item>
          <el-descriptions-item label="行数" :span="2">
            {{ assetData.row_count ? assetData.row_count.toLocaleString() : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="数据大小" :span="2">
            {{ formatSize(assetData.data_size) }}
          </el-descriptions-item>
          <el-descriptions-item label="字段数量" :span="2">
            {{ assetData.column_count || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="业务描述" :span="2">
            {{ assetData.business_description || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="技术说明" :span="2">
            {{ assetData.technical_description || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="业务负责人">
            {{ assetData.business_owner || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="技术负责人">
            {{ assetData.technical_owner || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建人">
            {{ assetData.created_by || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ assetData.created_at || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>

      <!-- 字段信息 -->
      <el-tab-pane label="字段信息" name="columns">
        <div style="margin-bottom: 10px;">
          <el-button size="small" @click="refreshColumns" :loading="columnLoading">
            刷新字段
          </el-button>
        </div>
        <el-table
            :data="columnList"
            border
            style="width: 100%"
            v-loading="columnLoading"
            max-height="400"
        >
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="column_name" label="字段名" width="150" />
          <el-table-column prop="column_name_cn" label="中文名" width="150" />
          <el-table-column prop="data_type" label="数据类型" width="120" />
          <el-table-column prop="is_primary_key" label="主键" width="80">
            <template #default="{ row }">
              <el-icon v-if="row.is_primary_key" color="#67C23A"><Check /></el-icon>
            </template>
          </el-table-column>
          <el-table-column prop="is_nullable" label="可空" width="80">
            <template #default="{ row }">
              <el-icon v-if="row.is_nullable" color="#E6A23C"><Check /></el-icon>
            </template>
          </el-table-column>
          <el-table-column prop="column_comment" label="注释" min-width="200" show-overflow-tooltip />
        </el-table>
      </el-tab-pane>

      <!-- 统计信息 -->
      <el-tab-pane label="统计信息" name="statistics">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="预览次数">
            {{ assetData.preview_count || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="下载次数">
            {{ assetData.download_count || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="API调用次数">
            {{ assetData.api_call_count || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="最后访问时间">
            {{ assetData.last_access_time || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="是否发布API">
            {{ assetData.is_api_published ? '是' : '否' }}
          </el-descriptions-item>
          <el-descriptions-item label="API发布时间">
            {{ assetData.api_publish_time || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
    </el-tabs>
  </BlockModal>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import BlockModal from '@/components/block-modal/index.vue'
import { ElMessage } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import { GetAssetDetail, GetAssetColumns, RefreshAssetColumns } from '@/services/data-asset.service'

const modelConfig = reactive({
  title: '资产详情',
  visible: false,
  width: '900px'
})

const activeTab = ref('basic')
const assetData = ref<any>({})
const columnList = ref<any[]>([])
const columnLoading = ref(false)

function showModal(assetId: number) {
  modelConfig.visible = true
  activeTab.value = 'basic'
  loadAssetDetail(assetId)
}

function loadAssetDetail(assetId: number) {
  GetAssetDetail(assetId).then((res: any) => {
    if (res.success && res.data) {
      assetData.value = res.data
      // 同时加载字段信息
      loadColumns(assetId)
    }
  }).catch(() => {
    ElMessage.error('加载资产详情失败')
  })
}

function loadColumns(assetId: number) {
  columnLoading.value = true
  GetAssetColumns(assetId).then((res: any) => {
    if (res.success && res.data) {
      columnList.value = res.data.columns || []
    }
    columnLoading.value = false
  }).catch(() => {
    columnList.value = []
    columnLoading.value = false
  })
}

function refreshColumns() {
  if (!assetData.value.id) return

  columnLoading.value = true
  RefreshAssetColumns(assetData.value.id).then((res: any) => {
    if (res.success) {
      ElMessage.success('刷新成功')
      loadColumns(assetData.value.id)
    } else {
      ElMessage.error(res.message || '刷新失败')
      columnLoading.value = false
    }
  }).catch(() => {
    ElMessage.error('刷新失败')
    columnLoading.value = false
  })
}

function getAssetTypeText(type: string) {
  const typeMap: any = {
    'table': '数据表',
    'view': '视图',
    'external': '外部表',
    'temp': '临时表'
  }
  return typeMap[type] || type
}

function getQualityType(level: string) {
  const typeMap: any = {
    'A': 'success',
    'B': 'success',
    'C': 'warning',
    'D': 'danger'
  }
  return typeMap[level] || 'info'
}

function getStatusType(status: string) {
  const typeMap: any = {
    'normal': 'success',
    'offline': 'info',
    'maintenance': 'warning',
    'deprecated': 'danger'
  }
  return typeMap[status] || 'info'
}

function getStatusText(status: string) {
  const textMap: any = {
    'normal': '正常',
    'offline': '已下线',
    'maintenance': '维护中',
    'deprecated': '已废弃'
  }
  return textMap[status] || status
}

function formatSize(bytes: number) {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

function closeEvent() {
  modelConfig.visible = false
  assetData.value = {}
  columnList.value = []
}

defineExpose({
  showModal
})
</script>

<style lang="scss" scoped>
:deep(.el-descriptions__label) {
  width: 120px;
}
</style>