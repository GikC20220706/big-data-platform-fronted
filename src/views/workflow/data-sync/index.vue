<template>
    <div class="data-sync-page">
        <div class="data-sync__option-container">
            <div class="btn-box" @click="goBack">
                <el-icon>
                    <RefreshLeft />
                </el-icon>
                <span class="btn-text">返回</span>
            </div>
            <div class="btn-box" @click="saveData">
                <el-icon v-if="!btnLoadingConfig.saveLoading">
                    <Finished />
                </el-icon>
                <el-icon v-else class="is-loading">
                    <Loading />
                </el-icon>
                <span class="btn-text">保存</span>
            </div>
            <div class="btn-box" @click="runWorkData">
                <el-icon v-if="!btnLoadingConfig.runningLoading">
                    <VideoPlay />
                </el-icon>
                <el-icon v-else class="is-loading">
                    <Loading />
                </el-icon>
                <span class="btn-text">运行</span>
            </div>
            <div class="btn-box" @click="terWorkData">
                <el-icon v-if="!btnLoadingConfig.stopWorkFlowLoading">
                    <Close />
                </el-icon>
                <el-icon v-else class="is-loading">
                    <Loading />
                </el-icon>
                <span class="btn-text">中止</span>
            </div>
            <div class="btn-box" @click="setConfigData">
                <el-icon>
                    <Setting />
                </el-icon>
                <span class="btn-text">配置</span>
            </div>
            <!-- <div class="btn-box" @click="publishData">
              <el-icon v-if="!btnLoadingConfig.publishLoading">
                <Promotion />
              </el-icon>
              <el-icon v-else class="is-loading">
                <Loading />
              </el-icon>
              <span class="btn-text">发布</span>
            </div>
            <div class="btn-box" @click="stopData">
              <el-icon v-if="!btnLoadingConfig.stopLoading">
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
        <LoadingPage
            :visible="loading"
            :network-error="networkError"
            @loading-refresh="getDate"
        >
            <div class="data-sync" :class="{ 'data-sync__log': !!instanceId }" id="data-sync">
                <div class="data-sync-top">
                    <el-card class="box-card">
                        <template #header>
                            <div class="card-header">
                                <span>数据来源</span>
                            </div>
                        </template>
                        <el-form ref="form" label-position="left" label-width="70px" :model="formData" :rules="rules">
                            <el-form-item prop="sourceDBType" label="类型">
                                <el-select v-model="formData.sourceDBType" clearable filterable placeholder="请选择"
                                    @change="dbTypeChange('source')">
                                    <el-option v-for="item in typeList" :key="item.value" :label="item.label"
                                        :value="item.value" />
                                </el-select>
                            </el-form-item>
                            <el-form-item prop="sourceDBId" label="数据源">
                                <el-tooltip content="数据源网速直接影响同步速度,推荐使用内网ip" placement="top">
                                    <el-icon style="left: -30px" class="tooltip-msg"><QuestionFilled /></el-icon>
                                </el-tooltip>
                                <el-select v-model="formData.sourceDBId" clearable filterable placeholder="请选择"
                                    @visible-change="getDataSource($event, formData.sourceDBType, 'source')"
                                    @change="dbIdChange('source')">
                                    <el-option v-for="item in sourceList" :key="item.value" :label="item.label"
                                        :value="item.value" />
                                </el-select>
                            </el-form-item>
                            <el-form-item prop="sourceTable" label="表">
                                <el-select v-model="formData.sourceTable" clearable filterable placeholder="请选择"
                                    @visible-change="getDataSourceTable($event, formData.sourceDBId, 'source')"
                                    @change="tableChangeEvent($event, formData.sourceDBId, 'source')">
                                    <el-option v-for="item in sourceTablesList" :key="item.value" :label="item.label"
                                        :value="item.value" />
                                </el-select>
                                <el-button type="primary" link @click="showTableDetail">数据预览</el-button>
                            </el-form-item>
                            <el-form-item label="分区键">
                                <el-select v-model="formData.partitionColumn" clearable filterable placeholder="请选择"
                                    @visible-change="getTableColumnData($event, formData.sourceDBId, formData.sourceTable)"
                                    @change="pageChangeEvent">
                                    <el-option v-for="item in partKeyList" :key="item.value" :label="item.label"
                                        :value="item.value" />
                                </el-select>
                            </el-form-item>
                            <el-form-item prop="queryCondition" label="过滤条件">
                                 <el-tooltip content="例如：age > 12 and username = 'zhangsan'，不需要填写where" placement="top">
                                    <el-icon style="left: -20px" class="tooltip-msg"><QuestionFilled /></el-icon>
                                </el-tooltip>
                                <code-mirror v-model="formData.queryCondition" basic :lang="lang" @change="pageChangeEvent" />
                            </el-form-item>
                        </el-form>
                    </el-card>
                  <el-card class="box-card">
                    <template #header>
                      <div class="card-header">数据去向</div>
                    </template>

                    <el-form :model="formData" label-width="70px" ref="form">
                      <!-- 类型 -->
                      <el-form-item prop="targetDBType" label="类型">
                        <el-select
                            v-model="formData.targetDBType"
                            clearable
                            filterable
                            placeholder="请选择"
                            @visible-change="getDataType($event, 'target')"
                            @change="dbTypeChange('target')"
                        >
                          <el-option
                              v-for="item in targetTypeList"
                              :key="item.value"
                              :label="item.label"
                              :value="item.value"
                          />
                        </el-select>
                      </el-form-item>

                      <!-- 数据源 -->
                      <el-form-item prop="targetDBId" label="数据源">
                        <el-select
                            v-model="formData.targetDBId"
                            clearable
                            filterable
                            placeholder="请选择"
                            @visible-change="getDataSource($event, formData.targetDBType, 'target')"
                            @change="dbIdChange('target')"
                        >
                          <el-option
                              v-for="item in targetList"
                              :key="item.value"
                              :label="item.label"
                              :value="item.value"
                          />
                        </el-select>
                      </el-form-item>

                      <!-- 表名 - 改为输入框 -->
                      <el-form-item prop="targetTable" label="表">
                        <el-input
                            v-model="formData.targetTable"
                            placeholder="请输入目标表名(自动创建)"
                            clearable
                            @blur="targetTableInputChange"
                        />
                        <span style="color: #909399; font-size: 12px;">
                目标表会自动创建,字段映射关系根据连线生成
            </span>
                      </el-form-item>

                      <!-- 写入模式 -->
                      <el-form-item prop="overMode" label="写入模式">
                        <el-select
                            v-model="formData.overMode"
                            clearable
                            filterable
                            placeholder="请选择"
                        >
                          <el-option
                              v-for="item in filteredOverModeList"
                              :key="item.value"
                              :label="item.label"
                              :value="item.value"
                          />
                        </el-select>
                      </el-form-item>
                    </el-form>
                  </el-card>
                </div>
                <data-sync-table ref="dataSyncTableRef" :formData="formData"></data-sync-table>
            </div>
        </LoadingPage>
        <!-- 数据同步日志部分  v-if="instanceId" -->
        <el-collapse v-if="!!instanceId" v-model="collapseActive" class="data-sync-log__collapse" ref="logCollapseRef">
            <el-collapse-item title="查看日志" :disabled="true" name="1">
                <template #title>
                    <el-tabs v-model="activeName" @tab-click="changeCollapseUp" @tab-change="tabChangeEvent">
                        <template v-for="tab in tabList" :key="tab.code">
                        <el-tab-pane v-if="!tab.hide" :label="tab.name" :name="tab.code" />
                        </template>
                    </el-tabs>
                    <span class="log__collapse">
                        <el-icon v-if="isCollapse" @click="changeCollapseDown"><ArrowDown /></el-icon>
                        <el-icon v-else @click="changeCollapseUp"><ArrowUp /></el-icon>
                    </span>
                </template>
                <div class="log-show log-show-datasync">
                    <component :is="currentTab" ref="containerInstanceRef" class="show-container" />
                </div>
            </el-collapse-item>
        </el-collapse>
        <!-- 数据预览 -->
        <table-detail ref="tableDetailRef"></table-detail>
        <!-- 配置 -->
        <config-detail ref="configDetailRef"></config-detail>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, defineProps, nextTick, markRaw, computed } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
