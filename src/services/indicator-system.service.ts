/*
 * @Description: 指标体系建设服务
 */
import { http } from '@/utils/http'

/**
 * 获取指标列表
 */
export function GetIndicatorList(params: any): Promise<any> {
    return http.request({
        method: 'get',
        url: '/api/v1/indicator-system/',
        params: params
    })
}

/**
 * 获取指标详情
 */
export function GetIndicatorDetail(id: number): Promise<any> {
    return http.request({
        method: 'get',
        url: `/api/v1/indicator-system/${id}`
    })
}

/**
 * 创建指标
 */
export function CreateIndicator(params: any): Promise<any> {
    return http.request({
        method: 'post',
        url: '/api/v1/indicator-system/',
        params: params
    })
}

/**
 * 更新指标
 */
export function UpdateIndicator(id: number, params: any): Promise<any> {
    return http.request({
        method: 'put',
        url: `/api/v1/indicator-system/${id}`,
        params: params
    })
}

/**
 * 删除指标
 */
export function DeleteIndicator(id: number, force: boolean = false): Promise<any> {
    return http.request({
        method: 'delete',
        url: `/api/v1/indicator-system/${id}`,
        params: { force }
    })
}

/**
 * 关联数据资产
 */
export function LinkAssets(id: number, data: any): Promise<any> {
    return http.request({
        method: 'post',
        url: `/api/v1/indicator-system/${id}/link-assets`,
        params: data
    })
}

/**
 * 解除资产关联
 */
export function UnlinkAsset(indicatorId: number, assetId: number): Promise<any> {
    return http.request({
        method: 'delete',
        url: `/api/v1/indicator-system/${indicatorId}/unlink-asset/${assetId}`
    })
}

/**
 * 获取关联的资产
 */
export function GetLinkedAssets(id: number): Promise<any> {
    return http.request({
        method: 'get',
        url: `/api/v1/indicator-system/${id}/linked-assets`
    })
}

/**
 * 批量创建指标
 */
export function BatchCreateIndicators(data: any): Promise<any> {
    return http.request({
        method: 'post',
        url: '/api/v1/indicator-system/batch/create',
        params: data
    })
}

/**
 * 下载Excel模板
 */
export function DownloadTemplate(): Promise<any> {
    return http.request({
        method: 'get',
        url: '/api/v1/indicator-system/template/download',
        responseType: 'blob'
    })
}

/**
 * 从Excel导入指标
 */
export function ImportFromExcel(file: File, creator?: string): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)

    let url = '/api/v1/indicator-system/import/excel'
    if (creator) {
        url += `?creator=${encodeURIComponent(creator)}`
    }

    return http.request({
        method: 'post',
        url: url,
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        timeout: 300000  // 🆕 5分钟超时
    })
}

/**
 * 批量导出指标
 */
export function BatchExportIndicators(params: any): Promise<any> {
    return http.request({
        method: 'get',
        url: '/api/v1/indicator-system/export/excel',
        params: params,
        responseType: 'blob',
        timeout: 120000  // 2分钟超时
    })
}

/**
 * 获取统计信息
 */
export function GetStatistics(): Promise<any> {
    return http.request({
        method: 'get',
        url: '/api/v1/indicator-system/statistics/overview'
    })
}

/**
 * 获取所有业务领域
 */
export function GetBusinessDomains(): Promise<any> {
    return http.request({
        method: 'get',
        url: '/api/v1/indicator-system/options/business-domains'
    })
}

/**
 * 获取所有指标类别
 */
export function GetIndicatorCategories(): Promise<any> {
    return http.request({
        method: 'get',
        url: '/api/v1/indicator-system/options/indicator-categories'
    })
}