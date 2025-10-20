// src/services/custom-api.adapter.ts

/**
 * 自定义API数据适配器
 * 负责前后端数据格式转换
 * 前端驼峰命名 ↔ 后端下划线命名
 */

import type {
    CreateApiRequest,
    UpdateApiRequest,
    CustomApiResponse,
    ApiListItem,
    ApiParameterCreate,
    ApiParameterResponse,
    ApiListParams,
    PageResponse,
    ApiTableRow,
    ApiFormData,
    TestFormData,
    TestApiRequest,
    ApiExecutionResult,
    SqlValidationResult,
    HttpMethod,
    ResponseFormat,
    ParameterType
} from '@/types/custom-api.types'
import { ApiStatus } from '@/types/custom-api.types'

/**
 * 数据适配器类
 */
export class CustomApiAdapter {

    // ==================== 命名转换工具 ====================

    /**
     * 驼峰转下划线
     */
    private static camelToSnake(str: string): string {
        return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
    }

    /**
     * 下划线转驼峰
     */
    private static snakeToCamel(str: string): string {
        return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    }

    /**
     * 对象键名转换:驼峰转下划线
     */
    private static objectKeysToSnake(obj: Record<string, any>): Record<string, any> {
        const result: Record<string, any> = {}
        for (const key in obj) {
            if (obj[key] !== undefined && obj[key] !== null) {
                const snakeKey = this.camelToSnake(key)
                if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null) {
                    result[snakeKey] = this.objectKeysToSnake(obj[key])
                } else if (Array.isArray(obj[key])) {
                    result[snakeKey] = obj[key].map((item: any) =>
                        typeof item === 'object' && item !== null ? this.objectKeysToSnake(item) : item
                    )
                } else {
                    result[snakeKey] = obj[key]
                }
            }
        }
        return result
    }

    /**
     * 对象键名转换:下划线转驼峰
     */
    private static objectKeysToCamel(obj: Record<string, any>): Record<string, any> {
        const result: Record<string, any> = {}
        for (const key in obj) {
            const camelKey = this.snakeToCamel(key)
            if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null) {
                result[camelKey] = this.objectKeysToCamel(obj[key])
            } else if (Array.isArray(obj[key])) {
                result[camelKey] = obj[key].map((item: any) =>
                    typeof item === 'object' && item !== null ? this.objectKeysToCamel(item) : item
                )
            } else {
                result[camelKey] = obj[key]
            }
        }
        return result
    }

    // ==================== 状态转换 ====================

    /**
     * 后端 is_active 转前端 status
     */
    static backendStatusToFrontend(isActive: boolean): ApiStatus {
        return isActive ? ApiStatus.ONLINE : ApiStatus.OFFLINE
    }

    /**
     * 前端 status 转后端 is_active
     */
    static frontendStatusToBackend(status: string): boolean {
        return status === ApiStatus.ONLINE || status === 'ONLINE'
    }

    // ==================== 参数转换 ====================

    /**
     * 前端参数转后端参数(创建API时)
     */
    static convertParameterToBackend(param: ApiParameterCreate): Record<string, any> {
        return {
            param_name: param.paramName,
            param_type: param.paramType,
            is_required: param.isRequired,
            default_value: param.defaultValue || null,
            description: param.description || null,
            validation_rule: param.validationRule || null
        }
    }

    /**
     * 后端参数转前端参数
     */
    static convertParameterToFrontend(param: Record<string, any>): ApiParameterResponse {
        return {
            id: param.id,
            paramName: param.paramName,
            paramType: param.paramType as ParameterType,
            isRequired: param.isRequired,
            defaultValue: param.defaultValue,
            description: param.description,
            validationRule: param.validationRule
        }
    }

    // ==================== 创建API请求转换 ====================

    /**
     * 前端创建请求转后端格式
     */
    static convertCreateRequestToBackend(request: CreateApiRequest): Record<string, any> {
        const backendRequest: Record<string, any> = {
            api_name: request.apiName,
            api_path: request.apiPath,
            data_source_id: request.dataSourceId,
            sql_template: request.sqlTemplate,
            http_method: request.httpMethod,
            response_format: request.responseFormat,
            cache_ttl: request.cacheTtl || 300,
            rate_limit: request.rateLimit || 100,
            parameters: request.parameters?.map(p => this.convertParameterToBackend(p)) || []
        }

        if (request.description) {
            backendRequest.description = request.description
        }

        if (request.isActive !== undefined) {
            backendRequest.is_active = request.isActive
        }

        if (request.isPublic !== undefined) {
            backendRequest.is_public = request.isPublic
        }

        return backendRequest
    }

    // ==================== 更新API请求转换 ====================

    /**
     * 前端更新请求转后端格式
     */
    static convertUpdateRequestToBackend(request: UpdateApiRequest): Record<string, any> {
        const backendRequest: Record<string, any> = {}

        if (request.description !== undefined) {
            backendRequest.description = request.description
        }

        if (request.sqlTemplate !== undefined) {
            backendRequest.sql_template = request.sqlTemplate
        }

        if (request.responseFormat !== undefined) {
            backendRequest.response_format = request.responseFormat
        }

        if (request.cacheTtl !== undefined) {
            backendRequest.cache_ttl = request.cacheTtl
        }

        if (request.rateLimit !== undefined) {
            backendRequest.rate_limit = request.rateLimit
        }

        if (request.isActive !== undefined) {
            backendRequest.is_active = request.isActive
        }

        if (request.parameters !== undefined && request.parameters !== null) {
            backendRequest.parameters = request.parameters.map(p => this.convertParameterToBackend(p))
        }

        return backendRequest
    }

    // ==================== 查询参数转换 ====================

    /**
     * 前端查询参数转后端格式
     */
    static convertListParamsToBackend(params: ApiListParams): Record<string, any> {
        const backendParams: Record<string, any> = {
            skip: params.skip || 0,
            limit: params.limit || 20
        }

        if (params.dataSourceId !== undefined && params.dataSourceId !== null) {
            backendParams.data_source_id = params.dataSourceId
        }

        if (params.isActive !== undefined && params.isActive !== null) {
            backendParams.is_active = params.isActive
        }

        if (params.searchKeyword) {
            backendParams.search_keyword = params.searchKeyword
        }

        return backendParams
    }

    // ==================== 响应数据转换 ====================

    /**
     * 后端API详情响应转前端格式
     */
    static convertApiDetailToFrontend(data: Record<string, any>): CustomApiResponse {
        const isAlreadyCamel = 'apiName' in data

        return {
            id: data.id,
            apiName: isAlreadyCamel ? data.apiName : data.api_name,
            apiPath: isAlreadyCamel ? data.apiPath : data.api_path,
            description: data.description,
            dataSourceId: isAlreadyCamel ? data.dataSourceId : data.data_source_id,
            dataSource: (isAlreadyCamel ? data.dataSource : data.data_source) ? {
                id: (isAlreadyCamel ? data.dataSource?.id : data.data_source?.id),
                name: (isAlreadyCamel ? data.dataSource?.name : data.data_source?.name),
                type: (isAlreadyCamel ? data.dataSource?.type : data.data_source?.type),
                host: (isAlreadyCamel ? data.dataSource?.host : data.data_source?.host)
            } : null,
            sqlTemplate: isAlreadyCamel ? data.sqlTemplate : data.sql_template,
            httpMethod: (isAlreadyCamel ? data.httpMethod : data.http_method) as HttpMethod,
            responseFormat: (isAlreadyCamel ? data.responseFormat : data.response_format) as ResponseFormat,
            isActive: isAlreadyCamel ? data.isActive : data.is_active,
            cacheTtl: isAlreadyCamel ? data.cacheTtl : data.cache_ttl,
            rateLimit: isAlreadyCamel ? data.rateLimit : data.rate_limit,
            statistics: {
                totalCalls: data.statistics?.totalCalls || data.statistics?.total_calls || 0,
                successCalls: data.statistics?.successCalls || data.statistics?.success_calls || 0,
                failedCalls: data.statistics?.failedCalls || data.statistics?.failed_calls || 0,
                successRate: data.statistics?.successRate || data.statistics?.success_rate || 0,
                lastCallTime: data.statistics?.lastCallTime || data.statistics?.last_call_time || null
            },
            parameters: data.parameters?.map((p: any) => {
                const isCamel = 'paramName' in p
                return {
                    id: p.id,
                    paramName: isCamel ? p.paramName : p.param_name,
                    paramType: (isCamel ? p.paramType : p.param_type) as ParameterType,
                    isRequired: isCamel ? p.isRequired : p.is_required,
                    defaultValue: isCamel ? p.defaultValue : p.default_value,
                    description: p.description,
                    validationRule: isCamel ? p.validationRule : p.validation_rule
                }
            }) || [],
            createdBy: isAlreadyCamel ? data.createdBy : data.created_by,
            createdAt: isAlreadyCamel ? data.createdAt : data.created_at,
            updatedAt: isAlreadyCamel ? data.updatedAt : data.updated_at
        }
    }

    /**
     * 后端API列表项转前端格式
     */
    static convertApiListItemToFrontend(data: Record<string, any>): ApiListItem {
        // 检查数据是否已经是驼峰格式(被HTTP拦截器转换过)
        const isAlreadyCamel = 'apiName' in data

        return {
            id: data.id,
            apiName: isAlreadyCamel ? (data.apiName || '') : (data.api_name || ''),
            apiPath: isAlreadyCamel ? (data.apiPath || '') : (data.api_path || ''),
            description: data.description || '',
            dataSourceId: isAlreadyCamel ? (data.dataSourceId || 0) : (data.data_source_id || 0),
            dataSourceName: isAlreadyCamel ? (data.dataSourceName || '-') : (data.data_source_name || '-'),
            dataSourceType: isAlreadyCamel ? (data.dataSourceType || '-') : (data.data_source_type || '-'),
            httpMethod: (isAlreadyCamel ? data.httpMethod : data.http_method || 'GET') as HttpMethod,
            responseFormat: (isAlreadyCamel ? data.responseFormat : data.response_format || 'json') as ResponseFormat,
            isActive: (isAlreadyCamel ? data.isActive : data.is_active) !== undefined ? (isAlreadyCamel ? data.isActive : data.is_active) : false,
            totalCalls: data.totalCalls || data.total_calls || 0,
            successCalls: data.successCalls || data.success_calls || 0,
            successRate: data.successRate || data.success_rate || 0,
            lastCallTime: data.lastCallTime || data.last_call_time || null,
            createdBy: data.createdBy || data.created_by || '-',
            createdAt: data.createdAt || data.created_at || '',
            updatedAt: data.updatedAt || data.updated_at || ''
        }
    }

    /**
     * 后端分页响应转前端格式
     */
    static convertPageResponseToFrontend<T>(
        data: Record<string, any>,
        itemConverter: (item: any) => T
    ): PageResponse<T> {
        return {
            items: data.items?.map(itemConverter) || [],
            total: data.total || 0,
            page: data.page || 0,
            pageSize: data.page_size || 20,
            hasMore: data.has_more || false
        }
    }

    // ==================== 表格数据转换 ====================

    /**
     * API列表项转表格行数据(用于现有页面)
     */
    static convertApiToTableRow(api: ApiListItem): ApiTableRow {
        return {
            id: api.id,
            name: api.apiName,
            apiType: api.httpMethod,
            path: api.apiPath,
            status: this.backendStatusToFrontend(api.isActive),
            createUsername: api.createdBy || '-',
            createDateTime: api.createdAt,
            remark: api.description || '-',
            // 添加缺失的字段,让表格能读取到
            dataSourceName: api.dataSourceName || '-',
            totalCalls: api.totalCalls || 0,
            successRate: api.successRate || 0
        } as any  // 使用 as any 临时绕过类型检查
    }

    /**
     * 批量转换为表格行数据
     */
    static convertApiListToTableRows(apiList: ApiListItem[]): ApiTableRow[] {
        return apiList.map(api => this.convertApiToTableRow(api))
    }

    // ==================== 表单数据转换 ====================

    /**
     * API详情转表单数据(编辑时使用)
     */
    static convertApiToFormData(api: CustomApiResponse): ApiFormData {
        return {
            id: api.id,
            name: api.apiName,
            path: api.apiPath,
            remark: api.description || '',
            dataSourceId: api.dataSourceId,
            apiType: api.httpMethod,
            sqlTemp: api.sqlTemplate,
            resBody: '',
            tokenType: 'CUSTOM',
            reqHeader: api.parameters
                .filter(p => p.paramType === ParameterType.STRING)
                .map(p => ({ label: p.paramName, value: '' })),
            reqGetTemp: api.httpMethod === 'GET'
                ? api.parameters.map(p => ({ label: p.paramName, value: '' }))
                : [],
            reqJsonTemp: api.httpMethod === 'POST'
                ? JSON.stringify(
                    api.parameters.reduce((acc, p) => {
                        acc[p.paramName] = p.defaultValue || ''
                        return acc
                    }, {} as Record<string, any>),
                    null,
                    2
                )
                : ''
        }
    }

    /**
     * 表单数据转创建请求
     */
    static convertFormDataToCreateRequest(formData: ApiFormData): CreateApiRequest {
        const parameters: ApiParameterCreate[] = []

        // 处理GET请求参数
        if (formData.apiType === 'GET' && formData.reqGetTemp) {
            formData.reqGetTemp.forEach(item => {
                if (item.label) {
                    parameters.push({
                        paramName: item.label,
                        paramType: ParameterType.STRING,
                        isRequired: false,
                        defaultValue: item.value || null,
                        description: null,
                        validationRule: null
                    })
                }
            })
        }

        // 处理POST请求参数
        if (formData.apiType === 'POST' && formData.reqJsonTemp) {
            try {
                const jsonParams = JSON.parse(formData.reqJsonTemp)
                Object.keys(jsonParams).forEach(key => {
                    parameters.push({
                        paramName: key,
                        paramType: ParameterType.STRING,
                        isRequired: false,
                        defaultValue: jsonParams[key],
                        description: null,
                        validationRule: null
                    })
                })
            } catch (e) {
                console.warn('JSON参数解析失败:', e)
            }
        }

        return {
            apiName: formData.name,
            apiPath: formData.path.startsWith('/api/custom/')
                ? formData.path
                : `/api/custom/${formData.path.replace(/^\//, '')}`,
            description: formData.remark || null,
            dataSourceId: formData.dataSourceId!,
            sqlTemplate: formData.sqlTemp,
            httpMethod: formData.apiType as HttpMethod,
            responseFormat: ResponseFormat.JSON,
            cacheTtl: 300,
            rateLimit: 100,
            parameters
        }
    }

    // ==================== 测试相关转换 ====================

    /**
     * 测试表单数据转测试请求
     */
    static convertTestFormToRequest(formData: TestFormData): TestApiRequest {
        const headerParams: Record<string, string> = {}
        formData.headerConfig.forEach(item => {
            if (item.label && item.value) {
                headerParams[item.label] = item.value
            }
        })

        let requestBody: Record<string, any> = {}
        if (formData.method === 'GET') {
            formData.bodyConfig.forEach(item => {
                if (item.label) {
                    requestBody[item.label] = item.value || ''
                }
            })
        } else if (formData.bodyParams) {
            try {
                requestBody = JSON.parse(formData.bodyParams)
            } catch (e) {
                console.warn('请求体JSON解析失败:', e)
            }
        }

        return {
            id: formData.id,
            headerParams,
            requestBody
        }
    }

    /**
     * 测试结果转前端格式
     */
    static convertTestResultToFrontend(data: Record<string, any>): ApiExecutionResult {
        return {
            success: data.success,
            data: data.data || [],
            totalCount: data.total_count || 0,
            responseTimeMs: data.response_time_ms || 0,
            executedSql: data.executed_sql || null,
            errorMessage: data.error_message || null,
            httpStatus: data.http_status || (data.success ? 200 : 500)
        }
    }

    // ==================== SQL验证结果转换 ====================

    /**
     * SQL验证结果转前端格式
     */
    static convertSqlValidationToFrontend(data: Record<string, any>): SqlValidationResult {
        return {
            isValid: data.is_valid,
            errorMessage: data.error_message,
            extractedParameters: data.extracted_parameters || [],
            renderedSqlExample: data.rendered_sql_example,
            parameterCount: data.parameter_count || 0
        }
    }

    // ==================== 分页数据转换(兼容前端现有格式) ====================

    /**
     * 后端分页响应转前端现有的分页格式
     */
    static convertBackendPageToFrontendPage(backendPage: Record<string, any>): Record<string, any> {
        return {
            content: backendPage.items || [],
            totalElements: backendPage.total || 0,
            page: backendPage.page || 0,
            pageSize: backendPage.page_size || 20,
            totalPages: Math.ceil((backendPage.total || 0) / (backendPage.page_size || 20))
        }
    }

    /**
     * 前端分页参数转后端格式(处理page从0开始的情况)
     */
    static convertFrontendPageParamsToBackend(page: number, pageSize: number): { skip: number; limit: number } {
        return {
            skip: page * pageSize,
            limit: pageSize
        }
    }
}

/**
 * 导出单例适配器
 */
export const customApiAdapter = CustomApiAdapter