<template>
  <ContentWrap>
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
      label-width="82px"
    >
      <el-form-item label="商品名称" prop="name">
        <el-input
          v-model="queryParams.name"
          class="!w-240px"
          clearable
          placeholder="请输入刊物商品名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商品分类" prop="categoryId">
        <el-cascader
          v-model="queryParams.categoryId"
          :options="categoryList"
          :props="defaultProps"
          class="!w-240px"
          clearable
          filterable
          placeholder="请选择商品分类"
        />
      </el-form-item>
      <el-form-item label="刊物主档" prop="publicationTitleId">
        <el-select
          v-model="queryParams.publicationTitleId"
          class="!w-240px"
          clearable
          filterable
          placeholder="请选择刊物主档"
        >
          <el-option
            v-for="item in titleList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="刊物类型" prop="publicationTypeId">
        <el-select
          v-model="queryParams.publicationTypeId"
          class="!w-240px"
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
          class="!w-240px"
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
      <el-form-item label="适用年级" prop="gradeCatalogId">
        <el-select
          v-model="queryParams.gradeCatalogId"
          class="!w-240px"
          clearable
          placeholder="请选择适用年级"
        >
          <el-option
            v-for="item in gradeList"
            :key="item.id"
            :label="buildGradeLabel(item)"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
          end-placeholder="结束日期"
          start-placeholder="开始日期"
          type="daterange"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon class="mr-5px" icon="ep:search" />搜索</el-button>
        <el-button @click="resetQuery"><Icon class="mr-5px" icon="ep:refresh" />重置</el-button>
        <el-button
          v-hasPermi="['product:publication-product:create']"
          plain
          type="primary"
          @click="openForm()"
        >
          <Icon class="mr-5px" icon="ep:plus" />新增刊物商品
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-tabs v-model="queryParams.tabType" @tab-click="handleTabClick">
      <el-tab-pane
        v-for="item in tabsData"
        :key="item.type"
        :label="`${item.name}(${item.count})`"
        :name="item.type"
      />
    </el-tabs>
    <el-table v-loading="loading" :data="list" :show-overflow-tooltip="true" :stripe="true">
      <el-table-column label="商品编号" prop="id" width="110" />
      <el-table-column label="商品信息" min-width="260">
        <template #default="{ row }">
          <div class="flex items-center">
            <el-image
              fit="cover"
              :src="row.picUrl"
              class="flex-none w-50px h-50px"
              @click="imagePreview(row.picUrl)"
            />
            <div class="ml-4 overflow-hidden">
              <div class="truncate font-600">{{ row.name }}</div>
              <div class="mt-1 text-12px text-gray-500">
                主档：{{ row.publicationTitleName || '-' }}
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="刊物类型" min-width="110" prop="publicationTypeName" />
      <el-table-column label="出版社" min-width="160" prop="publisherName" />
      <el-table-column label="适用年级" min-width="220">
        <template #default="{ row }">
          <el-tag
            v-for="gradeName in row.applicableGradeNames || []"
            :key="gradeName"
            class="mr-5px mb-5px"
          >
            {{ gradeName }}
          </el-tag>
          <span v-if="!row.applicableGradeNames?.length">-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="价格" min-width="110">
        <template #default="{ row }">¥ {{ fenToYuan(row.price || 0) }}</template>
      </el-table-column>
      <el-table-column align="center" label="销量" min-width="90" prop="salesCount" />
      <el-table-column align="center" label="库存" min-width="90" prop="stock" />
      <el-table-column align="center" label="排序" min-width="80" prop="sort" />
      <el-table-column align="center" label="销售状态" min-width="100">
        <template #default="{ row }">
          <template v-if="row.status >= 0">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              active-text="上架"
              inactive-text="下架"
              inline-prompt
              @change="handleStatusChange(row)"
            />
          </template>
          <template v-else>
            <el-tag type="info">回收站</el-tag>
          </template>
        </template>
      </el-table-column>
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="创建时间"
        prop="createTime"
        width="180"
      />
      <el-table-column align="center" fixed="right" label="操作" min-width="200">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row.id)">详情</el-button>
          <template v-if="queryParams.tabType === 4">
            <el-button
              v-hasPermi="['product:publication-product:delete']"
              link
              type="danger"
              @click="handleDelete(row.id)"
            >
              删除
            </el-button>
            <el-button
              v-hasPermi="['product:publication-product:update']"
              link
              type="primary"
              @click="handleStatus02Change(row, ProductSpuStatusEnum.DISABLE.status)"
            >
              恢复
            </el-button>
          </template>
          <template v-else>
            <el-button
              v-hasPermi="['product:publication-product:update']"
              link
              type="primary"
              @click="openForm(row.id)"
            >
              编辑
            </el-button>
            <el-button
              v-hasPermi="['product:publication-product:update']"
              link
              type="danger"
              @click="handleStatus02Change(row, ProductSpuStatusEnum.RECYCLE.status)"
            >
              回收
            </el-button>
          </template>
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
</template>

<script lang="ts" setup>
import { TabsPaneContext } from 'element-plus'
import { dateFormatter } from '@/utils/formatTime'
import { defaultProps, handleTree } from '@/utils/tree'
import { fenToYuan } from '@/utils'
import { createImageViewer } from '@/components/ImageViewer'
import { ProductSpuStatusEnum } from '@/utils/constants'
import * as ProductCategoryApi from '@/api/mall/product/category'
import * as PublicationProductApi from '@/api/mall/product/publicationProduct'
import * as PublicationTitleApi from '@/api/mall/product/publicationTitle'
import * as PublicationTypeApi from '@/api/mall/product/publicationType'
import * as PublicationPublisherApi from '@/api/mall/product/publicationPublisher'

