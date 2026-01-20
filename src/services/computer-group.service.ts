/*
 * @Author: fanciNate
 * @Date: 2023-04-26 17:01:16
 * @LastEditTime: 2023-06-18 13:07:27
 * @LastEditors: fanciNate
 * @Description: In User Settings Edit
 * @FilePath: /spark-yun/spark-yun-website/src/services/computer-group.service.ts
 */
import { http } from '@/utils/http'
interface SerchParams {
  page: number;
  pageSize: number;
  searchKeyWord: string;
}

interface AddParams {
  remark: string;
  name: string;
  id?: string;
}

interface Cluster {
  clusterId: string
}

export function GetComputerGroupList(params: SerchParams): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/user-cluster/pageCluster',
    data: params
  })
}

// 添加集群
export function AddComputerGroupData(params: AddParams): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/user-cluster/addCluster',
    data: params
  })
}

// 更新集群
export function UpdateComputerGroupData(params: AddParams): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/user-cluster/updateCluster',
    data: params
  })
}

// 设置默认集群
export function SetDefaultComputerGroup(params: Cluster): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/user-cluster/setDefaultCluster',
    data: params
  })
}

// 检测
export function CheckComputerGroupData(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/user-cluster/checkCluster',
    data: params
  })
}

// 删除
export function DeleteComputerGroupData(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/user-cluster/deleteCluster',
    data: params
  })
}

// 节点页面查询数据
export function GetComputerPointData(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/user-cluster-node/pageClusterNode',
    data: params
  })
}

// 检测节点页面查询数据
export function CheckComputerPointData(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/user-cluster-node/checkAgent',
    data: params
  })
}

// 设置默认集群节点
export function SetDefaultComputerPointNode(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/user-cluster-node/setDefaultClusterNode',
    data: params
  })
}

// 编辑节点页面查询数据
export function UpdateComputerPointData(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/user-cluster/updateClusterNode',
    data: params
  })
}

// 添加节点数据
export function AddComputerPointData(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/user-cluster-node/addClusterNode',  // ✅ 改这里
    data: params
  })
}

// 编辑节点数据
export function EditComputerPointData(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/user-cluster-node/updateClusterNode',  // ✅ 改这里
    data: params
  })
}

// 删除节点数据
export function DeleteComputerPointData(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/user-cluster-node/deleteClusterNode',  // ✅ 改这里
    data: params
  })
}

// 安装节点数据
export function InstallComputerPointData(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/user-cluster-node/installAgent',  // ✅ 改这里
    data: params
  })
}

// 卸载节点数据
export function UninstallComputerPointData(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/user-cluster-node/removeAgent',  // ✅ 改这里
    data: params
  })
}

// 清理节点数据
export function CleanComputerPointData(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/user-cluster-node/cleanAgent',  // ✅ 改这里
    data: params
  })
}

// 停止节点数据
export function StopComputerPointData(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/user-cluster-node/stopAgent',  // ✅ 改这里
    data: params
  })
}

// 激活节点数据
export function StartComputerPointData(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/user-cluster-node/startAgent',  // ✅ 改这里
    data: params
  })
}

// 获取节点数据
export function GetComputerPointDetailData(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/user-cluster-node/getClusterNode',  // ✅ 改这里
    data: params
  })
}

// 链接测试接口
export function TestComputerPointHostData(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/user-cluster-node/testAgent',  // ✅ 改这里
    data: params
  })
}
