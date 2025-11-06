import { http } from '@/utils/http'

interface SourceTablesParam {
    dataSourceId: string
    tablePattern: string
}

interface TableDetailParam {
    dataSourceId?: string
    dataSourceName?: string
    database?: string
    tableName: string
}

interface tableColumn {
    code: string
    type: string
    sql?: string
}

interface connect {
    source: string
    target: string
}

interface SaveParams {
    workId: string
    sourceDBType: string
    sourceDBId: string
    sourceTable: string
    queryCondition: string
    targetDBType: string
    targetDBId: string
    targetTable: string
    overMode: string
    sourceTableColumn: tableColumn[]
    targetTableColumn: tableColumn[]
    columnMap: connect[]
}

interface workIdParam {
    workId: string
}

// 作业流-数据同步-获取数据源表
export function GetDataSourceTables(params: SourceTablesParam): Promise<any> {
    return http.request({
        method: 'get',
        url: `/api/v1/integration/sources/${params.dataSourceId}/tables`,
        params: {
            limit: 1000,
            offset: 0
        }
    })
}

// 作业流-数据同步-数据预览
export function GetSourceTablesDetail(params: TableDetailParam): Promise<any> {
    return http.request({
        method: 'post',
        url: '/work/getDataSourceData',
        params: params
    })
}

// 作业流-数据同步-生成建表作业
export function CreateTableWork(params: TableDetailParam): Promise<any> {
    return http.request({
        method: 'post',
        url: '/work/getCreateTableSql',
        params: params
    })
}

// 作业流-数据同步-根据表获取字段
export function GetTableColumnsByTableId(params: TableDetailParam): Promise<any> {
    // 兼容：优先使用 name；若只有 id，则调用列表接口做一次映射
    const buildRequest = (sourceName: string) => {
        return http.request({
            method: 'get',
            url: `/api/v1/integration/sources/${encodeURIComponent(sourceName)}/tables/${encodeURIComponent(params.tableName)}/schema`,
            params: params.database ? { database: params.database } : {}
        })
    }

    if (params.dataSourceName) {
        return buildRequest(params.dataSourceName)
    }

    if (params.dataSourceId) {
        return http.request({
            method: 'get',
            url: '/api/v1/integration/sources',
            params: { page: 1, page_size: 100 }
        }).then((res: any) => {
            const all = res?.data?.sources || res?.data || []
            const ds = all.find((s: any) => String(s.id) === String(params.dataSourceId))
            const name = ds?.name || ds?.display_name || ds?.label
            const database = params.database ?? (ds?.database || (ds?.config ? ds.config.database : ''))
            return buildRequest(name).then(r => r)
        })
    }

    return Promise.reject(new Error('缺少 dataSourceName / dataSourceId'))
}


// 作业流-数据同步-保存数据
export function SaveDataSync(params: SaveParams): Promise<any> {
    return http.request({
        method: 'post',
        url: '/work/saveSyncWorkConfig',
        params: params
    })
}

// TODO: 作废
// 作业流-数据同步-保存数据
export function GetDataSyncDetail(params: workIdParam): Promise<any> {
    return http.request({
        method: 'post',
        url: '/work/getSyncWorkConfig',
        params: params
    })
}

// 作业流-Excel导入-数据预览
export function GetExcelDataPreviewDetail(params: any): Promise<any> {
    return http.request({
        method: 'post',
        url: '/work/getExcelData',
        params: params
    })
}

// 作业流-Excel导入-文件名预览
export function GetExcelReplaceName(params: any): Promise<any> {
    return http.request({
        method: 'post',
        url: '/work/parseExcelName',
        params: params
    })
}

// 作业流-Excel导入-获取Excel字段信息
export function GetExcelTableColumnsCodes(params: any): Promise<any> {
    return http.request({
        method: 'post',
        url: '/work/getExcelColumns',
        params: params
    })
}