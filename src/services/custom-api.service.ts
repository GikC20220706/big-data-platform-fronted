// src/services/custom-api.service.ts

/**
 * 自定义API服务层
 * 对接后端 /api/v1/custom-api 接口
 */

import { http } from '@/utils/http'
import { customApiAdapter } from './custom-api.adapter'
import type {
    CreateApiRequest,
    UpdateApiRequest,
    CustomApiResponse,
    ApiListItem,
    ApiListParams,
    PageResponse,
    CreateApiResponse,
    SqlValidationResult,
    ApiExecutionResult,
    TestApiRequest,
    ApiResponse
} from '@/types/custom-api.types'

/**
 * 自定义API服务类
 */
class CustomApiService {

    // ==================== API管理接口 ====================

    /**
     * 分页查询API列表
     */
    async queryCustomApiList(params: {
        page: number
        pageSize: number
        searchKeyWord?: string
        dataSourceId?: number
        isActive?: boolean
    }): Promise<any> {
        try {
            // 转换分页参数
            const { skip, limit } = customApiAdapter.convertFrontendPageParamsToBackend(
                params.page,
                params.pageSize
            )

            // 构建查询参数
            const queryParams: ApiListParams = {
                skip,
                limit,
                searchKeyword: params.searchKeyWord || null,
                dataSourceId: params.dataSourceId || null,
                isActive: params.isActive !== undefined ? params.isActive : null
            }

            // 转换为后端格式
            const backendParams = customApiAdapter.convertListParamsToBackend(queryParams)

            // 调用接口
            const response = await http.request<ApiResponse<any>>({
                method: 'get',
                url: '/api/v1/custom-api/custom-api/',
                params: backendParams
            })

            // 转换响应数据
            if (response.data) {
                // 适配后端实际返回的数据结构
                const backendData = response.data

                // 转换 apis -> items
                const pageData = {
                    items: backendData.apis || [],
                    total: backendData.total_count || 0,
                    page: params.page,
                    page_size: params.pageSize
                }

                // 转换每个API项
                const apiList = pageData.items.map((item: any) =>
                    customApiAdapter.convertApiListItemToFrontend(item)
                )

                // 转换为前端期望的格式
                return {
                    data: customApiAdapter.convertBackendPageToFrontendPage({
                        items: apiList,
                        total: pageData.total,
                        page: params.page,
                        page_size: params.pageSize
                    }),
                    msg: response.message || '查询成功'
                }
            }

            return response
        } catch (error) {
            console.error('查询API列表失败:', error)
            throw error
        }
    }

    /**
     * 创建API
     */
    async createCustomApiData(params: CreateApiRequest): Promise<any> {
        try {
            // 转换为后端格式
            const backendParams = customApiAdapter.convertCreateRequestToBackend(params)

            const response = await http.request<ApiResponse<CreateApiResponse>>({
                method: 'post',
                url: '/api/v1/custom-api/custom-api/',
                params: backendParams
            })

            return {
                data: response.data,
                msg: response.message || '创建成功'
            }
        } catch (error) {
            console.error('创建API失败:', error)
            throw error
        }
    }

    /**
     * 更新API
     */
    async updateCustomApiData(apiId: number, params: UpdateApiRequest): Promise<any> {
        try {
            // 转换为后端格式
            const backendParams = customApiAdapter.convertUpdateRequestToBackend(params)

            const response = await http.request<ApiResponse<any>>({
                method: 'put',
                url: `/api/v1/custom-api/custom-api/${apiId}`,
                params: backendParams
            })

            return {
                data: response.data,
                msg: response.message || '更新成功'
            }
        } catch (error) {
            console.error('更新API失败:', error)
            throw error
        }
    }

    /**
     * 删除API
     */
    async deleteCustomApiData(apiId: number): Promise<any> {
        try {
            const response = await http.request<ApiResponse<any>>({
                method: 'delete',
                url: `/api/v1/custom-api/custom-api/${apiId}`
            })

            return {
                msg: response.message || '删除成功'
            }
        } catch (error) {
            console.error('删除API失败:', error)
            throw error
        }
    }

    /**
     * 获取API详情
     */
    async getCustomApiDetailData(apiId: number): Promise<any> {
        try {
            const response = await http.request<ApiResponse<any>>({
                method: 'get',
                url: `/api/v1/custom-api/custom-api/${apiId}`
            })

            if (response.data) {
                // 由于HTTP拦截器已转为驼峰,直接使用
                const apiDetail = response.data

                return {
                    data: apiDetail,
                    msg: response.message || '查询成功'
                }
            }

            return response
        } catch (error) {
            console.error('获取API详情失败:', error)
            throw error
        }
    }

    // ==================== API发布/下线接口 ====================

    /**
     * 发布API(注册到动态路由)
     */
    async publishCustomApiData(apiId: number): Promise<any> {
        try {
            const response = await http.request<ApiResponse<any>>({
                method: 'post',
                url: `/api/v1/custom-api/custom-api/${apiId}/register`
            })

            return {
                data: response.data,
                msg: response.message || '发布成功'
            }
        } catch (error) {
            console.error('发布API失败:', error)
            throw error
        }
    }

    /**
     * 下线API(注销动态路由)
     */
    async offlineCustomApiData(apiId: number): Promise<any> {
        try {
            const response = await http.request<ApiResponse<any>>({
                method: 'post',
                url: `/api/v1/custom-api/custom-api/${apiId}/unregister`
            })

            return {
                msg: response.message || '下线成功'
            }
        } catch (error) {
            console.error('下线API失败:', error)
            throw error
        }
    }

