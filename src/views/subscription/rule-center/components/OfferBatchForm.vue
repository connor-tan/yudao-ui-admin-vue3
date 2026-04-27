<template>
  <Dialog
    v-model="dialogVisible"
    :appendToBody="true"
    :close-on-click-modal="false"
    title="批量添加窗口刊物"
    width="1500px"
  >
    <ContentWrap>
      <el-form
        ref="queryFormRef"
        :inline="true"
        :model="queryParams"
        class="-mb-15px"
        label-width="82px"
      >
        <el-form-item label="刊物名称" prop="productName">
          <el-input
            v-model="queryParams.productName"
            class="!w-220px"
            clearable
            placeholder="请输入刊物名称"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="商品分类" prop="categoryId">
          <el-tree-select
            v-model="queryParams.categoryId"
            :data="categoryTreeList"
            :props="defaultProps"
            check-strictly
            class="!w-220px"
            clearable
            node-key="id"
            placeholder="请选择商品分类"
          />
        </el-form-item>
        <el-form-item label="出版社" prop="publisherId">
          <el-select
            v-model="queryParams.publisherId"
            class="!w-180px"
            clearable
            filterable
            placeholder="请选择出版社"
          >
            <el-option
              v-for="item in publisherList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="刊物类型" prop="publicationTypeId">
          <el-select
            v-model="queryParams.publicationTypeId"
            class="!w-180px"
            clearable
            filterable
            placeholder="请选择刊物类型"
          >
            <el-option
              v-for="item in publicationTypeList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="出刊周期" prop="issueCycle">
          <el-select
            v-model="queryParams.issueCycle"
            class="!w-160px"
            clearable
            placeholder="请选择出刊周期"
          >
            <el-option
              v-for="dict in getStrDictOptions(DICT_TYPE.EDU_CYCLE)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="适用年级" prop="gradeCatalogId">
          <el-select
            v-model="queryParams.gradeCatalogId"
            class="!w-160px"
            clearable
            filterable
            placeholder="请选择年级"
          >
            <el-option
              v-for="item in gradeList"
              :key="item.id"
              :label="item.gradeName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="候选状态" prop="candidateStatus">
          <el-select v-model="queryParams.candidateStatus" class="!w-150px">
            <el-option
              v-for="item in candidateStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="handleQuery">
            <Icon class="mr-5px" icon="ep:search" />
            搜索
          </el-button>
          <el-button @click="resetQuery">
            <Icon class="mr-5px" icon="ep:refresh" />
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </ContentWrap>

    <ContentWrap title="候选刊物">
      <template #header>
        <div class="flex flex-1 items-center justify-end">
          <el-button :disabled="selectedRows.length === 0" @click="addSelectedToPending">
            加入选中
          </el-button>
          <el-button :disabled="currentPageCanAddRows.length === 0" @click="addCurrentPageToPending">
            一键加入当前页
          </el-button>
          <el-button :loading="submitLoading" type="primary" @click="submitCurrentQuery">
            添加当前筛选结果
          </el-button>
        </div>
      </template>
      <el-table
        v-loading="loading"
        :data="list"
        :show-overflow-tooltip="true"
        :stripe="true"
        max-height="430"
        row-key="productSpuId"
        @selection-change="handleSelectionChange"
      >
        <el-table-column :selectable="isSelectable" type="selection" width="55" />
        <el-table-column label="刊物信息" min-width="260">
          <template #default="{ row }">
            <div class="flex items-center">
              <el-image
                v-if="row.picUrl"
                :src="row.picUrl"
                class="h-50px w-50px flex-none rounded"
                fit="cover"
              />
              <div
                v-else
                class="h-50px w-50px flex flex-none items-center justify-center rounded bg-[var(--el-fill-color-light)] text-[var(--el-text-color-secondary)]"
              >
                <Icon icon="ep:picture" />
              </div>
              <div class="ml-12px min-w-0">
                <div class="truncate font-600">{{ row.productName }}</div>
                <div class="mt-1 text-12px text-gray-500">SPU：{{ row.productSpuId }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="分类" min-width="130" prop="categoryName" />
        <el-table-column label="出版社" min-width="130" prop="publisherName" />
        <el-table-column label="刊物类型" min-width="120" prop="publicationTypeName" />
        <el-table-column label="出刊周期" min-width="110">
          <template #default="{ row }">{{ formatIssueCycle(row.issueCycle) }}</template>
        </el-table-column>
        <el-table-column label="匹配年级" min-width="150">
          <template #default="{ row }">{{ joinText(row.matchedGradeNames) }}</template>
        </el-table-column>
        <el-table-column align="center" label="匹配 SKU" width="105">
          <template #default="{ row }">{{ row.matchedSkuCount || 0 }}/{{ row.totalSkuCount || 0 }}</template>
        </el-table-column>
        <el-table-column align="center" label="候选状态" width="140">
          <template #default="{ row }">
            <el-tag :type="getCandidateStatusType(row.candidateStatus)">
              {{ getCandidateStatusLabel(row.candidateStatus) }}
            </el-tag>
            <div v-if="row.disabledReason" class="mt-4px text-12px text-[var(--el-text-color-secondary)]">
              {{ row.disabledReason }}
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="价格" width="100">
          <template #default="{ row }">¥ {{ fenToYuan(row.price || 0) }}</template>
        </el-table-column>
        <el-table-column align="center" label="库存" width="90" prop="stock" />
      </el-table>
      <Pagination
        v-model:limit="queryParams.pageSize"
        v-model:page="queryParams.pageNo"
        :total="total"
        @pagination="getList"
      />
    </ContentWrap>

    <ContentWrap :title="'待添加列表（' + pendingItems.length + '）'">
      <template #header>
        <div class="flex flex-1 items-center justify-end">
          <el-button :disabled="pendingItems.length === 0" text type="danger" @click="clearPending">
            清空
          </el-button>
        </div>
      </template>
      <el-alert
        v-if="batchResult"
        :closable="false"
        class="mb-12px"
        show-icon
        type="success"
      >
        <template #title>
          新增刊物 {{ batchResult.createdOfferCount || 0 }} 个，初始化窗口 SKU
          {{ batchResult.createdOfferSkuCount || 0 }} 个，跳过 {{ batchResult.skippedCount || 0 }} 个
        </template>
      </el-alert>
      <el-table :data="pendingItems" :show-overflow-tooltip="true" max-height="220" row-key="productSpuId">
        <el-table-column label="刊物名称" min-width="240" prop="productName" />
        <el-table-column label="出版社" min-width="130" prop="publisherName" />
        <el-table-column label="刊物类型" min-width="120" prop="publicationTypeName" />
        <el-table-column label="匹配年级" min-width="150">
          <template #default="{ row }">{{ joinText(row.matchedGradeNames) }}</template>
        </el-table-column>
        <el-table-column align="center" label="匹配 SKU" width="100">
          <template #default="{ row }">{{ row.matchedSkuCount || 0 }}</template>
        </el-table-column>
        <el-table-column label="失败原因" min-width="180">
          <template #default="{ row }">{{ skippedReasonMap[row.productSpuId] || '-' }}</template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="90">
          <template #default="{ row }">
            <el-button link type="danger" @click="removePending(row.productSpuId)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </ContentWrap>

    <template #footer>
      <el-button
        :disabled="pendingItems.length === 0"
        :loading="submitLoading"
        type="primary"
        @click="submitPending"
      >
        提交待添加
      </el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { fenToYuan } from '@/utils'
import { DICT_TYPE, getDictLabel, getStrDictOptions } from '@/utils/dict'
import { defaultProps, handleTree } from '@/utils/tree'
import * as ProductCategoryApi from '@/api/mall/product/category'
import { BIZ_SCENE_PUBLICATION } from '@/api/mall/product/spu'
import {
  getPublicationPublisherSimpleList,
  type PublicationPublisherSimpleVO
} from '@/api/edu/publicationPublisher'
import {
  getPublicationTypeSimpleList,
  type PublicationTypeSimpleVO
} from '@/api/edu/publicationType'
import { SchoolApi, type GradeCatalog } from '@/api/edu/school'
import {
  SubscriptionOfferApi,
  type SubscriptionOfferAvailable,
  type SubscriptionOfferBatchCreateResp
} from '@/api/subscription/offer'

defineOptions({ name: 'SubscriptionOfferBatchForm' })

const CANDIDATE_STATUS_CAN_ADD = 'CAN_ADD'
const CANDIDATE_STATUS_ADDED = 'ADDED'
const CANDIDATE_STATUS_NO_MATCHED_SKU = 'NO_MATCHED_SKU'
const CANDIDATE_STATUS_DISABLED = 'DISABLED'
const CANDIDATE_STATUS_ALL = 'ALL'

const candidateStatusOptions = [
  { value: CANDIDATE_STATUS_CAN_ADD, label: '可添加' },
  { value: CANDIDATE_STATUS_ADDED, label: '已添加' },
  { value: CANDIDATE_STATUS_NO_MATCHED_SKU, label: '无匹配周期 SKU' },
  { value: CANDIDATE_STATUS_DISABLED, label: '不可用' },
  { value: CANDIDATE_STATUS_ALL, label: '全部' }
]

const message = useMessage()
const emit = defineEmits(['success'])
const dialogVisible = ref(false)
const loading = ref(false)
const submitLoading = ref(false)
const queryFormRef = ref()
const windowId = ref<number>()
const total = ref(0)
const list = ref<SubscriptionOfferAvailable[]>([])
const selectedRows = ref<SubscriptionOfferAvailable[]>([])
const pendingItems = ref<SubscriptionOfferAvailable[]>([])
const skippedReasonMap = ref<Record<number, string>>({})
const batchResult = ref<SubscriptionOfferBatchCreateResp>()
const categoryTreeList = ref<ProductCategoryApi.CategoryVO[]>([])
const publisherList = ref<PublicationPublisherSimpleVO[]>([])
const publicationTypeList = ref<PublicationTypeSimpleVO[]>([])
const gradeList = ref<GradeCatalog[]>([])

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  productName: undefined as string | undefined,
  categoryId: undefined as number | undefined,
  publisherId: undefined as number | undefined,
  publicationTypeId: undefined as number | undefined,
  issueCycle: undefined as string | undefined,
  gradeCatalogId: undefined as number | undefined,
  candidateStatus: CANDIDATE_STATUS_CAN_ADD
})