// import CodeMirror from 'vue-codemirror6'
import { sql } from '@codemirror/lang-sql'
import { DataSourceType, OverModeList } from './data.config.ts'
import { GetDatasourceList } from '@/services/datasource.service'
import { CreateTableWork, GetDataSourceTables, GetTableColumnsByTableId, SaveDataSync } from '@/services/data-sync.service'
import TableDetail from './table-detail/index.vue'
import DataSyncTable from './data-sync-table/index.vue'
import ConfigDetail from '../workflow-page/config-detail/index.vue'
import { DeleteWorkData, GetWorkItemConfig, PublishWorkData, RunWorkItemConfig, SaveWorkItemConfig, TerWorkItemConfig } from '@/services/workflow.service'
import PublishLog from '../work-item/publish-log.vue'
import RunningLog from '../work-item/running-log.vue'
import { Loading } from '@element-plus/icons-vue'
import LoadingPage from '@/components/loading/index.vue'
import { http } from '@/utils/http'

interface Option {
    label: string
    value: string
}

const props = defineProps<{
    workItemConfig: any
}>()

const emit = defineEmits(['back', 'locationNode'])

const changeStatus = ref(false)
const configDetailRef = ref()
const form = ref<FormInstance>()
const tableDetailRef = ref()
const dataSyncTableRef = ref()
const lang = ref<any>(sql())
const sourceList = ref<Option[]>([])
const targetList = ref<Option[]>([])
const sourceTablesList = ref<Option[]>([])
const targetTablesList = ref<Option[]>([])
const overModeList = ref<Option[]>(OverModeList)
const partKeyList = ref<Option[]>([])       // 分区键
const typeList = ref(DataSourceType);
const sourceTypeList = ref<Option[]>([])
const targetTypeList = ref<Option[]>([])
const loading = ref<boolean>(false)
const networkError = ref<boolean>(false)

