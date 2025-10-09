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

export interface SerchParams {
  page: number;
  pageSize: number;
  searchKeyWord: string;
}

export interface FormData {
  name: string;
  remark: string;
}

export const BreadCrumbList: Array<BreadCrumb> = [
  {
    name: '数据源',
    code: 'datasource'
  }
]
export const typeList = [
  {
    label: 'Mysql',
    value: 'mysql',
  },
  {
    label: 'Hive',
    value: 'hive',
  },
  {
    label: 'SqlServer',
    value: 'SQL_SERVER',
  },
  {
    label: 'KingBase',
    value: 'kingbase',
  },
  {
    label: 'Doris',
    value: 'doris',
  },
  {
    label: 'Kafka',
    value: 'KAFKA',
  },
  {
    label: 'HanaSap',
    value: 'HANA_SAP',
  },
  {
    label: '达梦',
    value: 'DM',
  },
  {
    label: 'OceanBase',
    value: 'OCEANBASE',
  },
  {
    label: 'TiDB',
    value: 'tidb',
  },
  {
    label: 'StarRocks',
    value: 'STAR_ROCKS',
  },
  {
    label: 'Greenplum',
    value: 'GREENPLUM',
  },
  {
    label: 'Gbase',
    value: 'GBASE',
  },
  {
    label: 'Sybase',
    value: 'SYBASE',
  },
  {
    label: 'Db2',
    value: 'DB2',
  },
  {
    label: 'H2',
    value: 'H2',
  },
  {
    label: 'Gauss',
    value: 'GAUSS',
  },
  {
    label: 'OpenGauss',
    value: 'OPEN_GAUSS',
  }
]
export const colConfigs: colConfig[] = [
  {
    prop: 'name',
    title: '名称',
    minWidth: 100,
    showOverflowTooltip: true
  },
  {
    prop: 'type',
    title: '类型',
    minWidth: 80,
    showOverflowTooltip: true
  },
  {
    prop: 'host',
    title: '主机',
    minWidth: 120,
    showOverflowTooltip: true
  },
  {
    prop: 'port',
    title: '端口',
    minWidth: 80
  },
  {
    prop: 'database',
    title: '数据库',
    minWidth: 120,
    showOverflowTooltip: true
  },
  {
    prop: 'username',
    title: '用户名',
    minWidth: 100,
    showOverflowTooltip: true
  },
  {
    prop: 'status',
    title: '状态',
    minWidth: 80,
    customSlot: 'statusTag'
  },
  {
    prop: 'last_test',
    title: '最后检测时间',
    minWidth: 160
  },
  {
    prop: 'description',
    title: '描述',
    minWidth: 140,
    showOverflowTooltip: true
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
  pagination: {
    currentPage: 1,
    pageSize: 10,
    total: 0
  },
  seqType: 'seq',
  loading: false
}