defineOptions({ name: 'ProductPublication' })

const message = useMessage()
const { t } = useI18n()
const { push } = useRouter()
const route = useRoute()

const loading = ref(false)
const total = ref(0)
const list = ref<PublicationProductApi.PublicationProductVO[]>([])
const tabsData = ref([
  { name: '出售中', type: 0, count: 0 },
  { name: '仓库中', type: 1, count: 0 },
  { name: '已售罄', type: 2, count: 0 },
  { name: '警戒库存', type: 3, count: 0 },
  { name: '回收站', type: 4, count: 0 }
])
const queryFormRef = ref()
const categoryList = ref<any[]>([])
const titleList = ref<PublicationTitleApi.PublicationTitleSimpleVO[]>([])
const typeList = ref<PublicationTypeApi.PublicationTypeSimpleVO[]>([])
const publisherList = ref<PublicationPublisherApi.PublicationPublisherSimpleVO[]>([])
const gradeList = ref<PublicationProductApi.PublicationGradeSimpleVO[]>([])
const queryParams = reactive<{
  pageNo: number
  pageSize: number
  tabType: number
  name: string | undefined
  categoryId: number | undefined
  publicationTitleId: number | undefined
  publicationTypeId: number | undefined
  publisherId: number | undefined
  gradeCatalogId: number | undefined
  createTime: string[]
}>({
  pageNo: 1,
  pageSize: 10,
  tabType: 0,
  name: undefined,
  categoryId: undefined,
  publicationTitleId: undefined,
  publicationTypeId: undefined,
  publisherId: undefined,
  gradeCatalogId: undefined,
  createTime: []
})

const buildGradeLabel = (item: PublicationProductApi.PublicationGradeSimpleVO) => {
  return item.aliasName ? `${item.gradeName}（${item.aliasName} / ${item.gradeNo}）` : `${item.gradeName}（${item.gradeNo}）`
}

const getList = async () => {
  loading.value = true
  try {
    const data = await PublicationProductApi.getPublicationProductPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const handleTabClick = (tab: TabsPaneContext) => {
  queryParams.tabType = tab.paneName as number
  getList()
}

const getTabsCount = async () => {
  const res = await PublicationProductApi.getPublicationProductCount()
  for (const objName in res) {
    tabsData.value[Number(objName)].count = res[objName]
  }
}

const handleStatus02Change = async (row: PublicationProductApi.PublicationProductVO, newStatus: number) => {
  try {
    const text = newStatus === ProductSpuStatusEnum.RECYCLE.status ? '加入到回收站' : '恢复到仓库'
    await message.confirm(`确认要"${row.name}"${text}吗？`)
    await PublicationProductApi.updatePublicationProductStatus({ id: row.id!, status: newStatus })
    message.success(text + '成功')
    await getTabsCount()
    await getList()
  } catch {}
}

const handleStatusChange = async (row: PublicationProductApi.PublicationProductVO) => {
  try {
    const text = row.status ? '上架' : '下架'
    await message.confirm(`确认要${text}"${row.name}"吗？`)
    await PublicationProductApi.updatePublicationProductStatus({ id: row.id!, status: row.status! })
    message.success(text + '成功')
    await getTabsCount()
    await getList()
  } catch {
    row.status =
      row.status === ProductSpuStatusEnum.DISABLE.status
        ? ProductSpuStatusEnum.ENABLE.status
        : ProductSpuStatusEnum.DISABLE.status
  }
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await PublicationProductApi.deletePublicationProduct(id)
    message.success(t('common.delSuccess'))
    await getTabsCount()
    await getList()
  } catch {}
}

const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}

const imagePreview = (imgUrl: string) => {
  createImageViewer({
    zIndex: 9999999,
    urlList: [imgUrl]
  })
}

const openForm = (id?: number) => {
  if (id) {
    push({ name: 'ProductPublicationEdit', params: { id } })
    return
  }
  push({ name: 'ProductPublicationAdd' })
}

const openDetail = (id: number) => {
  push({ name: 'ProductPublicationDetail', params: { id } })
}

const initOptions = async () => {
  const [categories, titles, types, publishers, grades] = await Promise.all([
    ProductCategoryApi.getCategoryList({
      status: 0,
      domainType: 'PUBLICATION'
    }),
    PublicationTitleApi.getPublicationTitleSimpleList(),
    PublicationTypeApi.getPublicationTypeSimpleList(),
    PublicationPublisherApi.getPublicationPublisherSimpleList(),
    PublicationProductApi.getPublicationGradeSimpleList()
  ])
  categoryList.value = handleTree(categories, 'id')
  titleList.value = titles
  typeList.value = types
  publisherList.value = publishers
  gradeList.value = grades
}

onMounted(async () => {
  await initOptions()
  await getTabsCount()
  await getList()
})

onActivated(() => {
  getTabsCount()
  getList()
})

watch(
  () => route.query.categoryId,
  (categoryId) => {
    queryParams.categoryId = categoryId ? Number(categoryId) : undefined
    queryParams.pageNo = 1
  },
  { immediate: true }
)
</script>
