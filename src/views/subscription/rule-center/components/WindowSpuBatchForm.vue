<template>
  <Dialog
    v-model="dialogVisible"
    :appendToBody="true"
    :closeOnClickModal="false"
    :max-height="760"
    :scroll="true"
    title="按年级批量新增"
    width="1500px"
  >
    <ContentWrap>
      <el-form :inline="true" :model="queryParams" class="-mb-15px" label-width="112px">
        <el-form-item label="基础可见年级" required>
          <el-select
            v-model="queryParams.baseGradeCatalogIds"
            class="!w-220px"
            collapse-tags
            collapse-tags-tooltip
            clearable
            filterable
            multiple
            placeholder="请选择基础可见年级"
            @change="handleGradeChange"
          >
            <el-option
              v-for="item in gradeList"
              :key="item.id"
              :label="buildGradeLabel(item)"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="刊物名称">
          <el-input
            v-model="queryParams.productName"
            class="!w-220px"
            clearable
            placeholder="请输入刊物名称"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="商品分类">
          <el-cascader
            v-model="queryParams.categoryId"
            :options="categoryList"
            :props="defaultProps"
            class="!w-220px"
            clearable
            filterable
            placeholder="请选择商品分类"
          />
        </el-form-item>
        <el-form-item label="刊物类型">
          <el-select
            v-model="queryParams.publicationTypeId"
            class="!w-220px"
            clearable
            placeholder="请选择刊物类型"
          >
            <el-option
              v-for="item in typeList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="出版社">
          <el-select
            v-model="queryParams.publisherId"
            class="!w-220px"
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
        <el-form-item>
          <el-button :disabled="queryParams.baseGradeCatalogIds.length === 0" @click="handleQuery">
            <Icon class="mr-5px" icon="ep:search" />
            搜索
          </el-button>
          <el-button @click="resetQuery">
            <Icon class="mr-5px" icon="ep:refresh" />
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <el-alert
        v-if="queryParams.baseGradeCatalogIds.length === 0"
        class="mb-12px"
        title="请先选择一个或多个基础可见年级，再筛选可加入的刊物"
        type="info"
        :closable="false"
      />

      <template v-if="queryParams.baseGradeCatalogIds.length > 0">
        <div class="mt-12px flex items-center justify-between gap-12px">
          <div class="text-14px font-600">候选刊物</div>
          <div class="flex items-center gap-12px">
            <div class="text-13px text-[var(--el-text-color-secondary)]">
              当前勾选 {{ selectedRows.length }} 项
            </div>
            <el-button :disabled="selectedRows.length === 0" type="primary" plain @click="handleAddToPending">
              加入待添加
            </el-button>
          </div>
        </div>

        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="list"
          :show-overflow-tooltip="true"
          :stripe="true"
          class="mt-12px"
          max-height="300"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" :selectable="isCandidateSelectable" />
          <el-table-column label="刊物信息" min-width="260">
            <template #default="{ row }">
              <div class="flex items-center">
                <el-image :src="row.picUrl" class="h-50px w-50px flex-none" fit="cover" />
                <div class="ml-4 overflow-hidden">
                  <div class="truncate font-600">{{ row.productName }}</div>
                  <div class="mt-1 text-12px text-gray-500">{{ row.publicationTitleName || '-' }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="商品分类" min-width="120" prop="categoryName" />
          <el-table-column label="刊物类型" min-width="100" prop="publicationTypeName" />
          <el-table-column label="出版社" min-width="160" prop="publisherName" />
          <el-table-column label="将挂载年级" min-width="220" prop="matchedGradeNames" />
          <el-table-column label="适用年级" min-width="220" prop="applicableGradeNames" />
          <el-table-column label="待处理状态" min-width="220">
            <template #default="{ row }">
              {{ buildCandidatePendingStatus(row) }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="价格" min-width="90">
            <template #default="{ row }">¥ {{ fenToYuan(row.price || 0) }}</template>
          </el-table-column>
        </el-table>

        <Pagination
          v-model:limit="queryParams.pageSize"
          v-model:page="queryParams.pageNo"
          :total="total"
          @pagination="getList"
        />
      </template>
      <el-empty
        v-else
        class="mt-12px"
        description="请先选择一个或多个基础可见年级，再筛选可加入的刊物"
      />

      <div class="clear-both mt-20px flex items-center justify-between gap-12px">
        <div class="text-14px font-600">待添加列表</div>
      </div>

      <el-empty v-if="pendingGroups.length === 0" class="mt-12px" description="暂无待添加刊物" />
      <el-table
        v-else
        :data="pendingGroups"
        :show-overflow-tooltip="true"
        :stripe="true"
        class="mt-12px"
        row-key="gradeCatalogId"
        max-height="300"
      >
        <el-table-column type="expand" width="55">
          <template #default="{ row }">
            <el-table :data="getPendingGroupPageItems(row)" border class="w-full" max-height="240">
              <el-table-column label="刊物信息" min-width="260">
                <template #default="{ row: item }">
                  <div class="flex items-center">
                    <el-image :src="item.picUrl" class="h-50px w-50px flex-none" fit="cover" />
                    <div class="ml-4 overflow-hidden">
                      <div class="truncate font-600">{{ item.productName }}</div>
                      <div class="mt-1 text-12px text-gray-500">
                        {{ item.publicationTitleName || '-' }}
                      </div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="商品分类" min-width="120" prop="categoryName" />
              <el-table-column label="刊物类型" min-width="100" prop="publicationTypeName" />
              <el-table-column label="出版社" min-width="160" prop="publisherName" />
              <el-table-column align="center" label="价格" min-width="90">
                <template #default="{ row: item }">¥ {{ fenToYuan(item.price || 0) }}</template>
              </el-table-column>
              <el-table-column label="失败原因" min-width="220">
                <template #default="{ row: item }">
                  {{ item.lastError || '-' }}
                </template>
              </el-table-column>
              <el-table-column align="center" label="操作" width="100">
                <template #default="{ row: item }">
                  <el-button
                    link
                    type="danger"
                    @click="removePendingItem(item.gradeCatalogId, item.productSpuId)"
                  >
                    移除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="clear-both overflow-hidden">
              <Pagination
                v-if="row.itemCount > getPendingGroupPageSize(row.gradeCatalogId)"
                :page="getPendingGroupPageNo(row.gradeCatalogId, row.itemCount)"
                :limit="getPendingGroupPageSize(row.gradeCatalogId)"
                :total="row.itemCount"
                @update:page="(page) => updatePendingGroupPage(row.gradeCatalogId, page)"
                @update:limit="(limit) => updatePendingGroupPageSize(row.gradeCatalogId, limit)"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="年级名称" min-width="180" prop="gradeName" />
        <el-table-column align="center" label="待添加刊物数" min-width="120" prop="itemCount" />
        <el-table-column align="center" label="操作" width="120">
          <template #default="{ row }">
            <el-button link type="danger" @click="clearPendingGroup(row.gradeCatalogId)">清空该年级</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="clear-both mt-12px flex items-center justify-between gap-12px">
        <div class="text-13px text-[var(--el-text-color-secondary)]">
          待添加年级 {{ pendingGroups.length }} 个，刊物组合 {{ pendingItems.length }} 条
        </div>
        <el-button
          :disabled="pendingItems.length === 0 || submitLoading"
          :loading="submitLoading && submitMode === 'insert'"
          type="primary"
          plain
          @click="handleInsert"
        >
          插入窗口规则
        </el-button>
      </div>

      <el-alert
        v-if="submitFeedback"
        class="mt-12px"
        :title="submitFeedback.message"
        :type="submitFeedback.type"
        :closable="false"
      />
    </ContentWrap>

    <template #footer>
      <el-button
        :disabled="pendingItems.length === 0 || submitLoading"
        :loading="submitLoading && submitMode === 'confirm'"
        type="primary"
        @click="handleConfirm"
      >
        确 定
      </el-button>
      <el-button :disabled="submitLoading" @click="handleCancel">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { fenToYuan } from '@/utils'
import { defaultProps, handleTree } from '@/utils/tree'
import * as ProductCategoryApi from '@/api/mall/product/category'
import * as PublicationTypeApi from '@/api/mall/product/publicationType'
import * as PublicationPublisherApi from '@/api/mall/product/publicationPublisher'
import { SchoolApi, type GradeCatalog } from '@/api/edu/school'
import {
  SubscriptionWindowSpuApi,
  type SubscriptionWindowSpuAvailable,
  type SubscriptionWindowSpuBatchCreateRespVO
} from '@/api/subscription/windowSpu'

defineOptions({ name: 'SubscriptionWindowSpuBatchForm' })

interface PendingItem {
  gradeCatalogId: number
  gradeName: string
  productSpuId: number
  productName: string
  picUrl?: string
  publicationTitleName?: string
  categoryName?: string
  publicationTypeName?: string
  publisherName?: string
  price?: number
  lastError?: string
}

interface PendingGroup {
  gradeCatalogId: number
  gradeName: string
  itemCount: number
  items: PendingItem[]
}

interface PendingGroupPageState {
  pageNo: number
  pageSize: number
}

const message = useMessage()
const dialogVisible = ref(false)
const loading = ref(false)
const submitLoading = ref(false)
const submitMode = ref<'insert' | 'confirm' | null>(null)
const submitFeedback = ref<{ type: 'success' | 'warning'; message: string } | null>(null)
const total = ref(0)
const windowId = ref<number>()
const tableRef = ref()
const list = ref<SubscriptionWindowSpuAvailable[]>([])
const selectedRows = ref<SubscriptionWindowSpuAvailable[]>([])
const pendingItems = ref<PendingItem[]>([])
const pendingGroupPageState = ref<Record<number, PendingGroupPageState>>({})
const categoryList = ref<any[]>([])
const typeList = ref<PublicationTypeApi.PublicationTypeSimpleVO[]>([])
const publisherList = ref<PublicationPublisherApi.PublicationPublisherSimpleVO[]>([])
const gradeList = ref<GradeCatalog[]>([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  baseGradeCatalogIds: [] as number[],
  productName: undefined as string | undefined,
  categoryId: undefined as number | undefined,
  publicationTypeId: undefined as number | undefined,
  publisherId: undefined as number | undefined
})

const emit = defineEmits(['success'])

const buildGradeLabel = (item: GradeCatalog) =>
  item.aliasName ? `${item.gradeName}（${item.aliasName} / ${item.gradeNo}）` : `${item.gradeName}（${item.gradeNo}）`

const gradeOrderMap = computed(() => {
  const orderMap = new Map<number, number>()
  gradeList.value.forEach((item, index) => orderMap.set(item.id, index))
  return orderMap
})

const gradeNameMap = computed(() => {
  const nameMap = new Map<number, string>()
  gradeList.value.forEach((item) => nameMap.set(item.id, item.gradeName))
  return nameMap
})

const pendingKeySet = computed(() => new Set(pendingItems.value.map((item) => buildPendingKey(item.gradeCatalogId, item.productSpuId))))

const pendingGroups = computed<PendingGroup[]>(() => {
  const groupMap = new Map<number, PendingGroup>()
  pendingItems.value.forEach((item) => {
    const group =
      groupMap.get(item.gradeCatalogId) ||
      ({
        gradeCatalogId: item.gradeCatalogId,
        gradeName: item.gradeName,
        itemCount: 0,
        items: []
      } as PendingGroup)
    group.items.push(item)
    group.itemCount = group.items.length
    groupMap.set(item.gradeCatalogId, group)
  })
  return Array.from(groupMap.values()).sort((left, right) => getGradeSort(left.gradeCatalogId) - getGradeSort(right.gradeCatalogId))
})

const getPendingGroupPageState = (gradeCatalogId: number): PendingGroupPageState => {
  if (!pendingGroupPageState.value[gradeCatalogId]) {
    pendingGroupPageState.value[gradeCatalogId] = {
      pageNo: 1,
      pageSize: 10
    }
  }
  return pendingGroupPageState.value[gradeCatalogId]
}

const getPendingGroupPageSize = (gradeCatalogId: number) => getPendingGroupPageState(gradeCatalogId).pageSize

const getPendingGroupPageNo = (gradeCatalogId: number, total: number) => {
  const state = getPendingGroupPageState(gradeCatalogId)
  const maxPage = Math.max(1, Math.ceil(total / state.pageSize))
  return Math.min(state.pageNo, maxPage)
}

const getPendingGroupPageItems = (group: PendingGroup) => {
  const pageNo = getPendingGroupPageNo(group.gradeCatalogId, group.itemCount)
  const pageSize = getPendingGroupPageSize(group.gradeCatalogId)
  const start = (pageNo - 1) * pageSize
  return group.items.slice(start, start + pageSize)
}

const updatePendingGroupPage = (gradeCatalogId: number, pageNo: number) => {
  getPendingGroupPageState(gradeCatalogId).pageNo = pageNo
}

const updatePendingGroupPageSize = (gradeCatalogId: number, pageSize: number) => {
  const state = getPendingGroupPageState(gradeCatalogId)
  state.pageSize = pageSize
  state.pageNo = 1
}

watch(
  () => dialogVisible.value,
  async (visible) => {
    if (!visible) {
      resetDialogState()
      await nextTick()
      tableRef.value?.clearSelection?.()
    }
  }
)

const buildPendingKey = (gradeCatalogId: number, productSpuId: number) => `${gradeCatalogId}_${productSpuId}`

const getGradeSort = (gradeCatalogId: number) => gradeOrderMap.value.get(gradeCatalogId) ?? Number.MAX_SAFE_INTEGER

const getGradeName = (gradeCatalogId: number) => gradeNameMap.value.get(gradeCatalogId) || `年级#${gradeCatalogId}`

const clearCurrentSelection = async () => {
  selectedRows.value = []
  await nextTick()
  tableRef.value?.clearSelection?.()
}

const resetDialogState = () => {
  selectedRows.value = []
  pendingItems.value = []
  pendingGroupPageState.value = {}
  submitFeedback.value = null
  submitMode.value = null
  submitLoading.value = false
  total.value = 0
  list.value = []
  windowId.value = undefined
}

const resetQueryParams = () => {
  queryParams.pageNo = 1
  queryParams.pageSize = 10
  queryParams.baseGradeCatalogIds = []
  queryParams.productName = undefined
  queryParams.categoryId = undefined
  queryParams.publicationTypeId = undefined
  queryParams.publisherId = undefined
}

const loadOptions = async () => {
  const [categories, types, publishers, grades] = await Promise.all([
    ProductCategoryApi.getCategoryList({ status: 0, domainType: 'PUBLICATION' }),
    PublicationTypeApi.getPublicationTypeSimpleList(),
    PublicationPublisherApi.getPublicationPublisherSimpleList(),
    SchoolApi.getGradeCatalogSimpleList()
  ])
  categoryList.value = handleTree(categories)
  typeList.value = types
  publisherList.value = publishers
  gradeList.value = grades
}

const getList = async () => {
  selectedRows.value = []
  if (!windowId.value || queryParams.baseGradeCatalogIds.length === 0) {
    list.value = []
    total.value = 0
    await clearCurrentSelection()
    return
  }
  loading.value = true
  try {
    const data = await SubscriptionWindowSpuApi.getAvailablePage({
      ...queryParams,
      windowId: windowId.value
    })
    list.value = data.list
    total.value = data.total
    await clearCurrentSelection()
  } finally {
    loading.value = false
  }
}

const resetQuery = () => {
  queryParams.pageNo = 1
  queryParams.productName = undefined
  queryParams.categoryId = undefined
  queryParams.publicationTypeId = undefined
  queryParams.publisherId = undefined
  getList()
}

const handleQuery = () => {
  if (queryParams.baseGradeCatalogIds.length === 0) {
    message.warning('请先选择基础可见年级')
    return
  }
  queryParams.pageNo = 1
  getList()
}

const handleGradeChange = () => {
  queryParams.pageNo = 1
  getList()
}

const handleSelectionChange = (rows: SubscriptionWindowSpuAvailable[]) => {
  selectedRows.value = rows
}

const getMatchedGradeIds = (row: SubscriptionWindowSpuAvailable) => row.matchedGradeCatalogIds || []

const getQueuedGradeIds = (row: SubscriptionWindowSpuAvailable) =>
  getMatchedGradeIds(row).filter((gradeCatalogId) => pendingKeySet.value.has(buildPendingKey(gradeCatalogId, row.productSpuId)))

const getRemainingGradeIds = (row: SubscriptionWindowSpuAvailable) =>
  getMatchedGradeIds(row).filter((gradeCatalogId) => !pendingKeySet.value.has(buildPendingKey(gradeCatalogId, row.productSpuId)))

const isCandidateSelectable = (row: SubscriptionWindowSpuAvailable) => getRemainingGradeIds(row).length > 0

const joinGradeNames = (gradeCatalogIds: number[]) => gradeCatalogIds.map((gradeCatalogId) => getGradeName(gradeCatalogId)).join(' / ')

const buildCandidatePendingStatus = (row: SubscriptionWindowSpuAvailable) => {
  const queuedGradeIds = getQueuedGradeIds(row)
  const remainingGradeIds = getRemainingGradeIds(row)
  if (queuedGradeIds.length === 0) {
    return `待加入：${joinGradeNames(remainingGradeIds)}`
  }
  if (remainingGradeIds.length === 0) {
    return `已加入：${joinGradeNames(queuedGradeIds)}`
  }
  return `已加入：${joinGradeNames(queuedGradeIds)}；待加入：${joinGradeNames(remainingGradeIds)}`
}

const upsertPendingItem = (row: SubscriptionWindowSpuAvailable, gradeCatalogId: number) => {
  const pendingKey = buildPendingKey(gradeCatalogId, row.productSpuId)
  if (pendingKeySet.value.has(pendingKey)) {
    return
  }
  pendingItems.value.push({
    gradeCatalogId,
    gradeName: getGradeName(gradeCatalogId),
    productSpuId: row.productSpuId,
    productName: row.productName,
    picUrl: row.picUrl,
    publicationTitleName: row.publicationTitleName,
    categoryName: row.categoryName,
    publicationTypeName: row.publicationTypeName,
    publisherName: row.publisherName,
    price: row.price,
    lastError: undefined
  })
}

const handleAddToPending = async () => {
  if (selectedRows.value.length === 0) {
    message.warning('请至少选择一个刊物商品')
    return
  }
  let addedCount = 0
  selectedRows.value.forEach((row) => {
    getRemainingGradeIds(row).forEach((gradeCatalogId) => {
      upsertPendingItem(row, gradeCatalogId)
      addedCount++
    })
  })
  submitFeedback.value = null
  await clearCurrentSelection()
  if (addedCount === 0) {
    message.warning('当前勾选刊物已全部加入待添加列表')
    return
  }
  message.success(`已加入待添加 ${addedCount} 条年级-刊物组合`)
}

const removePendingItem = (gradeCatalogId: number, productSpuId: number) => {
  pendingItems.value = pendingItems.value.filter(
    (item) => !(item.gradeCatalogId === gradeCatalogId && item.productSpuId === productSpuId)
  )
}

const clearPendingGroup = (gradeCatalogId: number) => {
  pendingItems.value = pendingItems.value.filter((item) => item.gradeCatalogId !== gradeCatalogId)
}

const buildSkippedKeyMap = (resp: SubscriptionWindowSpuBatchCreateRespVO) => {
  const skippedKeyMap = new Map<string, string>()
  resp.skippedItems.forEach((item) => {
    ;(item.skippedGradeCatalogIds || []).forEach((gradeCatalogId) => {
      skippedKeyMap.set(buildPendingKey(gradeCatalogId, item.productSpuId), item.reason)
    })
  })
  return skippedKeyMap
}

const buildSubmitFeedback = (resp: SubscriptionWindowSpuBatchCreateRespVO) => {
  const prefix = submitMode.value === 'insert' ? '插入窗口规则完成' : '批量新增完成'
  const messageText =
    resp.skippedCount > 0
      ? `${prefix}，新增刊物 ${resp.createdWindowSpuCount} 条，新增年级关系 ${resp.createdGradeCount} 条，失败 ${resp.skippedCount} 条`
      : `${prefix}，新增刊物 ${resp.createdWindowSpuCount} 条，新增年级关系 ${resp.createdGradeCount} 条`
  const skuNotice =
    resp.createdWindowSpuCount > 0 ? '；与窗口周期匹配的 SKU 已默认启用，可在“配置SKU”中调整' : ''
  return {
    type: resp.skippedCount > 0 ? ('warning' as const) : ('success' as const),
    message: `${messageText}${skuNotice}`
  }
}

const submitPendingItems = async (closeWhenClear: boolean) => {
  if (!windowId.value) {
    return
  }
  if (pendingItems.value.length === 0) {
    message.warning('请先加入待添加刊物')
    return
  }
  submitLoading.value = true
  const submittedItems = pendingItems.value.map((item) => ({
    gradeCatalogId: item.gradeCatalogId,
    productSpuId: item.productSpuId
  }))
  try {
    const resp = await SubscriptionWindowSpuApi.batchCreate({
      windowId: windowId.value,
      items: submittedItems
    })
    const skippedKeyMap = buildSkippedKeyMap(resp)
    pendingItems.value = pendingItems.value.flatMap((item) => {
      const reason = skippedKeyMap.get(buildPendingKey(item.gradeCatalogId, item.productSpuId))
      if (!reason) {
        return []
      }
      return [{ ...item, lastError: reason }]
    })
    submitFeedback.value = buildSubmitFeedback(resp)
    if (resp.createdWindowSpuCount > 0 || resp.createdGradeCount > 0) {
      emit('success')
    }
    await getList()
    if (submitFeedback.value.type === 'success') {
      message.success(submitFeedback.value.message)
    } else {
      message.warning(submitFeedback.value.message)
    }
    if (closeWhenClear && pendingItems.value.length === 0) {
      dialogVisible.value = false
    }
  } finally {
    submitLoading.value = false
    submitMode.value = null
  }
}

const handleInsert = async () => {
  submitMode.value = 'insert'
  await submitPendingItems(false)
}

const handleConfirm = async () => {
  submitMode.value = 'confirm'
  await submitPendingItems(true)
}

const handleCancel = () => {
  dialogVisible.value = false
}

const open = async (selectedWindowId: number) => {
  resetDialogState()
  resetQueryParams()
  dialogVisible.value = true
  windowId.value = selectedWindowId
  await loadOptions()
  await getList()
}

defineExpose({ open })
</script>
