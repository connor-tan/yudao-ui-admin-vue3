<template>
  <Dialog v-model="dialogVisible" title="配置窗口 SKU" width="980px">
    <div class="mb-12px flex justify-between">
      <div class="text-13px text-[var(--el-text-color-secondary)]">
        商品中心新增 SKU 后，需要在这里手动同步后才会进入窗口规则和 app 可售范围。
      </div>
      <el-button :loading="syncLoading" plain type="primary" @click="handleSyncSku">
        同步商品 SKU
      </el-button>
    </div>
    <el-table v-loading="loading" :data="list" :show-overflow-tooltip="true" :stripe="true">
      <el-table-column label="SKU" min-width="180" prop="productSkuName" />
      <el-table-column label="周期" width="100">
        <template #default="{ row }">{{ getSubscriptionTargetPeriodLabel(row.targetPeriod) }}</template>
      </el-table-column>
      <el-table-column label="册别" width="100">
        <template #default="{ row }">
          {{ formatPublicationDict(DICT_TYPE.EDU_PUBLICATION_VOLUME, row.volumeLabel) }}
        </template>
      </el-table-column>
      <el-table-column label="版本" width="120">
        <template #default="{ row }">
          {{ formatPublicationDict(DICT_TYPE.EDU_PUBLICATION_EDITION, row.editionLabel) }}
        </template>
      </el-table-column>
      <el-table-column label="适用年级" min-width="160" prop="applicableGradeNames" />
      <el-table-column align="center" label="限购" width="120">
        <template #default="{ row }">
          <el-input-number v-model="row.maxQuantityPerStudent" :min="1" :step="1" class="!w-90px" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="排序" width="110">
        <template #default="{ row }">
          <el-input-number v-model="row.sort" :min="0" :step="1" class="!w-90px" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" width="110">
        <template #default="{ row }">
          <el-switch v-model="row.status" :active-value="0" :inactive-value="1" />
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button :loading="submitLoading" type="primary" @click="submitForm">保 存</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { DICT_TYPE, getDictLabel } from '@/utils/dict'
import { getSubscriptionTargetPeriodLabel } from '@/utils/subscription'
import { SubscriptionOfferSkuApi, type SubscriptionOfferSku } from '@/api/subscription/offerSku'

defineOptions({ name: 'SubscriptionOfferSkuForm' })

const message = useMessage()
const dialogVisible = ref(false)
const loading = ref(false)
const syncLoading = ref(false)
const submitLoading = ref(false)
const offerId = ref<number>()
const list = ref<SubscriptionOfferSku[]>([])

const formatPublicationDict = (dictType: string, value?: string) => {
  if (!value) {
    return '-'
  }
  return getDictLabel(dictType, value) || value
}

const open = async (id: number) => {
  offerId.value = id
  dialogVisible.value = true
  await getList()
}
defineExpose({ open })

const getList = async () => {
  if (!offerId.value) return
  loading.value = true
  try {
    list.value = await SubscriptionOfferSkuApi.getOfferSkuList(offerId.value)
  } finally {
    loading.value = false
  }
}

const handleSyncSku = async () => {
  if (!offerId.value) return
  syncLoading.value = true
  try {
    const count = await SubscriptionOfferSkuApi.syncOfferSku(offerId.value)
    message.success(`同步完成，新增 ${count || 0} 个窗口 SKU`)
    await getList()
    emit('success')
  } finally {
    syncLoading.value = false
  }
}

const emit = defineEmits(['success'])
const submitForm = async () => {
  if (!offerId.value) return
  submitLoading.value = true
  try {
    await SubscriptionOfferSkuApi.batchUpdateOfferSku({ offerId: offerId.value, skus: list.value })
    message.success('保存成功')
    dialogVisible.value = false
    emit('success')
  } finally {
    submitLoading.value = false
  }
}
</script>
