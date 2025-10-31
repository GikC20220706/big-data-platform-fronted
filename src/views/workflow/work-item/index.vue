<template>
  <div class="zqy-work-item">
    <LoadingPage :visible="loading" :network-error="networkError" @loading-refresh="initData">
      <div class="zqy-work-container">
        <div class="sql-code-container">
          <div class="sql-option-container">
            <div class="btn-box" @click="goBack">
              <el-icon>
                <RefreshLeft />
              </el-icon>
              <span class="btn-text">返回</span>
            </div>
            <div class="btn-box" @click="runWorkData">
              <el-icon v-if="!runningLoading">
                <VideoPlay />
              </el-icon>
              <el-icon v-else class="is-loading">
                <Loading />
              </el-icon>
              <span class="btn-text">运行</span>
            </div>
            <div class="btn-box" @click="terWorkData">
              <el-icon v-if="!terLoading">
                <Close />
              </el-icon>
              <el-icon v-else class="is-loading">
                <Loading />
              </el-icon>
              <span class="btn-text">中止</span>
            </div>
            <div class="btn-box" @click="saveData">
              <el-icon v-if="!saveLoading">
                <Finished />
              </el-icon>
              <el-icon v-else class="is-loading">
                <Loading />
              </el-icon>
              <span class="btn-text">保存</span>
            </div>
            <div class="btn-box" @click="setConfigData">
              <el-icon>
                <Setting />
              </el-icon>
              <span class="btn-text">配置</span>
            </div>
            <!-- <div class="btn-box" @click="publishData">
              <el-icon v-if="!publishLoading">
                <Promotion />
              </el-icon>
              <el-icon v-else class="is-loading">
                <Loading />
              </el-icon>
              <span class="btn-text">发布</span>
            </div>
            <div class="btn-box" @click="stopData">
              <el-icon v-if="!stopLoading">
                <Failed />
              </el-icon>
              <el-icon v-else class="is-loading">
                <Loading />
              </el-icon>
              <span class="btn-text">下线</span>
            </div> -->
            <div class="btn-box" @click="locationNode">
              <el-icon>
                <Position />
              </el-icon>
              <span class="btn-text">定位</span>
            </div>
          </div>
          <code-mirror v-model="sqltextData" basic :lang="workConfig.workType === 'PYTHON' ? pythonLang : lang"
            @change="sqlConfigChange" />
        </div>

        <el-collapse v-model="collapseActive" class="work-item-log__collapse" ref="logCollapseRef">
          <el-collapse-item title="查看日志" :disabled="true" name="1">
            <template #title>
              <el-tabs v-model="activeName" @tab-click="changeCollapseUp" @tab-change="tabChangeEvent">
                <template v-for="tab in tabList" :key="tab.code">
                  <el-tab-pane v-if="!tab.hide" :label="tab.name" :name="tab.code" />
                </template>
              </el-tabs>
              <span class="log__collapse">
                <el-icon v-if="isCollapse" @click="changeCollapseDown">
                  <ArrowDown />
                </el-icon>
                <el-icon v-else @click="changeCollapseUp">
                  <ArrowUp />
                </el-icon>
              </span>
            </template>
            <div class="log-show log-show-datasync">
              <component
                :is="currentTab"
                ref="containerInstanceRef"
                class="show-container"
                :showParse="showParse"
                @getJsonParseResult="getJsonParseResult"
              />
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </LoadingPage>
    <!-- 配置 -->
    <config-detail ref="configDetailRef"></config-detail>
    <!-- 解析弹窗 -->
    <ParseModal ref="parseModalRef"></ParseModal>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted, markRaw, nextTick, computed } from 'vue'
import Breadcrumb from '@/layout/bread-crumb/index.vue'
import LoadingPage from '@/components/loading/index.vue'
import ConfigDetail from '../workflow-page/config-detail/index.vue'
import PublishLog from './publish-log.vue'
import ReturnData from './return-data.vue'
import RunningLog from './running-log.vue'
import TotalDetail from './total-detail.vue'
import { sql } from '@codemirror/lang-sql'
import { python } from '@codemirror/lang-python'

import { DeleteWorkData, GetWorkItemConfig, PublishWorkData, RunWorkItemConfig, SaveWorkItemConfig, TerWorkItemConfig } from '@/services/workflow.service'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { Loading } from '@element-plus/icons-vue'
import ParseModal from '@/components/log-container/parse-modal/index.vue'

const route = useRoute()
const router = useRouter()
const emit = defineEmits(['back', 'locationNode'])

const props = defineProps<{
  workItemConfig: any,
  workFlowData: any
}>()

