export interface BreadCrumb {
    name: string;
    code: string;
    hidden?: boolean;
}

export interface colConfig {
    prop?: string;
    title: string;
    align?: string;
    showOverflowTooltip?: boolean;
    customSlot?: string;
    width?: number;
    minWidth?: number;
    formatter?: any
    fixed?: string;
    dragSort?: boolean
}

export interface Pagination {
    currentPage: number;
    pageSize: number;
    total: number;
}

export interface TableConfig {
    tableData: Array<any>;
    colConfigs: Array<colConfig>;
    seqType: string;
    pagination?: Pagination; // 分页数据
    loading?: boolean; // 表格loading
}

export const BreadCrumbList: Array<BreadCrumb> = [
    {
        name: '数据分层',
        code: 'data-layer'
    }
]

export const colConfigs: colConfig[] = [
    {
        prop: 'catalog_name',
        title: '目录名称',
        minWidth: 125,
        customSlot: 'nameSlot'
    },
    {
        prop: 'catalog_type',
        title: '类型',
        minWidth: 100,
        formatter: (data: any) => {
            const typeMap: any = {
                'domain': '业务域',
                'subject': '主题域',
                'dataset': '数据集'
            }
            return typeMap[data.cellValue] || data.cellValue
        }
    },
    {
        prop: 'level',
        title: '层级',
        width: 80
    },
    {
        prop: 'asset_count',
        title: '资产数量',
        width: 100
    },
    {
        prop: 'description',
        title: '描述',
        minWidth: 120
    },
    {
        prop: 'created_by',
        title: '创建人',
        minWidth: 120
    },
    {
        prop: 'created_at',
        title: '创建时间',
        minWidth: 140
    },
    {
        title: '操作',
        align: 'center',
        customSlot: 'options',
        width: 90,
        fixed: 'right'
    }
]

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
