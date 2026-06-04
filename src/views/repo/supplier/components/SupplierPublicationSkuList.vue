<template>
  <div v-if="selectedSupplierId">
    <el-form
      ref="queryFormRef"
      class="-mb-15px"
      :inline="true"
      :model="queryParams"
      label-width="68px"
    >
      <el-form-item label="关键字" prop="keyword">
        <el-input
          v-model="queryParams.keyword"
          class="!w-240px"
          clearable
          placeholder="刊物、SKU 或 ISBN"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" class="!w-180px" clearable>
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          v-hasPermi="['repo:supplier-publication-sku:create']"
          plain
          type="primary"
          @click="openForm('create')"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      class="mt-16px"
      :data="list"
      :show-overflow-tooltip="true"
      :stripe="true"
    >
      <el-table-column align="center" label="刊物" min-width="200" prop="productNameSnapshot" />
      <el-table-column align="center" label="刊物 SKU" min-width="220">
        <template #default="{ row }">
          <div>{{ row.productSkuNameSnapshot || '-' }}</div>
          <div class="text-xs text-gray-500">SKU #{{ row.skuId || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="ISBN" min-width="170" prop="isbn" />
      <el-table-column align="center" label="排序" width="80" prop="sort" />
      <el-table-column align="center" label="状态" width="100" prop="status">
        <template #default="{ row }">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="row.status" />
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="创建时间"
        prop="createTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column align="center" fixed="right" label="操作" width="120">
        <template #default="{ row }">
          <el-button
            v-hasPermi="['repo:supplier-publication-sku:update']"
            link
            type="primary"
            @click="openForm('update', row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-hasPermi="['repo:supplier-publication-sku:delete']"
            link
            type="danger"
            @click="handleDelete(row.id)"
          >
            删除
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
  </div>
  <el-empty v-else description="请选择一个供应商后维护供应刊物" />

  <SupplierPublicationSkuForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import type { SupplierVO } from '@/api/repo/supplier'
import {
  SupplierPublicationSkuApi,
  type SupplierPublicationSkuVO
} from '@/api/repo/supplierPublicationSku'
import SupplierPublicationSkuForm from './SupplierPublicationSkuForm.vue'

defineOptions({ name: 'RepoSupplierPublicationSkuList' })

const message = useMessage()
const { t } = useI18n()
const props = defineProps<{
  supplier?: Partial<SupplierVO>
}>()

const loading = ref(false)
const list = ref<SupplierPublicationSkuVO[]>([])
const total = ref(0)
const queryFormRef = ref()
const selectedSupplierId = computed(() => props.supplier?.id)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  supplierId: undefined as number | undefined,
  keyword: undefined as string | undefined,
  status: undefined as number | undefined
})

watch(
  selectedSupplierId,
  (supplierId) => {
    if (!supplierId) {
      queryParams.supplierId = undefined
      list.value = []
      total.value = 0
      return
    }
    queryParams.supplierId = supplierId
    handleQuery()
  },
  { immediate: true }
)

const getList = async () => {
  if (!selectedSupplierId.value) {
    list.value = []
    total.value = 0
    return
  }
  loading.value = true
  try {
    queryParams.supplierId = selectedSupplierId.value
    const data = await SupplierPublicationSkuApi.getSupplierPublicationSkuPage(queryParams)
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
  queryFormRef.value?.resetFields()
  handleQuery()
}

const formRef = ref()
const openForm = (type: string, id?: number) => {
  if (!selectedSupplierId.value) {
    message.error('请选择一个供应商')
    return
  }
  formRef.value.open(type, id, props.supplier)
}

const handleDelete = async (id?: number) => {
  if (!id) return
  try {
    await message.delConfirm()
    await SupplierPublicationSkuApi.deleteSupplierPublicationSku(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}
</script>
