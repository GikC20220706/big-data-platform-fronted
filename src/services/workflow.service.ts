/*
 * @Author: fanciNate
 * @Date: 2023-04-26 17:01:16
 * @LastEditTime: 2023-06-18 14:56:21
 * @LastEditors: fanciNate
 * @Description: In User Settings Edit
 * @FilePath: /spark-yun/spark-yun-website/src/services/workflow.service.ts
 */
import { http } from '@/utils/http'
interface SerchParams {
  page: number;
  pageSize: number;
  searchKeyWord: string;
}

export function GetWorkflowList(params: SerchParams): Promise<any> {
  return http.request({
    method: 'get',
    url: '/api/v1/job-workflow/page',
    params: {
      page: params.page,
      pageSize: params.pageSize,
      searchKeyWord: params.searchKeyWord
    }
  })
}

// 添加
export function AddWorkflowData(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/job-workflow/add',
    data: {
      name: params.name,
      remark: params.remark
    }
  })
}

// 更新
export function UpdateWorkflowData(params: any): Promise<any> {
  return http.request({
    method: 'put',
    url: '/api/v1/job-workflow/update',
    data: {
      workflow_id: params.id,
      name: params.name,
      remark: params.remark
    }
  })
}

// 发布
// export function PublishWorkflowData(params: any): Promise<any> {
//     return http.request({
//         method: 'post',
//         url: '/workflow/testConnect',
//         params: params
//     })
// }

// 删除
export function DeleteWorkflowData(params: any): Promise<any> {
  return http.request({
    method: 'delete',
    url: `/api/v1/job-workflow/delete/${params.id}`
  })
}

// 作业-查询
export function GetWorkflowDetailList(params: any): Promise<any> {
  return http.request({
    method: 'get',
    url: '/api/v1/job-work/page',
    params: {
      workflowId: params.workflowId,
      page: params.page || 0,
      pageSize: params.pageSize || 10,
      searchKeyWord: params.searchKeyWord || undefined
    }
  })
}

// 作业-添加
export function AddWorkflowDetailList(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/job-work/add',
    data: {
      workflowId: params.workflowId,
      name: params.name,
      workType: params.workType,
      remark: params.remark,
      datasourceId: params.datasourceId,
      clusterId: params.clusterId,
      clusterNodeId: params.clusterNodeId,
      containerId: params.containerId
    }
  })
}

// 作业-更新
export function UpdateWorkflowDetailList(params: any): Promise<any> {
  return http.request({
    method: 'put',
    url: '/api/v1/job-work/update',
    data: {
      workId: params.workId || params.id,  // 兼容两种传参方式
      name: params.name,
      remark: params.remark
    }
  })
}

// 作业-复制
export function CopyWorkflowDetailList(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/job-work/copy',
    data: {
      sourceWorkId: params.workId,
      targetWorkflowId: params.workflowId,
      newWorkName: params.name
    }
  })
}

// 作业-删除
export function DeleteWorkflowDetailList(params: any): Promise<any> {
  return http.request({
    method: 'delete',
    url: `/api/v1/job-work/delete/${params.workId}`
  })
}

// 作业-发布
export function PublishWorkData(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: `/api/v1/job-work/publish/${params.workId}`
  })
}

// 作业-下线
export function DeleteWorkData(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: `/api/v1/job-work/offline/${params.workId}`
  })
}

// 作业-详情-获取数据
export function GetWorkItemConfig(params: any): Promise<any> {
  return http.request({
    method: 'get',
    url: `/api/v1/job-work/detail/${params.workId}`
  })
}

// 作业-详情-运行
export function RunWorkItemConfig(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/job-work/run',
    data: {
      workId: params.workId,
      context: params.context || {}
    }
  })
}

// 作业-详情-终止
export function TerWorkItemConfig(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/job-work/stop',
    data: {
      workInstanceId: params.workInstanceId
    }
  })
}

// 作业-详情-保存配置
export function SaveWorkItemConfig(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/job-work/saveConfig',
    data: {
      workId: params.workId,
      config: params.config
    }
  })
}

