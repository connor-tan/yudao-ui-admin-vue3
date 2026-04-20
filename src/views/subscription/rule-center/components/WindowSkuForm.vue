<template>
  <Dialog
    v-model="dialogVisible"
    :appendToBody="true"
    :scroll="true"
    :title="`配置 SKU：${productName}`"
    width="1000px"
  >
    <ContentWrap>
      <el-alert
        :closable="false"
        class="mb-12px"
        show-icon
        title="当前窗口只售卖与目标周期匹配的 SKU；新增或补齐的匹配 SKU 默认启用，周期不匹配的 SKU 不进入 app 可见结果。"
        type="info"
      />
      <el-table v-loading="loading" :data="list" :show-overflow-tooltip="true" :stripe="true">
        <el-table-column label="SKU" min-width="220">
          <template #default="{ row }">
            <div class="font-600">
              {{ [row.volumeLabel, row.editionLabel].filter(Boolean).join(' / ') || `SKU#${row.productSkuId}` }}
            </div>
            <div v-if="row.isbn" class="mt-1 text-12px text-gray-500">ISBN：{{ row.isbn }}</div>
            <div v-if="row.disabledReason" class="mt-1 text-12px text-[var(--el-color-danger)]">
              {{ row.disabledReason }}
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="适用周期" min-width="140">
          <template #default="{ row }">
            <el-tag :type="row.targetPeriodMatched === false ? 'danger' : 'success'">
              {{ getSubscriptionTargetPeriodLabel(row.productSkuTargetPeriod) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="价格" min-width="90">
          <template #default="{ row }">¥ {{ fenToYuan(row.price || 0) }}</template>
        </el-table-column>
        <el-table-column align="center" label="库存" min-width="90" prop="stock" />
        <el-table-column align="center" label="状态" min-width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :disabled="row.targetPeriodMatched === false && row.status !== 0"
              :active-value="0"
              :inactive-value="1"
              active-text="启用"
              inactive-text="停用"
              inline-prompt
            />
          </template>
        </el-table-column>
        <el-table-column align="center" label="排序" min-width="110">
          <template #default="{ row }">
            <el-input-number v-model="row.sort" :min="0" class="!w-100px" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="每生限购" min-width="120">
          <template #default="{ row }">
            <el-input-number v-model="row.maxQuantityPerStudent" :min="1" class="!w-110px" />
          </template>
        </el-table-column>
        <el-table-column label="备注" min-width="180">
          <template #default="{ row }">
            <el-input v-model="row.remark" maxlength="100" placeholder="请输入备注" />
          </template>
        </el-table-column>
      </el-table>
    </ContentWrap>
    <template #footer>
      <el-button :disabled="loading || submitLoading" type="primary" @click="submitForm">保 存</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { fenToYuan } from '@/utils'
import { getSubscriptionTargetPeriodLabel } from '@/utils/subscription'
import { SubscriptionWindowSkuApi, type SubscriptionWindowSku } from '@/api/subscription/windowSku'

defineOptions({ name: 'SubscriptionWindowSkuForm' })

const message = useMessage()
const dialogVisible = ref(false)
const loading = ref(false)
const submitLoading = ref(false)
const windowSpuId = ref<number>()
const productName = ref('')
const list = ref<SubscriptionWindowSku[]>([])

const open = async (selectedWindowSpuId: number, selectedProductName: string) => {
  dialogVisible.value = true
  windowSpuId.value = selectedWindowSpuId
  productName.value = selectedProductName
  await getList()
}
defineExpose({ open })

const emit = defineEmits(['success'])

const getList = async () => {
  if (!windowSpuId.value) {
    return
  }
  loading.value = true
  try {
    list.value = await SubscriptionWindowSkuApi.getListByWindowSpu(windowSpuId.value)
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  if (!windowSpuId.value) {
    return
  }
  submitLoading.value = true
  try {
    await SubscriptionWindowSkuApi.batchUpdate({
      windowSpuId: windowSpuId.value,
      items: list.value.map((item) => ({
        id: item.id,
        status: item.status,
        sort: item.sort,
        maxQuantityPerStudent: item.maxQuantityPerStudent,
        remark: item.remark
      }))
    })
    message.success('保存成功')
    dialogVisible.value = false
    emit('success')
  } finally {
    submitLoading.value = false
  }
}
</script>
