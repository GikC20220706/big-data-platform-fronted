<template>
  <BlockDrawer :drawer-config="drawerConfig">
    <el-scrollbar>
      <div class="work-flow-config">
        <!-- 调度配置 -->
        <div class="config-item">
          <div class="item-title">调度配置</div>
          <el-form
              ref="cronConfigForm"
              label-position="left"
              label-width="120px"
              :model="cronConfig"
              :rules="cronConfigRules"
          >
            <el-form-item label="启用">
              <el-switch v-model="cronConfig.enable" />
            </el-form-item>
            <template v-if="cronConfig.enable">
              <el-form-item label="类型" prop="type">
                <el-select v-model="cronConfig.type" placeholder="请选择">
                  <el-option
                      v-for="item in typeList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="模式">
                <el-radio-group v-model="cronConfig.setMode" size="small" @change="cronTypeChange">
                  <el-radio-button label="SIMPLE">简易</el-radio-button>
                  <el-radio-button label="ADVANCE">高级定义</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="生效时间" prop="workDate">
                <el-date-picker
                    v-model="cronConfig.workDate"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始生效日期"
                    end-placeholder="结束生效日期"
                    value-format="YYYY-MM-DD"
                />
              </el-form-item>

              <el-form-item label="cron表达式" prop="cron" v-if="cronConfig.setMode === 'ADVANCE'">
                <el-input
                    v-model="cronConfig.cron"
                    placeholder="请输入cron表达式，如: 0 0 2 * * ?"
                />
              </el-form-item>
              <template v-else>
                <el-form-item label="调度周期" prop="range">
                  <el-select v-model="cronConfig.range" placeholder="请选择" :disabled="!cronConfig.enable" @change="changeScheduleRangeEvent">
                    <el-option
                        v-for="item in scheduleRange"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                  </el-select>
                </el-form-item>

                <!-- 调度周期 -> 分钟 -->
                <template v-if="cronConfig.range === 'min'">
                  <el-form-item label="开始时间" prop="startDateMin">
                    <el-time-select
                        v-model="cronConfig.startDateMin"
                        :disabled="!cronConfig.enable"
                        start="00:00"
                        step="01:00"
                        end="23:00"
                        placeholder="请选择开始时间">
                    </el-time-select>
                  </el-form-item>
                  <el-form-item label="时间间隔(分钟)" prop="minNum">
                    <el-input-number :disabled="!cronConfig.enable" v-model="cronConfig.minNum" :min="1" :max="59" controls-position="right" />
                  </el-form-item>
                  <el-form-item label="结束时间" prop="endDateMin">
                    <el-time-select
                        v-model="cronConfig.endDateMin"
                        :disabled="!cronConfig.enable"
                        start="00:00"
                        step="01:00"
                        end="23:00"
                        placeholder="请选择结束时间">
                    </el-time-select>
                  </el-form-item>
                </template>

                <!-- 调度周期 -> 小时 -->
                <template v-if="cronConfig.range === 'hour'">
                  <el-form-item label="开始时间" prop="startDate">
                    <el-time-select
                        :disabled="!cronConfig.enable"
                        v-model="cronConfig.startDate"
                        start="00:00"
                        step="01:00"
                        end="23:00"
                        placeholder="请选择开始时间">
                    </el-time-select>
                  </el-form-item>
                  <el-form-item label="时间间隔(小时)" prop="hourNum">
                    <el-input-number :disabled="!cronConfig.enable" v-model="cronConfig.hourNum" :min="1" :max="23" controls-position="right" />
                  </el-form-item>
                  <el-form-item label="结束时间" prop="endDate">
                    <el-time-select
                        :disabled="!cronConfig.enable"
                        v-model="cronConfig.endDate"
                        start="00:00"
                        step="01:00"
                        end="23:00"
                        placeholder="请选择结束时间">
                    </el-time-select>
                  </el-form-item>
                </template>

                <!-- 调度周期 -> 日 -->
                <template v-if="cronConfig.range === 'day'">
                  <el-form-item label="调度时间" prop="scheduleDate">
                    <el-time-picker
                        :disabled="!cronConfig.enable"
                        v-model="cronConfig.scheduleDate"
                        format="HH:mm"
                        value-format="HH:mm"
                        placeholder="请选择每天执行时间"
                    />
                  </el-form-item>
                </template>

                <!-- 调度周期 -> 月 -->
                <template v-if="cronConfig.range === 'month'">
                  <el-form-item label="调度时间" prop="scheduleDate">
                    <el-time-picker
                        :disabled="!cronConfig.enable"
                        v-model="cronConfig.scheduleDate"
                        format="HH:mm"
                        value-format="HH:mm"
                        placeholder="请选择执行时间"
                    />
                  </el-form-item>
                  <el-form-item label="指定时间" prop="monthDay">
                    <el-select v-model="cronConfig.monthDay" placeholder="请选择每月哪一天" :disabled="!cronConfig.enable">
                      <el-option
                          v-for="item in dayList"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                </template>

                <!-- 调度周期 -> 星期 -->
                <template v-if="cronConfig.range === 'week'">
                  <el-form-item label="调度时间" prop="scheduleDate">
                    <el-time-picker
                        :disabled="!cronConfig.enable"
                        v-model="cronConfig.scheduleDate"
                        format="HH:mm"
                        value-format="HH:mm"
                        placeholder="请选择执行时间"
                    />
                  </el-form-item>
                  <el-form-item label="指定时间" prop="weekDate">
                    <el-select v-model="cronConfig.weekDate" placeholder="请选择星期几" :disabled="!cronConfig.enable">
                      <el-option
                          v-for="item in weekDateList"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                </template>
              </template>
            </template>
          </el-form>
        </div>

        <!-- 基线告警 -->
        <div class="config-item">
          <div class="item-title">基线告警</div>
          <el-form
              label-position="left"
              label-width="120px"
              :model="messageConfig"
          >
            <el-form-item label="告警">
              <el-select
                  v-model="messageConfig.alarmList"
                  clearable
                  multiple
                  collapse-tags
                  collapse-tags-tooltip
                  filterable
                  placeholder="请选择告警配置">
                <el-option
                    v-for="item in alarmConfigList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>

        <!-- 外部调用 -->
        <div class="config-item">
          <div class="item-title">外部调用</div>
          <el-form
              label-position="left"
              label-width="120px"
              :model="otherConfig"
          >
            <el-form-item label="启用">
              <el-switch v-model="otherConfig.invokeStatus" @change="getInvokeUrl" />
            </el-form-item>
            <el-form-item v-if="otherConfig.invokeUrl" label="调用链接" class="invoke-url-copy">
              <el-input v-model="otherConfig.invokeUrl" :disabled="true" />
              <span
                  class="invoke-url-copy__text"
                  @click="copyUrlEvent(otherConfig.invokeUrl)"
              >复制</span>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-scrollbar>
  </BlockDrawer>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import BlockDrawer from '@/components/block-drawer/index.vue'