// 日志展示相关
const containerInstanceRef = ref(null)
const activeName = ref()
const currentTab = ref()
const instanceId = ref('')
const logCollapseRef = ref()
const collapseActive = ref('0')
const isCollapse = ref(false)
const tabList = reactive([
  {
    name: '提交日志',
    code: 'PublishLog',
    hide: false
  },
  {
    name: '运行日志',
    code: 'RunningLog',
    hide: false
  }
])

const formData = reactive({
    workId: '',     // 作业id
    sourceDBType: '',     // 来源数据源类型
    sourceDBId: '',       // 来源数据源
    sourceTable: '',      // 来源数据库表名
    queryCondition: '',   // 来源数据库查询条件
    partitionColumn: '',  // 分区键
    partitionValue: '',   // 分区值(可选,为空则自动生成日期)
    partitionType: 'date',// 分区类型: date/custom
    targetDBType: '',     // 目标数据库类型
    targetDBId: '',       // 目标数据源
    targetTable: '',      // 目标数据库表名
    overMode: '',         // 写入模式
})
const rules = reactive<FormRules>({
})
const btnLoadingConfig = reactive({
    runningLoading: false,
    reRunLoading: false,
    saveLoading: false,
    publishLoading: false,
    stopWorkFlowLoading: false,
    importLoading: false,
    exportLoading: false,
    stopLoading: false
})

// 日志tab切换
function tabChangeEvent(e: string) {
  const lookup = {
    PublishLog: PublishLog,
    RunningLog: RunningLog
  }
  activeName.value = e
  currentTab.value = markRaw(lookup[e])
  nextTick(() => {
    containerInstanceRef.value.initData(instanceId.value)
  })
}

