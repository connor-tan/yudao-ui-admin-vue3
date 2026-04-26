<template>
  <Dialog v-model="dialogVisible" :appendToBody="true" title="添加窗口刊物" width="70%">
    <ContentWrap>
      <el-form :inline="true" :model="queryParams" class="-mb-15px" label-width="68px">
        <el-form-item label="刊物名称">
          <el-input
            v-model="queryParams.name"
            class="!w-240px"
            clearable
            placeholder="请输入刊物名称"
            @keyup.enter="getList"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="getList">
            <Icon class="mr-5px" icon="ep:search" />
            搜索
          </el-button>
        </el-form-item>
      </el-form>

      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="list"
        :show-overflow-tooltip="true"
        :stripe="true"
        class="mt-12px"
        max-height="520"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
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
                <div class="truncate font-600">{{ row.name }}</div>
                <div class="mt-1 text-12px text-gray-500">{{ row.categoryName || '-' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="出版社" min-width="140">
          <template #default="{ row }">{{ row.publicationExt?.publisherName || '-' }}</template>
        </el-table-column>
        <el-table-column label="刊物类型" min-width="120">
          <template #default="{ row }">{{ row.publicationExt?.publicationTypeName || '-' }}</template>
        </el-table-column>
        <el-table-column align="center" label="价格" width="100">
          <template #default="{ row }">¥ {{ fenToYuan(row.price || 0) }}</template>
        </el-table-column>
        <el-table-column align="center" label="库存" width="90" prop="stock" />
      </el-table>
      <div class="min-h-47px overflow-hidden">
        <Pagination
          v-model:limit="queryParams.pageSize"
          v-model:page="queryParams.pageNo"
          :total="total"
          @pagination="getList"
        />
      </div>
    </ContentWrap>

    <template #footer>
      <el-button
        :disabled="selectedRows.length === 0"
        :loading="submitLoading"
        type="primary"
        @click="submitForm"
      >
        添 加
      </el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { fenToYuan } from '@/utils'
import * as ProductSpuApi from '@/api/mall/product/spu'
import { BIZ_SCENE_PUBLICATION } from '@/api/mall/product/spu'
import { SubscriptionOfferApi } from '@/api/subscription/offer'

defineOptions({ name: 'SubscriptionOfferBatchForm' })

const message = useMessage()
const dialogVisible = ref(false)
const loading = ref(false)
const submitLoading = ref(false)
const windowId = ref<number>()
const total = ref(0)
const list = ref<ProductSpuApi.Spu[]>([])
const selectedRows = ref<ProductSpuApi.Spu[]>([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined as string | undefined,
  bizScene: BIZ_SCENE_PUBLICATION
})

const open = async (id: number) => {
  windowId.value = id
  dialogVisible.value = true
  selectedRows.value = []
  queryParams.pageNo = 1
  await getList()
}
defineExpose({ open })

const getList = async () => {
  loading.value = true
  try {
    const data = await ProductSpuApi.getSpuPage(queryParams as any)
    list.value = data.list || []
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (rows: ProductSpuApi.Spu[]) => {
  selectedRows.value = rows
}

const emit = defineEmits(['success'])
const submitForm = async () => {
  if (!windowId.value || selectedRows.value.length === 0) return
  submitLoading.value = true
  try {
    await SubscriptionOfferApi.batchCreateOffer({
      windowId: windowId.value,
      productSpuIds: selectedRows.value.map((item) => item.id!)
    })
    message.success('添加成功')
    dialogVisible.value = false
    emit('success')
  } finally {
    submitLoading.value = false
  }
}
</script>