import { ScheduleRange, WeekDateList, CronConfigRules } from './config-detail'
import { GetAlarmPagesList } from '@/services/message-center.service'
import { GetInvokeUrl, SaveWorkflowConfigData } from '@/services/workflow.service'

const scheduleRange = ref(ScheduleRange)
const weekDateList = ref(WeekDateList)
const dayList = ref<any[]>([])
const cronConfigForm = ref<FormInstance>()
const callback = ref<any>()

const typeList = ref([
  {
    label: '单一调度',
    value: 'ALL'
  },
  {
    label: '离散调度',
    value: 'SINGLE'
  }
])

const alarmConfigList = ref<any[]>([])
const workflowId = ref('')
const cronConfigRules = reactive<FormRules>(CronConfigRules)

const drawerConfig = reactive({
  title: '配置',
  visible: false,
  width: '400',
  okConfig: {
    title: '确定',
    ok: okEvent,
    disabled: false,
    loading: false,
  },
  cancelConfig: {
    title: '取消',
    cancel: closeEvent,
    disabled: false,
  },
  zIndex: 1100,
  closeOnClickModal: false,
})

// 定时配置
let cronConfig = reactive({
  setMode: 'SIMPLE',       // 模式
  type: 'ALL',             // 类型
  enable: false,           // 启用
  cron: '',                // cron表达式
  workDate: '',            // 生效时间
  range: '',               // 调度周期
  startDateMin: '',        // 开始时间 - 分钟
  minNum: undefined,       // 间隔时间 - 分钟
  endDateMin: '',          // 结束时间 - 分钟
  startDate: '',           // 开始时间 - 小时
  hourNum: undefined,      // 间隔时间 - 小时
  endDate: '',             // 结束时间 - 小时
  scheduleDate: '',        // 调度时间 - 日/周/月
  weekDate: '',            // 指定时间 - 星期
  monthDay: '',            // 指定时间 - 月
})