function getDataType(e: boolean, type: string) {
  if (e) {
    // ✅ 直接使用 DataSourceType,不需要额外请求
    const options = DataSourceType.map((item: any) => {
      return {
        label: item.label,
        value: item.value
      }
    })

    if (type === 'source') {
      sourceTypeList.value = options
    } else if (type === 'target') {
      targetTypeList.value = options
    }

    console.log(`${type} 数据源类型列表:`, options)
  }
}

// 保存数据
function saveData() {
  btnLoadingConfig.saveLoading = true

  if (!formData.sourceTable || !formData.targetTable) {
    ElMessage.error('请输入源表和目标表名称')
    btnLoadingConfig.saveLoading = false
    return
  }

  // 强制获取最新的连线数据
  const sourceColumns = dataSyncTableRef.value.getSourceTableColumn()
  const targetColumns = dataSyncTableRef.value.getTargetTableColumn()
  const columnMap = dataSyncTableRef.value.getConnect()

  console.log('==== 开始保存 ====')
  console.log('源字段数量:', sourceColumns.length)
  console.log('目标字段数量:', targetColumns.length)
  console.log('连线映射数量:', columnMap.length)
  console.log('连线映射详细:', JSON.stringify(columnMap))

  // 检查连线映射
  if (!columnMap || columnMap.length === 0) {
    ElMessage.error('请先建立字段映射关系(点击"同名映射"按钮)')
    btnLoadingConfig.saveLoading = false
    return
  }

  // 过滤掉分区字段
  const filteredSourceColumns = sourceColumns.filter((col) => col.code.toLowerCase() !== 'dt')

  // 如果目标字段为空,从映射生成
  let filteredTargetColumns = targetColumns.filter((col) => col.code.toLowerCase() !== 'dt')
  if (filteredTargetColumns.length === 0) {
    filteredTargetColumns = columnMap.map((mapping) => {
      const sourceCol = sourceColumns.find((col) => col.code === mapping.source)
      return {
        code: mapping.target,
        type: sourceCol?.type || 'STRING',
        sql: ''
      }
    })
    console.log('自动生成目标字段:', filteredTargetColumns)
  }

  const config = {
    sourceType: formData.sourceDBType,
    sourceId: formData.sourceDBId,
    sourceTable: formData.sourceTable,
    sourceColumns: filteredSourceColumns,
    targetType: formData.targetDBType,
    targetId: formData.targetDBId,
    targetTable: formData.targetTable,
    targetColumns: filteredTargetColumns,
    columnMapping: columnMap,  // 注意这里是 columnMapping
    whereCondition: formData.queryCondition || '',
    partitionColumn: formData.partitionColumn || null,
    syncMode: formData.overMode || 'replace',
    autoCreateTable: true
  }

  console.log('完整配置对象:', JSON.stringify(config, null, 2))

  SaveWorkItemConfig({
    workId: formData.workId,
    config: config
  }).then((res) => {
    console.log('保存成功,响应:', res)
    changeStatus.value = false
    btnLoadingConfig.saveLoading = false
    ElMessage.success('保存成功')
    getDate()
  }).catch(err => {
    console.error('保存失败:', err)
    btnLoadingConfig.saveLoading = false
    ElMessage.error('保存失败')
  })
}

const filteredOverModeList = computed(() => {
    if (formData.targetDBType === 'CLICKHOUSE') {
        return overModeList.value.filter(item => item.value === 'INTO')
    }
    return overModeList.value
})

