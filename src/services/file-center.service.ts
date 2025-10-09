/*
 * @Description: 资源中心服务
 * @Author: System
 * @Date: 2024-01-01
 */
import { http } from '@/utils/http'

interface SearchParams {
  page: number
  page_size: number
  keyword?: string
  type?: string
}

interface UploadParams {
  file: File
  type: string
  remark?: string
}

/**
 * 获取资源文件列表
 * @param params 查询参数
 */
export function GetFileCenterList(params: SearchParams): Promise<any> {
  return http.request({
    method: 'get',
    url: '/api/v1/resources',
    params: {
      page: params.page + 1, // 后端页码从1开始，前端从0开始，需要+1
      page_size: params.page_size || 10,
      keyword: params.keyword || undefined,
      type: params.type || undefined
    }
  })
}

/**
 * 上传资源文件
 * @param params 上传参数（FormData）
 */
export function UploadFileData(formData: FormData): Promise<any> {
  return http.uploadFile({
    method: 'post',
    url: '/api/v1/resources/upload',
    params: formData
  })
}

/**
 * 下载资源文件
 * @param params 下载参数
 */
export function DownloadFileData(params: { id: number }): Promise<any> {
  return http.request({
    method: 'get',
    url: `/api/v1/resources/${params.id}/download`,
    responseType: 'blob'
  })
}

/**
 * 删除资源文件
 * @param params 删除参数
 */
export function DeleteFileData(params: { id: number; force?: boolean }): Promise<any> {
  return http.request({
    method: 'delete',
    url: `/api/v1/resources/${params.id}`,
    params: {
      force: params.force || false
    }
  })
}

/**
 * 更新资源备注
 * @param params 更新参数
 */
export function UpdateFileData(params: { id: number; remark: string }): Promise<any> {
  return http.request({
    method: 'put',
    url: `/api/v1/resources/${params.id}/remark`,
    params: {
      remark: params.remark
    }
  })
}

/**
 * 获取资源详情
 * @param params 查询参数
 */
export function GetFileDetail(params: { id: number }): Promise<any> {
  return http.request({
    method: 'get',
    url: `/api/v1/resources/${params.id}`
  })
}

/**
 * 获取资源引用情况
 * @param params 查询参数
 */
export function GetFileReferences(params: { id: number }): Promise<any> {
  return http.request({
    method: 'get',
    url: `/api/v1/resources/${params.id}/references`
  })
}

/**
 * 获取资源类型配置信息
 */
export function GetResourceTypesInfo(): Promise<any> {
  return http.request({
    method: 'get',
    url: '/api/v1/resources/types/info'
  })
}