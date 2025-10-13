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
export function ImportFromDataSource(data: any): Promise<any> {
    // 手动构建 URL 查询字符串
    const queryParams = new URLSearchParams()

    // 必填参数
    queryParams.append('data_source_name', data.data_source_id)
    queryParams.append('catalog_id', String(data.catalog_id))
    queryParams.append('include_columns', String(data.include_columns))

    // 可选参数
    if (data.database_name) {
        queryParams.append('database_name', data.database_name)
    }

    // 数组参数：每个元素单独添加
    if (data.table_patterns && data.table_patterns.length > 0) {
        data.table_patterns.forEach((pattern: string) => {
            queryParams.append('table_patterns', pattern)
        })
    }

    const url = `/api/v1/data-asset/import-from-datasource?${queryParams.toString()}`

    console.log('最终请求URL:', url)

    return http.request({
        method: 'post',
        url: url
        // 不要传 params 或 data
    })
}

/**
 * 获取数据源的表列表
 */
export function GetSourceTables(sourceName: string, database?: string): Promise<any> {
    return http.request({
        method: 'get',
        url: '/api/v1/integration/sources/${sourceName}/tables',
    params: {
        database: database || undefined,
            limit: 1000
    }
})
}