<template>
  <el-dialog
      v-model="visible"
      :title="`密钥管理 - ${currentUser?.display_name || ''}`"
      width="900px"
      @close="handleClose"
  >
    <!-- 顶部操作栏 -->
    <div style="margin-bottom: 16px">
      <el-button
          type="primary"
          :icon="Plus"
          @click="showCreateKeyForm"
      >
        创建新密钥
      </el-button>
    </div>

    <!-- 密钥列表 -->
    <el-table
        :data="keyList"
        v-loading="loading"
        style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="60" />

      <el-table-column label="密钥信息" min-width="250">
        <template #default="{ row }">
          <div>
            <div style="font-weight: 600">{{ row.key_name }}</div>
            <div style="font-size: 12px; color: #909399; margin-top: 4px; font-family: monospace">
              {{ row.key_preview }}
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag
              :type="row.is_active ? 'success' : 'danger'"
              size="small"
          >
            {{ row.is_active ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="过期时间" width="150">
        <template #default="{ row }">
          <span v-if="row.expires_at">
            {{ formatDate(row.expires_at) }}
          </span>
          <el-tag v-else type="success" size="small">永不过期</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="rate_limit" label="速率限制" width="100">
        <template #default="{ row }">
          {{ row.rate_limit }}/小时
        </template>
      </el-table-column>

      <el-table-column label="使用统计" width="120">
        <template #default="{ row }">
          <div style="font-size: 13px">
            <div>调用: {{ row.total_calls }}</div>
            <div v-if="row.last_used_at" style="margin-top: 2px; color: #909399">
              最后使用: {{ formatDate(row.last_used_at) }}
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button
              :type="row.is_active ? 'warning' : 'success'"
              size="small"
              text
              @click="handleToggleStatus(row)"
          >
            {{ row.is_active ? '禁用' : '启用' }}
          </el-button>
          <el-button
              type="danger"
              size="small"
              text
              :icon="Delete"
              @click="handleDeleteKey(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 创建密钥表单 -->
    <el-dialog
        v-model="createFormVisible"
        title="创建API密钥"
        width="500px"
        append-to-body
    >
      <el-form
          ref="createFormRef"
          :model="createFormData"
          :rules="createFormRules"
          label-width="120px"
      >
        <el-form-item label="密钥名称" prop="key_name">
          <el-input
              v-model="createFormData.key_name"
              placeholder="例如: 生产环境密钥"
              maxlength="100"
          />
        </el-form-item>

        <el-form-item label="有效期" prop="expires_days">
          <el-select v-model="createFormData.expires_days" style="width: 100%">
            <el-option label="永不过期" :value="null" />
            <el-option label="30天" :value="30" />
            <el-option label="90天" :value="90" />
            <el-option label="180天" :value="180" />
            <el-option label="365天" :value="365" />
            <el-option label="730天(2年)" :value="730" />
          </el-select>
        </el-form-item>

        <el-form-item label="速率限制" prop="rate_limit">
          <el-input-number
              v-model="createFormData.rate_limit"
              :min="1"
              :max="100000"
              style="width: 100%"
          />
          <div style="font-size: 12px; color: #909399; margin-top: 4px">
            每小时最大请求次数
          </div>
        </el-form-item>

        <el-form-item label="IP白名单">
          <el-input
              v-model="createFormData.allowed_ips"
              type="textarea"
              :rows="3"
              placeholder="可选，留空表示不限制IP。多个IP用英文逗号分隔，例如: 192.168.1.1, 10.0.0.1"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="createFormVisible = false">取消</el-button>
        <el-button
            type="primary"
            :loading="createLoading"
            @click="handleCreateKey"
        >
          创建
        </el-button>
      </template>
    </el-dialog>

    <!-- 显示新创建的密钥 -->
    <el-dialog
        v-model="showNewKeyDialog"
        title="密钥创建成功"
        width="600px"
        append-to-body
        :close-on-click-modal="false"
    >
      <el-alert
          title="请妥善保管密钥"
          type="warning"
          :closable="false"
          style="margin-bottom: 16px"
      >
        <template #default>
          密钥只会显示一次，请立即复制保存。关闭此窗口后将无法再次查看完整密钥。
        </template>
      </el-alert>

      <div class="new-key-display">
        <div class="key-label">API密钥:</div>
        <div class="key-value">
          <code>{{ newApiKey }}</code>
          <el-button
              type="primary"
              size="small"
              :icon="DocumentCopy"
              @click="copyKey"
          >
            复制
          </el-button>
        </div>
      </div>

      <template #footer>
        <el-button type="primary" @click="showNewKeyDialog = false">
          我已保存，关闭
        </el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus, Delete, DocumentCopy } from '@element-plus/icons-vue'
import Clipboard from 'clipboard'
import {
  GetUserAPIKeys,
  CreateAPIKey,
  DeleteAPIKey,
  ToggleAPIKeyStatus
} from '@/services/api-user.service'

// ==================== 响应式数据 ====================

const visible = ref(false)
const loading = ref(false)
const currentUser = ref<any>(null)
const keyList = ref<any[]>([])

const createFormVisible = ref(false)
const createLoading = ref(false)
const createFormRef = ref<FormInstance>()

const createFormData = reactive({
  key_name: '',
  expires_days: null as number | null,
  rate_limit: 1000,
  allowed_ips: ''
})

const createFormRules: FormRules = {
  key_name: [
    { required: true, message: '请输入密钥名称', trigger: 'blur' }
  ],
  rate_limit: [
    { required: true, message: '请设置速率限制', trigger: 'blur' }
  ]
}

const showNewKeyDialog = ref(false)
const newApiKey = ref('')

// ==================== 对外方法 ====================

async function showModal(user: any) {
  currentUser.value = user
  visible.value = true
  await loadKeys()
}

defineExpose({ showModal })

// ==================== 数据加载 ====================

async function loadKeys() {
  if (!currentUser.value) return

  loading.value = true

  try {
    const res = await GetUserAPIKeys(currentUser.value.id, true)

    if (res.data) {
      keyList.value = res.data.keys || []
    }
  } catch (error) {
    console.error('加载密钥列表失败:', error)
    ElMessage.error('加载密钥列表失败')
  } finally {
    loading.value = false
  }
}

// ==================== 操作方法 ====================

function showCreateKeyForm() {
  createFormData.key_name = ''
  createFormData.expires_days = null
  createFormData.rate_limit = 1000
  createFormData.allowed_ips = ''
  createFormRef.value?.resetFields()
  createFormVisible.value = true
}

async function handleCreateKey() {
  try {
    await createFormRef.value?.validate()

    createLoading.value = true

    const data: any = {
      user_id: currentUser.value.id,
      key_name: createFormData.key_name,
      rate_limit: createFormData.rate_limit
    }

    if (createFormData.expires_days) {
      data.expires_days = createFormData.expires_days
    }

    if (createFormData.allowed_ips) {
      data.allowed_ips = createFormData.allowed_ips
    }

    const res = await CreateAPIKey(data)

    if (res.data && res.data.api_key) {
      newApiKey.value = res.data.api_key
      showNewKeyDialog.value = true
      createFormVisible.value = false
      ElMessage.success('密钥创建成功')
      await loadKeys()
    }
  } catch (error: any) {
    console.error('创建密钥失败:', error)
    ElMessage.error(error.message || '创建失败')
  } finally {
    createLoading.value = false
  }
}

async function handleToggleStatus(row: any) {
  try {
    await ToggleAPIKeyStatus(row.id)
    ElMessage.success(row.is_active ? '密钥已禁用' : '密钥已启用')
    await loadKeys()
  } catch (error) {
    console.error('切换状态失败:', error)
    ElMessage.error('操作失败')
  }
}

async function handleDeleteKey(row: any) {
  try {
    await ElMessageBox.confirm(
        `确定要删除密钥 "${row.key_name}" 吗？删除后无法恢复。`,
        '警告',
        {
          type: 'warning',
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }
    )

    await DeleteAPIKey(row.id)
    ElMessage.success('删除成功')
    await loadKeys()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

function copyKey() {
  const clipboard = new Clipboard('.el-button', {
    text: () => newApiKey.value
  })

  clipboard.on('success', () => {
    ElMessage.success('密钥已复制到剪贴板')
    clipboard.destroy()
  })

  clipboard.on('error', () => {
    ElMessage.error('复制失败，请手动复制')
    clipboard.destroy()
  })
}

function handleClose() {
  currentUser.value = null
  keyList.value = []
}

function formatDate(dateString: string): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style lang="scss" scoped>
.new-key-display {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 4px;

  .key-label {
    font-weight: 600;
    margin-bottom: 8px;
  }

  .key-value {
    display: flex;
    align-items: center;
    gap: 12px;

    code {
      flex: 1;
      background: white;
      padding: 12px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      word-break: break-all;
      border: 1px solid #dcdfe6;
    }
  }
}
</style>