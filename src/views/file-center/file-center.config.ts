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
    name: '资源中心',
    code: 'file-center'
  }
]

export const colConfigs: colConfig[] = [
  {
    prop: 'fileName',  // 🆕 确认字段名
    title: '名称',
    minWidth: 125,
    showOverflowTooltip: true
  },
  {
    prop: 'fileSize',  // 🆕 后端已格式化好的大小
    title: '大小',
    minWidth: 110
  },
  {
    prop: 'fileType',  // 🆕 确认字段名
    title: '类型',
    minWidth: 110,
    formatter: (data: any) => {
      const obj = {
        JOB: '作业',
        FUNC: '函数',
        LIB: '依赖',
        EXCEL: 'Excel'
      }
      return obj[data.cellValue] || data.cellValue
    }
  },
  {
    prop: 'createUsername',  // 🆕 确认字段名
    title: '创建人',
    minWidth: 120
  },
  {
    prop: 'createDatetime',  // 🆕 确认字段名（注意是驼峰命名）
    title: '创建时间',
    minWidth: 140
  },
  {
    prop: 'remark',
    title: '备注',
    minWidth: 100,
    showOverflowTooltip: true
  },
  {
    title: '操作',
    align: 'center',
    customSlot: 'options',
    width: 80,
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
