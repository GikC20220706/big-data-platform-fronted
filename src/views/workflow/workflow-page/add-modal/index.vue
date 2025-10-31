<template>
  <BlockModal :model-config="modelConfig">
    <el-form
        ref="form"
        v-if="showForm"
        label-position="top"
        :model="formData"
        :rules="dynamicRules"
    >
      <!-- 作业名称 - 所有类型都需要 -->
      <el-form-item label="名称" prop="name">
        <el-input
            v-model="formData.name"
            show-word-limit
            maxlength="200"
            placeholder="请输入"
        />
      </el-form-item>

      <!-- 作业类型 - 新建时显示,编辑时禁用 -->
      <el-form-item label="类型" prop="workType">
        <el-select
            v-model="formData.workType"
            placeholder="请选择"
            :disabled="renderSense === 'edit'"
            @change="workTypeChangeEvent"
        >
          <el-option
              v-for="item in filteredTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-form-item>

      <!-- JDBC类作业 - 需要选择数据源 -->
      <template v-if="isJdbcType">
        <el-form-item label="数据源" prop="datasourceId">
          <el-select
              v-model="formData.datasourceId"
              placeholder="请选择"
              @visible-change="getDataSourceList"
          >
            <el-option
                v-for="item in dataSourceList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </el-form-item>
      </template>

      <!-- Spark/Flink类作业 - 需要选择集群 -->
      <template v-if="isSparkOrFlinkType">
        <el-form-item label="计算集群" prop="clusterId">
          <el-select
              v-model="formData.clusterId"
              placeholder="请选择"
              @visible-change="getClusterList"
              @change="clusterIdChangeEvent"
          >
            <el-option
                v-for="item in clusterList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="集群节点" prop="clusterNodeId">
          <el-select
              v-model="formData.clusterNodeId"
              placeholder="请选择"
              :disabled="!formData.clusterId"
              @visible-change="getClusterNodeList"
          >
            <el-option
                v-for="item in clusterNodeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </el-form-item>

        <!-- Spark容器(可选) -->
        <template v-if="isSparkType">
          <el-form-item label="Spark容器" prop="containerId">
            <el-select
                v-model="formData.containerId"
                placeholder="请选择"
                @visible-change="getSparkContainerList"
            >
              <el-option
                  v-for="item in sparkContainerList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
          </el-form-item>

          <!-- Hive支持 -->
          <el-form-item label="">
            <el-checkbox v-model="formData.enableHive" @change="enableHiveChange">
              启用Hive支持
            </el-checkbox>
          </el-form-item>
        </template>
      </template>

      <!-- 备注 - 所有类型都可以填写 -->
      <el-form-item label="备注">
        <el-input
            v-model="formData.remark"
            show-word-limit
            type="textarea"
            maxlength="200"
            :autosize="{ minRows: 4, maxRows: 4 }"
            placeholder="请输入"
        />
      </el-form-item>
    </el-form>
  </BlockModal>
</template>

<script lang="ts" setup>
import {reactive, ref, nextTick, computed} from 'vue'
import BlockModal from '@/components/block-modal/index.vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { GetComputerGroupList, GetComputerPointData } from '@/services/computer-group.service'
import { GetDatasourceList } from '@/services/datasource.service'
import { GetSparkContainerList } from '@/services/spark-container.service'
import { TypeList } from '../../workflow.config'

const isJdbcType = computed(() => {
  return ['EXE_JDBC', 'QUERY_JDBC'].includes(formData.workType)
})

const isSparkOrFlinkType = computed(() => {
  return ['SPARK_SQL', 'SPARK_JAR', 'FLINK_SQL', 'FLINK_JAR'].includes(formData.workType)
})

const isSparkType = computed(() => {
  return ['SPARK_SQL', 'SPARK_JAR'].includes(formData.workType)
})

const isDataSyncType = computed(() => {
  return ['DATA_SYNC_JDBC', 'EXCEL_SYNC_JDBC', 'DB_MIGRATE'].includes(formData.workType)
})

const filteredTypeList = computed(() => {
  return typeList.filter(item => {
    // 可以在这里过滤掉未实现的作业类型
    return true
  })
})

const dynamicRules = computed(() => {
  const baseRules = {
    name: [
      {
        required: true,
        message: '请输入作业名称',
        trigger: ['blur', 'change']
      }
    ],
    workType: [
      {
        required: true,
        message: '请选择类型',
        trigger: ['blur', 'change']
      }
    ]
  }

  // JDBC类作业需要数据源
  if (isJdbcType.value) {
    baseRules['datasourceId'] = [
      {
        required: true,
        message: '请选择数据源',
        trigger: ['blur', 'change']
      }
    ]
  }

  // Spark/Flink类作业需要集群
  if (isSparkOrFlinkType.value) {
    baseRules['clusterId'] = [
      {
        required: true,
        message: '请选择计算集群',
        trigger: ['blur', 'change']
      }
    ]
    baseRules['clusterNodeId'] = [
      {
        required: true,
        message: '请选择集群节点',
        trigger: ['blur', 'change']
      }
    ]

    // Spark容器可选,不添加必填验证
  }

  return baseRules
})