const lang = ref(sql())
const pythonLang = ref(python())
const loading = ref(false)
const networkError = ref(false)
const runningLoading = ref(false)
const saveLoading = ref(false)
const terLoading = ref(false)
const publishLoading = ref(false)
const stopLoading = ref(false)
// const configModalRef = ref(null)
const configDetailRef = ref()
const activeName = ref()
const currentTab = ref()
const sqltextData = ref('')
const instanceId = ref('')
const changeStatus = ref(false)

const containerInstanceRef = ref(null)

const logCollapseRef = ref()
const collapseActive = ref('0')
const isCollapse = ref(false)
const parseModalRef = ref()

let workConfig = reactive({
  clusterId: '',
  datasourceId: '',
  corn: '',
  name: '',
  sqlScript: '',
  workId: '',
  workType: '',
  workflowId: '',
  applicationId: '',
  sparkConfig: '',
  flinkConfig: ''
})

const tabList = reactive([
  {
    name: '提交日志',
    code: 'PublishLog',
    hide: false
  },
  {
    name: '运行结果',
    code: 'ReturnData',
    hide: false
  },
  {
    name: '运行日志',
    code: 'RunningLog',
    hide: false
  },
  // {
  //   name: '监控信息',
  //   code: 'TotalDetail',
  //   hide: true
  // }
])

const showParse = computed(() => {
  return ['CURL', 'QUERY_JDBC', 'SPARK_SQL','FLINK_SQL', 'BASH', 'PYTHON'].includes(props.workItemConfig.workType)
})
function initData() {
  return new Promise((resolve, reject) => {
    loading.value = true
    GetWorkItemConfig({
      workId: props.workItemConfig.id
    }).then((res: any) => {
      workConfig.value = res.data

      // 根据作业类型处理配置显示
      const config = workConfig.value.config || {}

      if (['QUERY_JDBC', 'EXE_JDBC'].includes(workConfig.value.workType)) {
        // JDBC类作业：只显示SQL
        sqltextData.value = config.sql || ''
      } else if (['SPARK_SQL', 'FLINK_SQL'].includes(workConfig.value.workType)) {
        // Spark/Flink SQL：只显示SQL
        sqltextData.value = config.sql || ''
      } else if (['BASH'].includes(workConfig.value.workType)) {
        // Bash脚本：只显示脚本
        sqltextData.value = config.script || ''
      } else if (['PYTHON'].includes(workConfig.value.workType)) {
        // Python脚本：只显示脚本
        sqltextData.value = config.script || ''
        lang.value = python()  // 切换到Python语法高亮
      } else {
        // 其他类型：显示完整JSON
        sqltextData.value = JSON.stringify(config, null, 2)
      }

      loading.value = false
      networkError.value = false

      // 延迟重置变更状态,确保CodeMirror的change事件已触发完成
      nextTick(() => {
        setTimeout(() => {
          changeStatus.value = false
        }, 100)
      })

      resolve(res)
    }).catch((err) => {
      loading.value = false
      networkError.value = true
      reject(err)
    })
  })
}

// 返回
function goBack() {
  if (changeStatus.value) {
    ElMessageBox.confirm('作业尚未保存，是否确定要返回吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      emit('back', props.workItemConfig.id)
    })
  } else {
    emit('back', props.workItemConfig.id)
  }
}
function locationNode() {
  if (changeStatus.value) {
    ElMessageBox.confirm('作业尚未保存，是否确定要返回吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      emit('locationNode', props.workItemConfig.id)
    })
  } else {
    emit('locationNode', props.workItemConfig.id)
  }
}

// 运行
function runWorkData() {
  if (changeStatus.value) {
    ElMessageBox.confirm('作业尚未保存，是否确定要运行作业？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      executeRun()
    })
  } else {
    executeRun()
  }
}

function executeRun() {
  console.log('开始执行作业')
  console.log('workType:', workConfig.workType)

  // 显示所有标签页
  tabList.forEach((item: any) => {
    item.hide = false
  })

  runningLoading.value = true

  // 默认显示提交日志
  activeName.value = 'PublishLog'
  currentTab.value = markRaw(PublishLog)

  RunWorkItemConfig({
    workId: props.workItemConfig.id
  })
      .then((res: any) => {
        runningLoading.value = false

        const workInstanceId = res.data?.workInstanceId || res.data
        console.log('运行作业响应, instanceId:', workInstanceId)

        if (!workInstanceId || typeof workInstanceId !== 'string') {
          ElMessage.error('运行失败：未能获取作业实例ID')
          return
        }

        // 保存实例ID到组件状态
        instanceId.value = workInstanceId
        console.log('保存instanceId:', instanceId.value)

        nextTick(() => {
          // 初始化提交日志组件
          if (containerInstanceRef.value && containerInstanceRef.value.initData) {
            console.log('初始化提交日志组件')
            containerInstanceRef.value.initData(workInstanceId, (status: string) => {
              console.log('作业执行完成，状态:', status)
              console.log('当前保存的instanceId:', instanceId.value)

              // 执行成功后不自动切换，让用户手动切换
              if (status === 'SUCCESS') {
                console.log('执行成功，用户可以手动切换到运行结果查看')
              }
            })
          }
        })

        // 展开日志区域
        if (!isCollapse.value) {
          changeCollapseDown()
        }
      })
      .catch((error) => {
        runningLoading.value = false
        console.error('运行作业失败:', error)
        ElMessage.error(error.message || '运行作业失败')
      })
}