// 基线告警
let messageConfig = reactive({
  alarmList: []
})

// 外部调用
let otherConfig = reactive({
  invokeStatus: false,
  invokeUrl: ''
})

const state = reactive({
  secondsText: '',
  minutesText: '',
  hoursText: '',
  daysText: '',
  weeksText: '',
  monthsText: '',
  yearsText: ''
})

const cron = computed(() => {
  return `${state.secondsText || '*'} ${state.minutesText || '*'} ${state.hoursText || '*'} ${
      state.daysText || '*'
  } ${state.monthsText || '*'} ${state.weeksText || '?'} ${state.yearsText || '*'}`
})

function showModal(cb: () => void, data: any) {
  callback.value = cb

  // 调度日期初始化(1-31号)
  dayList.value = []
  for (let i = 1; i <= 31; i++) {
    dayList.value.push({
      label: `${i}号`,
      value: `${i}`
    })
  }

  // 初始化配置
  if (!data) {
    // 新建时的默认值
    cronConfig.setMode = 'SIMPLE'
    cronConfig.type = 'ALL'
    cronConfig.enable = false
    cronConfig.cron = ''
    cronConfig.workDate = ''
    cronConfig.range = ''
    messageConfig.alarmList = []
    otherConfig.invokeStatus = false
    otherConfig.invokeUrl = ''
  } else {
    // 编辑时加载已有配置
    workflowId.value = data.workflowId

    if (data.cronConfig) {
      Object.keys(cronConfig).forEach((key: string) => {
        if (data.cronConfig[key] !== undefined) {
          cronConfig[key] = data.cronConfig[key]
        }
      })
    }

    if (data.alarmList) {
      messageConfig.alarmList = data.alarmList
    }

    if (data.invokeStatus !== undefined) {
      otherConfig.invokeStatus = data.invokeStatus === 'ON' || data.invokeStatus === true
    }

    if (data.invokeUrl) {
      otherConfig.invokeUrl = data.invokeUrl
    }
  }

  // 加载告警配置列表
  getAlarmConfigList()

  drawerConfig.visible = true
}

function getAlarmConfigList() {
  GetAlarmPagesList({
    page: 0,
    pageSize: 10000,
    searchKeyWord: ''
  }).then((res: any) => {
    alarmConfigList.value = res.data.content.filter((item: any) => item.alarmType === 'WORKFLOW')
  }).catch(() => {
    alarmConfigList.value = []
  })
}

function getInvokeUrl(val: boolean) {
  if (val && workflowId.value) {
    GetInvokeUrl({
      workflowId: workflowId.value
    }).then((res: any) => {
      otherConfig.invokeUrl = res.data || ''
    }).catch(() => {
      otherConfig.invokeUrl = ''
    })
  } else {
    otherConfig.invokeUrl = ''
  }
}

