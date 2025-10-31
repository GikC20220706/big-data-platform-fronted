/*
 * @Author: fanciNate
 * @Date: 2023-04-26 17:01:16
 * @LastEditTime: 2023-05-03 21:36:23
 * @LastEditors: fanciNate
 * @Description: In User Settings Edit
 * @FilePath: /zqy-web/src/services/computer-group.service.ts
 */
import { http } from '@/utils/http'

interface SearchParams {
  page?: number;
  page_size?: number;
  include_table_count?: boolean;
  table_count_limit?: number;
  fast_mode?: boolean;
}

export function GetDatasourceList(params: SearchParams = {}): Promise<any> {
  return http.request({
    method: 'get',
    url: '/api/v1/integration/sources',
    params: {
      page: 1,
      page_size: 100,
      include_table_count: false,
      fast_mode: true,
      ...params
    }
  })
}

// 添加
export function AddDatasourceData(params: any): Promise<any> {
  return http.request({
    method: 'post',
    url: '/api/v1/integration/sources',
    data: params
  })
}

// 更新
export function UpdateDatasourceData(sourceName: string, params: any): Promise<any> {
  return http.request({
    method: 'put',
    url: `/api/v1/integration/sources/${sourceName}`,
    data: params
  })
}

// 检测
export function CheckDatasourceData(sourceName: string): Promise<any> {
  return http.request({
    method: 'get',
    url: `/api/v1/integration/sources/${sourceName}/health`
  })
}

// 测试数据源链接
export function TestDatasourceData(sourceName: string): Promise<any> {
  return http.request({
    method: 'post',
    url: `/api/v1/integration/sources/${sourceName}/test`
  })
}

// 删除
export function DeleteDatasourceData(sourceName: string): Promise<any> {
  return http.request({
    method: 'delete',
    url: `/api/v1/integration/sources/${sourceName}`
  })
}

// // 获取数据源驱动
// export function GetDriverListData(params: any): Promise<any> {
//   return http.request({
//     method: 'post',
//     url: '/datasource/pageDatabaseDriver',
//     params: params
//   })
// }
// // 获取默认驱动
// export function GetDefaultDriverData(params: any): Promise<any> {
//   return http.request({
//     method: 'post',
//     url: '/datasource/getDefaultDatabaseDriver',
//     params: params
//   })
// }


