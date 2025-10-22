// src/views/custom-api/custom-api.config.ts

/**
 * 自定义API页面配置
 * 包含面包屑、表格列配置等
 */

import { ApiStatus } from '@/types/custom-api.types'

export interface BreadCrumb {
    name: string
    code: string
    hidden?: boolean
}

export interface colConfig {
    prop?: string
    title: string
    align?: string
    showOverflowTooltip?: boolean
    customSlot?: string
    width?: number
    minWidth?: number
    formatter?: any
    fixed?: string
}

export interface Pagination {
    currentPage: number
    pageSize: number
    total: number
}

export interface TableConfig {
    tableData: Array<any>
    colConfigs: Array<colConfig>
    seqType: string
    pagination?: Pagination
    loading?: boolean
}

export interface SearchParams {
    page: number
    pageSize: number
    searchKeyWord: string
    dataSourceId?: number
    isActive?: boolean
}

// ==================== 面包屑配置 ====================

export const BreadCrumbList: Array<BreadCrumb> = [
    {
        name: '接口服务',
        code: 'custom-api'
    }
]

// ==================== 表格列配置 ====================

export const colConfigs: colConfig[] = [
    {
        prop: 'name',
        title: 'API名称',
        minWidth: 150,
        showOverflowTooltip: true
    },
    {
        prop: 'apiType',
        title: '请求方式',
        width: 100,
        align: 'center'
    },
    {
        prop: 'path',
        title: 'API路径',
        minWidth: 200,
        showOverflowTooltip: true
    },
    {
        prop: 'dataSourceName',
        title: '数据源',
        minWidth: 120,
        showOverflowTooltip: true,
        formatter: (data: any) => {
            return data.cellValue || '-'
        }
    },
    {
        prop: 'status',
        title: '状态',
        width: 100,
        align: 'center',
        customSlot: 'statusTag'
    },
    {
        prop: 'totalCalls',
        title: '调用次数',
        width: 100,
        align: 'center',
        formatter: (data: any) => {
            return data.cellValue || 0
        }
    },
    {
        prop: 'successRate',
        title: '成功率',
        width: 100,
        align: 'center',
        formatter: (data: any) => {
            const rate = data.cellValue || 0
            return `${rate.toFixed(1)}%`
        }
    },
    {
        prop: 'createUsername',
        title: '创建人',
        minWidth: 100,
        showOverflowTooltip: true,
        formatter: (data: any) => {
            return data.cellValue || '-'
        }
    },
    {
        prop: 'createDateTime',
        title: '创建时间',
        minWidth: 160,
        showOverflowTooltip: true
    },
    {
        prop: 'remark',
        title: '描述',
        minWidth: 150,
        showOverflowTooltip: true,
        formatter: (data: any) => {
            return data.cellValue || '-'
        }
    },
    {
        title: '操作',
        align: 'center',
        customSlot: 'options',
        width: 180,
        fixed: 'right'
    }
]

// ==================== 表格配置 ====================

export const TableConfig: TableConfig = {
    tableData: [],
    colConfigs: colConfigs,
    pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
    },
    seqType: 'seq',
    loading: false
}

// ==================== 状态标签配置 ====================

export const statusTagConfig: Record<ApiStatus, { type: string; text: string }> = {
    [ApiStatus.ONLINE]: {
        type: 'success',
        text: '已发布'
    },
    [ApiStatus.OFFLINE]: {
        type: 'info',
        text: '未发布'
    }
}

// ==================== HTTP方法配置 ====================

export const httpMethodConfig: Record<string, { color: string; text: string }> = {
    GET: {
        color: '#67C23A',
        text: 'GET'
    },
    POST: {
        color: '#E6A23C',
        text: 'POST'
    },
    PUT: {
        color: '#409EFF',
        text: 'PUT'
    },
    DELETE: {
        color: '#F56C6C',
        text: 'DELETE'
    }
}

// ==================== 响应格式配置 ====================

export const responseFormatConfig = [
    {
        label: 'JSON',
        value: 'json'
    },
    {
        label: 'CSV',
        value: 'csv'
    },
    {
        label: 'Excel',
        value: 'excel'
    }
]

// ==================== 参数类型配置 ====================

export const parameterTypeConfig = [
    {
        label: '字符串',
        value: 'string'
    },
    {
        label: '整数',
        value: 'integer'
    },
    {
        label: '浮点数',
        value: 'float'
    },
    {
        label: '布尔值',
        value: 'boolean'
    },
    {
        label: '日期',
        value: 'date'
    },
    {
        label: '日期时间',
        value: 'datetime'
    },
    {
        label: '数组',
        value: 'array'
    },
    {
        label: '对象',
        value: 'object'
    }
]

// ==================== 表单验证规则 ====================

