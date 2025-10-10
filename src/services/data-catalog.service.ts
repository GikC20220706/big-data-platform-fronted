/*
 * @Description: 数据资源目录服务
 * @Author: System
 * @Date: 2025-01-10
 */
import { http } from '@/utils/http'

interface SearchParams {
    page: number
    page_size: number
    keyword?: string
    catalog_type?: string
    parent_id?: number
    is_active?: boolean
}

interface CatalogData {
    catalog_name: string
    catalog_code: string
    catalog_type: string
    parent_id?: number
    level: number
    description?: string
    sort_order?: number
    icon?: string
    tags?: string[]
}

/**
 * 获取目录树
 */
export function GetCatalogTree(params?: { parent_id?: number; include_inactive?: boolean }): Promise<any> {
    return http.request({
        method: 'get',
        url: '/api/v1/data-catalog/tree',
        params: params || {}
    })
}

/**
 * 分页查询目录列表
 */
export function GetCatalogList(params: SearchParams): Promise<any> {
    return http.request({
        method: 'get',
        url: '/api/v1/data-catalog/list',
        params: params
    })
}

/**
 * 获取目录详情
 */
export function GetCatalogDetail(id: number): Promise<any> {
    return http.request({
        method: 'get',
        url: `/api/v1/data-catalog/${id}`
    })
}

/**
 * 获取目录路径
 */
export function GetCatalogPath(id: number): Promise<any> {
    return http.request({
        method: 'get',
        url: `/api/v1/data-catalog/${id}/path`
    })
}

/**
 * 创建目录
 */
export function CreateCatalog(data: CatalogData): Promise<any> {
    return http.request({
        method: 'post',
        url: '/api/v1/data-catalog/',
        params: data
    })
}

/**
 * 更新目录
 */
export function UpdateCatalog(id: number, data: Partial<CatalogData>): Promise<any> {
    return http.request({
        method: 'put',
        url: `/api/v1/data-catalog/${id}`,
        params: data
    })
}

/**
 * 删除目录
 */
export function DeleteCatalog(id: number, force: boolean = false): Promise<any> {
    return http.request({
        method: 'delete',
        url: `/api/v1/data-catalog/${id}`,
        params: { force }
    })
}

/**
 * 获取统计摘要
 */
export function GetCatalogStatistics(): Promise<any> {
    return http.request({
        method: 'get',
        url: '/api/v1/data-catalog/statistics/summary'
    })
}