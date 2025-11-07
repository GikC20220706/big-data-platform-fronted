/**
 * 数据源写入模式能力配置
 * 集中管理各数据源支持的写入模式和实现细节
 */

export interface WriteModeCapability {
    /** 支持的写入模式 */
    supportedModes: Array<'append' | 'overwrite'>
    /** 默认写入模式 */
    defaultMode: 'append' | 'overwrite'
    /** 模式说明 */
    description: {
        append: string
        overwrite: string
    }
    /** 后端实现方式说明(仅用于开发参考) */
    implementation?: {
        append: string
        overwrite: string
    }
}

/**
 * 数据源写入模式配置表
 */
export const DATASOURCE_WRITE_MODE_CONFIG: Record<string, WriteModeCapability> = {
    // ==================== 关系型数据库 ====================
    MYSQL: {
        supportedModes: ['append', 'overwrite'],
        defaultMode: 'append',
        description: {
            append: '追加:INSERT插入',
            overwrite: '覆写:TRUNCATE后插入'
        },
        implementation: {
            append: 'writeMode: insert',
            overwrite: 'preSql: TRUNCATE TABLE + writeMode: insert'
        }
    },

    DORIS: {
        supportedModes: ['append', 'overwrite'],
        defaultMode: 'append',
        description: {
            append: '追加:直接写入',
            overwrite: '覆写:TRUNCATE后写入'
        },
        implementation: {
            append: '直接写入',
            overwrite: 'preSql: TRUNCATE TABLE + 直接写入'
        }
    },

    KINGBASE: {
        supportedModes: ['append', 'overwrite'],
        defaultMode: 'append',
        description: {
            append: '追加:INSERT插入',
            overwrite: '覆写:TRUNCATE后插入'
        },
        implementation: {
            append: 'INSERT',
            overwrite: 'preSql: TRUNCATE TABLE + INSERT'
        }
    },

    TIDB: {
        supportedModes: ['append', 'overwrite'],
        defaultMode: 'append',
        description: {
            append: '追加:INSERT插入',
            overwrite: '覆写:TRUNCATE后插入'
        },
        implementation: {
            append: 'writeMode: insert',
            overwrite: 'preSql: TRUNCATE TABLE + writeMode: insert'
        }
    },

    DM: { // 达梦
        supportedModes: ['append', 'overwrite'],
        defaultMode: 'append',
        description: {
            append: '追加:INSERT插入',
            overwrite: '覆写:TRUNCATE后插入'
        }
    },

    GBASE: {
        supportedModes: ['append', 'overwrite'],
        defaultMode: 'append',
        description: {
            append: '追加:INSERT插入',
            overwrite: '覆写:TRUNCATE后插入'
        }
    },

    POSTGRE_SQL: {
        supportedModes: ['append', 'overwrite'],
        defaultMode: 'append',
        description: {
            append: '追加:INSERT插入',
            overwrite: '覆写:TRUNCATE后插入'
        },
        implementation: {
            append: 'writeMode: insert',
            overwrite: 'preSql: TRUNCATE TABLE + writeMode: insert'
        }
    },

    ORACLE: {
        supportedModes: ['append', 'overwrite'],
        defaultMode: 'append',
        description: {
            append: '追加:INSERT插入',
            overwrite: '覆写:TRUNCATE后插入'
        },
        implementation: {
            append: 'writeMode: insert',
            overwrite: 'preSql: TRUNCATE TABLE + writeMode: insert'
        }
    },

    SQL_SERVER: {
        supportedModes: ['append', 'overwrite'],
        defaultMode: 'append',
        description: {
            append: '追加:INSERT插入',
            overwrite: '覆写:TRUNCATE后插入'
        }
    },

    // ==================== 大数据存储 ====================
    HIVE: {
        supportedModes: ['append', 'overwrite'],
        defaultMode: 'append',
        description: {
            append: '追加:append模式',
            overwrite: '覆写:truncate模式(删除HDFS文件)'
        },
        implementation: {
            append: 'writeMode: append',
            overwrite: 'writeMode: truncate'
        }
    },

    // ==================== 列式数据库 ====================
    CLICKHOUSE: {
        supportedModes: ['append'], // 仅支持追加
        defaultMode: 'append',
        description: {
            append: '追加:INSERT插入',
            overwrite: '不支持覆写模式'
        },
        implementation: {
            append: 'INSERT',
            overwrite: 'NOT_SUPPORTED'
        }
    },

    // ==================== 其他数据源 ====================
    OCEANBASE: {
        supportedModes: ['append', 'overwrite'],
        defaultMode: 'append',
        description: {
            append: '追加:INSERT插入',
            overwrite: '覆写:TRUNCATE后插入'
        }
    },

    STAR_ROCKS: {
        supportedModes: ['append', 'overwrite'],
        defaultMode: 'append',
        description: {
            append: '追加:直接写入',
            overwrite: '覆写:TRUNCATE后写入'
        }
    },

    GREENPLUM: {
        supportedModes: ['append', 'overwrite'],
        defaultMode: 'append',
        description: {
            append: '追加:INSERT插入',
            overwrite: '覆写:TRUNCATE后插入'
        }
    },

    GAUSS: {
        supportedModes: ['append', 'overwrite'],
        defaultMode: 'append',
        description: {
            append: '追加:INSERT插入',
            overwrite: '覆写:TRUNCATE后插入'
        }
    },

    OPEN_GAUSS: {
        supportedModes: ['append', 'overwrite'],
        defaultMode: 'append',
        description: {
            append: '追加:INSERT插入',
            overwrite: '覆写:TRUNCATE后插入'
        }
    },

    DB2: {
        supportedModes: ['append', 'overwrite'],
        defaultMode: 'append',
        description: {
            append: '追加:INSERT插入',
            overwrite: '覆写:TRUNCATE后插入'
        }
    },

    H2: {
        supportedModes: ['append', 'overwrite'],
        defaultMode: 'append',
        description: {
            append: '追加:INSERT插入',
            overwrite: '覆写:TRUNCATE后插入'
        }
    },

    SYBASE: {
        supportedModes: ['append', 'overwrite'],
        defaultMode: 'append',
        description: {
            append: '追加:INSERT插入',
            overwrite: '覆写:TRUNCATE后插入'
        }
    },

    HANA_SAP: {
        supportedModes: ['append', 'overwrite'],
        defaultMode: 'append',
        description: {
            append: '追加:INSERT插入',
            overwrite: '覆写:TRUNCATE后插入'
        }
    }
}

/**
 * 获取数据源写入模式配置
 */
export function getWriteModeConfig(datasourceType: string): WriteModeCapability {
    const config = DATASOURCE_WRITE_MODE_CONFIG[datasourceType]

    // 如果配置不存在,返回默认配置
    if (!config) {
        console.warn(`数据源 ${datasourceType} 未配置写入模式,使用默认配置`)
        return {
            supportedModes: ['append'],
            defaultMode: 'append',
            description: {
                append: '追加:INSERT插入',
                overwrite: '不支持覆写'
            }
        }
    }

    return config
}

/**
 * 检查数据源是否支持指定写入模式
 */
export function supportsWriteMode(
    datasourceType: string,
    mode: 'append' | 'overwrite'
): boolean {
    const config = getWriteModeConfig(datasourceType)
    return config.supportedModes.includes(mode)
}

/**
 * 获取数据源的默认写入模式
 */
export function getDefaultWriteMode(datasourceType: string): 'append' | 'overwrite' {
    const config = getWriteModeConfig(datasourceType)
    return config.defaultMode
}