function getDate() {
  loading.value = true
  networkError.value = false

  GetWorkItemConfig({
    workId: props.workItemConfig.id
  }).then((res: any) => {
    networkError.value = false

    // ✅ 统一从 config 读取
    if (res.data.config) {
      const config = res.data.config

      formData.sourceDBType = config.sourceType
      formData.sourceDBId = config.sourceId
      formData.sourceTable = config.sourceTable
      formData.queryCondition = config.whereCondition || ''
      formData.partitionColumn = config.partitionColumn || ''
      formData.targetDBType = config.targetType
      formData.targetDBId = config.targetId
      formData.targetTable = config.targetTable
      formData.overMode = config.syncMode || 'replace'

      nextTick(() => {
        Promise.all([
          getDataSource(true, formData.sourceDBType, 'source'),
          getDataSource(true, formData.targetDBType, 'target'),
          getDataSourceTable(true, formData.sourceDBId, 'source'),
          getDataSourceTable(true, formData.targetDBId, 'target')
        ]).then(() => {
          // ✅ 初始化字段映射
          if (config.sourceColumns && config.columnMapping) {
            dataSyncTableRef.value.initPageData({
              sourceTableColumn: config.sourceColumns,
              targetTableColumn: config.targetColumns || [],
              columnMap: config.columnMapping
            })
          }
          loading.value = false
        }).catch((err: any) => {
          loading.value = false
          console.error('加载失败', err)
        })

        changeStatus.value = false
      })
    } else {
      loading.value = false
    }
  }).catch(err => {
    loading.value = false
    networkError.value = true
    console.error(err)
  })
}
// 运行
function runWorkData() {
  const executeRun = () => {
    btnLoadingConfig.runningLoading = true

    activeName.value = 'PublishLog'
    currentTab.value = markRaw(PublishLog)

    RunWorkItemConfig({
      workId: props.workItemConfig.id
    }).then((res: any) => {
      btnLoadingConfig.runningLoading = false

      // ✅ 设置实例ID
      instanceId.value = res.data.workInstanceId

      ElMessage.success('作业已提交运行')

      // ✅ 等待DOM更新后初始化日志
      nextTick(() => {
        if (containerInstanceRef.value) {
          containerInstanceRef.value.initData(instanceId.value)
        }

        // ✅ 展开日志面板
        changeCollapseUp()
      })
    }).catch((err) => {
      btnLoadingConfig.runningLoading = false
      console.error('运行失败:', err)
    })
  }

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
// 终止
function terWorkData() {
  if (!instanceId.value) {
    ElMessage.warning('暂无可中止的作业')
    return
  }
  btnLoadingConfig.stopWorkFlowLoading = true
  TerWorkItemConfig({
    workId: props.workItemConfig.id,
    instanceId: instanceId.value
  }).then((res: any) => {
    btnLoadingConfig.stopWorkFlowLoading = false
    ElMessage.success(res.msg)
  }).catch(() => {
    btnLoadingConfig.stopWorkFlowLoading = false
  })
}

// 发布
function publishData() {
  btnLoadingConfig.publishLoading = true
  PublishWorkData({
    workId: props.workItemConfig.id
  }).then((res: any) => {
    ElMessage.success(res.msg)
    btnLoadingConfig.publishLoading = false
  })
  .catch((error: any) => {
    btnLoadingConfig.publishLoading = false
  })
}

// 下线
function stopData() {
  btnLoadingConfig.stopLoading = true
  DeleteWorkData({
    workId: props.workItemConfig.id
  }).then((res: any) => {
    ElMessage.success(res.msg)
    btnLoadingConfig.stopLoading = false
  })
  .catch((error: any) => {
    btnLoadingConfig.stopLoading = false
  })
}

// 获取数据源
function getDataSource(e: boolean, sourceType: string, type: string) {
  return new Promise((resolve, reject) => {
    if (e && sourceType) {
      GetDatasourceList({
        page: 1,
        page_size: 100,
        include_table_count: false,
        fast_mode: true
      }).then((res: any) => {
        if (res.code === 200 && res.data && Array.isArray(res.data.sources)) {
          const options = res.data.sources
              .filter((item: any) => {
                const itemType = (item.type || '').toUpperCase()
                return itemType === sourceType.toUpperCase()
              })
              .map((item: any) => {
                return {
                  label: item.name,
                  value: item.id
                }
              })

          type === 'source' ? sourceList.value = options : targetList.value = options
          resolve(options)  // 这里传递 options
        } else {
          type === 'source' ? sourceList.value = [] : targetList.value = []
          resolve([])
        }
      }).catch(err => {
        console.error(err)
        type === 'source' ? sourceList.value = [] : targetList.value = []
        reject(err)
      })
    } else {
      type === 'source' ? sourceList.value = [] : targetList.value = []
      resolve([])
    }
  })
}

// 获取数据源表
async function getDataSourceTable(e: boolean, dataSourceId: string, type: string) {
  if (!e || !dataSourceId) {
    type === 'source' ? sourceTablesList.value = [] : targetTablesList.value = []
    return Promise.resolve([])
  }

  try {
    console.log('getDataSourceTable 被调用:', { dataSourceId, type })

    // 获取当前数据源列表和类型
    let currentList = type === 'source' ? sourceList.value : targetList.value
    const dbType = type === 'source' ? formData.sourceDBType : formData.targetDBType

    // 如果数据源列表为空,先加载
    if (currentList.length === 0 && dbType) {
      console.log('数据源列表为空,先加载数据源...')
      await getDataSource(true, dbType, type)
      // 重新获取列表
      currentList = type === 'source' ? sourceList.value : targetList.value
    }

    console.log('当前数据源列表:', currentList)

    // 根据ID查找数据源
    const sourceItem = currentList.find(s => s.value == dataSourceId)

    console.log('找到的数据源:', sourceItem)

    if (!sourceItem) {
      console.error('找不到数据源,ID:', dataSourceId)
      ElMessage.warning('找不到对应的数据源')
      type === 'source' ? sourceTablesList.value = [] : targetTablesList.value = []
      return Promise.resolve([])
    }

    // 使用数据源名称调用API获取表列表
    const response = await http.request({
      method: 'get',
      url: `/api/v1/integration/sources/${encodeURIComponent(sourceItem.label)}/tables`,
      params: {
        limit: 1000,
        offset: 0
      }
    })

    if (response.code === 200 && response.data && response.data.tables) {
      const options = response.data.tables.map((item: any) => {
        return {
          label: item.table_name,
          value: item.table_name
        }
      })

      type === 'source' ? sourceTablesList.value = options : targetTablesList.value = options
      console.log('成功加载表列表:', options.length, '张表')
      return Promise.resolve(options)
    } else {
      type === 'source' ? sourceTablesList.value = [] : targetTablesList.value = []
      return Promise.resolve([])
    }

  } catch (err) {
    console.error('获取表列表失败:', err)
    type === 'source' ? sourceTablesList.value = [] : targetTablesList.value = []
    ElMessage.error('获取表列表失败')
    return Promise.reject(err)
  }
}

// 获取分区键字段列表
function getTableColumnData(e: boolean, dataSourceId: string, tableName: string) {
  if (!e || !dataSourceId || !tableName) {
    partKeyList.value = []
    return
  }

  // 从数据源列表中查找数据源名称
  const sourceItem = sourceList.value.find(s => s.value == dataSourceId)
  if (!sourceItem) {
    partKeyList.value = []
    return
  }

  // 调用API获取字段列表
  http.request({
    method: 'get',
    url: `/api/v1/integration/sources/${encodeURIComponent(sourceItem.label)}/tables/${encodeURIComponent(tableName)}/schema`,
    params: {}
  }).then((res: any) => {
    if (res.code === 200 && res.data) {
      const columns = res.data.columns || res.data.fields || []
      partKeyList.value = columns.map((column: any) => {
        return {
          label: column.name,
          value: column.name
        }
      })
    } else {
      partKeyList.value = []
    }
  }).catch(err => {
    console.error('获取分区键字段失败:', err)
    partKeyList.value = []
    ElMessage.error('获取分区键字段失败')
  })
}

// 数据预览
function showTableDetail(): void {
    if (formData.sourceDBId && formData.sourceTable) {
        tableDetailRef.value.showModal({
            dataSourceId: formData.sourceDBId,
            tableName: formData.sourceTable
        })
    } else {
        ElMessage.warning('请选择数据源和表')
    }
}
// 目标表名输入变化
function targetTableInputChange() {
  if (formData.targetTable && formData.targetDBId) {
    changeStatus.value = true
    ElMessage.info('目标表会自动创建,请配置字段映射关系')
  }
}

// 生成建表作业
function createTableWork() {
    CreateTableWork({
        dataSourceId: formData.sourceDBId,
        tableName: formData.sourceTable
    }).then((res: any) => {
        ElMessage.success('操作成功')
    }).catch(err => {
        console.error(err)
    })
}

function tableChangeEvent(e: string, dataSourceId: string, type: string) {
  changeStatus.value = true

  if (type === 'source') {
    // 清空分区字段
    formData.partitionColumn = ''

    // 只有源表才需要获取字段结构
    const currentList = sourceList.value
    const sourceItem = currentList.find(s => s.value == dataSourceId)

    if (sourceItem) {
      dataSyncTableRef.value.getTableColumnData({
        dataSourceName: sourceItem.label,
        tableName: e
      }, type)
    } else {
      console.error('找不到数据源:', dataSourceId)
    }
  } else if (type === 'target') {
    // 目标表输入框变化,不需要获取字段
    // 目标表会自动创建,字段由连线映射生成
    console.log('目标表:', e)
    ElMessage.info('目标表会自动创建,字段将根据连线映射生成')
  }
}

// 级联控制
function dbTypeChange(type: string) {
    changeStatus.value = true
    if (type === 'source') {
        formData.sourceDBId = ''
        formData.sourceTable = ''
    } else {
        formData.targetDBId = ''
        formData.targetTable = ''
    }
}
// 级联控制
function dbIdChange(type: string) {
    changeStatus.value = true
    if (type === 'source') {
        formData.sourceTable = ''
    } else {
        formData.targetTable = ''
    }
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

// 配置打开
function setConfigData() {
    configDetailRef.value.showModal(props.workItemConfig)
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
function pageChangeEvent() {
    changeStatus.value = true
}

onMounted(() => {
  formData.workId = props.workItemConfig.id

  getDataType(true, 'source')
  getDataType(true, 'target')

  getDate()

  activeName.value = 'PublishLog'
  currentTab.value = markRaw(PublishLog)
})
</script>

<style lang="scss">
.data-sync-page {
    position: relative;
    padding-top: 50px;
    background-color: #ffffff;
    width: 100%;
    // border-left: 1px solid var(--el-border-color);

    .data-sync__option-container {
        height: 50px;
        display: flex;
        align-items: center;
        color: getCssVar('color', 'primary', 'light-5');
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        padding-left: 20px;
        z-index: 10;
        border-bottom: 1px solid getCssVar('border-color');

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
            }
        }
    }

    .data-sync {
        width: 100%;
        padding: 20px;
        box-sizing: border-box;
        overflow: auto;
        height: calc(100vh - 100px);
        position: relative;

        &.data-sync__log {
            padding-bottom: 70px;
        }

        .data-sync-top {
            display: flex;
            width: 100%;

            .vue-codemirror {
                height: 100px;
                width: 100%;

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

            .el-card {
                width: 100%;

                &+.el-card {
                    margin-left: 12px;
                }

                .el-card__header {
                    padding: 0;
                    border: 0;

                    .card-header {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 32px;
                        font-size: 14px;
                    }
                }

                .el-card__body {
                    .el-form {
                        .el-form-item {
                            position: relative;
                            .tooltip-msg {
                                position: absolute;
                                top: 7px;
                                color: getCssVar('color', 'info');
                                font-size: 16px;
                            }
                            .el-form-item__label {
                                position: relative;

                                &::before {
                                    position: absolute;
                                    left: -8px;
                                }
                            }

                            .el-form-item__content {
                                flex-wrap: nowrap;
                                justify-content: flex-end;
                            }
                        }
                    }
                }
            }
        }

        .select-link-type {
            height: 44px;
            display: flex;
            align-items: center;
            font-size: 12px;
            width: 100%;

            .el-select {
                margin-left: 20px;
            }
        }

    }
    .data-sync-log__collapse {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
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
            &.log-show-datasync {
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
</style>
