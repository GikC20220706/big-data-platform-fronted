<template>
  <el-dialog
      v-model="visible"
      :title="isEdit ? '编辑用户' : '创建用户'"
      width="600px"
      @close="handleClose"
  >
    <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"        
    >
      <el-form-item label="用户名" prop="username">
        <el-input
            v-model="formData.username"
            placeholder="只能包含字母、数字、下划线"
            :disabled="isEdit"
            maxlength="50"
        />
      </el-form-item>

      <el-form-item label="显示名称" prop="display_name">
        <el-input
            v-model="formData.display_name"
            placeholder="用于显示的名称"
            maxlength="100"
        />
      </el-form-item>

      <el-form-item label="用户类型" prop="user_type">
        <el-select v-model="formData.user_type" style="width: 100%">
          <el-option label="系统账号" value="system" />
          <el-option label="应用" value="application" />
          <el-option label="开发者" value="developer" />
        </el-select>
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="用户描述信息"
            maxlength="1000"
            show-word-limit
        />
      </el-form-item>

      <el-form-item v-if="isEdit" label="状态">
        <el-switch
            v-model="formData.is_active"
            active-text="启用"
            inactive-text="禁用"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button style="display: inline-block;" @click="visible = false">取消</el-button>
      <el-button style="display: inline-block;"  type="primary" :loading="submitLoading" @click="handleSubmit">
        {{ submitLoading ? '提交中...' : '确定' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { CreateAPIUser, UpdateAPIUser, GetAPIUserDetail } from '@/services/api-user.service'
import { left } from '@antv/x6/lib/registry/port-layout/line'

// ==================== Props & Emits ====================

const emit = defineEmits(['refresh'])

// ==================== 响应式数据 ====================

const visible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const userId = ref<number | null>(null)

const formRef = ref<FormInstance>()

const formData = reactive({
  username: '',
  display_name: '',
  user_type: 'application',
  description: '',
  is_active: true
})

const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
      message: '用户名只能包含字母、数字、下划线，且必须以字母开头',
      trigger: 'blur'
    }
  ],
  display_name: [
    { required: true, message: '请输入显示名称', trigger: 'blur' }
  ],
  user_type: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ]
}

// ==================== 对外方法 ====================

async function showModal(id?: number) {
  resetForm()

  if (id) {
    isEdit.value = true
    userId.value = id
    await loadUserDetail(id)
  } else {
    isEdit.value = false
    userId.value = null
  }

  visible.value = true
}

defineExpose({ showModal })

// ==================== 内部方法 ====================

async function loadUserDetail(id: number) {
  try {
    const res = await GetAPIUserDetail(id)
    if (res.data) {
      formData.username = res.data.username
      formData.display_name = res.data.display_name
      formData.user_type = res.data.user_type
      formData.description = res.data.description || ''
      formData.is_active = res.data.is_active
    }
  } catch (error) {
    console.error('加载用户详情失败:', error)
    ElMessage.error('加载数据失败')
  }
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()

    submitLoading.value = true

    if (isEdit.value && userId.value) {
      // 编辑
      const updateData: any = {
        display_name: formData.display_name,
        user_type: formData.user_type,
        description: formData.description,
        is_active: formData.is_active
      }

      await UpdateAPIUser(userId.value, updateData)
      ElMessage.success('更新成功')
    } else {
      // 创建
      const createData = {
        username: formData.username,
        display_name: formData.display_name,
        user_type: formData.user_type,
        description: formData.description
      }

      await CreateAPIUser(createData)
      ElMessage.success('创建成功')
    }

    visible.value = false
    emit('refresh')
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('提交失败:', error)
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    submitLoading.value = false
  }
}

function handleClose() {
  resetForm()
}

function resetForm() {
  formData.username = ''
  formData.display_name = ''
  formData.user_type = 'application'
  formData.description = ''
  formData.is_active = true
  formRef.value?.resetFields()
}
</script>
<style lang="scss" scoped>
:deep(.el-form-item) {
  .el-form-item__label::before{
    position:static !important
  }  
}
</style>