const pendingIdSet = computed(() => new Set(pendingItems.value.map((item) => item.productSpuId)))
const currentPageCanAddRows = computed(() =>
  list.value.filter((item) => item.candidateStatus === CANDIDATE_STATUS_CAN_ADD && !pendingIdSet.value.has(item.productSpuId))
)

const open = async (id: number) => {
  windowId.value = id
  dialogVisible.value = true
  selectedRows.value = []
  pendingItems.value = []
  skippedReasonMap.value = {}
  batchResult.value = undefined
  resetQueryParams()
  await loadOptions()
  await getList()
}
defineExpose({ open })

const loadOptions = async () => {
  const [categories, publishers, publicationTypes, grades] = await Promise.all([
    ProductCategoryApi.getCategoryList({ bizScene: BIZ_SCENE_PUBLICATION }),
    getPublicationPublisherSimpleList(),
    getPublicationTypeSimpleList(),
    SchoolApi.getGradeCatalogSimpleList()
  ])
  categoryTreeList.value = handleTree(categories)
  publisherList.value = publishers
  publicationTypeList.value = publicationTypes
  gradeList.value = grades
}

const getList = async () => {
  if (!windowId.value) return
  loading.value = true
  try {
    const data = await SubscriptionOfferApi.getAvailablePage({
      ...queryParams,
      windowId: windowId.value
    })
    list.value = data.list || []
    total.value = data.total || 0
    selectedRows.value = []
  } finally {
    loading.value = false
  }
}

