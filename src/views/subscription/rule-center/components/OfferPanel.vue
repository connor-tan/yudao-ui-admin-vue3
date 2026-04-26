<template>
  <div>
    <ContentWrap>
      <el-form :inline="true" :model="queryParams" class="-mb-15px" label-width="82px">
        <el-form-item label="刊物名称">
          <el-input
            v-model="queryParams.productName"
            class="!w-220px"
            clearable
            placeholder="请输入刊物名称"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="推荐">
          <el-select v-model="queryParams.recommendFlag" class="!w-160px" clearable>
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
          <el-button plain type="primary" @click="openBatchForm">
            <Icon class="mr-5px" icon="ep:plus" />
            添加刊物
          </el-button>
          <el-button plain @click="openWindowRuleForm">
            窗口级规则
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
                <div class="mt-1 text-12px text-gray-500">{{ row.categoryName || '-' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="刊物类型" min-width="120" prop="publicationTypeName" />
        <el-table-column label="出版社" min-width="140" prop="publisherName" />
        <el-table-column label="年级收窄" min-width="160">
          <template #default="{ row }">{{ row.gradeNames?.join('、') || '不额外收窄' }}</template>
        </el-table-column>
        <el-table-column align="center" label="SKU" width="100">
          <template #default="{ row }">{{ row.enabledSkuCount || 0 }}/{{ row.totalSkuCount || 0 }}</template>
        </el-table-column>
        <el-table-column align="center" label="推荐" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.recommendFlag" type="success">推荐</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="排序" width="80" prop="sort" />
        <el-table-column align="center" label="状态" width="90">
          <template #default="{ row }">
            <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="row.status" />
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" label="操作" width="250">
          <template #default="{ row }">
            <el-button link type="primary" @click="offerFormRef.open(row.id)">编辑</el-button>
            <el-button link type="primary" @click="skuFormRef.open(row.id)">SKU</el-button>
            <el-button link type="primary" @click="ruleFormRef.open(windowId, row.id)">规则</el-button>
            <el-button link type="danger" @click="handleDelete(row.id)">移除</el-button>
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

    <OfferBatchForm ref="batchFormRef" @success="getList" />
    <OfferForm ref="offerFormRef" @success="getList" />
    <OfferSkuForm ref="skuFormRef" @success="getList" />
    <RuleForm ref="ruleFormRef" />
  </div>
</template>

<script setup lang="ts">
import { DICT_TYPE } from '@/utils/dict'
import { SubscriptionOfferApi, type SubscriptionOffer } from '@/api/subscription/offer'
import OfferBatchForm from './OfferBatchForm.vue'
import OfferForm from './OfferForm.vue'
import OfferSkuForm from './OfferSkuForm.vue'
import RuleForm from './RuleForm.vue'

defineOptions({ name: 'SubscriptionOfferPanel' })

const props = defineProps<{ windowId?: number }>()
const message = useMessage()
const loading = ref(false)
const total = ref(0)
const list = ref<SubscriptionOffer[]>([])
const batchFormRef = ref()
const offerFormRef = ref()
const skuFormRef = ref()
const ruleFormRef = ref()
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  productName: undefined as string | undefined,
  recommendFlag: undefined as boolean | undefined
})

const getList = async () => {
  if (!props.windowId) {
    list.value = []
    total.value = 0
    return
  }
  loading.value = true
  try {
    const data = await SubscriptionOfferApi.getOfferPage({ ...queryParams, windowId: props.windowId })
    list.value = data.list || []
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const resetQuery = () => {
  queryParams.productName = undefined
  queryParams.recommendFlag = undefined
  handleQuery()
}

const openBatchForm = () => {
  if (props.windowId) batchFormRef.value.open(props.windowId)
}

const openWindowRuleForm = () => {
  if (props.windowId) ruleFormRef.value.open(props.windowId)
}

const handleDelete = async (id?: number) => {
  if (!id) return
  await message.delConfirm()
  await SubscriptionOfferApi.deleteOffer(id)
  message.success('移除成功')
  await getList()
}

watch(() => props.windowId, getList, { immediate: true })
</script>