function workTypeChangeEvent() {
  // 清空可能不相关的字段
  if (!isJdbcType.value) {
    formData.datasourceId = ''
  }
  if (!isSparkOrFlinkType.value) {
    formData.clusterId = ''
    formData.clusterNodeId = ''
    formData.containerId = ''
    formData.enableHive = false
  }
}

const form = ref<FormInstance>()
const callback = ref<any>()
const clusterList = ref([]) // 计算集群
const clusterNodeList = ref([]) // 集群节点
const dataSourceList = ref([]) // 数据源
const showForm = ref(true)
const renderSense = ref('')
const sparkContainerList = ref([]) // spark容器

const modelConfig = reactive({
    title: '添加作业',
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
    name: '',
    workType: '',
    clusterId: '', // 计算集群
    clusterNodeId: '', // 集群节点
    datasourceId: '', // 数据源
    containerId: '', // spark容器
    enableHive: false,
    remark: '',
    id: ''
})
const typeList = reactive(TypeList)


function showModal(cb: () => void, data: any): void {
    callback.value = cb
    modelConfig.visible = true
    if (data && data.id) {
        Object.keys(data).forEach((key: string) => {
            formData[key] = data[key]
        })
        formData.clusterId && getClusterList(true)
        formData.clusterNodeId && getClusterNodeList(true)
        formData.datasourceId && getDataSourceList(true)
        formData.containerId && getSparkContainerList(true)

        modelConfig.title = '编辑作业'
        renderSense.value = 'edit'
    } else {
        formData.name = ''
        formData.workType = ''
        formData.remark = ''
        formData.clusterId = ''
        formData.clusterNodeId = ''
        formData.datasourceId = ''
        formData.enableHive = false

        formData.id = ''
        modelConfig.title = '添加作业'
        renderSense.value = 'new'
    }
    nextTick(() => {
        form.value?.resetFields()
    })
}

function okEvent() {
    form.value?.validate((valid) => {
        if (valid) {
            modelConfig.okConfig.loading = true
            callback
                .value({
                    ...formData,
                    id: formData.id ? formData.id : undefined
                })
                .then((res: any) => {
                    modelConfig.okConfig.loading = false
                    if (res === undefined) {
                        modelConfig.visible = false
                    } else {
                        modelConfig.visible = true
                    }
                })
                .catch((err: any) => {
                    modelConfig.okConfig.loading = false
                })
        } else {
            ElMessage.warning('请将表单输入完整')
        }
    })
}
function enableHiveChange() {
    showForm.value = false
    nextTick(() => {
        showForm.value = true
    })
}
function clusterIdChangeEvent() {
    formData.clusterNodeId = ''
}

function getDataSourceList(e: boolean, searchType?: string) {
  if (e) {
    GetDatasourceList({
      page: 1,
      page_size: 100,
      include_table_count: false,
      fast_mode: true
    }).then((res: any) => {
      console.log('数据源API响应:', res)

      if (res.code === 200 && res.data && Array.isArray(res.data.sources)) {
        dataSourceList.value = res.data.sources
            .filter((item: any) => {
              // 过滤掉 Kafka 数据源(如果是 JDBC 作业)
              const sourceType = (item.type || '').toUpperCase()
              return !(sourceType === 'KAFKA' && ['EXE_JDBC', 'QUERY_JDBC'].includes(formData.workType))
            })
            .map((item: any) => {
              return {
                label: item.name,
                value: item.id
              }
            })

        console.log('处理后的数据源列表:', dataSourceList.value)
      } else {
        console.warn('数据源数据格式不正确:', res)
        dataSourceList.value = []
      }
    }).catch((err) => {
      console.error('获取数据源失败:', err)
      dataSourceList.value = []
    })
  }
}

function getClusterNodeList(e: boolean) {
  if (e && formData.clusterId) {
    GetComputerPointData({
      page: 1,
      pageSize: 100,
      searchKeyWord: '',
      clusterId: formData.clusterId
    })
        .then((res: any) => {
          if (res.code === 200 && res.data && res.data.content) {
            clusterNodeList.value = res.data.content.map((item: any) => {
              return {
                label: item.name,
                value: item.id
              }
            })
          } else {
            clusterNodeList.value = []
          }
        })
        .catch(() => {
          clusterNodeList.value = []
        })
  }
}
function getClusterList(e: boolean) {
  if (e) {
    GetComputerGroupList({
      page: 1,
      pageSize: 100,
      searchKeyWord: ''
    })
        .then((res: any) => {
          if (res.code === 200 && res.data && res.data.content) {
            clusterList.value = res.data.content.map((item: any) => {
              return {
                label: item.name,
                value: item.id
              }
            })
          } else {
            clusterList.value = []
          }
        })
        .catch(() => {
          clusterList.value = []
        })
  }
}
function getSparkContainerList(e: boolean, searchType?: string) {
  if (e) {
    GetSparkContainerList({
      page: 1,
      pageSize: 100,
      searchKeyWord: ''
    })
        .then((res: any) => {
          if (res.code === 200 && res.data && res.data.content) {
            sparkContainerList.value = res.data.content.map((item: any) => {
              return {
                label: item.name,
                value: item.id
              }
            })
          } else {
            sparkContainerList.value = []
          }
        })
        .catch(() => {
          sparkContainerList.value = []
        })
  }
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