const handleQuery = async () => {
  queryParams.pageNo = 1
  await getList()
}

const resetQuery = async () => {
  queryFormRef.value?.resetFields()
  resetQueryParams()
  await handleQuery()
}

const resetQueryParams = () => {
  Object.assign(queryParams, {
    pageNo: 1,
    pageSize: 10,
    productName: undefined,
    categoryId: undefined,
    publisherId: undefined,
    publicationTypeId: undefined,
    issueCycle: undefined,
    gradeCatalogId: undefined,
    candidateStatus: CANDIDATE_STATUS_CAN_ADD
  })
}

const handleSelectionChange = (rows: SubscriptionOfferAvailable[]) => {
  selectedRows.value = rows
}

const isSelectable = (row: SubscriptionOfferAvailable) => {
  return row.candidateStatus === CANDIDATE_STATUS_CAN_ADD && !pendingIdSet.value.has(row.productSpuId)
}

const addSelectedToPending = () => {
  addRowsToPending(selectedRows.value)
}

const addCurrentPageToPending = () => {
  addRowsToPending(currentPageCanAddRows.value)
}

const addRowsToPending = (rows: SubscriptionOfferAvailable[]) => {
  const additions = rows.filter(
    (row) => row.candidateStatus === CANDIDATE_STATUS_CAN_ADD && !pendingIdSet.value.has(row.productSpuId)
  )
  if (additions.length === 0) {
    message.warning('当前没有可加入的刊物')
    return
  }
  pendingItems.value.push(...additions)
  additions.forEach((item) => delete skippedReasonMap.value[item.productSpuId])
  message.success(`已加入待添加列表 ${additions.length} 个`)
}

