<template>
  <ContentWrap>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="待收货需求" name="demand">
        <el-form
          ref="demandQueryFormRef"
          class="-mb-15px"
          :inline="true"
          :model="demandQueryParams"
          label-width="88px"
        >
          <el-form-item label="供应商" prop="supplierId">
            <el-select v-model="demandQueryParams.supplierId" class="!w-220px" clearable filterable>
              <el-option
                v-for="item in supplierList"
                :key="item.id"
                :label="item.name"
                :value="item.id!"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="仓库" prop="warehouseId">
            <el-select v-model="demandQueryParams.warehouseId" class="!w-220px" clearable filterable>
              <el-option
                v-for="item in warehouseList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="关键字" prop="keyword">
            <el-input
              v-model="demandQueryParams.keyword"
              class="!w-240px"
              clearable
              placeholder="刊物、SKU、ISBN 或期次"
              @keyup.enter="handleDemandQuery"
            />
          </el-form-item>
          <el-form-item label="期号" prop="issueNo">
            <el-input-number v-model="demandQueryParams.issueNo" :min="1" class="!w-140px" />
          </el-form-item>
          <el-form-item>
            <el-button @click="handleDemandQuery">
              <Icon icon="ep:search" class="mr-5px" /> 搜索
            </el-button>
            <el-button @click="resetDemandQuery">
              <Icon icon="ep:refresh" class="mr-5px" /> 重置
            </el-button>
            <el-button
              v-hasPermi="['repo:publication-receipt:create']"
              :loading="createReceiptSubmitting"
              plain
              type="primary"
              @click="handleCreateReceipt"
            >
              <Icon icon="ep:plus" class="mr-5px" /> 生成收货单
            </el-button>
          </el-form-item>
        </el-form>

        <el-table
          ref="demandTableRef"
          v-loading="demandLoading"
          class="mt-20px"
          :data="demandList"
          :show-overflow-tooltip="true"
          :stripe="true"
          @selection-change="handleDemandSelectionChange"
        >
          <el-table-column type="selection" width="45" />
          <el-table-column align="center" label="仓库" min-width="140" prop="warehouseNameSnapshot" />
          <el-table-column align="center" label="订刊窗口" min-width="160" prop="windowNameSnapshot" />
          <el-table-column align="center" label="刊物" min-width="200" prop="productNameSnapshot" />
          <el-table-column align="center" label="刊物 SKU" min-width="220">
            <template #default="{ row }">
              <div>{{ row.productSkuNameSnapshot || '-' }}</div>
              <div class="text-xs text-gray-500">SKU #{{ row.skuId || '-' }}</div>
            </template>
          </el-table-column>
          <el-table-column align="center" label="ISBN" min-width="170" prop="isbn" />
          <el-table-column align="center" label="期次" min-width="130">
            <template #default="{ row }">
              <div>第 {{ row.issueNo }} 期</div>
              <div class="text-xs text-gray-500">{{ row.issueName || '-' }}</div>
            </template>
          </el-table-column>
          <el-table-column align="center" label="订单需求" width="100" prop="demandCount" />
          <el-table-column align="center" label="已到货" width="90" prop="receivedCount" />
          <el-table-column align="center" label="已占用" width="90" prop="allocatedCount" />
          <el-table-column align="center" label="可发" width="90" prop="availableCount" />
          <el-table-column align="center" label="缺口" width="90">
            <template #default="{ row }">
              <el-tag :type="(row.shortageCount || 0) > 0 ? 'danger' : 'success'">
                {{ row.shortageCount || 0 }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" label="本次应收" width="150">
            <template #default="{ row }">
              <el-input-number
                v-model="row.expectedCount"
                :min="1"
                :precision="0"
                class="!w-120px"
              />
            </template>
          </el-table-column>
        </el-table>
        <Pagination
          v-model:limit="demandQueryParams.pageSize"
          v-model:page="demandQueryParams.pageNo"
          :total="demandTotal"
          @pagination="getDemandList"
        />
      </el-tab-pane>

      <el-tab-pane label="收货单" name="receipt">
        <el-form
          ref="receiptQueryFormRef"
          class="-mb-15px"
          :inline="true"
          :model="receiptQueryParams"
          label-width="88px"
        >
          <el-form-item label="收货单号" prop="receiptNo">
            <el-input
              v-model="receiptQueryParams.receiptNo"
              class="!w-220px"
              clearable
              placeholder="请输入收货单号"
              @keyup.enter="handleReceiptQuery"
            />
          </el-form-item>
          <el-form-item label="供应商" prop="supplierId">
            <el-select v-model="receiptQueryParams.supplierId" class="!w-220px" clearable filterable>
              <el-option
                v-for="item in supplierList"
                :key="item.id"
                :label="item.name"
                :value="item.id!"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="仓库" prop="warehouseId">
            <el-select v-model="receiptQueryParams.warehouseId" class="!w-220px" clearable filterable>
              <el-option
                v-for="item in warehouseList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="receiptQueryParams.status" class="!w-180px" clearable>
              <el-option
                v-for="item in receiptStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button @click="handleReceiptQuery">
              <Icon icon="ep:search" class="mr-5px" /> 搜索
            </el-button>
            <el-button @click="resetReceiptQuery">
              <Icon icon="ep:refresh" class="mr-5px" /> 重置
            </el-button>
          </el-form-item>
        </el-form>

        <el-table
          v-loading="receiptLoading"
          class="mt-20px"
          :data="receiptList"
          :show-overflow-tooltip="true"
          :stripe="true"
        >
          <el-table-column align="center" label="收货单号" min-width="190" prop="receiptNo" />
          <el-table-column align="center" label="供应商" min-width="160" prop="supplierNameSnapshot" />
          <el-table-column align="center" label="仓库" min-width="140" prop="warehouseNameSnapshot" />
          <el-table-column align="center" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getReceiptStatusTag(row.status)">
                {{ getReceiptStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" label="数量" min-width="180">
            <template #default="{ row }">
              应收 {{ row.expectedCount || 0 }} / 到货 {{ row.receivedCount || 0 }} / 占用
              {{ row.allocatedCount || 0 }}
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="创建时间"
            prop="createTime"
            :formatter="dateFormatter"
            width="180"
          />
          <el-table-column align="center" fixed="right" label="操作" width="230">
            <template #default="{ row }">
              <el-button
                v-if="row.status === ReceiptStatusEnum.DRAFT"
                v-hasPermi="['repo:publication-receipt:update']"
                :loading="receiptActionLoadingMap[row.id!]"
                link
                type="primary"
                @click="handleSubmitReceipt(row)"
              >
                提交
              </el-button>
              <el-button
                v-if="row.status !== ReceiptStatusEnum.DRAFT && row.status !== ReceiptStatusEnum.CLOSED"
                v-hasPermi="['repo:publication-receipt:receive']"
                link
                type="primary"
                @click="openReceiveDialog(row.id)"
              >
                收货
              </el-button>
              <el-button
                v-hasPermi="['repo:publication-receipt:query']"
                link
                type="primary"
                @click="openDetailDialog(row.id)"
              >
                详情
              </el-button>
              <el-button
                v-if="row.status !== ReceiptStatusEnum.CLOSED"
                v-hasPermi="['repo:publication-receipt:update']"
                :loading="receiptActionLoadingMap[row.id!]"
                link
                type="danger"
                @click="handleCloseReceipt(row)"
              >
                关闭
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <Pagination
          v-model:limit="receiptQueryParams.pageSize"
          v-model:page="receiptQueryParams.pageNo"
          :total="receiptTotal"
          @pagination="getReceiptList"
        />
      </el-tab-pane>
    </el-tabs>
  </ContentWrap>

  <Dialog v-model="receiveDialogVisible" title="登记刊物到货" width="1080px">
    <el-descriptions v-if="currentReceipt" :column="3" border class="mb-20px">
      <el-descriptions-item label="收货单">{{ currentReceipt.receiptNo }}</el-descriptions-item>
      <el-descriptions-item label="供应商">{{ currentReceipt.supplierNameSnapshot }}</el-descriptions-item>
      <el-descriptions-item label="仓库">{{ currentReceipt.warehouseNameSnapshot }}</el-descriptions-item>
    </el-descriptions>
    <el-table :data="currentReceipt?.items || []" border>
      <el-table-column align="center" label="刊物" min-width="200" prop="productNameSnapshot" />
      <el-table-column align="center" label="刊物 SKU" min-width="220" prop="productSkuNameSnapshot" />
      <el-table-column align="center" label="期次" min-width="120">
        <template #default="{ row }">第 {{ row.issueNo }} 期 {{ row.issueName || '' }}</template>
      </el-table-column>
      <el-table-column align="center" label="应收" width="80" prop="expectedCount" />
      <el-table-column align="center" label="已到货" width="90" prop="receivedCount" />
      <el-table-column align="center" label="已占用" width="90" prop="allocatedCount" />
      <el-table-column align="center" label="捆数" width="150">
        <template #default="{ row }">
          <el-input-number v-model="row.bundleCount" :min="0" :precision="0" class="!w-120px" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="本次到货" width="160">
        <template #default="{ row }">
          <el-input-number
            v-model="row.receiveCountInput"
            :min="0"
            :precision="0"
            class="!w-130px"
          />
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button :loading="receiveSubmitting" type="primary" @click="submitReceive">确 定</el-button>
      <el-button @click="receiveDialogVisible = false">取 消</el-button>
    </template>
  </Dialog>

  <Dialog v-model="detailDialogVisible" title="刊物收货单详情" width="1080px">
    <el-descriptions v-if="currentReceipt" :column="3" border>
      <el-descriptions-item label="收货单">{{ currentReceipt.receiptNo }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="getReceiptStatusTag(currentReceipt.status)">
          {{ getReceiptStatusLabel(currentReceipt.status) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="供应商">{{ currentReceipt.supplierNameSnapshot }}</el-descriptions-item>
      <el-descriptions-item label="仓库">{{ currentReceipt.warehouseNameSnapshot }}</el-descriptions-item>
      <el-descriptions-item label="数量">
        应收 {{ currentReceipt.expectedCount || 0 }} / 到货 {{ currentReceipt.receivedCount || 0 }} /
        占用 {{ currentReceipt.allocatedCount || 0 }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ currentReceipt.createTime ? formatDate(currentReceipt.createTime) : '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="备注" :span="3">{{ currentReceipt.remark || '-' }}</el-descriptions-item>
      <el-descriptions-item v-if="currentReceipt.closeReason" label="关闭原因" :span="3">
        {{ currentReceipt.closeReason }}
      </el-descriptions-item>
    </el-descriptions>
    <el-table :data="currentReceipt?.items || []" border class="mt-20px">
      <el-table-column align="center" label="刊物" min-width="200" prop="productNameSnapshot" />
      <el-table-column align="center" label="刊物 SKU" min-width="220" prop="productSkuNameSnapshot" />
      <el-table-column align="center" label="ISBN" min-width="170" prop="isbn" />
      <el-table-column align="center" label="期次" min-width="120">
        <template #default="{ row }">第 {{ row.issueNo }} 期 {{ row.issueName || '' }}</template>
      </el-table-column>
      <el-table-column align="center" label="应收" width="80" prop="expectedCount" />
      <el-table-column align="center" label="已到货" width="90" prop="receivedCount" />
      <el-table-column align="center" label="已占用" width="90" prop="allocatedCount" />
      <el-table-column align="center" label="可发" width="90" prop="availableCount" />
    </el-table>
  </Dialog>
</template>

<script setup lang="ts">
import { dateFormatter, formatDate } from '@/utils/formatTime'
import { SupplierApi, type SupplierVO } from '@/api/repo/supplier'
import { WarehouseApi, type WarehouseVO } from '@/api/repo/warehouse'
import {
  PublicationReceiptApi,
  type PublicationReceiptDemandVO,
  type PublicationReceiptVO
} from '@/api/repo/publicationReceipt'

defineOptions({ name: 'RepoPublicationReceipt' })

const message = useMessage()
const activeTab = ref('demand')

const ReceiptStatusEnum = {
  DRAFT: 10,
  PENDING_RECEIVE: 20,
  PARTIAL_RECEIVED: 30,
  RECEIVED: 40,
  CLOSED: 50
}
const receiptStatusOptions = [
  { value: ReceiptStatusEnum.DRAFT, label: '草稿' },
  { value: ReceiptStatusEnum.PENDING_RECEIVE, label: '待收货' },
  { value: ReceiptStatusEnum.PARTIAL_RECEIVED, label: '部分收货' },
  { value: ReceiptStatusEnum.RECEIVED, label: '已收齐' },
  { value: ReceiptStatusEnum.CLOSED, label: '已关闭' }
]

const supplierList = ref<SupplierVO[]>([])
const warehouseList = ref<WarehouseVO[]>([])

const demandLoading = ref(false)
const demandTotal = ref(0)
const demandList = ref<PublicationReceiptDemandVO[]>([])
const selectedDemandList = ref<PublicationReceiptDemandVO[]>([])
const createReceiptSubmitting = ref(false)
const demandTableRef = ref()
const demandQueryFormRef = ref()
const demandQueryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  supplierId: undefined as number | undefined,
  warehouseId: undefined as number | undefined,
  issueNo: undefined as number | undefined,
  keyword: undefined as string | undefined
})

const receiptLoading = ref(false)
const receiptTotal = ref(0)
const receiptList = ref<PublicationReceiptVO[]>([])
const receiptQueryFormRef = ref()
const receiptQueryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  receiptNo: undefined as string | undefined,
  supplierId: undefined as number | undefined,
  warehouseId: undefined as number | undefined,
  status: undefined as number | undefined
})

const receiveDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const receiveSubmitting = ref(false)
const receiptActionLoadingMap = ref<Record<number, boolean>>({})
const currentReceipt = ref<PublicationReceiptVO>()

const getReceiptStatusLabel = (status?: number) => {
  return receiptStatusOptions.find((item) => item.value === status)?.label || '-'
}

const getReceiptStatusTag = (status?: number) => {
  if (status === ReceiptStatusEnum.RECEIVED) return 'success'
  if (status === ReceiptStatusEnum.PARTIAL_RECEIVED) return 'warning'
  if (status === ReceiptStatusEnum.CLOSED) return 'info'
  return 'primary'
}

const getDemandList = async () => {
  demandLoading.value = true
  try {
    const data = await PublicationReceiptApi.getDemandPage(demandQueryParams)
    demandList.value = (data.list || []).map((item) => ({
      ...item,
      expectedCount: Math.max(item.suggestExpectedCount || item.shortageCount || item.demandCount || 1, 1)
    }))
    demandTotal.value = data.total || 0
  } finally {
    demandLoading.value = false
  }
}

const handleDemandQuery = () => {
  clearDemandSelection()
  demandQueryParams.pageNo = 1
  getDemandList()
}

const resetDemandQuery = () => {
  demandQueryFormRef.value?.resetFields()
  handleDemandQuery()
}

const handleDemandSelectionChange = (rows: PublicationReceiptDemandVO[]) => {
  selectedDemandList.value = rows
}

const clearDemandSelection = () => {
  selectedDemandList.value = []
  demandTableRef.value?.clearSelection?.()
}

const handleCreateReceipt = async () => {
  if (createReceiptSubmitting.value) {
    return
  }
  if (!demandQueryParams.supplierId || !demandQueryParams.warehouseId) {
    message.error('请先选择供应商和仓库')
    return
  }
  if (selectedDemandList.value.length === 0) {
    message.error('请选择需要生成收货单的刊物需求')
    return
  }
  const invalid = selectedDemandList.value.find((item) => !item.expectedCount || item.expectedCount <= 0)
  if (invalid) {
    message.error('本次应收数量必须大于 0')
    return
  }
  const contextMismatch = selectedDemandList.value.some(
    (item) => item.warehouseId !== demandQueryParams.warehouseId
  )
  if (contextMismatch) {
    message.error('所选明细与当前仓库不一致，请重新查询后选择')
    clearDemandSelection()
    return
  }
  try {
    await message.confirm(`确认生成 ${selectedDemandList.value.length} 条明细的刊物收货单？`)
  } catch {
    return
  }
  createReceiptSubmitting.value = true
  try {
    const receiptId = await PublicationReceiptApi.createReceipt({
      supplierId: demandQueryParams.supplierId,
      warehouseId: demandQueryParams.warehouseId,
      items: selectedDemandList.value.map((item) => ({
        windowId: item.windowId,
        offerId: item.offerId,
        offerSkuId: item.offerSkuId,
        skuId: item.skuId,
        issueId: item.issueId,
        issueNo: item.issueNo,
        expectedCount: item.expectedCount
      }))
    })
    message.success(`已生成收货单 #${receiptId}`)
    activeTab.value = 'receipt'
    clearDemandSelection()
    await Promise.all([getDemandList(), getReceiptList()])
  } finally {
    createReceiptSubmitting.value = false
  }
}

const getReceiptList = async () => {
  receiptLoading.value = true
  try {
    const data = await PublicationReceiptApi.getReceiptPage(receiptQueryParams)
    receiptList.value = data.list || []
    receiptTotal.value = data.total || 0
  } finally {
    receiptLoading.value = false
  }
}

const handleReceiptQuery = () => {
  receiptQueryParams.pageNo = 1
  getReceiptList()
}

const resetReceiptQuery = () => {
  receiptQueryFormRef.value?.resetFields()
  handleReceiptQuery()
}

const handleSubmitReceipt = async (row: PublicationReceiptVO) => {
  if (!row.id) return
  if (receiptActionLoadingMap.value[row.id]) return
  await message.confirm(`确认提交收货单 ${row.receiptNo}？`)
  receiptActionLoadingMap.value[row.id] = true
  try {
    await PublicationReceiptApi.submitReceipt(row.id)
    message.success('提交成功')
    await getReceiptList()
  } finally {
    receiptActionLoadingMap.value[row.id] = false
  }
}

const loadReceiptDetail = async (id?: number) => {
  if (!id) return
  const data = await PublicationReceiptApi.getReceipt(id)
  data.items = (data.items || []).map((item) => ({
    ...item,
    bundleCount: 0,
    receiveCountInput: Math.max((item.expectedCount || 0) - (item.receivedCount || 0), 0)
  }))
  currentReceipt.value = data
}

const openReceiveDialog = async (id?: number) => {
  await loadReceiptDetail(id)
  receiveDialogVisible.value = true
}

const openDetailDialog = async (id?: number) => {
  await loadReceiptDetail(id)
  detailDialogVisible.value = true
}

const submitReceive = async () => {
  if (!currentReceipt.value?.id) return
  const items = (currentReceipt.value.items || [])
    .filter((item) => (item.receiveCountInput || 0) > 0)
    .map((item) => ({
      receiptItemId: item.id,
      bundleCount: item.bundleCount,
      receivedCount: item.receiveCountInput
    }))
  if (items.length === 0) {
    message.error('请至少录入一条本次到货数量')
    return
  }
  receiveSubmitting.value = true
  try {
    await PublicationReceiptApi.receiveReceipt({
      receiptId: currentReceipt.value.id,
      items
    })
    message.success('收货登记成功')
    receiveDialogVisible.value = false
    await Promise.all([getDemandList(), getReceiptList()])
  } finally {
    receiveSubmitting.value = false
  }
}

const handleCloseReceipt = async (row: PublicationReceiptVO) => {
  if (!row.id) return
  if (receiptActionLoadingMap.value[row.id]) return
  const result = await message.prompt('请输入关闭原因', '关闭收货单')
  receiptActionLoadingMap.value[row.id] = true
  try {
    await PublicationReceiptApi.closeReceipt({
      id: row.id,
      closeReason: result.value
    })
    message.success('关闭成功')
    await getReceiptList()
  } finally {
    receiptActionLoadingMap.value[row.id] = false
  }
}

watch(
  () => [demandQueryParams.supplierId, demandQueryParams.warehouseId],
  () => clearDemandSelection()
)

onMounted(async () => {
  await Promise.all([
    SupplierApi.getSupplierSimpleList().then((data) => {
      supplierList.value = data || []
    }),
    WarehouseApi.getWarehouseSimpleList().then((data) => {
      warehouseList.value = data || []
    }),
    getDemandList(),
    getReceiptList()
  ])
})
</script>
