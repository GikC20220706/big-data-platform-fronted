/*
 * @Description: 数据资产服务
 */
import { http } from '@/utils/http'

/**
 * 获取资产列表
 */
export function GetAssetList(params: any): Promise<any> {
    return http.request({
        method: 'get',
        url: '/api/v1/data-asset/',
        params: params
    })
}

/**
 * 获取资产详情
 */
export function GetAssetDetail(id: number): Promise<any> {
    return http.request({
        method: 'get',
        url: `/api/v1/data-asset/${id}`
    })
}

/**
 * 创建资产
 */
export function CreateAsset(params: any): Promise<any> {
    return http.request({
        method: 'post',
        url: '/api/v1/data-asset/',
        params: params
    })
}

/**
 * 更新资产
 */
export function UpdateAsset(id: number, params: any): Promise<any> {
    return http.request({
        method: 'put',
        url: `/api/v1/data-asset/${id}`,
        params: params
    })
}

/**
 * 删除资产
 */
export function DeleteAsset(id: number, force: boolean = false): Promise<any> {
    return http.request({
        method: 'delete',
        url: `/api/v1/data-asset/${id}`,
        params: { force }
    })
}

/**
 * 获取资产字段
 */
export function GetAssetColumns(id: number): Promise<any> {
    return http.request({
        method: 'get',
        url: `/api/v1/data-asset/${id}/columns`
    })
}

/**
 * 刷新字段信息
 */
export function RefreshAssetColumns(id: number): Promise<any> {
    return http.request({
        method: 'post',
        url: `/api/v1/data-asset/${id}/columns/refresh`
    })
}

/**
 * 预览数据
 */
export function PreviewAssetData(id: number, params: any): Promise<any> {
    return http.request({
        method: 'post',
        url: `/api/v1/data-asset/${id}/preview`,
        params: params
    })
}

/**
 * 从数据源导入表
 */
export function ImportFromDataSource(params: any): Promise<any> {
    return http.request({
        method: 'post',
        url: '/api/v1/data-asset/import-from-datasource',
        params: params
    })
}

/**
 * 获取数据源的表列表
 */
export function GetSourceTables(sourceName: string, database?: string): Promise<any> {
    return http.request({
        method: 'get',
        url: `/api/v1/integration/sources/${sourceName}/tables`,
        params: {
            database: database || undefined,
            limit: 1000
        }
    })
}