const submitPending = async () => {
  if (!windowId.value || pendingItems.value.length === 0) return
  const submittedIds = pendingItems.value.map((item) => item.productSpuId)
  submitLoading.value = true
  try {
    const result = await SubscriptionOfferApi.batchCreateOffer({
      windowId: windowId.value,
      productSpuIds: submittedIds
    })
    handleBatchResult(result, submittedIds)
  } finally {
    submitLoading.value = false
  }
}

const submitCurrentQuery = async () => {
  if (!windowId.value) return
  submitLoading.value = true
  try {
    const result = await SubscriptionOfferApi.batchCreateByQuery({
      windowId: windowId.value,
      query: {
        ...queryParams,
        windowId: windowId.value,
        pageNo: 1,
        pageSize: 1
      }
    })
    handleBatchResult(result)
  } finally {
    submitLoading.value = false
  }
}

const handleBatchResult = async (result: SubscriptionOfferBatchCreateResp, submittedIds?: number[]) => {
  batchResult.value = result
  const skippedIds = new Set((result.skippedItems || []).map((item) => item.productSpuId).filter(Boolean))
  skippedReasonMap.value = Object.fromEntries(
    (result.skippedItems || [])
      .filter((item) => item.productSpuId)
      .map((item) => [item.productSpuId!, item.reason || '添加失败'])
  )
  if (submittedIds) {
    pendingItems.value = pendingItems.value.filter((item) => skippedIds.has(item.productSpuId))
  }
  message.success(
    `新增刊物 ${result.createdOfferCount || 0} 个，初始化窗口 SKU ${result.createdOfferSkuCount || 0} 个，跳过 ${result.skippedCount || 0} 个`
  )
  await getList()
  if ((result.createdOfferCount || 0) > 0) {
    emit('success')
  }
  if (submittedIds && pendingItems.value.length === 0 && (result.skippedCount || 0) === 0) {
    dialogVisible.value = false
  }
}

const removePending = (productSpuId: number) => {
  pendingItems.value = pendingItems.value.filter((item) => item.productSpuId !== productSpuId)
  delete skippedReasonMap.value[productSpuId]
}

const clearPending = () => {
  pendingItems.value = []
  skippedReasonMap.value = {}
}

const joinText = (items?: string[]) => {
  return items && items.length > 0 ? items.join('、') : '-'
}

const formatIssueCycle = (value?: string) => {
  return value ? getDictLabel(DICT_TYPE.EDU_CYCLE, value) || value : '-'
}

const getCandidateStatusLabel = (status?: string) => {
  return candidateStatusOptions.find((item) => item.value === status)?.label || status || '-'
}

const getCandidateStatusType = (
  status?: string
): 'success' | 'info' | 'warning' | 'danger' | undefined => {
  if (status === CANDIDATE_STATUS_CAN_ADD) return 'success'
  if (status === CANDIDATE_STATUS_ADDED) return 'info'
  if (status === CANDIDATE_STATUS_NO_MATCHED_SKU) return 'warning'
  if (status === CANDIDATE_STATUS_DISABLED) return 'danger'
  return undefined
}
</script>