function copyUrlEvent(url: string) {
  if (!url) {
    ElMessage.warning('暂无调用链接')
    return
  }

  navigator.clipboard.writeText(url).then(() => {
    ElMessage.success('复制成功')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

function okEvent() {
  if (!cronConfig.enable) {
    // 如果未启用调度，直接保存
    saveConfiguration()
    return
  }

  // 启用了调度，需要验证表单
  cronConfigForm.value?.validate((valid: boolean) => {
    if (valid) {
      saveConfiguration()
    } else {
      ElMessage.warning('请完善调度配置信息')
    }
  })
}

function saveConfiguration() {
  drawerConfig.okConfig.loading = true

  // 生成cron表达式
  getCron()
  const generatedCron = `${state.secondsText || '*'} ${state.minutesText || '*'} ${state.hoursText || '*'} ${
      state.daysText || '*'
  } ${state.monthsText || '*'} ${state.weeksText || '?'} ${state.yearsText || '*'}`

  // 准备保存数据
  const saveData = {
    cronConfig: cronConfig.enable ? {
      enable: true,
      type: cronConfig.type,
      setMode: cronConfig.setMode,
      workDate: cronConfig.workDate,
      cron: cronConfig.setMode === 'SIMPLE' ? generatedCron : cronConfig.cron,
      range: cronConfig.setMode === 'SIMPLE' ? cronConfig.range : undefined,
      // 简易模式的详细参数
      startDateMin: cronConfig.startDateMin,
      minNum: cronConfig.minNum,
      endDateMin: cronConfig.endDateMin,
      startDate: cronConfig.startDate,
      hourNum: cronConfig.hourNum,
      endDate: cronConfig.endDate,
      scheduleDate: cronConfig.scheduleDate,
      weekDate: cronConfig.weekDate,
      monthDay: cronConfig.monthDay
    } : { enable: false },
    alarmList: messageConfig.alarmList || [],
    otherConfig: {
      invokeStatus: otherConfig.invokeStatus ? 'ON' : 'OFF',
      invokeUrl: otherConfig.invokeUrl || ''
    }
  }

  // 调用回调函数保存
  if (callback.value) {
    callback.value(saveData).then(() => {
      drawerConfig.okConfig.loading = false
      drawerConfig.visible = false
      ElMessage.success('保存成功')
    }).catch((err: any) => {
      console.error('保存失败:', err)
      drawerConfig.okConfig.loading = false
      ElMessage.error(err.message || '保存失败')
    })
  }
}

function getCron() {
  // 根据调度周期生成cron表达式各部分
  if (cronConfig.range === 'min') {
    // 调度周期为分钟: 0 */N HH-HH * * ?
    state.secondsText = '0'
    state.minutesText = `0/${cronConfig.minNum}`
    state.hoursText = `${cronConfig.startDateMin.split(':')[0]}-${cronConfig.endDateMin.split(':')[0]}`
    state.daysText = '*'
    state.monthsText = '*'
    state.weeksText = '?'
  } else if (cronConfig.range === 'hour') {
    // 调度周期为小时: 0 0 HH-HH/N * * ?
    state.secondsText = '0'
    state.minutesText = '0'
    state.hoursText = `${cronConfig.startDate.split(':')[0]}-${cronConfig.endDate.split(':')[0]}/${cronConfig.hourNum}`
    state.daysText = '*'
    state.monthsText = '*'
    state.weeksText = '?'
  } else if (cronConfig.range === 'day') {
    // 调度周期为日: 0 MM HH * * ?
    state.secondsText = '0'
    state.minutesText = `${cronConfig.scheduleDate.split(':')[1]}`
    state.hoursText = `${cronConfig.scheduleDate.split(':')[0]}`
    state.daysText = '*'
    state.monthsText = '*'
    state.weeksText = '?'
  } else if (cronConfig.range === 'month') {
    // 调度周期为月: 0 MM HH DD * ?
    state.secondsText = '0'
    state.minutesText = `${cronConfig.scheduleDate.split(':')[1]}`
    state.hoursText = `${cronConfig.scheduleDate.split(':')[0]}`
    state.daysText = `${cronConfig.monthDay}`
    state.monthsText = '*'
    state.weeksText = '?'
  } else if (cronConfig.range === 'week') {
    // 调度周期为星期: 0 MM HH ? * WW
    state.secondsText = '0'
    state.minutesText = `${cronConfig.scheduleDate.split(':')[1]}`
    state.hoursText = `${cronConfig.scheduleDate.split(':')[0]}`
    state.daysText = '?'
    state.monthsText = '*'
    state.weeksText = `${cronConfig.weekDate}`
  }
}

function changeScheduleRangeEvent() {
  // 切换调度周期时清空相关字段
  cronConfig.startDateMin = ''
  cronConfig.minNum = undefined
  cronConfig.endDateMin = ''
  cronConfig.startDate = ''
  cronConfig.hourNum = undefined
  cronConfig.endDate = ''
  cronConfig.scheduleDate = ''
  cronConfig.weekDate = ''
  cronConfig.monthDay = ''
}

function cronTypeChange(val: string) {
  // 切换模式时清空cron表达式
  if (val === 'ADVANCE') {
    cronConfig.cron = ''
  }
}

function closeEvent() {
  drawerConfig.visible = false
}

defineExpose({
  showModal
})
</script>

<style lang="scss" scoped>
.work-flow-config {
  padding: 20px;

  .config-item {
    margin-bottom: 30px;

    .item-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #303133;
      border-left: 4px solid #409eff;
      padding-left: 10px;
    }
  }

  .invoke-url-copy {
    :deep(.el-form-item__content) {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    &__text {
      cursor: pointer;
      color: #409eff;
      white-space: nowrap;

      &:hover {
        color: #66b1ff;
      }
    }
  }
}
</style>