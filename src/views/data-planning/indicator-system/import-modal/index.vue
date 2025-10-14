<template>
  <BlockModal :model-config="modelConfig">
    <div class="import-container">
      <!-- 步骤1：上传文件 -->
      <el-alert
          title="导入说明"
          type="info"
          :closable="false"
          style="margin-bottom: 20px"
      >
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>请先下载Excel模板，按模板格式填写数据</li>
          <li>Excel文件第一行为中文表头，第二行为英文字段名，从第三行开始填写数据</li>
          <li>只有"指标名称"为必填字段，其他字段均可选</li>
          <li>支持.xlsx和.xls格式的Excel文件</li>
          <li>单次最多导入1000条数据</li>
          <li>导入失败的行会在结果中显示详细错误信息</li>
        </ul>
      </el-alert>

      <el-upload
          ref="uploadRef"
          class="upload-area"
          drag
          :auto-upload="false"
          :limit="1"
          accept=".xlsx,.xls"
          :on-change="handleFileChange"
          :on-exceed="handleExceed"
          :file-list="fileList"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将Excel文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 .xlsx、.xls 格式，文件大小不超过10MB
          </div>
        </template>
      </el-upload>

      <!-- 步骤2：导入结果 -->
      <div v-if="importResult" class="import-result">
        <el-divider>导入结果</el-divider>

        <el-result
            :icon="importResult.failed_count === 0 ? 'success' : 'warning'"
            :title="importResult.message"
        >
          <template #sub-title>
            <div class="result-summary">
              <p>总行数：{{ importResult.total_rows }}</p>
              <p>成功导入：<span class="success-text">{{ importResult.success_count }}</span> 条</p>
              <p v-if="importResult.failed_count > 0">
                导入失败：<span class="error-text">{{ importResult.failed_count }}</span> 条
              </p>
            </div>
          </template>
          <template #extra>
            <el-button type="primary" @click="closeAndRefresh">
              完成
            </el-button>
          </template>
        </el-result>

        <!-- 失败详情 -->
        <div v-if="importResult.failed_rows && importResult.failed_rows.length > 0" class="failed-details">
          <el-collapse>
            <el-collapse-item title="查看失败详情" name="1">
              <el-table
                  :data="importResult.failed_rows"
                  style="width: 100%"
                  max-height="300"
              >
                <el-table-column
                    prop="row"
                    label="行号"
                    width="80"
                />
                <el-table-column
                    label="指标名称"
                    width="180"
                >
                  <template #default="scope">
                    {{ getIndicatorName(scope.row.data) }}
                  </template>
                </el-table-column>
                <el-table-column
                    prop="error"
                    label="失败原因"
                    show-overflow-tooltip
                />
              </el-table>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="closeEvent">取消</el-button>
      <el-button
          type="primary"
          :loading="importing"
          :disabled="!fileList.length || importing || !!importResult"
          @click="startImport"
      >
        开始导入
      </el-button>
    </template>
  </BlockModal>
</template>

<script lang="ts" setup>
import { ref, reactive, defineEmits } from 'vue'
import BlockModal from '@/components/block-modal/index.vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { ImportFromExcel } from '@/services/indicator-system.service'

const emit = defineEmits(['refresh'])

const modelConfig = reactive({
  title: '批量导入指标',
  visible: false,
  width: '700px',
  needScale: false,
  zIndex: 1100,
  closeOnClickModal: false,
  okConfig: {
    title: '开始导入',
    ok: startImport,
    disabled: false,
    loading: false
  },
  cancelConfig: {
    title: '取消',
    cancel: closeEvent,
    disabled: false
  }
})

const uploadRef = ref<any>(null)
const fileList = ref<any[]>([])
const importing = ref(false)
const importResult = ref<any>(null)

function showModal() {
  modelConfig.visible = true
  resetForm()
}

function resetForm() {
  fileList.value = []
  importResult.value = null
  importing.value = false
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

function handleFileChange(file: any, files: any[]) {
  // 验证文件类型
  const fileName = file.name
  const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls')

  if (!isExcel) {
    ElMessage.error('只支持上传Excel文件（.xlsx或.xls）')
    files.pop()
    return
  }

  // 验证文件大小（10MB）
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('上传文件大小不能超过 10MB')
    files.pop()
    return
  }

  fileList.value = files
}

function handleExceed() {
  ElMessage.warning('只能上传一个文件，请先移除已上传的文件')
}

function startImport() {
  if (!fileList.value.length) {
    ElMessage.warning('请先上传Excel文件')
    return
  }

  modelConfig.okConfig.loading = true
  modelConfig.okConfig.disabled = true

  // 🆕 显示进度提示
  const progressMsg = ElMessage({
    message: '正在导入，请稍候...（数据量大可能需要几分钟）',
    type: 'info',
    duration: 0,
    showClose: false
  })

  const file = fileList.value[0].raw

  ImportFromExcel(file)
      .then((res: any) => {
        progressMsg.close()  // 🆕 关闭进度提示

        if (res.success && res.data) {
          importResult.value = res.data

          if (res.data.failed_count === 0) {
            ElMessage.success('导入成功！')
          } else {
            ElMessage.warning(`导入完成，但有 ${res.data.failed_count} 条数据导入失败`)
          }
        } else {
          ElMessage.error(res.message || '导入失败')
        }
      })
      .catch((error: any) => {
        progressMsg.close()  // 🆕 关闭进度提示
        console.error('导入失败:', error)

        // 🆕 区分超时错误
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          ElMessage.error('导入超时，请减少数据量或联系管理员')
        } else {
          ElMessage.error('导入失败，请检查文件格式')
        }
      })
      .finally(() => {
        modelConfig.okConfig.loading = false
        modelConfig.okConfig.disabled = false
      })
}

function getIndicatorName(data: any[]) {
  // 指标名称在第5列（索引4）
  return data && data[4] ? data[4] : '未知'
}

function closeAndRefresh() {
  if (importResult.value && importResult.value.success_count > 0) {
    emit('refresh')
  }
  closeEvent()
}

function closeEvent() {
  modelConfig.visible = false
  setTimeout(() => {
    resetForm()
  }, 300)
}

defineExpose({
  showModal
})
</script>

<style lang="scss" scoped>
.import-container {
  padding: 20px;

  .upload-area {
    margin: 20px 0;

    :deep(.el-upload) {
      width: 100%;
    }

    :deep(.el-upload-dragger) {
      width: 100%;
      height: 200px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .el-icon--upload {
      font-size: 67px;
      color: #409eff;
      margin-bottom: 16px;
    }
  }

  .import-result {
    margin-top: 20px;

    .result-summary {
      text-align: center;
      font-size: 14px;
      line-height: 1.8;

      p {
        margin: 5px 0;
      }

      .success-text {
        color: #67c23a;
        font-weight: bold;
      }

      .error-text {
        color: #f56c6c;
        font-weight: bold;
      }
    }

    .failed-details {
      margin-top: 20px;
      padding: 0 20px;
    }
  }
}
</style>