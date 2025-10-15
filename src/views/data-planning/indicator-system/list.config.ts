/*
 * @Description: 指标体系建设列表配置
 */
import type { BreadCrumb } from '@/types/common-types'

interface colConfig {
    type?: string
    prop?: string
    title?: string
    align?: string
    showOverflowTooltip?: boolean
    customSlot?: string
    width?: number
    minWidth?: number
    formatter?: any
    fixed?: string
}

interface Pagination {
    currentPage: number
    pageSize: number
    total: number
    pageSizes?: number[]
}

interface TableConfig {
    tableData: Array<any>
    colConfigs: Array<colConfig>
    seqType: string
    pagination?: Pagination
    loading?: boolean
}

export const BreadCrumbList: Array<BreadCrumb> = [
    {
        name: '指标体系建设',
        code: 'indicator-system'
    }
]

export const colConfigs: colConfig[] = [
    {
        type: 'selection',
        width: 55
    },
    {
        prop: 'indicator_name',
        title: '指标名称',
        minWidth: 180,
        showOverflowTooltip: true,
        fixed: 'left'
    },
    {
        prop: 'business_domain',
        title: '业务领域',
        minWidth: 120,
        showOverflowTooltip: true
    },
    {
        prop: 'business_theme',
        title: '业务主题',
        minWidth: 120,
        showOverflowTooltip: true
    },
    {
        prop: 'indicator_category',
        title: '指标类别',
        minWidth: 120,
        showOverflowTooltip: true
    },
    {
        prop: 'source_system',
        title: '来源系统',
        minWidth: 120,
        showOverflowTooltip: true
    },
    {
        prop: 'indicator_type',
        title: '指标类型',
        width: 100,
        showOverflowTooltip: true
    },
    {
        prop: 'data_type',
        title: '数据类型',
        width: 100,
        showOverflowTooltip: true
    },
    {
        prop: 'responsible_dept',
        title: '权责部门',
        minWidth: 120,
        showOverflowTooltip: true
    },
    {
        prop: 'collection_frequency',
        title: '采集频率',
        width: 100,
        showOverflowTooltip: true
    },
    {
        prop: 'asset_count',
        title: '关联资产数',
        width: 100,
        align: 'center',
        formatter: (data: any) => {
            return data.cellValue || 0
        }
    },
    {
        prop: 'is_active',
        title: '状态',
        width: 80,
        customSlot: 'statusSlot'
    },
    {
        prop: 'created_by',
        title: '创建人',
        minWidth: 100
    },
    {
        prop: 'created_at',
        title: '创建时间',
        minWidth: 160
    },
    {
        title: '操作',
        align: 'center',
        customSlot: 'options',
        width: 200,
        fixed: 'right'
    }
]

export const TableConfig: TableConfig = {
    tableData: [],
    colConfigs: colConfigs,
    seqType: 'seq',
    pagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0,
        pageSizes: [20, 50, 100]
    },
}