// 作业-详情-提交日志
export function GetSubmitLogData(params: any): Promise<any> {
  return http.request({
    method: 'get',
    url: `/api/v1/job-work/instance/${params.instanceId}/log`,
    params: {
      log_type: params.logType || 'all'  // all, submit, running
    }
  })
}

// 作业-详情-监控信息
export function GetResultItemDetail(params: any): Promise<any> {
  return http.request({
    method: 'get',
    url: `/api/v1/job-work/instance/${params.instanceId}`
  })
}

// 工作流------------流程图接口
// 保存工作流--流程图
export function SaveWorkflowData(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/job-workflow/saveConfig',
    data: {
      workflowId: params.workflowId,
      webConfig: params.webConfig
    }
  })
}

// 获取配置的工作流程图信息--流程图
export function GetWorkflowData(params: any): Promise<any> {
  return http.request({
    method: 'get',
    url: `/api/v1/job-workflow/getConfig/${params.workflowId}`
  })
}

// 运行工作流--流程图
export function RunWorkflowData(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/job-workflow/run',
    data: {
      workflowId: params.workflowId,
      context: params.context || {}
    }
  })
}

// 中止正在运行的工作流--流程图
export function StopWorkflowData(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/job-workflow/abort',
    data: {
      workflowInstanceId: params.workflowInstanceId
    }
  })
}

// 查询作业流实例接口--流程图
export function QueryRunWorkInstances(params: any): Promise<any> {
  return http.request({
    method: 'get',
    url: `/api/v1/job-workflow/instance/${params.workflowInstanceId}`
  })
}

// 导出作业--流程图
export function ExportWorkflowData(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: '/workflow/exportWorks',
    params: params
  })
}
// 作业流配置保存
export function SaveWorkflowConfigData(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/job-workflow/saveSetting',
    data: {
      workflowId: params.workflowId,
      cronConfig: params.cronConfig,
      alarmList: params.alarmList,
      otherConfig: params.otherConfig
    }
  })
}
// 导入作业--流程图
export function ImportWorkflowData(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: '/workflow/importWorks',
    params: params
  })
}

// 发布作业流--流程图
export function PublishWorkflowData(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: `/api/v1/job-workflow/publish/${params.workflowId}`
  })
}
// 下线作业流--流程图
export function UnderlineWorkflowData(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: `/api/v1/job-workflow/offline/${params.workflowId}`
  })
}

// 发布作业流--流程图--重跑下游节点
export function RunAfterFlowData(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: `/api/v1/job-workflow/instance/${params.workflowInstanceId}/run-after-node`,  // ✅ 修改URL
    data: {
      work_id: params.workId  // 传递要开始执行的节点ID
    }
  })
}
// 发布作业流--流程图--中断
export function BreakFlowData(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: `/api/v1/job-workflow/instance/${params.workflowInstanceId}/abort`,  // ✅ 修改URL
    data: {
      reason: params.reason || '用户手动中断'
    }
  })
}
// 发布作业流--流程图--重跑当前节点
export function RerunCurrentNodeFlowData(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: `/api/v1/job-workflow/instance/${params.workflowInstanceId}/rerun-current-node`,  // ✅ 修改URL
    data: {
      work_instance_id: params.workInstanceId  // 传递作业实例ID
    }
  })
}

// 作业流--流程图--重跑工作流
export function ReRunWorkflow(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: `/api/v1/job-workflow/instance/${params.workflowInstanceId}/rerun`
  })
}

// 外部调用获取链接
export function GetInvokeUrl(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: '/workflow/getInvokeUrl',
    params: params
  })
}

// 获取作业返回的jsonPath接口
export function GetWorkInstanceJsonPath(params: any): Promise<any> {
  return http.request({
    method: 'get',
    url: `/api/v1/job-work/instance/${params.workInstanceId}/jsonpath`
  })
}

// 获取作业返回的几行几列结果接口
export function GetWorkInstanceTablePath(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: `/api/v1/job-work/instance/${params.workInstanceId}/tablepath`,
    data: {
      tableRow: params.tableRow,
      tableCol: params.tableCol
    }
  })
}

// 获取作业返回的正则解析结果接口
export function GetWorkInstanceRegexPath(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: `/api/v1/job-work/instance/${params.workInstanceId}/regexpath`,
    data: {
      regexStr: params.regexStr
    }
  })
}
