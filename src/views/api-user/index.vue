<template>
  <div class="api-user-container">
    <el-card>
      <!-- 顶部操作栏 -->
      <div class="toolbar">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索用户名或显示名称"
            style="width: 300px"
            clearable
            @clear="loadData"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select
            v-model="filterUserType"
            placeholder="用户类型"
            clearable
            style="width: 150px; margin-left: 10px"
            @change="loadData"
        >
          <el-option label="全部" value="" />
          <el-option label="系统账号" value="system" />
          <el-option label="应用" value="application" />
          <el-option label="开发者" value="developer" />
        </el-select>

        <el-select
            v-model="filterIsActive"
            placeholder="状态"
            clearable
            style="width: 120px; margin-left: 10px"
            @change="loadData"
        >
          <el-option label="全部" value="" />
          <el-option label="启用" :value="true" />
          <el-option label="禁用" :value="false" />
        </el-select>

        <el-button
            type="primary"
            :icon="Search"
            style="margin-left: 10px"
            @click="loadData"
        >
          搜索
        </el-button>

        <el-button
            type="success"
            :icon="Plus"
            style="margin-left: auto"
            @click="showAddModal"
        >
          创建用户
        </el-button>
      </div>

      <!-- 用户列表表格 -->
      <el-table
          :data="userList"
          style="width: 100%; margin-top: 20px"
          v-loading="loading"
      >
        <el-table-column prop="id" label="ID" width="80" />

        <el-table-column label="用户信息" min-width="200">
          <template #default="{ row }">
            <div>
              <div style="font-weight: 600">{{ row.display_name }}</div>
              <div style="font-size: 12px; color: #909399; margin-top: 4px">
                @{{ row.username }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />

        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <el-tag
                :type="getUserTypeTagType(row.user_type)"
                size="small"
            >
              {{ getUserTypeLabel(row.user_type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag
                :type="row.is_active ? 'success' : 'danger'"
                size="small"
            >
              {{ row.is_active ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="统计" width="150">
          <template #default="{ row }">
            <div style="font-size: 13px">
              <div>密钥: {{ row.total_keys }}</div>
              <div style="margin-top: 2px">权限: {{ row.total_permissions }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button
                type="primary"
                size="small"
                text
                :icon="Key"
                @click="showKeysModal(row)"
            >
              密钥管理
            </el-button>
            <el-button
                type="primary"
                size="small"
                text
                :icon="Edit"
                @click="showEditModal(row)"
            >
              编辑
            </el-button>
            <el-button
                type="danger"
                size="small"
                text
                :icon="Delete"
                @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          style="margin-top: 20px; justify-content: flex-end"
          @size-change="loadData"
          @current-change="loadData"
      />
    </el-card>

    <!-- 创建/编辑用户对话框 -->
    <UserFormModal
        ref="userFormModalRef"
        @refresh="loadData"
    />

    <!-- 密钥管理对话框 -->
    <KeyManageModal
        ref="keyManageModalRef"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Delete, Key } from '@element-plus/icons-vue'
import { GetAPIUserList, DeleteAPIUser } from '@/services/api-user.service'
import UserFormModal from './components/user-form-modal.vue'
import KeyManageModal from './components/key-manage-modal.vue'

// ==================== 响应式数据 ====================

const loading = ref(false)
const userList = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

const searchKeyword = ref('')
const filterUserType = ref('')
const filterIsActive = ref<boolean | ''>('')

const userFormModalRef = ref()
const keyManageModalRef = ref()

// ==================== 生命周期 ====================

onMounted(() => {
  loadData()
})

// ==================== 数据加载 ====================

async function loadData() {
  loading.value = true

  try {
    const params: any = {
      skip: (currentPage.value - 1) * pageSize.value,
      limit: pageSize.value
    }

    if (searchKeyword.value) {
      params.search = searchKeyword.value
    }

    if (filterUserType.value) {
      params.user_type = filterUserType.value
    }

    if (filterIsActive.value !== '') {
      params.is_active = filterIsActive.value
    }

    const res = await GetAPIUserList(params)

    if (res.data) {
      userList.value = res.data.users || []
      total.value = res.data.total_count || 0
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// ==================== 操作方法 ====================

function showAddModal() {
  userFormModalRef.value?.showModal()
}

function showEditModal(row: any) {
  userFormModalRef.value?.showModal(row.id)
}

function showKeysModal(row: any) {
  keyManageModalRef.value?.showModal(row)
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm(
        `确定要删除用户 "${row.display_name}" 吗？删除后其所有密钥和权限也将被删除。`,
        '警告',
        {
          type: 'warning',
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }
    )

    await DeleteAPIUser(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// ==================== 工具方法 ====================

function getUserTypeLabel(type: string): string {
  const map: Record<string, string> = {
    system: '系统账号',
    application: '应用',
    developer: '开发者'
  }
  return map[type] || type
}

function getUserTypeTagType(type: string): string {
  const map: Record<string, string> = {
    system: 'danger',
    application: 'primary',
    developer: 'success'
  }
  return map[type] || ''
}

function formatDate(dateString: string): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}
</script>

<style lang="scss" scoped>
.api-user-container {
  padding: 20px;

  .toolbar {
    display: flex;
    align-items: center;
  }
}
</style>