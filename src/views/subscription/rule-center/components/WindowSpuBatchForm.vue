<template>
  <Dialog v-model="dialogVisible" title="按年级批量新增" width="1100px">
    <el-form :inline="true" :model="queryParams" class="-mb-15px" label-width="96px">
      <el-form-item label="基础可见年级" required>
        <el-select
          v-model="queryParams.baseGradeCatalogId"
          class="!w-220px"
          clearable
          filterable
          placeholder="请选择基础可见年级"
          @change="handleQuery"
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

    <el-alert
      v-if="!queryParams.baseGradeCatalogId"
      class="mb-12px"
      title="请先选择一个基础可见年级，再筛选可加入的刊物"
      type="info"
      :closable="false"
    />

    <el-table
      v-loading="loading"
      :data="list"
      :show-overflow-tooltip="true"
      :stripe="true"
      class="mt-12px"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
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
      <el-table-column label="适用年级" min-width="220" prop="applicableGradeNames" />
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

    <el-alert
      v-if="resultSummary"
      class="mt-12px"
      :title="resultSummary"
      type="success"
      :closable="false"
    />
    <el-alert
      v-if="skippedSummary"
      class="mt-12px"
      :title="skippedSummary"
      type="warning"
      :closable="false"
    />

    <template #footer>
      <el-button :disabled="submitLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
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

const message = useMessage()
const dialogVisible = ref(false)
const loading = ref(false)
const submitLoading = ref(false)
const total = ref(0)
const windowId = ref<number>()
const list = ref<SubscriptionWindowSpuAvailable[]>([])
const selectedIds = ref<number[]>([])
const categoryList = ref<any[]>([])
const typeList = ref<PublicationTypeApi.PublicationTypeSimpleVO[]>([])
const publisherList = ref<PublicationPublisherApi.PublicationPublisherSimpleVO[]>([])
const gradeList = ref<GradeCatalog[]>([])
const resultSummary = ref('')
const skippedSummary = ref('')
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  baseGradeCatalogId: undefined as number | undefined,
  productName: undefined as string | undefined,
  categoryId: undefined as number | undefined,
  publicationTypeId: undefined as number | undefined,
  publisherId: undefined as number | undefined
})

const buildGradeLabel = (item: GradeCatalog) =>
  item.aliasName ? `${item.gradeName}（${item.aliasName} / ${item.gradeNo}）` : `${item.gradeName}（${item.gradeNo}）`

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
  if (!windowId.value || !queryParams.baseGradeCatalogId) {
    list.value = []
    total.value = 0
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
  queryParams.pageNo = 1
  getList()
}

const handleSelectionChange = (rows: SubscriptionWindowSpuAvailable[]) => {
  selectedIds.value = rows.map((item) => item.productSpuId)
}

const open = async (selectedWindowId: number) => {
  dialogVisible.value = true
  windowId.value = selectedWindowId
  resultSummary.value = ''
  skippedSummary.value = ''
  selectedIds.value = []
  queryParams.pageNo = 1
  queryParams.pageSize = 10
  queryParams.baseGradeCatalogId = undefined
  queryParams.productName = undefined
  queryParams.categoryId = undefined
  queryParams.publicationTypeId = undefined
  queryParams.publisherId = undefined
  await loadOptions()
  await getList()
}
defineExpose({ open })

const emit = defineEmits(['success'])

const submitForm = async () => {
  if (!windowId.value) {
    return
  }
  if (!queryParams.baseGradeCatalogId) {
    message.warning('请先选择基础可见年级')
    return
  }
  if (selectedIds.value.length === 0) {
    message.warning('请至少选择一个刊物商品')
    return
  }
  submitLoading.value = true
  try {
    const resp: SubscriptionWindowSpuBatchCreateRespVO = await SubscriptionWindowSpuApi.batchCreate({
      windowId: windowId.value,
      baseGradeCatalogId: queryParams.baseGradeCatalogId,
      productSpuIds: selectedIds.value
    })
    resultSummary.value = `成功处理 ${resp.createdCount} 条刊物挂载`
    skippedSummary.value =
      resp.skippedCount > 0
        ? `跳过 ${resp.skippedCount} 条：${resp.skippedItems.map((item) => `${item.productName}（${item.reason}）`).join('、')}`
        : ''
    message.success('批量新增完成')
    emit('success')
    dialogVisible.value = false
  } finally {
    submitLoading.value = false
  }
}
</script>
