import { http } from '@/utils/http'

interface SerchParams {
  page: number;
  pageSize: number;
  searchKeyWord: string;
  executeStatus: string
  workflowId?: string
}

interface LogParam {
  instanceId: string;
}

interface workflowInstanceId {
  workflowInstanceId: string
}

// 获取调度历史查询数据---作业实例
export function GetScheduleList(params: SerchParams): Promise<any> {
  return http.request({
    method: 'get',
    url: '/api/v1/job-instance/work/list',
    params: {
      page: params.page,
      pageSize: params.pageSize,
      status: params.executeStatus || undefined
    }
  })
}

// 获取调度历史查询数据---作业流实例
export function GetScheduleWorkFlowList(params: SerchParams): Promise<any> {
  return http.request({
    method: 'get',
    url: '/api/v1/job-instance/workflow/list',
    params: {
      workflowId: params.workflowId || undefined,
      page: params.page,
      pageSize: params.pageSize,
      status: params.executeStatus || undefined
    }
  })
}

// 获取调度历史查询数据---作业流实例详情
export function GetScheduleDetail(params: workflowInstanceId): Promise<any> {
  return http.request({
    method: 'get',
    url: `/api/v1/job-workflow/instance/${params.workflowInstanceId}`
  })
}

// 获取日志
export function GetLogData(params: LogParam): Promise<any> {
  return http.request({
    method: 'get',
    url: `/api/v1/job-work/instance/${params.instanceId}/log`,
    params: {
      log_type: 'all'
    }
  })
}

// 获取Yarn日志 (暂不支持)
export function GetYarnLogData(params: LogParam): Promise<any> {
  return http.request({
    method: 'get',
    url: `/api/v1/job-work/instance/${params.instanceId}/log`,
    params: {
      log_type: 'running'
    }
  })
}

// 重新运行 (暂不支持)
export function ReStartRunning(params: LogParam): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/job-work/run',
    data: {
      workId: params.instanceId
    }
  })
}

// 获取结果表
export function GetResultData(params: LogParam): Promise<any> {
  return http.request({
    method: 'get',
    url: `/api/v1/job-work/instance/${params.instanceId}`
  })
}

// 删除调度历史-作业 (暂不支持)
export function DeleteScheduleLog(params: LogParam): Promise<any> {
  return http.request({
    method: 'delete',
    url: `/api/v1/job-instance/work/${params.instanceId}`
  })
}

// 删除调度历史-作业流 (暂不支持)
export function DeleteWorkFlowScheduleLog(params: workflowInstanceId): Promise<any> {
  return http.request({
    method: 'delete',
    url: `/api/v1/job-instance/workflow/${params.workflowInstanceId}`
  })
}