// 终止
function terWorkData() {
  if (!instanceId.value) {
    ElMessage.warning('暂无可中止的作业')
    return
  }
  terLoading.value = true
  TerWorkItemConfig({
    workId: props.workItemConfig.id,
    instanceId: instanceId.value
  })
    .then((res: any) => {
      terLoading.value = false
      ElMessage.success(res.msg)
      initData('', true)
    })
    .catch(() => {
      terLoading.value = false
    })
}

// 保存配置
function saveData() {
  saveLoading.value = true

  // 根据作业类型包装配置
  let configData: any = {}

  if (['QUERY_JDBC', 'EXE_JDBC'].includes(workConfig.value.workType)) {
    // ✅ 获取原配置
    const originalConfig = workConfig.value.config || {}

    console.log('保存前的原配置:', originalConfig)
    console.log('保存前的SQL:', sqltextData.value)

    // JDBC类：保留所有原配置，只更新SQL
    configData = {
      ...originalConfig,  // 保留所有原有配置（包括dataSourceId）
      sql: sqltextData.value.trim()  // 更新SQL
    }

    console.log('准备保存的配置:', configData)
  } else if (['SPARK_SQL', 'FLINK_SQL'].includes(workConfig.value.workType)) {
    const originalConfig = workConfig.value.config || {}
    configData = {
      ...originalConfig,
      sql: sqltextData.value.trim()
    }
  } else if (['BASH', 'PYTHON'].includes(workConfig.value.workType)) {
    const originalConfig = workConfig.value.config || {}
    configData = {
      ...originalConfig,
      script: sqltextData.value.trim()
    }
  } else {
    // 其他类型：解析JSON
    try {
      configData = JSON.parse(sqltextData.value)
    } catch (e) {
      ElMessage.error('JSON格式错误，请检查配置')
      saveLoading.value = false
      return
    }
  }

  // ✅ 确保必要字段存在
  if (['QUERY_JDBC', 'EXE_JDBC'].includes(workConfig.value.workType)) {
    if (!configData.dataSourceId) {
      ElMessage.error('数据源ID不能为空，请重新创建作业并选择数据源')
      saveLoading.value = false
      return
    }
    if (!configData.timeout) {
      configData.timeout = 300
    }
    if (!configData.type) {
      configData.type = workConfig.value.workType === 'EXE_JDBC' ? 'execute' : 'query'
    }
  }

  console.log('最终保存的配置:', configData)

  SaveWorkItemConfig({
    workId: props.workItemConfig.id,
    config: configData
  }).then((res: any) => {
    console.log('保存响应:', res)
    ElMessage.success(res.msg || '保存成功')
    saveLoading.value = false
    changeStatus.value = false

    // 重新加载配置以验证
    initData().then(() => {
      console.log('重新加载后的配置:', workConfig.value.config)
    })
  }).catch((err) => {
    console.error('保存失败:', err)
    ElMessage.error(err.message || '保存失败')
    saveLoading.value = false
  })
}


// 发布
function publishData() {
  publishLoading.value = true
  PublishWorkData({
    workId: props.workItemConfig.id
  }).then((res: any) => {
    ElMessage.success(res.msg)
    publishLoading.value = false
  })
    .catch((error: any) => {
      publishLoading.value = false
    })
}

// 下线
function stopData() {
  stopLoading.value = true
  DeleteWorkData({
    workId: props.workItemConfig.id
  }).then((res: any) => {
    ElMessage.success(res.msg)
    stopLoading.value = false
  })
    .catch((error: any) => {
      stopLoading.value = false
    })
}

// 配置打开
function setConfigData() {
  configDetailRef.value.showModal(props.workItemConfig, () => {
    initData()
  })
}
function changeCollapseDown() {
  logCollapseRef.value.setActiveNames('0')
  isCollapse.value = false
}
function changeCollapseUp(e: any) {
  if (e && e.paneName === activeName.value && isCollapse.value) {
    changeCollapseDown()
  } else {
    logCollapseRef.value.setActiveNames('1')
    isCollapse.value = true
  }
}

