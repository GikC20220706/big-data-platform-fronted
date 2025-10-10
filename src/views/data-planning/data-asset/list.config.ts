/*
 * @Description: 数据资产列表配置
 */
import type { BreadCrumb } from '@/types/common-types'

interface colConfig {
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

interface Pagination {
    currentPage: number
    pageSize: number
    total: number
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
        name: '数据资产',
        code: 'data-asset'
    }
]

export const colConfigs: colConfig[] = [
    {
        prop: 'asset_name',
        title: '资产名称',
        minWidth: 150,
        showOverflowTooltip: true
    },
    {
        prop: 'asset_code',
        title: '资产编码',
        minWidth: 150,
        showOverflowTooltip: true
    },
    {
        prop: 'catalog_name',
        title: '所属目录',
        minWidth: 120,
        showOverflowTooltip: true
    },
    {
        prop: 'data_source_name',
        title: '数据源',
        minWidth: 120,
        showOverflowTooltip: true
    },
    {
        prop: 'table_name',
        title: '表名',
        minWidth: 150,
        showOverflowTooltip: true
    },
    {
        prop: 'asset_type',
        title: '资产类型',
        width: 100,
        formatter: (data: any) => {
            const typeMap: any = {
                'table': '数据表',
                'view': '视图',
                'external': '外部表',
                'temp': '临时表'
            }
            return typeMap[data.cellValue] || data.cellValue
        }
    },
    {
        prop: 'quality_level',
        title: '质量等级',
        width: 100,
        formatter: (data: any) => {
            return data.cellValue || '-'
        }
    },
    {
        prop: 'status',
        title: '状态',
        width: 100,
        customSlot: 'statusSlot'
    },
    {
        prop: 'row_count',
        title: '行数',
        width: 100,
        align: 'right',
        formatter: (data: any) => {
            if (!data.cellValue) return '-'
            return data.cellValue.toLocaleString()
        }
    },
    {
        prop: 'preview_count',
        title: '预览次数',
        width: 100,
        align: 'right'
    },
    {
        prop: 'download_count',
        title: '下载次数',
        width: 100,
        align: 'right'
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
        width: 160,
        fixed: 'right'
    }
]

export const TableConfig: TableConfig = {
    tableData: [],
    colConfigs: colConfigs,
    seqType: 'seq',
    pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
    }
}