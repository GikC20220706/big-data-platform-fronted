<template>
  <el-drawer
      v-model="visible"
      title="指标详情"
      size="60%"
      :close-on-click-modal="false"
  >
    <div v-loading="loading" class="detail-container">
      <el-descriptions
          v-if="indicatorData"
          :column="2"
          border
          class="detail-descriptions"
      >
        <!-- 业务属性 -->
        <el-descriptions-item>
          <template #label>
            <span class="label-text">指标名称</span>
          </template>
          {{ indicatorData.indicator_name || '-' }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <span class="label-text">来源系统</span>
          </template>
          {{ indicatorData.source_system || '-' }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <span class="label-text">业务领域</span>
          </template>
          {{ indicatorData.business_domain || '-' }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <span class="label-text">业务主题</span>
          </template>
          {{ indicatorData.business_theme || '-' }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <span class="label-text">指标类别</span>
          </template>
          {{ indicatorData.indicator_category || '-' }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <span class="label-text">状态</span>
          </template>
          <el-tag v-if="indicatorData.is_active" type="success">启用</el-tag>
          <el-tag v-else type="info">停用</el-tag>
        </el-descriptions-item>
        <el-descriptions-item :span="2">
          <template #label>
            <span class="label-text">指标说明</span>
          </template>
          {{ indicatorData.indicator_description || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :span="2">
          <template #label>
            <span class="label-text">备注</span>
          </template>
          {{ indicatorData.remark || '-' }}
        </el-descriptions-item>

        <!-- 技术属性 -->
        <el-descriptions-item>
          <template #label>
            <span class="label-text">指标类型</span>
          </template>
          {{ indicatorData.indicator_type || '-' }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <span class="label-text">数据类型</span>
          </template>
          {{ indicatorData.data_type || '-' }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <span class="label-text">数据长度</span>
          </template>
          {{ indicatorData.data_length || '-' }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <span class="label-text">数据格式</span>
          </template>
          {{ indicatorData.data_format || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :span="2">
          <template #label>
            <span class="label-text">技术分类</span>
          </template>
          {{ indicatorData.tech_classification || '-' }}
        </el-descriptions-item>

        <!-- 管理属性 -->
        <el-descriptions-item>
          <template #label>
            <span class="label-text">权责部门</span>
          </template>
          {{ indicatorData.responsible_dept || '-' }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <span class="label-text">采集频率</span>
          </template>
          {{ indicatorData.collection_frequency || '-' }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <span class="label-text">采集时点</span>
          </template>
          {{ indicatorData.collection_time || '-' }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <span class="label-text">共享类型</span>
          </template>
          {{ indicatorData.share_type || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :span="2">
          <template #label>
            <span class="label-text">开放属性</span>
          </template>
          {{ indicatorData.open_attribute || '-' }}
        </el-descriptions-item>

        <!-- 其他信息 -->
        <el-descriptions-item>
          <template #label>
            <span class="label-text">创建人</span>
          </template>
          {{ indicatorData.created_by || '-' }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <span class="label-text">创建时间</span>
          </template>
          {{ indicatorData.created_at || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :span="2">
          <template #label>
            <span class="label-text">标签</span>
          </template>
          <el-tag
              v-for="tag in indicatorData.tags"
              :key="tag"
              style="margin-right: 8px"
              size="small"
          >
            {{ tag }}
          </el-tag>
          <span v-if="!indicatorData.tags || indicatorData.tags.length === 0">-</span>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 关联资产列表 -->
      <el-divider>关联的数据资产</el-divider>
      <el-table
          :data="linkedAssets"
          style="width: 100%"
          empty-text="暂无关联资产"
      >
        <el-table-column prop="asset_name" label="资产名称" min-width="150" />
        <el-table-column prop="asset_code" label="资产编码" min-width="150" />
        <el-table-column prop="table_name" label="表名" min-width="150" />
        <el-table-column prop="relation_type" label="关联类型" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.relation_type === 'source'" type="primary" size="small">
              数据来源
            </el-tag>
            <el-tag v-else-if="scope.row.relation_type === 'reference'" type="success" size="small">
              参考引用
            </el-tag>
            <el-tag v-else-if="scope.row.relation_type === 'derived'" type="warning" size="small">
              派生计算
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
import { ref, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import { GetIndicatorDetail } from '@/services/indicator-system.service'

const emit = defineEmits(['refresh'])

const visible = ref(false)
const loading = ref(false)
const indicatorData = ref<any>(null)
const linkedAssets = ref<any[]>([])

function showDrawer(id: number) {
  visible.value = true
  loadDetail(id)
}

function loadDetail(id: number) {
  loading.value = true

  GetIndicatorDetail(id)
      .then((res: any) => {
        if (res.success && res.data) {
          indicatorData.value = res.data
          linkedAssets.value = res.data.linked_assets || []
        } else {
          ElMessage.error('获取详情失败')
        }
      })
      .catch(() => {
        ElMessage.error('获取详情失败')
      })
      .finally(() => {
        loading.value = false
      })
}

defineExpose({
  showDrawer
})
</script>

<style lang="scss" scoped>
.detail-container {
  padding: 20px;

  .detail-descriptions {
    margin-bottom: 20px;

    .label-text {
      font-weight: 500;
    }
  }
}
</style>