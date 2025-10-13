<template>
  <BlockModal :model-config="modelConfig">
    <el-form
        ref="form"
        class="add-computer-group acquisition-task-add"
        label-position="top"
        :model="formData"
        :rules="rules"
    >
      <el-form-item label="目录名称" prop="name">
        <el-input v-model="formData.name" maxlength="200" placeholder="请输入目录名称" />
      </el-form-item>

      <el-form-item label="目录编码" prop="code">
        <el-input
            v-model="formData.code"
            maxlength="100"
            placeholder="请输入目录编码（唯一）"
            :disabled="!!formData.id"
        />
        <div style="color: #999; font-size: 12px; margin-top: 5px;">
          留空自动生成，创建后不可修改
        </div>
      </el-form-item>

      <el-form-item label="父级目录" prop="parentLayerId">
        <el-select
            :disabled="!!formData.id"
            v-model="formData.parentLayerId"
            filterable
            clearable
            placeholder="请选择父级目录（不选则为顶级目录）"
        >
          <el-option
              v-for="item in parentLayerIdList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="目录类型" prop="type">
        <el-select
            v-model="formData.type"
            placeholder="请选择目录类型"
            :disabled="!!formData.id"
        >
          <el-option label="业务域" value="domain" />
          <el-option label="主题域" value="subject" />
          <el-option label="数据集" value="dataset" />
        </el-select>
        <div style="color: #999; font-size: 12px; margin-top: 5px;">
          1-业务域 2-主题域 3-数据集
        </div>
      </el-form-item>

      <el-form-item label="层级" prop="level">
        <el-input-number
            v-model="formData.level"
            :min="1"
            :max="3"
            :disabled="!!formData.id"
            style="width: 150px;"
        />
        <div style="color: #999; font-size: 12px; margin-top: 5px;">
          根据类型自动设置：业务域=1，主题域=2，数据集=3
        </div>
      </el-form-item>

      <el-form-item label="排序" prop="sortOrder">
        <el-input-number
            v-model="formData.sortOrder"
            :min="0"
            :max="9999"
            style="width: 150px;"
        />
      </el-form-item>


      <el-form-item label="描述">
        <el-input
            v-model="formData.remark"
            type="textarea"
            maxlength="500"
            :autosize="{ minRows: 4, maxRows: 4 }"
            placeholder="请输入描述信息"
        />
      </el-form-item>
    </el-form>
  </BlockModal>
</template>

<script lang="ts" setup>
import { reactive, ref, watch } from 'vue'
import { GetCatalogTree } from '@/services/data-catalog.service'
import { ElMessage, FormInstance, FormRules } from 'element-plus'

interface Option {
  label: string
  value: number
}

const form = ref<FormInstance>()
const callback = ref<any>()
const parentLayerIdList = ref<Option[]>([])

const modelConfig = reactive({
  title: '添加',
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

const formData = reactive<any>({
  name: '',
  code: '',
  parentLayerId: null,
  type: 'domain',
  level: 1,
  sortOrder: 0,
  remark: '',
  id: null
})

const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入目录名称', trigger: ['blur', 'change'] }],
  type: [{ required: true, message: '请选择目录类型', trigger: ['blur', 'change'] }],
  level: [{ required: true, message: '请输入层级', trigger: ['blur', 'change'] }]
})

// 监听类型变化，自动设置层级
watch(() => formData.type, (newType) => {
  if (!formData.id) { // 只在新建时自动设置
    if (newType === 'domain') {
      formData.level = 1
    } else if (newType === 'subject') {
      formData.level = 2
    } else if (newType === 'dataset') {
      formData.level = 3
    }
  }
})

function showModal(cb: () => void, data: any, parentLayerId: number | null, parentInfo?: any): void {
  // 先加载父级目录列表
  getParentCatalogList()

  if (data) {
    // 编辑模式
    Object.keys(formData).forEach((key: string) => {
      if (key === 'parentLayerId') {
        formData[key] = data.parent_id || null
      } else if (key === 'name') {
        formData[key] = data.catalog_name || ''
      } else if (key === 'code') {
        formData[key] = data.catalog_code || ''
      } else if (key === 'type') {
        formData[key] = data.catalog_type || 'domain'
      } else if (key === 'level') {
        formData[key] = data.level || 1
      } else if (key === 'sortOrder') {
        formData[key] = data.sort_order || 0
      } else if (key === 'remark') {
        formData[key] = data.description || ''
      } else if (key === 'id') {
        formData[key] = data.id || null
      }
    })
    modelConfig.title = '编辑目录'
  } else {
    // 新建模式
    let defaultType = 'domain'
    let defaultLevel = 1

    // 如果有父级信息，根据父级自动设置子级类型和层级
    if (parentInfo) {
      if (parentInfo.level === 1) {
        // 父级是业务域(level=1)，子级应该是主题域(level=2)
        defaultType = 'subject'
        defaultLevel = 2
      } else if (parentInfo.level === 2) {
        // 父级是主题域(level=2)，子级应该是数据集(level=3)
        defaultType = 'dataset'
        defaultLevel = 3
      }
    }

    Object.keys(formData).forEach((key: string) => {
      if (key === 'parentLayerId') {
        formData[key] = parentLayerId || null
      } else if (key === 'type') {
        formData[key] = defaultType
      } else if (key === 'level') {
        formData[key] = defaultLevel
      } else if (key === 'sortOrder') {
        formData[key] = 0
      } else {
        formData[key] = ''
      }
    })
    formData.id = null
    modelConfig.title = '添加目录'
  }

  callback.value = cb
  modelConfig.visible = true
}

function okEvent() {
  form.value?.validate((valid: boolean) => {
    if (valid) {
      modelConfig.okConfig.loading = true

      // 构建提交数据
      const submitData = {
        catalog_name: formData.name,
        catalog_code: formData.code || `CAT_${Date.now()}`,
        catalog_type: formData.type,
        parent_id: formData.parentLayerId || null,
        level: formData.level,
        description: formData.remark,
        sort_order: formData.sortOrder
      }

      // 如果是编辑，添加ID
      if (formData.id) {
        submitData.id = formData.id
      }

      callback.value(submitData).then((res: any) => {
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

function getParentCatalogList() {
  GetCatalogTree({
    include_inactive: false
  }).then((res: any) => {
    if (res.success && res.data) {
      // 扁平化树形结构
      parentLayerIdList.value = flattenTree(res.data)
    } else {
      parentLayerIdList.value = []
    }
  }).catch(() => {
    parentLayerIdList.value = []
  })
}

function flattenTree(tree: any[], level: number = 0): Option[] {
  let result: Option[] = []
  tree.forEach((node: any) => {
    result.push({
      label: '　'.repeat(level) + node.catalog_name,
      value: node.id
    })
    if (node.children && node.children.length > 0) {
      result = result.concat(flattenTree(node.children, level + 1))
    }
  })
  return result
}

function closeEvent() {
  modelConfig.visible = false
}

defineExpose({
  showModal
})
</script>

<style lang="scss">
.acquisition-task-add {
  .el-form-item {
    .el-form-item__content {
      position: relative;
      flex-wrap: nowrap;
      justify-content: space-between;

      .time-num-input {
        height: 36px;

        .el-input-number__decrease {
          top: 16px
        }
      }
    }
  }

  .cron-config {
    border: 1px solid getCssVar('border-color');
    padding: 8px 12px;
    margin-bottom: 12px;
    border-radius: 5px;
  }
}
</style>