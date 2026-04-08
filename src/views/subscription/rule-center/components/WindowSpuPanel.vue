<template>
  <div>
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
        <el-form-item label="刊物类型" prop="publicationTypeId">
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
        <el-form-item label="出版社" prop="publisherId">
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
        <el-form-item label="推荐配置" prop="recommendFlag">
          <el-select
            v-model="queryParams.recommendFlag"
            class="!w-180px"
            clearable
            placeholder="请选择推荐配置"
          >
            <el-option label="推荐" :value="true" />
            <el-option label="不推荐" :value="false" />
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
          <el-button
            v-hasPermi="['subscription:window-spu:create']"
            plain
            type="primary"
            @click="openBatchForm"
          >
            <Icon class="mr-5px" icon="ep:plus" />
            按年级批量新增
          </el-button>
        </el-form-item>
      </el-form>
    </ContentWrap>

    <ContentWrap>
      <el-table v-loading="loading" :data="list" :show-overflow-tooltip="true" :stripe="true">
        <el-table-column label="刊物信息" min-width="280">
          <template #default="{ row }">
            <div class="flex items-center">
              <el-image :src="row.picUrl" class="h-50px w-50px flex-none" fit="cover" />
              <div class="ml-4 min-w-0">
                <div class="truncate font-600">{{ row.productName }}</div>
                <div class="mt-1 text-12px text-gray-500">
                  {{ row.publicationTitleName || '-' }} / {{ row.categoryName || '-' }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="刊物类型" min-width="100" prop="publicationTypeName" />
        <el-table-column label="出版社" min-width="160" prop="publisherName" />
        <el-table-column label="基础可见年级" min-width="220" prop="gradeNames" />
        <el-table-column align="center" label="推荐" min-width="80">
          <template #default="{ row }">
            <el-tag v-if="row.recommendFlag" type="success">推荐</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="SKU启用/总数" min-width="110">
          <template #default="{ row }">
            {{ row.enabledSkuCount || 0 }}/{{ row.totalSkuCount || 0 }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="排序" min-width="70" prop="sort" />
        <el-table-column align="center" label="价格" min-width="90">
          <template #default="{ row }">¥ {{ fenToYuan(row.price || 0) }}</template>
        </el-table-column>
        <el-table-column
          :formatter="dateFormatter"
          align="center"
          label="创建时间"
          prop="createTime"
          width="180"
        />
        <el-table-column align="center" fixed="right" label="操作" min-width="260">
          <template #default="{ row }">
            <el-button
              v-hasPermi="['subscription:window-spu:update']"
              link
              type="primary"
              @click="openSpuForm(row)"
            >
              编辑SPU
            </el-button>
            <el-button
              v-hasPermi="['subscription:window-sku:update']"
              link
              type="primary"
              @click="openSkuForm(row)"
            >
              配置SKU
            </el-button>
            <el-button
              v-hasPermi="['subscription:window-spu-rule:query']"
              link
              type="primary"
              @click="openRuleForm(row)"
            >
              特殊规则
            </el-button>
            <el-button
              v-hasPermi="['subscription:window-spu:delete']"
              link
              type="danger"
              @click="handleDelete(row.id)"
            >
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <Pagination
        v-model:limit="queryParams.pageSize"
        v-model:page="queryParams.pageNo"
        :total="total"
        @pagination="getList"
      />
    </ContentWrap>

    <WindowSpuBatchForm ref="batchFormRef" @success="getList" />
    <WindowSpuForm ref="spuFormRef" @success="getList" />
    <WindowSkuForm ref="skuFormRef" @success="getList" />
    <WindowSpuRuleForm ref="ruleFormRef" />
  </div>
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import { fenToYuan } from '@/utils'
import { defaultProps, handleTree } from '@/utils/tree'
import * as ProductCategoryApi from '@/api/mall/product/category'
import * as PublicationTypeApi from '@/api/mall/product/publicationType'
import * as PublicationPublisherApi from '@/api/mall/product/publicationPublisher'
import { SubscriptionWindowSpuApi, type SubscriptionWindowSpu } from '@/api/subscription/windowSpu'
import WindowSpuBatchForm from './WindowSpuBatchForm.vue'
import WindowSpuForm from './WindowSpuForm.vue'
import WindowSkuForm from './WindowSkuForm.vue'
import WindowSpuRuleForm from './WindowSpuRuleForm.vue'

defineOptions({ name: 'SubscriptionWindowSpuPanel' })

const props = defineProps<{
  windowId?: number
}>()

const message = useMessage()
const loading = ref(false)
const total = ref(0)
const list = ref<SubscriptionWindowSpu[]>([])
const queryFormRef = ref()
const categoryList = ref<any[]>([])
const typeList = ref<PublicationTypeApi.PublicationTypeSimpleVO[]>([])
const publisherList = ref<PublicationPublisherApi.PublicationPublisherSimpleVO[]>([])
const batchFormRef = ref()
const spuFormRef = ref()
const skuFormRef = ref()
const ruleFormRef = ref()
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  productName: undefined as string | undefined,
  categoryId: undefined as number | undefined,
  publicationTypeId: undefined as number | undefined,
  publisherId: undefined as number | undefined,
  recommendFlag: undefined as boolean | undefined
})

const loadOptions = async () => {
  const [categories, types, publishers] = await Promise.all([
    ProductCategoryApi.getCategoryList({ status: 0, domainType: 'PUBLICATION' }),
    PublicationTypeApi.getPublicationTypeSimpleList(),
    PublicationPublisherApi.getPublicationPublisherSimpleList()
  ])
  categoryList.value = handleTree(categories)
  typeList.value = types
  publisherList.value = publishers
}

const getList = async () => {
  if (!props.windowId) {
    list.value = []
    total.value = 0
    return
  }
  loading.value = true
  try {
    const data = await SubscriptionWindowSpuApi.getWindowSpuPage({
      ...queryParams,
      windowId: props.windowId
    })
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}

const openBatchForm = () => {
  if (!props.windowId) {
    return
  }
  batchFormRef.value.open(props.windowId)
}

const openSpuForm = (row: SubscriptionWindowSpu) => {
  spuFormRef.value.open(row)
}

const openSkuForm = (row: SubscriptionWindowSpu) => {
  skuFormRef.value.open(row.id, row.productName)
}

const openRuleForm = (row: SubscriptionWindowSpu) => {
  ruleFormRef.value.open(row.id, row.productName)
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await SubscriptionWindowSpuApi.deleteWindowSpu(id)
    message.success('移除成功')
    await getList()
  } catch {}
}

watch(
  () => props.windowId,
  async () => {
    queryParams.pageNo = 1
    await getList()
  },
  { immediate: true }
)

onMounted(loadOptions)
</script>
