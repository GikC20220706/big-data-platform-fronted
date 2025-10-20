// src/types/custom-api.types.ts

/**
 * 自定义API类型定义
 * 对接后端 FastAPI 接口
 */

// ==================== 枚举类型 ====================

/**
 * HTTP请求方法
 */
export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE'
}

/**
 * 响应格式
 */
export enum ResponseFormat {
    JSON = 'json',
    CSV = 'csv',
    EXCEL = 'excel'
}

/**
 * 参数类型
 */
export enum ParameterType {
    STRING = 'string',
    INTEGER = 'integer',
    FLOAT = 'float',
    BOOLEAN = 'boolean',
    DATE = 'date',
    DATETIME = 'datetime',
    ARRAY = 'array',
    OBJECT = 'object'
}

/**
 * API状态(前端显示用)
 */
export enum ApiStatus {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE'
}

// ==================== 参数相关类型 ====================

/**
 * 参数验证规则
 */
export interface ValidationRule {
    minLength?: number
    maxLength?: number
    minValue?: number
    maxValue?: number
    pattern?: string
    enum?: Array<string | number>
    format?: string
    [key: string]: any
}

/**
 * API参数定义(创建时)
 */
export interface ApiParameterCreate {
    paramName: string
    paramType: ParameterType
    isRequired: boolean
    defaultValue?: string | null
    description?: string | null
    validationRule?: ValidationRule | null
}

/**
 * API参数响应
 */
export interface ApiParameterResponse extends ApiParameterCreate {
    id: number
}

// ==================== 请求相关类型 ====================

/**
 * 创建API请求
 */
export interface CreateApiRequest {
    apiName: string
    apiPath: string
    description?: string | null
    dataSourceId: number
    sqlTemplate: string
    httpMethod: HttpMethod
    responseFormat: ResponseFormat
    cacheTtl?: number
    rateLimit?: number
    parameters?: ApiParameterCreate[]
    isActive?: boolean
    isPublic?: boolean
}

/**
 * 更新API请求
 */
export interface UpdateApiRequest {
    description?: string | null
    sqlTemplate?: string | null
    responseFormat?: ResponseFormat | null
    cacheTtl?: number | null
    rateLimit?: number | null
    isActive?: boolean | null
    parameters?: ApiParameterCreate[] | null
}

/**
 * 分页查询参数
 */
export interface ApiListParams {
    skip?: number
    limit?: number
    dataSourceId?: number | null
    isActive?: boolean | null
    searchKeyword?: string | null
}

/**
 * 测试API请求参数
 */
export interface TestApiRequest {
    id: number
    headerParams?: Record<string, string>
    requestBody?: Record<string, any>
}

// ==================== 响应相关类型 ====================

/**
 * 数据源信息
 */
export interface DataSourceInfo {
    id: number
    name: string
    type: string
    host?: string
}

/**
 * API统计信息
 */
export interface ApiStatistics {
    totalCalls: number
    successCalls: number
    failedCalls: number
    successRate: number
    lastCallTime: string | null
}

/**
 * 自定义API详情响应
 */
export interface CustomApiResponse {
    id: number
    apiName: string
    apiPath: string
    description: string | null
    dataSourceId: number
    dataSource: DataSourceInfo | null
    sqlTemplate: string
    httpMethod: HttpMethod
    responseFormat: ResponseFormat
    isActive: boolean
    cacheTtl: number
    rateLimit: number
    statistics: ApiStatistics
    parameters: ApiParameterResponse[]
    createdBy: string | null
    createdAt: string
    updatedAt: string
}

/**
 * API列表项(简化版)
 */
export interface ApiListItem {
    id: number
    apiName: string
    apiPath: string
    description: string | null
    dataSourceId: number
    dataSourceName: string | null
    dataSourceType: string | null
    httpMethod: HttpMethod
    responseFormat: ResponseFormat
    isActive: boolean
    totalCalls: number
    successCalls: number
    successRate: number
    lastCallTime: string | null
    createdBy: string | null
    createdAt: string
    updatedAt: string
}

/**
 * 分页响应
 */
export interface PageResponse<T> {
    items: T[]
    total: number
    page: number
    pageSize: number
    hasMore: boolean
}

/**
 * API创建响应
 */
export interface CreateApiResponse {
    apiId: number
    apiName: string
    apiPath: string
    createdAt: string
    parameterCount: number
}

/**
 * SQL验证结果
 */
export interface SqlValidationResult {
    isValid: boolean
    errorMessage: string | null
    extractedParameters: string[]
    renderedSqlExample: string | null
    parameterCount: number
}

/**
 * API执行结果(测试用)
 */
export interface ApiExecutionResult {
    success: boolean
    data: Record<string, any>[]
    totalCount: number
    responseTimeMs: number
    executedSql: string | null
    errorMessage: string | null
    httpStatus?: number
}

/**
 * 标准API响应格式
 */
export interface ApiResponse<T = any> {
    success: boolean
    code: number
    message: string
    data: T
    timestamp: string
}

// ==================== 前端特定类型 ====================

/**
 * 表单数据(前端使用)
 */
export interface ApiFormData {
    id?: number
    name: string
    path: string
    remark?: string
    dataSourceId: number | null
    clusterId?: number | null
    apiType: string
    sqlTemp: string
    resBody?: string
    tokenType?: string
    reqHeader?: Array<{ label: string; value: string }>
    reqGetTemp?: Array<{ label: string; value: string }>
    reqJsonTemp?: string
}

/**
 * 测试表单数据
 */
export interface TestFormData {
    id: number
    path: string
    method: string
    headerConfig: Array<{ label: string; value: string }>
    bodyConfig: Array<{ label: string; value: string }>
    bodyParams: string | null
    returnConfig: string | null
}

/**
 * 表格行数据(兼容现有代码)
 */
export interface ApiTableRow {
    id: number
    name: string
    apiType: string
    path: string
    status: ApiStatus
    createUsername: string
    createDateTime: string
    remark: string
    dataSourceName?: string  // 添加
    totalCalls?: number      // 添加
    successRate?: number     // 添加
}