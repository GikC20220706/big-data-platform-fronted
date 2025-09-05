import { mapStatus } from './status-mapping'

// 分页数据转换
export function transformPaginationData(data: any) {
  if (data.items) {
    return {
      ...data,
      content: data.items,
      totalElements: data.total || 0,
      currentPage: data.page || 1,
      pageSize: data.page_size || 20,
      totalPages: Math.ceil((data.total || 0) / (data.page_size || 20))
    }
  }
  return data
}

// 工作流数据转换
export function transformWorkflowData(workflow: any) {
  return {
    ...workflow,
    id: workflow.id || workflow.workflow_id,
    name: workflow.workflow_name || workflow.name,
    displayName: workflow.display_name || workflow.workflow_name,
    status: mapStatus(workflow.status, 'workflow'),
    createDateTime: workflow.created_at,
    updateDateTime: workflow.updated_at,
    remark: workflow.description
  }
}

// 执行记录数据转换  
export function transformExecutionData(execution: any) {
  return {
    ...execution,
    workflowInstanceId: execution.execution_id,
    workflowName: execution.workflow_name || execution.workflow_id,
    status: mapStatus(execution.status, 'execution'),
    startDateTime: execution.start_time,
    endDateTime: execution.end_time,
    duration: calculateDuration(execution.start_time, execution.end_time),
    planStartDateTime: execution.scheduled_time,
    instanceType: mapStatus(execution.trigger_type, 'workflow'),
    workType: execution.task_type || 'WORKFLOW',
    lastModifiedBy: execution.trigger_user || 'system'
  }
}

// API数据转换
export function transformApiData(api: any) {
  return {
    ...api,
    status: mapStatus(api.is_active, 'api'),
    createDateTime: api.created_at,
    updateDateTime: api.updated_at,
    callCount: api.total_calls || 0,
    successRate: api.total_calls > 0 ? (api.success_calls / api.total_calls * 100).toFixed(1) + '%' : '0%'
  }
}

// 时长计算
export function calculateDuration(startTime: string, endTime?: string): number {
  if (!startTime) return 0
  const start = new Date(startTime).getTime()
  const end = endTime ? new Date(endTime).getTime() : Date.now()
  return Math.max(0, Math.floor((end - start) / 1000)) // 返回秒数
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化持续时间
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}秒`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分${seconds % 60}秒`
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours}小时${minutes}分${secs}秒`
}