<template>
  <BlockModal :model-config="modelConfig">
    <el-form
      ref="form"
      class="add-computer-group"
      label-position="top"
      :model="formData"
      :rules="rules"
    >
      <el-form-item
        label="集群名称"
        prop="name"
      >
        <el-input
          v-model="formData.name"
          maxlength="20"
          placeholder="请输入"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="类型" prop="clusterType">
        <el-select v-model="formData.clusterType" placeholder="请选择">
          <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <template v-if="formData.clusterType === 'hadoop'">
        <el-form-item label="NameNode主机地址" prop="webApiConfig.namenode_host">
          <el-input v-model="formData.webApiConfig.namenode_host" placeholder="如：192.168.1.100" />
        </el-form-item>

        <el-form-item label="NameNode Web端口" prop="webApiConfig.namenode_web_port">
          <el-input-number v-model="formData.webApiConfig.namenode_web_port" :min="1" :max="65535" />
        </el-form-item>

        <el-form-item label="NameNode HA主机">
          <el-input v-model="nameNodeHaHosts" placeholder="多个主机用逗号分隔，如：192.168.1.101,192.168.1.102" />
        </el-form-item>

        <el-form-item label="JournalNode主机">
          <el-input v-model="journalNodeHosts" placeholder="多个主机用逗号分隔，如：192.168.1.103,192.168.1.104,192.168.1.105" />
        </el-form-item>

        <el-form-item label="JournalNode端口">
          <el-input-number v-model="formData.webApiConfig.journalnode_port" :min="1" :max="65535" />
        </el-form-item>
      </template>

      <el-form-item label="自动发现">
        <el-switch v-model="formData.autoDiscovery" />
      </el-form-item>

      <el-form-item label="备注">
        <el-input v-model="formData.remark" show-word-limit type="textarea" maxlength="200"
                  :autosize="{ minRows: 4, maxRows: 4 }" placeholder="请输入" />
      </el-form-item>
    </el-form>
  </BlockModal>
</template>

<script lang="ts" setup>
import { reactive, ref, nextTick } from 'vue'
import BlockModal from '@/components/block-modal/index.vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'

const form = ref<FormInstance>()
const callback = ref<any>()
const modelConfig = reactive({
  title: '添加集群',
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
  clusterType: '',
  name: '',
  remark: '',
  webApiConfig: {
    namenode_host: '',
    namenode_web_port: 9870,
    namenode_ha_hosts: [],
    journalnode_hosts: [],
    journalnode_port: 8485
  },
  autoDiscovery: true,
  id: ''
})
const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入集群名称', trigger: ['blur', 'change'] }],
  clusterType: [{ required: true, message: '请选择集群类型', trigger: ['blur', 'change'] }],
  'webApiConfig.namenode_host': [
    {
      required: true,
      message: '请输入NameNode主机地址',
      trigger: ['blur', 'change'],
      validator: (rule, value, callback) => {
        // 只有选择了hadoop类型才需要验证这个字段
        if (formData.clusterType === 'hadoop' && !value) {
          callback(new Error('请输入NameNode主机地址'))
        } else {
          callback()
        }
      }
    }
  ]
})
const typeList = reactive([
  {
    label: 'Kubernetes',
    value: 'kubernetes',
  },
  {
    label: 'Yarn',
    value: 'yarn',
  },
  {
    label: 'StandAlone',
    value: 'standalone',
  },
  {
    label: 'Hadoop',
    value: 'hadoop',
  },
  {
    label: 'Doris',
    value: 'doris',
  },
  {
    label: 'Flink',
    value: 'flink',
  },
]);

const nameNodeHaHosts = ref('')
const journalNodeHosts = ref('')

function showModal(cb: () => void, data: any): void {
  callback.value = cb

  if (data) {
    // 编辑模式 - 填充现有数据
    formData.name = data.name
    formData.clusterType = data.clusterType
    formData.remark = data.remark
    formData.id = data.id
    formData.webApiConfig = data.webApiConfig || {
      namenode_host: '',
      namenode_web_port: 9870,
      namenode_ha_hosts: [],
      journalnode_hosts: [],
      journalnode_port: 8485
    }
    nameNodeHaHosts.value = data.webApiConfig?.namenode_ha_hosts?.join(',') || ''
    journalNodeHosts.value = data.webApiConfig?.journalnode_hosts?.join(',') || ''
    formData.autoDiscovery = data.autoDiscovery !== undefined ? data.autoDiscovery : true
    modelConfig.title = '编辑集群'
  } else {
    // 新建模式 - 重置所有字段
    formData.name = ''
    formData.clusterType = ''
    formData.remark = ''
    formData.id = ''
    formData.webApiConfig = {
      namenode_host: '',
      namenode_web_port: 9870,
      namenode_ha_hosts: [],
      journalnode_hosts: [],
      journalnode_port: 8485
    }
    formData.autoDiscovery = true
    nameNodeHaHosts.value = ''
    journalNodeHosts.value = ''
    modelConfig.title = '添加集群'
  }

  nextTick(() => {
    form.value?.resetFields()
  })
  modelConfig.visible = true
}

function okEvent() {
  formData.webApiConfig.namenode_ha_hosts = nameNodeHaHosts.value ?
      nameNodeHaHosts.value.split(',').map(s => s.trim()).filter(s => s) : []
  formData.webApiConfig.journalnode_hosts = journalNodeHosts.value ?
      journalNodeHosts.value.split(',').map(s => s.trim()).filter(s => s) : []
  form.value?.validate((valid) => {
    if (valid) {
      modelConfig.okConfig.loading = true
      callback
        .value({
          ...formData,
          id: formData.id ? formData.id : undefined,
          clusterId: formData.id ? formData.id : undefined
        })
        .then((res: any) => {
          modelConfig.okConfig.loading = false
            modelConfig.visible = false
            modelConfig.visible = true
        })
        .catch(() => {
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

defineExpose({
  showModal
})
</script>

<style lang="scss">
.add-computer-group {
  padding: 12px 20px 0 20px;
  box-sizing: border-box;
}
</style>
