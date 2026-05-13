<template>
  <Dialog v-model="dialogVisible" title="批量导入后台订单" width="460px">
    <el-upload
      ref="uploadRef"
      v-model:file-list="fileList"
      :auto-upload="false"
      :disabled="formLoading"
      :limit="1"
      :on-exceed="handleExceed"
      accept=".xlsx,.xls"
      action="none"
      drag
    >
      <Icon icon="ep:upload" />
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip text-center">
          <span>仅允许导入 xls、xlsx 格式文件。</span>
          <el-link
            :underline="false"
            style="font-size: 12px; vertical-align: baseline"
            type="primary"
            @click="importTemplate"
          >
            下载模板
          </el-link>
        </div>
      </template>
    </el-upload>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import type { UploadUserFile } from 'element-plus'
import * as TradeOrderApi from '@/api/mall/trade/order'
import download from '@/utils/download'

defineOptions({ name: 'OrderManualImportForm' })

const emit = defineEmits(['success'])
const message = useMessage()
const dialogVisible = ref(false)
const formLoading = ref(false)
const uploadRef = ref()
const fileList = ref<UploadUserFile[]>([])

const open = async () => {
  resetForm()
  dialogVisible.value = true
}
defineExpose({ open })

const submitForm = async () => {
  if (!fileList.value.length) {
    message.error('请上传文件')
    return
  }
  formLoading.value = true
  try {
    const formData = new FormData()
    formData.append('file', fileList.value[0].raw as Blob)
    const response = await TradeOrderApi.importManualOrder(formData)
    submitFormSuccess(response as any)
  } catch {
    message.error('上传失败，请重新上传')
  } finally {
    formLoading.value = false
  }
}

const submitFormSuccess = (response: any) => {
  if (response.code !== 0) {
    message.error(response.msg)
    return
  }
  const data = response.data as TradeOrderApi.ManualOrderImportRespVO
  const results = data.items
    .map((item) => {
      const status = item.success ? `成功 #${item.orderId}` : '失败'
      return `${item.importOrderNo || '-'}：${status}${item.message ? `，${item.message}` : ''}`
    })
    .join('\n')
  message.alert(`导入成功 ${data.successCount} 单，失败 ${data.failureCount} 单。\n${results}`)
  dialogVisible.value = false
  emit('success', true)
}

const resetForm = async () => {
  fileList.value = []
  await nextTick()
  uploadRef.value?.clearFiles()
}

const handleExceed = () => {
  message.error('最多只能上传一个文件')
}

const importTemplate = async () => {
  const res = await TradeOrderApi.importManualOrderTemplate()
  download.excel(res, '后台订单导入模板.xls')
}
</script>
