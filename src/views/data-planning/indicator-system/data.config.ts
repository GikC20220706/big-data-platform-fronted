/*
 * @Description: 指标体系建设数据配置
 */

/**
 * 指标类型选项
 */
export const IndicatorTypeOptions = [
    { label: '采集指标', value: '采集指标' },
    { label: '统计指标', value: '统计指标' },
    { label: '反馈指标', value: '反馈指标' }
]

/**
 * 数据类型选项
 */
export const DataTypeOptions = [
    { label: '浮点型(FLOAT)', value: 'FLOAT' },
    { label: '数值型(DECIMAL)', value: 'DECIMAL' },
    { label: '字符型(VARCHAR)', value: 'VARCHAR' },
    { label: '整数型(INT)', value: 'INT' },
    { label: '日期型(DATE)', value: 'DATE' },
    { label: '时间戳型(TIMESTAMP)', value: 'TIMESTAMP' },
    { label: '浮点型F(FLOAT)', value: 'FLOAT' },
    { label: '双精度型(DOUBLE)', value: 'DOUBLE' },
    { label: '文本型(TEXT)', value: 'TEXT' },
    { label: '字符串型C(VARCHAR)', value: 'VARCHAR' },
    { label: '时间型(TIME)', value: 'TIME' },
    { label: '整型I(INT)', value: 'INT' },
    { label: '附件(ATTACHMENT)', value: 'ATTACHMENT' },
    { label: '日期型D(DATE)', value: 'DATE' },
    { label: '数值型N(DECIMAL)', value: 'DECIMAL' },
    { label: '二进制型(BLOB)', value: 'BLOB' },
    { label: '整型(INT)', value: 'INT' }
]

/**
 * 采集频率选项
 */
export const CollectionFrequencyOptions = [
    { label: '实时', value: '实时' },
    { label: '每小时', value: '每小时' },
    { label: '每日', value: '每日' },
    { label: '每周', value: '每周' },
    { label: '每月', value: '每月' },
    { label: '每季度', value: '每季度' },
    { label: '每年', value: '每年' },
    { label: '按需', value: '按需' }
]

/**
 * 共享类型选项
 */
export const ShareTypeOptions = [
    { label: '完全共享', value: '完全共享' },
    { label: '有条件共享', value: '有条件共享' },
    { label: '不予共享', value: '不予共享' }
]

/**
 * 开放属性选项
 */
export const OpenAttributeOptions = [
    { label: '对外开放', value: '对外开放' },
    { label: '对内开放', value: '对内开放' },
    { label: '依申请开放', value: '依申请开放' },
    { label: '不予开放', value: '不予开放' }
]

/**
 * 关联类型选项
 */
export const RelationTypeOptions = [
    { label: '数据来源', value: 'source' },
    { label: '参考引用', value: 'reference' },
    { label: '派生计算', value: 'derived' }
]

/**
 * Tab页签配置
 */
export const TabConfig = [
    {
        label: '业务属性',
        name: 'business',
        fields: [
            'source_system',
            'business_domain',
            'business_theme',
            'indicator_category',
            'indicator_name',
            'indicator_description',
            'remark'
        ]
    },
    {
        label: '技术属性',
        name: 'technical',
        fields: [
            'indicator_type',
            'tech_classification',
            'data_type',
            'data_length',
            'data_format'
        ]
    },
    {
        label: '管理属性',
        name: 'management',
        fields: [
            'responsible_dept',
            'collection_frequency',
            'collection_time',
            'share_type',
            'open_attribute'
        ]
    }
]

/**
 * 字段中文名映射
 */
export const FieldLabels: Record<string, string> = {
    // 业务属性
    source_system: '来源系统',
    business_domain: '业务领域',
    business_theme: '业务主题',
    indicator_category: '指标类别',
    indicator_name: '指标名称',
    indicator_description: '指标说明',
    remark: '备注',

    // 技术属性
    indicator_type: '指标类型',
    tech_classification: '数据标准技术分类',
    data_type: '数据类型',
    data_length: '数据长度',
    data_format: '数据格式',

    // 管理属性
    responsible_dept: '权责部门',
    collection_frequency: '采集频率',
    collection_time: '采集时点',
    share_type: '共享类型',
    open_attribute: '开放属性',

    // 其他
    tags: '标签',
    is_active: '是否启用'
}

/**
 * Excel表头映射（用于导入）
 */
export const ExcelHeaderMapping: Record<string, string> = {
    '来源系统': 'source_system',
    '业务领域': 'business_domain',
    '业务主题': 'business_theme',
    '指标类别': 'indicator_category',
    '指标名称': 'indicator_name',
    '指标说明': 'indicator_description',
    '备注': 'remark',
    '指标类型': 'indicator_type',
    '数据标准技术分类': 'tech_classification',
    '数据类型': 'data_type',
    '数据长度': 'data_length',
    '数据格式': 'data_format',
    '权责部门': 'responsible_dept',
    '采集频率': 'collection_frequency',
    '采集时点': 'collection_time',
    '共享类型': 'share_type',
    '开放属性': 'open_attribute'
}