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
      <el-table-column align="center" label="履约" width="120">
        <template #default="{ row }">
          <div>{{ formatIssueMode(row.issueMode) }}</div>
          <div v-if="row.issueMode === ProductSpuApi.PUBLICATION_ISSUE_MODE_PERIODICAL" class="text-xs text-gray-500">
            {{ row.issueCount || 0 }} 期
          </div>
        </template>
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
      <el-table-column align="center" fixed="right" label="期次计划" width="110">
        <template #default="{ row }">
          <el-button
            v-if="row.issueMode === ProductSpuApi.PUBLICATION_ISSUE_MODE_PERIODICAL"
            link
            type="primary"
            @click="openIssueDialog(row)"
          >
            维护
          </el-button>
          <span v-else>-</span>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button :loading="submitLoading" type="primary" @click="submitForm">保 存</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>

  <Dialog
    v-model="issueDialogVisible"
    :title="`期次计划${currentIssueOfferSku?.productSkuName ? ' - ' + currentIssueOfferSku.productSkuName : ''}`"
    width="1080px"
  >
    <el-form :inline="true" :model="generateForm" label-width="92px">
      <el-form-item label="起始期号">
        <el-input-number v-model="generateForm.startIssueNo" :min="1" :step="1" class="!w-120px" />
      </el-form-item>
      <el-form-item label="生成期数">
        <el-input-number v-model="generateForm.issueCount" :min="1" :step="1" class="!w-120px" />
      </el-form-item>
      <el-form-item label="名称前缀">
        <el-input v-model="generateForm.issueNamePrefix" class="!w-120px" placeholder="第" />
      </el-form-item>
      <el-form-item label="首发刊日">
        <el-date-picker
          v-model="generateForm.firstPublishDate"
          class="!w-150px"
          type="date"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="发刊间隔">
        <el-input-number
          v-model="generateForm.publishIntervalDays"
          :min="1"
          :step="1"
          class="!w-120px"
        />
      </el-form-item>
      <el-form-item label="首配送日">
        <el-date-picker
          v-model="generateForm.firstDeliveryDate"
          class="!w-150px"
          type="date"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="配送间隔">
        <el-input-number
          v-model="generateForm.deliveryIntervalDays"
          :min="1"
          :step="1"
          class="!w-120px"
        />
      </el-form-item>
      <el-form-item>
        <el-button :loading="issueSubmitLoading" plain type="primary" @click="handleGenerateIssues">
          批量生成
        </el-button>
      </el-form-item>
    </el-form>

    <el-divider />
    <el-form
      ref="issueFormRef"
      :inline="true"
      :model="issueForm"
      :rules="issueRules"
      label-width="92px"
    >
      <el-form-item label="期号" prop="issueNo">
        <el-input-number v-model="issueForm.issueNo" :min="1" :step="1" class="!w-120px" />
      </el-form-item>
      <el-form-item label="期次名称" prop="issueName">
        <el-input v-model="issueForm.issueName" class="!w-160px" placeholder="请输入期次名称" />
      </el-form-item>
      <el-form-item label="计划发刊">
        <el-date-picker
          v-model="issueForm.plannedPublishDate"
          class="!w-150px"
          type="date"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="计划配送">
        <el-date-picker
          v-model="issueForm.plannedDeliveryDate"
          class="!w-150px"
          type="date"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="排序">
        <el-input-number v-model="issueForm.sort" :min="0" :step="1" class="!w-120px" />
      </el-form-item>
      <el-form-item label="状态">
        <el-switch v-model="issueForm.status" :active-value="0" :inactive-value="1" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="issueForm.remark" class="!w-180px" placeholder="请输入备注" />
      </el-form-item>
      <el-form-item>
        <el-button :loading="issueSubmitLoading" type="primary" @click="submitIssueForm">
          {{ issueForm.id ? '保存' : '新增' }}
        </el-button>
        <el-button @click="resetIssueForm">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="issueLoading" :data="issueList" border>
      <el-table-column align="center" label="期号" prop="issueNo" width="90" />
      <el-table-column label="期次名称" min-width="160" prop="issueName" />
      <el-table-column align="center" label="计划发刊" prop="plannedPublishDate" width="130" />
      <el-table-column align="center" label="计划配送" prop="plannedDeliveryDate" width="130" />
      <el-table-column align="center" label="排序" prop="sort" width="90" />
      <el-table-column align="center" label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 0 ? 'success' : 'info'">
            {{ row.status === 0 ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" min-width="160" prop="remark" />
      <el-table-column align="center" fixed="right" label="操作" width="130">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEditIssue(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDeleteIssue(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </Dialog>
</template>

<script setup lang="ts">
import { DICT_TYPE, getDictLabel } from '@/utils/dict'
import { SubscriptionOfferSkuApi, type SubscriptionOfferSku } from '@/api/subscription/offerSku'
import {
  SubscriptionOfferSkuIssueApi,
  type SubscriptionOfferSkuIssue
} from '@/api/subscription/offerSkuIssue'
import * as ProductSpuApi from '@/api/mall/product/spu'

defineOptions({ name: 'SubscriptionOfferSkuForm' })

const message = useMessage()
const dialogVisible = ref(false)
const loading = ref(false)
const syncLoading = ref(false)
const submitLoading = ref(false)
const issueLoading = ref(false)
const issueSubmitLoading = ref(false)
const offerId = ref<number>()
const list = ref<SubscriptionOfferSku[]>([])
const issueDialogVisible = ref(false)
const currentIssueOfferSku = ref<SubscriptionOfferSku>()
const issueList = ref<SubscriptionOfferSkuIssue[]>([])
const issueFormRef = ref()

const createIssueForm = (): SubscriptionOfferSkuIssue => ({
  offerSkuId: undefined,
  issueNo: 1,
  issueName: '',
  plannedPublishDate: undefined,
  plannedDeliveryDate: undefined,
  sort: 0,
  status: 0,
  remark: ''
})
const issueForm = reactive<SubscriptionOfferSkuIssue>(createIssueForm())
const issueRules = reactive({
  issueNo: [required],
  issueName: [required]
})
const generateForm = reactive({
  startIssueNo: 1,
  issueCount: 12,
  issueNamePrefix: '第',
  firstPublishDate: undefined as string | undefined,
  publishIntervalDays: 30,
  firstDeliveryDate: undefined as string | undefined,
  deliveryIntervalDays: 30
})

const formatPublicationDict = (dictType: string, value?: string) => {
  if (!value) {
    return '-'
  }
  return getDictLabel(dictType, value) || value
}

const formatIssueMode = (issueMode?: string) => {
  return (
    ProductSpuApi.PUBLICATION_ISSUE_MODE_OPTIONS.find((item) => item.value === issueMode)?.label ||
    '独立刊物'
  )
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

const getIssueList = async () => {
  if (!currentIssueOfferSku.value?.id) {
    return
  }
  issueLoading.value = true
  try {
    issueList.value = await SubscriptionOfferSkuIssueApi.getIssueList(currentIssueOfferSku.value.id)
  } finally {
    issueLoading.value = false
  }
}

const openIssueDialog = async (row: SubscriptionOfferSku) => {
  if (!row.id) {
    return
  }
  currentIssueOfferSku.value = row
  issueDialogVisible.value = true
  resetIssueForm()
  await getIssueList()
}

const resetIssueForm = () => {
  Object.assign(issueForm, createIssueForm(), {
    offerSkuId: currentIssueOfferSku.value?.id,
    issueNo: (issueList.value?.length || 0) + 1,
    sort: (issueList.value?.length || 0) + 1
  })
  issueFormRef.value?.clearValidate?.()
}

const handleEditIssue = (row: SubscriptionOfferSkuIssue) => {
  Object.assign(issueForm, createIssueForm(), row)
}

const submitIssueForm = async () => {
  if (!currentIssueOfferSku.value?.id) {
    return
  }
  await issueFormRef.value?.validate()
  issueSubmitLoading.value = true
  try {
    const data = {
      ...issueForm,
      offerSkuId: currentIssueOfferSku.value.id
    }
    if (data.id) {
      await SubscriptionOfferSkuIssueApi.updateIssue(data)
    } else {
      await SubscriptionOfferSkuIssueApi.createIssue(data)
    }
    message.success('保存成功')
    await getIssueList()
    resetIssueForm()
    await getList()
  } finally {
    issueSubmitLoading.value = false
  }
}

const handleGenerateIssues = async () => {
  if (!currentIssueOfferSku.value?.id) {
    return
  }
  issueSubmitLoading.value = true
  try {
    const count = await SubscriptionOfferSkuIssueApi.generateIssues({
      ...generateForm,
      offerSkuId: currentIssueOfferSku.value.id
    })
    message.success(`生成完成，新增 ${count || 0} 条期次`)
    await getIssueList()
    resetIssueForm()
    await getList()
  } finally {
    issueSubmitLoading.value = false
  }
}

const handleDeleteIssue = async (id?: number) => {
  if (!id) {
    return
  }
  try {
    await message.confirm('确认删除该期次吗？')
  } catch {
    return
  }
  await SubscriptionOfferSkuIssueApi.deleteIssue(id)
  message.success('删除成功')
  await getIssueList()
  resetIssueForm()
  await getList()
}
</script>