function tabChangeEvent(e: any) {
  console.log('切换标签页:', e)
  console.log('当前instanceId:', instanceId.value)

  // 检查instanceId是否有效
  if (!instanceId.value || instanceId.value === 'undefined') {
    console.error('instanceId无效，无法切换标签页')
    return
  }

  // 切换组件
  if (e === 'PublishLog') {
    currentTab.value = markRaw(PublishLog)
  } else if (e === 'ReturnData') {
    currentTab.value = markRaw(ReturnData)
  } else if (e === 'RunningLog') {
    currentTab.value = markRaw(RunningLog)
  } else if (e === 'TotalDetail') {
    currentTab.value = markRaw(TotalDetail)
  }

  // 保存当前instanceId，防止被覆盖
  const currentInstanceId = instanceId.value

  nextTick(() => {
    setTimeout(() => {
      if (containerInstanceRef.value && containerInstanceRef.value.initData) {
        console.log('初始化组件，使用instanceId:', currentInstanceId)
        containerInstanceRef.value.initData(currentInstanceId)
      }
    }, 100)
  })
}

function sqlConfigChange(e: string) {
  changeStatus.value = true
}

function getJsonParseResult() {
  if (['CURL'].includes(props.workItemConfig.workType)) {
    parseModalRef.value.showModal(instanceId.value, 'jsonPath')
  } else if (['QUERY_JDBC', 'SPARK_SQL', 'FLINK_SQL'].includes(props.workItemConfig.workType)) {
    parseModalRef.value.showModal(instanceId.value, 'tablePath')
  } else if (['BASH', 'PYTHON'].includes(props.workItemConfig.workType)) {
    parseModalRef.value.showModal(instanceId.value, 'regexPath')
  }
}

onMounted(() => {
  initData()
  activeName.value = 'PublishLog'
  currentTab.value = markRaw(PublishLog)
})
</script>

<style lang="scss">
.zqy-work-item {
  .zqy-loading {
    padding: 0 20px;
    box-sizing: border-box;
    height: calc(100vh - 55px);
  }

  .zqy-work-container {
    .sql-code-container {
      .vue-codemirror {
        height: calc(100vh - 174px);
        .cm-editor {
          height: 100%;
          outline: none;
          border: 1px solid #dcdfe6;
        }

        .cm-gutters {
          font-size: 12px;
          font-family: v-sans, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        }

        .cm-content {
          font-size: 12px;
          font-family: v-sans, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        }

        .cm-tooltip-autocomplete {

          // display: none !important;
          ul {
            li {
              height: 40px;
              display: flex;
              align-items: center;
              font-size: 12px;
              background-color: #ffffff;
              font-family: v-sans, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
            }

            li[aria-selected] {
              background: #409EFF;
            }

            .cm-completionIcon {
              margin-right: -4px;
              opacity: 0;
            }
          }
        }
      }

      .sql-option-container {
        height: 50px;
        display: flex;
        align-items: center;
        color: getCssVar('color', 'primary', 'light-5');

        .btn-box {
          font-size: getCssVar('font-size', 'extra-small');
          display: flex;
          cursor: pointer;
          width: 48px;
          margin-right: 8px;

          &.btn-box__4 {
            width: 70px;
          }

          .btn-text {
            margin-left: 4px;
          }

          &:hover {
            color: getCssVar('color', 'primary');
            ;
          }
        }
      }

    }

    .work-item-log__collapse {
      position: absolute;
      left: 0;
      right: 0;
      bottom: -2px;
      z-index: 100;

      .el-collapse-item__header {
        // padding-left: 20px;
        cursor: default;
      }

      .el-collapse-item__arrow {
        display: none;
      }

      .el-collapse-item__content {
        padding-bottom: 14px;
      }

      .log__collapse {
        position: absolute;
        right: 20px;
        cursor: pointer;
      }

      .el-tabs {
        width: 100%;
        // padding: 0 20px;
        height: 40px;
        box-sizing: border-box;

        .el-tabs__item {
          font-size: getCssVar('font-size', 'extra-small');
        }

        .el-tabs__nav-scroll {
          padding-left: 20px;
          box-sizing: border-box;
        }

        .el-tabs__content {
          height: 0;
        }

        .el-tabs__nav-scroll {
          border-bottom: 1px solid getCssVar('border-color');
        }
      }

      .log-show {
        padding: 0 20px;
        box-sizing: border-box;
        overflow: auto;

        &.log-show-datasync {
          height: calc(100vh - 368px);
          .zqy-download-log {
            right: 40px;
            top: 12px;
          }
        }

        pre {
          width: 100px;
        }

        .show-container {
          height: calc(100vh - 368px);
          overflow: auto;
        }

        .empty-page {
          height: 80%;
        }
      }
    }
  }
}
</style>