    /**
     * 切换API状态(启用/禁用)
     */
    async toggleApiStatus(apiId: number): Promise<any> {
        try {
            const response = await http.request<ApiResponse<any>>({
                method: 'post',
                url: `/api/v1/custom-api/custom-api/${apiId}/toggle`
            })

            return {
                data: response.data,
                msg: response.message || '操作成功'
            }
        } catch (error) {
            console.error('切换API状态失败:', error)
            throw error
        }
    }

    // ==================== API测试接口 ====================

    /**
     * 测试API
     */
    async testCustomApiData(params: TestApiRequest): Promise<any> {
        try {
            const response = await http.request<ApiResponse<any>>({
                method: 'post',
                url: `/api/v1/custom-api/custom-api/${params.id}/test`,
                params: {
                    header_params: params.headerParams || {},
                    request_body: params.requestBody || {}
                }
            })

            if (response.data) {
                // 转换测试结果
                const testResult = customApiAdapter.convertTestResultToFrontend(response.data)

                return {
                    data: {
                        ...testResult,
                        body: testResult.data,
                        msg: testResult.errorMessage || '测试成功'
                    },
                    msg: response.message || '测试完成'
                }
            }

            return response
        } catch (error) {
            console.error('测试API失败:', error)
            throw error
        }
    }

    // ==================== SQL验证接口 ====================

    /**
     * 验证SQL模板
     */
    async validateSqlTemplate(params: {
        sqlTemplate: string
        dataSourceId: number
    }): Promise<any> {
        try {
            const response = await http.request<ApiResponse<any>>({
                method: 'post',
                url: '/api/v1/custom-api/custom-api/validate-sql',
                params: {
                    sql_template: params.sqlTemplate,
                    data_source_id: params.dataSourceId
                }
            })

            if (response.data) {
                // 转换验证结果
                const validationResult = customApiAdapter.convertSqlValidationToFrontend(response.data)

                return {
                    data: validationResult,
                    msg: response.message || '验证完成'
                }
            }

            return response
        } catch (error) {
            console.error('验证SQL失败:', error)
            throw error
        }
    }

    // ==================== 统计接口 ====================

    /**
     * 获取API访问日志
     */
    async getApiAccessLogs(params: {
        apiId: number
        startTime?: string
        endTime?: string
        skip?: number
        limit?: number
    }): Promise<any> {
        try {
            const response = await http.request<ApiResponse<any>>({
                method: 'get',
                url: `/api/v1/custom-api/custom-api/${params.apiId}/logs`,
                params: {
                    start_time: params.startTime,
                    end_time: params.endTime,
                    skip: params.skip || 0,
                    limit: params.limit || 20
                }
            })

            return {
                data: response.data,
                msg: response.message || '查询成功'
            }
        } catch (error) {
            console.error('获取访问日志失败:', error)
            throw error
        }
    }

    /**
     * 获取API统计信息
     */
    async getApiStatistics(apiId: number): Promise<any> {
        try {
            const response = await http.request<ApiResponse<any>>({
                method: 'get',
                url: `/api/v1/custom-api/custom-api/${apiId}/statistics`
            })

            return {
                data: response.data,
                msg: response.message || '查询成功'
            }
        } catch (error) {
            console.error('获取统计信息失败:', error)
            throw error
        }
    }

    // ==================== 批量操作接口 ====================

    /**
     * 批量删除API
     */
    async batchDeleteApis(apiIds: number[]): Promise<any> {
        try {
            const response = await http.request<ApiResponse<any>>({
                method: 'post',
                url: '/api/v1/custom-api/custom-api/batch-delete',
                params: {
                    api_ids: apiIds
                }
            })

            return {
                data: response.data,
                msg: response.message || '批量删除成功'
            }
        } catch (error) {
            console.error('批量删除失败:', error)
            throw error
        }
    }

    /**
     * 批量发布API
     */
    async batchPublishApis(apiIds: number[]): Promise<any> {
        try {
            const response = await http.request<ApiResponse<any>>({
                method: 'post',
                url: '/api/v1/custom-api/custom-api/batch-register',
                params: {
                    api_ids: apiIds
                }
            })

            return {
                data: response.data,
                msg: response.message || '批量发布成功'
            }
        } catch (error) {
            console.error('批量发布失败:', error)
            throw error
        }
    }

    /**
     * 批量下线API
     */
    async batchOfflineApis(apiIds: number[]): Promise<any> {
        try {
            const response = await http.request<ApiResponse<any>>({
                method: 'post',
                url: '/api/v1/custom-api/custom-api/batch-unregister',
                params: {
                    api_ids: apiIds
                }
            })

            return {
                data: response.data,
                msg: response.message || '批量下线成功'
            }
        } catch (error) {
            console.error('批量下线失败:', error)
            throw error
        }
    }
}

// 导出服务实例
export const customApiService = new CustomApiService()

// 导出命名函数(兼容现有代码)
export const QueryCustomApiList = (params: any) => customApiService.queryCustomApiList(params)
export const CreateCustomApiData = (params: any) => customApiService.createCustomApiData(params)
export const UpdateCustomApiData = (apiId: number, params: any) => customApiService.updateCustomApiData(apiId, params)
export const DeleteCustomApiData = (apiId: number) => customApiService.deleteCustomApiData(apiId)
export const PublishCustomApiData = (params: any) => customApiService.publishCustomApiData(params.id)
export const OfflineCustomApiData = (params: any) => customApiService.offlineCustomApiData(params.id)
export const GetCustomApiDetailData = (apiId: number) => customApiService.getCustomApiDetailData(apiId)
export const TestCustomApiData = (params: any) => customApiService.testCustomApiData(params)
