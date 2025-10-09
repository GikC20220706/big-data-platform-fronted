// 工作流状态映射
export const WorkflowStatusMapping = {
  // 您的后端状态 -> 前端期望状态
  'draft': 'UN_PUBLISHED',
  'active': 'PUBLISHED', 
  'paused': 'STOP',
  'error': 'FAIL',
  'disabled': 'DISABLE',
  'enabled': 'ENABLE',
  'running': 'RUNNING',
  'success': 'SUCCESS',
  'failed': 'FAIL'
}

// 执行状态映射
export const ExecutionStatusMapping = {
  'running': 'RUNNING',
  'success': 'SUCCESS',
  'failed': 'FAIL', 
  'cancelled': 'ABORT',
  'queued': 'PENDING',
  'up_for_retry': 'RUNNING',
  'upstream_failed': 'FAIL',
  'skipped': 'SUCCESS'
}

// 数据源状态映射
export const DataSourceStatusMapping = {
  'active': 'ACTIVE',
  'inactive': 'NO_ACTIVE',
  'error': 'CHECK_ERROR',
  'testing': 'CHECKING'
}

// API状态映射
export const ApiStatusMapping = {
  true: 'PUBLISHED',   // is_active: true
  false: 'UN_PUBLISHED' // is_active: false
}

// 触发类型映射
export const TriggerTypeMapping = {
  'manual': '手动触发',
  'scheduled': '定时触发', 
  'dependency': '依赖触发',
  'external': '外部触发'
}

// 统一状态映射函数
export function mapStatus(status: any, type: 'workflow' | 'execution' | 'datasource' | 'api'): string {
  const mappings = {
    workflow: WorkflowStatusMapping,
    execution: ExecutionStatusMapping, 
    datasource: DataSourceStatusMapping,
    api: ApiStatusMapping
  }
  
  const mapping = mappings[type]
  return mapping[status] || status
}