export const formRules = {
    name: [
        { required: true, message: '请输入API名称', trigger: 'blur' },
        {
            pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
            message: 'API名称只能包含字母、数字、下划线,且必须以字母或下划线开头',
            trigger: 'blur'
        },
        { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
    ],
    path: [
        { required: true, message: '请输入API路径', trigger: 'blur' },
        {
            pattern: /^\/api\/custom\/[a-zA-Z0-9_\/-]+$/,
            message: 'API路径必须以 /api/custom/ 开头,且只能包含字母、数字、下划线、连字符和斜线',
            trigger: 'blur'
        },
        { max: 200, message: '路径长度不能超过 200 个字符', trigger: 'blur' }
    ],
    dataSourceId: [
        { required: true, message: '请选择数据源', trigger: 'change' }
    ],
    sqlTemp: [
        { required: true, message: '请输入SQL查询模板', trigger: 'blur' },
        { min: 10, message: 'SQL模板至少需要 10 个字符', trigger: 'blur' },
        {
            validator: (rule: any, value: any, callback: any) => {
                if (value && !value.trim().toLowerCase().startsWith('select')) {
                    callback(new Error('SQL模板必须以 SELECT 开头'))
                } else {
                    callback()
                }
            },
            trigger: 'blur'
        }
    ],
    apiType: [
        { required: true, message: '请选择请求方式', trigger: 'change' }
    ],
    remark: [
        { max: 1000, message: '描述长度不能超过 1000 个字符', trigger: 'blur' }
    ],
    accessLevel: [
        { required: true, message: '请选择访问级别', trigger: 'change' }
    ],
    allowedUserIds: [
        {
            validator: (rule: any, value: any[], callback: any) => {
                if (formData.accessLevel === 'restricted' && (!value || value.length === 0)) {
                    callback(new Error('请至少选择一个用户'))
                } else {
                    callback()
                }
            },
            trigger: 'change'
        }
    ]
}

// ==================== 默认表单数据 ====================

export const defaultFormData = {
    id: undefined,
    name: '',
    path: '',
    remark: '',
    dataSourceId: null,
    apiType: 'GET',
    sqlTemp: '',
    responseFormat: 'json',
    cacheTtl: 300,
    rateLimit: 100,
    parameters: [] as Array<{
        paramName: string
        paramType: string
        isRequired: boolean
        defaultValue: string
        description: string
        validationRule: any
    }>,
    // 保留旧字段以兼容
    clusterId: null,
    resBody: '',
    tokenType: 'CUSTOM',
    reqHeader: [{ label: '', value: '' }],
    reqGetTemp: [{ label: '', value: '' }],
    reqJsonTemp: ''
}

// ==================== 测试表单默认数据 ====================

export const defaultTestFormData = {
    id: 0,
    path: '',
    method: 'GET',
    headerConfig: [{ label: '', value: '' }],
    bodyConfig: [{ label: '', value: '' }],
    bodyParams: null,
    returnConfig: null
}

// ==================== 操作按钮配置 ====================

export const operationButtons = {
    edit: {
        text: '编辑',
        icon: 'Edit',
        type: 'primary'
    },
    test: {
        text: '测试',
        icon: 'VideoPlay',
        type: 'success'
    },
    publish: {
        text: '发布',
        icon: 'Upload',
        type: 'warning'
    },
    offline: {
        text: '下线',
        icon: 'Download',
        type: 'info'
    },
    delete: {
        text: '删除',
        icon: 'Delete',
        type: 'danger'
    },
    detail: {
        text: '详情',
        icon: 'View',
        type: 'info'
    },
    logs: {
        text: '日志',
        icon: 'Document',
        type: 'primary'
    }
}

// ==================== 缓存时间选项 ====================

export const cacheTtlOptions = [
    { label: '不缓存', value: 0 },
    { label: '1分钟', value: 60 },
    { label: '5分钟', value: 300 },
    { label: '10分钟', value: 600 },
    { label: '30分钟', value: 1800 },
    { label: '1小时', value: 3600 }
]

// ==================== 频率限制选项 ====================

export const rateLimitOptions = [
    { label: '10次/分钟', value: 10 },
    { label: '50次/分钟', value: 50 },
    { label: '100次/分钟', value: 100 },
    { label: '500次/分钟', value: 500 },
    { label: '1000次/分钟', value: 1000 },
    { label: '无限制', value: 10000 }
]

// ==================== 步骤条配置 ====================

export const stepConfig = [
    {
        title: '基本信息',
        description: '配置API基本信息'
    },
    {
        title: 'SQL配置',
        description: '编写SQL查询模板'
    },
    {
        title: '接口测试',
        description: '测试API功能'
    }
]

// ==================== 新增API参数配置的默认数据 ====================

/**
 * 默认API参数
 */
export const defaultApiParameter = {
    paramName: '',
    paramType: 'string',
    isRequired: false,
    defaultValue: '',
    description: '',
    validationRule: null
}

/**
 * 新的默认表单数据(适配后端CreateAPIRequest)
 */
export const defaultApiFormData = {
    id: undefined,
    name: '',
    path: '',
    remark: '',
    dataSourceId: null,
    apiType: 'GET',
    sqlTemp: '',
    responseFormat: 'json',
    cacheTtl: 300,
    rateLimit: 100,
    parameters: [] as Array<{
        paramName: string
        paramType: string
        isRequired: boolean
        defaultValue: string
        description: string
        validationRule: any
    }>
}

// ==================== SQL模板示例 ====================

export const sqlTemplateExamples = {
    simple: 'SELECT * FROM users WHERE id = {{ user_id }}',
    withMultipleParams: 'SELECT * FROM orders WHERE user_id = {{ user_id }} AND status = {{ status }}',
    withDateRange: 'SELECT * FROM logs WHERE created_at BETWEEN {{ start_date }} AND {{ end_date }}',
    withPagination: 'SELECT * FROM products WHERE category = {{ category }} LIMIT {{ limit }} OFFSET {{ offset }}'
}

export const sqlTemplateHints = [
    '1. SQL必须以SELECT开头',
    '2. 使用 {{ param_name }} 定义参数',
    '3. 参数名只能包含字母、数字、下划线',
    '4. 支持Jinja2模板语法',
    '5. 示例: SELECT * FROM users WHERE id = {{ user_id }}'
]