<template>
  <BlockModal :model-config="modelConfig">
    <div class="asset-link-container">
      <!-- 已关联的资产 -->
      <div class="linked-assets-section">
        <h4>已关联资产 ({{ linkedAssets.length }})</h4>
        <el-table
            :data="linkedAssets"
            style="width: 100%; margin-top: 10px"
            max-height="250"
            empty-text="暂无关联资产"
        >
          <el-table-column prop="asset_name" label="资产名称" min-width="150" />
          <el-table-column prop="asset_code" label="资产编码" min-width="120" />
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
          <el-table-column label="操作" width="80" align="center">
            <template #default="scope">
              <el-button
                  type="danger"
                  link
                  size="small"
                  @click="unlinkAsset(scope.row)"
              >
                解除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-divider />

      <!-- 添加新关联 -->
      <div class="add-link-section">
        <h4>添加关联资产</h4>
        <el-form :model="formData" label-width="100px" style="margin-top: 10px">
          <el-form-item label="选择资产">
            <el-select
                v-model="formData.asset_ids"
                multiple
                filterable
                placeholder="请选择数据资产"
                style="width: 100%"
                @visible-change="handleSelectVisibleChange"
            >
              <el-option
                  v-for="asset in availableAssets"
                  :key="asset.id"
                  :label="`${asset.asset_name} (${asset.asset_code})`"
                  :value="asset.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="关联类型">
            <el-select
                v-model="formData.relation_type"
                placeholder="请选择关联类型"
                style="width: 100%"
            >
              <el-option
                  v-for="item in RelationTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="关联说明">
            <el-input
                v-model="formData.relation_description"
                type="textarea"
                :rows="2"
                placeholder="请输入关联说明（可选）"
                maxlength="500"
            />
          </el-form-item>
        </el-form>
      </div>
    </div>
  </BlockModal>
</template>

<script lang="ts" setup>
import { ref, reactive, defineEmits } from 'vue'
import BlockModal from '@/components/block-modal/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  GetLinkedAssets,
  LinkAssets,
  UnlinkAsset
} from '@/services/indicator-system.service'
import { GetAssetList } from '@/services/data-asset.service'
import { RelationTypeOptions } from '../data.config'

const emit = defineEmits(['refresh'])

const modelConfig = reactive({
  title: '管理关联资产',
  visible: false,
  width: '800px',
  needScale: false,
  zIndex: 1100,
  closeOnClickModal: false,
  okConfig: {
    title: '添加关联',
    ok: submitLink,
    disabled: false,
    loading: false
  },
  cancelConfig: {
    title: '关闭',
    cancel: closeEvent,
    disabled: false
  }
})

const indicatorId = ref<number | null>(null)
const linkedAssets = ref<any[]>([])
const availableAssets = ref<any[]>([])
const formData = reactive({
  asset_ids: [] as number[],
  relation_type: 'source',
  relation_description: ''
})

function showModal(id: number) {
  indicatorId.value = id
  modelConfig.visible = true
  resetForm()
  loadLinkedAssets()
  loadAvailableAssets()
}

function resetForm() {
  formData.asset_ids = []
  formData.relation_type = 'source'
  formData.relation_description = ''
}

function loadLinkedAssets() {
  if (!indicatorId.value) return

  GetLinkedAssets(indicatorId.value)
      .then((res: any) => {
        if (res.success && res.data) {
          linkedAssets.value = res.data.assets || []
        }
      })
      .catch(() => {
        linkedAssets.value = []
      })
}

function loadAvailableAssets() {
  GetAssetList({
    page: 1,
    page_size: 100,
    status: 'normal'
  })
      .then((res: any) => {
        if (res.success && res.data) {
          availableAssets.value = res.data.items || []
        }
      })
      .catch(() => {
        availableAssets.value = []
      })
}

function handleSelectVisibleChange(visible: boolean) {
  if (visible && availableAssets.value.length === 0) {
    loadAvailableAssets()
  }
}

function submitLink() {
  if (!formData.asset_ids.length) {
    ElMessage.warning('请选择要关联的资产')
    return
  }

  // 🆕 改用 modelConfig 控制按钮状态
  modelConfig.okConfig.loading = true
  modelConfig.okConfig.disabled = true

  const data = {
    asset_ids: formData.asset_ids,
    relation_type: formData.relation_type,
    relation_description: formData.relation_description
  }

  LinkAssets(indicatorId.value!, data)
      .then((res: any) => {
        if (res.success) {
          ElMessage.success('关联成功')
          resetForm()
          loadLinkedAssets()
          emit('refresh')
        } else {
          ElMessage.error(res.message || '关联失败')
        }
      })
      .catch(() => {
        ElMessage.error('关联失败')
      })
      .finally(() => {
        // 🆕 恢复按钮状态
        modelConfig.okConfig.loading = false
        modelConfig.okConfig.disabled = false
      })
}

function unlinkAsset(row: any) {
  ElMessageBox.confirm(
      `确定要解除与资产"${row.asset_name}"的关联吗？`,
      '解除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  )
      .then(() => {
        UnlinkAsset(indicatorId.value!, row.asset_id)
            .then((res: any) => {
              if (res.success) {
                ElMessage.success('解除关联成功')
                loadLinkedAssets()
                emit('refresh')
              } else {
                ElMessage.error(res.message || '解除关联失败')
              }
            })
            .catch(() => {
              ElMessage.error('解除关联失败')
            })
      })
      .catch(() => {
        // 用户取消
      })
}

function closeEvent() {
  modelConfig.visible = false
  setTimeout(() => {
    resetForm()
  }, 300)
}

defineExpose({
  showModal
})
</script>

<style lang="scss" scoped>
.asset-link-container {
  padding: 20px;

  h4 {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 10px;
    color: #303133;
  }

  .linked-assets-section {
    margin-bottom: 20px;
  }

  .add-link-section {
    margin-top: 20px;
  }
}
</style>