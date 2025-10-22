/**
 * API用户和密钥管理服务
 */

import { http } from '@/utils/http'

// ==================== API用户管理 ====================

/**
 * 创建API用户
 */
export function CreateAPIUser(data: {
    username: string
    display_name: string
    description?: string
    user_type: 'system' | 'application' | 'developer'
}): Promise<any> {
    return http.request({
        method: 'post',
        url: '/api/v1/api-users/',
        data: data
    })
}

/**
 * 获取API用户列表
 */
export function GetAPIUserList(params: {
    skip?: number
    limit?: number
    search?: string
    user_type?: string
    is_active?: boolean
}): Promise<any> {
    return http.request({
        method: 'get',
        url: '/api/v1/api-users/',
        params: params
    })
}

/**
 * 获取API用户详情
 */
export function GetAPIUserDetail(userId: number): Promise<any> {
    return http.request({
        method: 'get',
        url: `/api/v1/api-users/${userId}`
    })
}

/**
 * 更新API用户
 */
export function UpdateAPIUser(userId: number, data: {
    display_name?: string
    description?: string
    user_type?: string
    is_active?: boolean
}): Promise<any> {
    return http.request({
        method: 'put',
        url: `/api/v1/api-users/${userId}`,
        data: data
    })
}

/**
 * 删除API用户
 */
export function DeleteAPIUser(userId: number): Promise<any> {
    return http.request({
        method: 'delete',
        url: `/api/v1/api-users/${userId}`
    })
}

// ==================== API密钥管理 ====================

/**
 * 创建API密钥
 */
export function CreateAPIKey(data: {
    user_id: number
    key_name: string
    expires_days?: number
    rate_limit?: number
    allowed_ips?: string
}): Promise<any> {
    return http.request({
        method: 'post',
        url: '/api/v1/api-users/keys',
        data: data
    })
}

/**
 * 获取用户的所有密钥
 */
export function GetUserAPIKeys(userId: number, includeInactive: boolean = false): Promise<any> {
    return http.request({
        method: 'get',
        url: `/api/v1/api-users/keys/user/${userId}`,
        params: { include_inactive: includeInactive }
    })
}

/**
 * 删除API密钥
 */
export function DeleteAPIKey(keyId: number): Promise<any> {
    return http.request({
        method: 'delete',
        url: `/api/v1/api-users/keys/${keyId}`
    })
}

/**
 * 切换密钥状态
 */
export function ToggleAPIKeyStatus(keyId: number): Promise<any> {
    return http.request({
        method: 'post',
        url: `/api/v1/api-users/keys/${keyId}/toggle`
    })
}

// ==================== 权限管理 ====================

/**
 * 授权API访问权限
 */
export function GrantAPIPermissions(data: {
    api_id: number
    user_ids: number[]
    granted_by?: string
}): Promise<any> {
    return http.request({
        method: 'post',
        url: '/api/v1/api-users/permissions/grant',
        data: data
    })
}

/**
 * 撤销API访问权限
 */
export function RevokeAPIPermissions(data: {
    api_id: number
    user_ids: number[]
}): Promise<any> {
    return http.request({
        method: 'post',
        url: '/api/v1/api-users/permissions/revoke',
        data: data
    })
}

/**
 * 获取API的授权用户列表
 */
export function GetAPIPermissions(apiId: number): Promise<any> {
    return http.request({
        method: 'get',
        url: `/api/v1/api-users/permissions/api/${apiId}`
    })
}

/**
 * 获取用户可访问的API列表
 */
export function GetUserPermissions(userId: number): Promise<any> {
    return http.request({
        method: 'get',
        url: `/api/v1/api-users/permissions/user/${userId}`
    })
}