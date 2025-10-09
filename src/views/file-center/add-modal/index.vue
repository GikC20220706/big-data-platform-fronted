<template>
  <BlockModal :model-config="modelConfig">
    <el-form
      ref="form"
      class="add-computer-group"
      label-position="top"
      :model="formData"
      :rules="rules"
    >
      <el-form-item label="类型" prop="type">
        <el-select
          v-model="formData.type"
          placeholder="请选择"
          :disabled="renderSence === 'edit'"
        >
          <el-option
            v-for="item in typeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="formData.remark"
          type="textarea"
          maxlength="200"
          :autosize="{ minRows: 4, maxRows: 4 }"
          placeholder="请输入"
        />
      </el-form-item>
    </el-form>
    <el-upload
      v-if="renderSence === 'new'"
      class="license-upload"
      action=""
      :limit="1"
      :multiple="false"
      :drag="true"
      :auto-upload="false"
      :on-change="handleChange"
    >
      <el-icon class="el-icon--upload">
        <upload-filled />
      </el-icon>
      <div class="el-upload__text">
        上传附件 <em>点击上传</em>
      </div>
    </el-upload>
  </BlockModal>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'

const form = ref<FormInstance>()
const callback = ref<any>()
const typeList = ref([
  {
    label: '作业',
    value: 'JOB',
  },
  {
    label: '函数',
    value: 'FUNC',
  },
  {
    label: '依赖',
    value: 'LIB',
  },
  {
    label: 'Excel',
    value: 'EXCEL',
  }
])
const renderSence = ref<string>('new')
const modelConfig = reactive({
  title: '上传资源',
  visible: false,
  width: '520px',
  okConfig: {
    title: '确定',
    ok: okEvent,
    disabled: false,
    loading: false
  },
  cancelConfig: {
    title: '取消',
    cancel: closeEvent,
    disabled: false
  },
  needScale: false,
  zIndex: 1100,
  closeOnClickModal: false
})
const formData = reactive({
  id: null,
  type: '',
  remark: '',
  fileData: null
})
const rules = reactive<FormRules>({
  type: [
    {
      required: true,
      message: '请选择类型',
      trigger: [ 'blur', 'change' ]
    }
  ]
})

function showModal(cb: () => void, data: any): void {
  formData.type = ''
  formData.remark = ''
  formData.fileData = null
  renderSence.value = 'new'
  modelConfig.title = '上传资源'

  if (data) {
    // 编辑模式
    modelConfig.title = '编辑资源'
    formData.type = data.fileType  // 🆕 确认字段名
    formData.remark = data.remark
    formData.id = data.id
    renderSence.value = 'edit'
  }

  callback.value = cb
  modelConfig.visible = true
}

function okEvent() {
  if (!formData.fileData && renderSence.value === 'new') {
    ElMessage.warning('请上传附件')
    return
  }
  form.value?.validate((valid: boolean) => {
    if (valid) {
      modelConfig.okConfig.loading = true
      callback.value(formData).then((res: any) => {
        modelConfig.okConfig.loading = false
        if (res === undefined) {
          modelConfig.visible = false
        } else {
          modelConfig.visible = true
        }
      }).catch((err: any) => {
        modelConfig.okConfig.loading = false
      })
    } else {
      ElMessage.warning('请将表单输入完整')
    }
  })
}

function closeEvent() {
  modelConfig.visible = false
}

function handleChange(e: any) {
  formData.fileData = e.raw
}

defineExpose({
  showModal
})
</script>

<style lang="scss">
.license-upload {
  margin: 20px;
  .el-upload {
    .el-upload-dragger {
      border-radius: getCssVar('border-radius', 'small');
      .el-upload__text {
        font-size: getCssVar('font-size', 'extra-small');
      }
    }
  }
}
</style>
