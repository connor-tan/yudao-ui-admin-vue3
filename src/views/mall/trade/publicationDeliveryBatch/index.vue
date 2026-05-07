<template>
  <ContentWrap>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="待发货聚合" name="candidate">
        <el-form
          ref="candidateQueryFormRef"
          :inline="true"
          :model="candidateQueryParams"
          class="-mb-15px"
          label-width="88px"
        >
          <el-form-item label="订刊窗口" prop="windowId">
            <el-select
              v-model="candidateQueryParams.windowId"
              class="!w-240px"
              clearable
              filterable
              placeholder="请选择订刊窗口"
              @change="handleCandidateWindowChange"
            >
              <el-option
                v-for="item in windowList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="刊物" prop="offerId">
            <el-select
              v-model="candidateQueryParams.offerId"
              class="!w-240px"
              clearable
              filterable
              placeholder="请选择刊物"
              @change="handleCandidateOfferChange"
            >
              <el-option
                v-for="item in candidateOfferList"
                :key="item.id"
                :label="item.productName"
                :value="item.id!"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="刊物 SKU" prop="offerSkuId">
            <el-select
              v-model="candidateQueryParams.offerSkuId"
              class="!w-240px"
              clearable
              filterable
              placeholder="请选择刊物 SKU"
              @change="handleCandidateOfferSkuChange"
            >
              <el-option
                v-for="item in candidateOfferSkuList"
                :key="item.id"
                :label="item.productSkuName || `SKU-${item.productSkuId}`"
                :value="item.id!"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="学校" prop="schoolId">
            <el-select
              v-model="candidateQueryParams.schoolId"
              class="!w-240px"
              clearable
              filterable
              placeholder="请选择学校"
            >
              <el-option
                v-for="item in schoolList"
                :key="item.id"
                :label="item.schoolName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="站点" prop="stationId">
            <el-select
              v-model="candidateQueryParams.stationId"
              class="!w-240px"
              clearable
              filterable
              placeholder="请选择站点"
            >
              <el-option
                v-for="item in stationList"
                :key="item.id"
                :label="item.stationName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button @click="handleCandidateQuery">
              <Icon class="mr-5px" icon="ep:search" />
              搜索
            </el-button>
            <el-button @click="resetCandidateQuery">
              <Icon class="mr-5px" icon="ep:refresh" />
              重置
            </el-button>
          </el-form-item>
        </el-form>

        <el-table
          v-loading="candidateLoading"
          :data="candidateList"
          :show-overflow-tooltip="true"
          :stripe="true"
          class="mt-20px"
        >
          <el-table-column align="center" label="站点" min-width="140" prop="stationNameSnapshot" />
          <el-table-column align="center" label="学校" min-width="160" prop="schoolNameSnapshot" />
          <el-table-column
            align="center"
            label="订刊窗口"
            min-width="160"
            prop="windowNameSnapshot"
          />
          <el-table-column align="center" label="刊物" min-width="200" prop="productNameSnapshot" />
          <el-table-column align="center" label="刊物 SKU" min-width="140">
            <template #default="{ row }">
              <div>offerSkuId：{{ row.offerSkuId }}</div>
              <div>skuId：{{ row.skuId }}</div>
            </template>
          </el-table-column>
          <el-table-column align="center" label="目标周期" min-width="100">
            <template #default="{ row }">
              {{ getSubscriptionTargetPeriodLabel(row.targetPeriod) }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="待发数量" prop="totalCount" width="100" />
          <el-table-column align="center" label="订单数" prop="orderCount" width="100" />
          <el-table-column align="center" label="学生数" prop="studentCount" width="100" />
          <el-table-column align="center" fixed="right" label="操作" width="120">
            <template #default="{ row }">
              <el-button
                v-hasPermi="['trade:publication-delivery-batch:create']"
                link
                type="primary"
                @click="handleCreateAndDeliver(row)"
              >
                确认发货
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <Pagination
          v-model:limit="candidateQueryParams.pageSize"
          v-model:page="candidateQueryParams.pageNo"
          :total="candidateTotal"
          @pagination="getCandidateList"
        />
      </el-tab-pane>

      <el-tab-pane label="批次记录" name="batch">
        <el-form
          ref="batchQueryFormRef"
          :inline="true"
          :model="batchQueryParams"
          class="-mb-15px"
          label-width="88px"
        >
          <el-form-item label="批次号" prop="batchNo">
            <el-input
              v-model="batchQueryParams.batchNo"
              class="!w-240px"
              clearable
              placeholder="请输入批次号"
              @keyup.enter="handleBatchQuery"
            />
          </el-form-item>
          <el-form-item label="订刊窗口" prop="windowId">
            <el-select
              v-model="batchQueryParams.windowId"
              class="!w-240px"
              clearable
              filterable
              placeholder="请选择订刊窗口"
              @change="handleBatchWindowChange"
            >
              <el-option
                v-for="item in windowList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="刊物" prop="offerId">
            <el-select
              v-model="batchQueryParams.offerId"
              class="!w-240px"
              clearable
              filterable
              placeholder="请选择刊物"
              @change="handleBatchOfferChange"
            >
              <el-option
                v-for="item in batchOfferList"
                :key="item.id"
                :label="item.productName"
                :value="item.id!"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="刊物 SKU" prop="offerSkuId">
            <el-select
              v-model="batchQueryParams.offerSkuId"
              class="!w-240px"
              clearable
              filterable
              placeholder="请选择刊物 SKU"
              @change="handleBatchOfferSkuChange"
            >
              <el-option
                v-for="item in batchOfferSkuList"
                :key="item.id"
                :label="item.productSkuName || `SKU-${item.productSkuId}`"
                :value="item.id!"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="学校" prop="schoolId">
            <el-select
              v-model="batchQueryParams.schoolId"
              class="!w-240px"
              clearable
              filterable
              placeholder="请选择学校"
            >
              <el-option
                v-for="item in schoolList"
                :key="item.id"
                :label="item.schoolName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="站点" prop="stationId">
            <el-select
              v-model="batchQueryParams.stationId"
              class="!w-240px"
              clearable
              filterable
              placeholder="请选择站点"
            >
              <el-option
                v-for="item in stationList"
                :key="item.id"
                :label="item.stationName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="发货时间" prop="deliveryTime">
            <el-date-picker
              v-model="batchQueryParams.deliveryTime"
              :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
              class="!w-240px"
              end-placeholder="结束时间"
              start-placeholder="开始时间"
              type="daterange"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
          <el-form-item>
            <el-button @click="handleBatchQuery">
              <Icon class="mr-5px" icon="ep:search" />
              搜索
            </el-button>
            <el-button @click="resetBatchQuery">
              <Icon class="mr-5px" icon="ep:refresh" />
              重置
            </el-button>
          </el-form-item>
        </el-form>

        <el-table
          v-loading="batchLoading"
          :data="batchList"
          :show-overflow-tooltip="true"
          :stripe="true"
          class="mt-20px"
        >
          <el-table-column align="center" label="批次号" min-width="160" prop="batchNo" />
          <el-table-column align="center" label="站点" min-width="140" prop="stationNameSnapshot" />
          <el-table-column align="center" label="学校" min-width="160" prop="schoolNameSnapshot" />
          <el-table-column
            align="center"
            label="订刊窗口"
            min-width="160"
            prop="windowNameSnapshot"
          />
          <el-table-column align="center" label="刊物" min-width="200" prop="productNameSnapshot" />
          <el-table-column align="center" label="数量" width="150">
            <template #default="{ row }">
              {{ row.totalCount || 0 }} 本 / {{ row.orderCount || 0 }} 单
            </template>
          </el-table-column>
          <el-table-column align="center" label="状态" width="100">
            <template #default="{ row }">
              <el-tag type="success">{{ getBatchStatusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            :formatter="dateFormatter"
            align="center"
            label="发货时间"
            prop="deliveryTime"
            width="180"
          />
          <el-table-column align="center" label="操作人" prop="operatorUserId" width="100" />
          <el-table-column align="center" fixed="right" label="操作" width="100">
            <template #default="{ row }">
              <el-button
                v-hasPermi="['trade:publication-delivery-batch:query']"
                link
                type="primary"
                @click="openBatchDetail(row.id)"
              >
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <Pagination
          v-model:limit="batchQueryParams.pageSize"
          v-model:page="batchQueryParams.pageNo"
          :total="batchTotal"
          @pagination="getBatchList"
        />
      </el-tab-pane>
    </el-tabs>
  </ContentWrap>

  <Dialog v-model="detailVisible" title="刊物批次详情" width="900px">
    <el-descriptions v-if="batchDetail" :column="2" border>
      <el-descriptions-item label="批次号">{{ batchDetail.batchNo }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag type="success">{{ getBatchStatusLabel(batchDetail.status) }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="站点">{{
        batchDetail.stationNameSnapshot
      }}</el-descriptions-item>
      <el-descriptions-item label="学校">{{ batchDetail.schoolNameSnapshot }}</el-descriptions-item>
      <el-descriptions-item label="订刊窗口">{{
        batchDetail.windowNameSnapshot
      }}</el-descriptions-item>
      <el-descriptions-item label="刊物">{{
        batchDetail.productNameSnapshot
      }}</el-descriptions-item>
      <el-descriptions-item label="刊物 SKU">
        offerSkuId：{{ batchDetail.offerSkuId }} / skuId：{{ batchDetail.skuId }}
      </el-descriptions-item>
      <el-descriptions-item label="目标周期">
        {{ getSubscriptionTargetPeriodLabel(batchDetail.targetPeriod) }}
      </el-descriptions-item>
      <el-descriptions-item label="发货数量">
        {{ batchDetail.totalCount || 0 }} 本 / {{ batchDetail.orderCount || 0 }} 单 /
        {{ batchDetail.studentCount || 0 }} 名学生
      </el-descriptions-item>
      <el-descriptions-item label="发货时间">
        {{ batchDetail.deliveryTime ? formatDate(batchDetail.deliveryTime) : '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">{{
        batchDetail.remark || '-'
      }}</el-descriptions-item>
    </el-descriptions>
    <el-table :data="batchDetail?.items || []" border class="mt-20px">
      <el-table-column align="center" label="订单号" min-width="180" prop="orderNo" />
      <el-table-column align="center" label="配送单" min-width="100">
        <template #default="{ row }">#{{ row.deliveryId }}</template>
      </el-table-column>
      <el-table-column align="center" label="学生" min-width="120" prop="studentNameSnapshot" />
      <el-table-column align="center" label="班级" min-width="140" prop="classNameSnapshot" />
      <el-table-column align="center" label="数量" width="80" prop="count" />
    </el-table>
  </Dialog>
</template>

<script setup lang="ts">
import { dateFormatter, formatDate } from '@/utils/formatTime'
import { getSubscriptionTargetPeriodLabel } from '@/utils/subscription'
import { PublicationDeliveryBatchStatusEnum } from '@/utils/constants'
import { SubscriptionWindowApi, type SubscriptionWindowSimple } from '@/api/subscription/window'
import { SubscriptionOfferApi, type SubscriptionOffer } from '@/api/subscription/offer'
import { SubscriptionOfferSkuApi, type SubscriptionOfferSku } from '@/api/subscription/offerSku'
import { SchoolApi, type SchoolSimple } from '@/api/edu/school'
import { StationApi, type StationSimple } from '@/api/edu/station'
import {
  PublicationDeliveryBatchApi,
  type PublicationDeliveryBatchRespVO,
  type PublicationDeliveryCandidateRespVO
} from '@/api/mall/trade/publicationDeliveryBatch'

defineOptions({ name: 'TradePublicationDeliveryBatch' })

const message = useMessage()
const activeTab = ref('candidate')

const windowList = ref<SubscriptionWindowSimple[]>([])
const schoolList = ref<SchoolSimple[]>([])
const stationList = ref<StationSimple[]>([])
const candidateOfferList = ref<SubscriptionOffer[]>([])
const candidateOfferSkuList = ref<SubscriptionOfferSku[]>([])
const batchOfferList = ref<SubscriptionOffer[]>([])
const batchOfferSkuList = ref<SubscriptionOfferSku[]>([])

const candidateLoading = ref(false)
const candidateTotal = ref(0)
const candidateList = ref<PublicationDeliveryCandidateRespVO[]>([])
const candidateQueryFormRef = ref()
const candidateQueryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  schoolId: undefined as number | undefined,
  stationId: undefined as number | undefined,
  windowId: undefined as number | undefined,
  offerId: undefined as number | undefined,
  offerSkuId: undefined as number | undefined,
  skuId: undefined as number | undefined
})

const batchLoading = ref(false)
const batchTotal = ref(0)
const batchList = ref<PublicationDeliveryBatchRespVO[]>([])
const batchQueryFormRef = ref()
const batchQueryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  batchNo: undefined as string | undefined,
  schoolId: undefined as number | undefined,
  stationId: undefined as number | undefined,
  windowId: undefined as number | undefined,
  offerId: undefined as number | undefined,
  offerSkuId: undefined as number | undefined,
  skuId: undefined as number | undefined,
  deliveryTime: undefined as string[] | undefined
})

const detailVisible = ref(false)
const batchDetail = ref<PublicationDeliveryBatchRespVO>()

const getBatchStatusLabel = (status?: number) => {
  return status === PublicationDeliveryBatchStatusEnum.DELIVERED.status ? '已发货' : '-'
}

const loadWindowList = async () => {
  const data = await SubscriptionWindowApi.getWindowSimpleList()
  windowList.value = data.list || []
}

const loadOfferList = async (windowId: number | undefined, target: Ref<SubscriptionOffer[]>) => {
  target.value = []
  if (!windowId) {
    return
  }
  const result: SubscriptionOffer[] = []
  const pageSize = 100
  let pageNo = 1
  while (true) {
    const data = await SubscriptionOfferApi.getOfferPage({
      pageNo,
      pageSize,
      windowId
    })
    const pageList = data.list || []
    result.push(...pageList)
    if (pageList.length === 0 || result.length >= (data.total || result.length)) {
      break
    }
    pageNo += 1
  }
  target.value = result
}

const loadOfferSkuList = async (
  offerId: number | undefined,
  target: Ref<SubscriptionOfferSku[]>
) => {
  target.value = []
  if (!offerId) {
    return
  }
  target.value = await SubscriptionOfferSkuApi.getOfferSkuList(offerId)
}

const handleCandidateWindowChange = async () => {
  candidateQueryParams.offerId = undefined
  candidateQueryParams.offerSkuId = undefined
  candidateQueryParams.skuId = undefined
  candidateOfferSkuList.value = []
  await loadOfferList(candidateQueryParams.windowId, candidateOfferList)
}

const handleCandidateOfferChange = async () => {
  candidateQueryParams.offerSkuId = undefined
  candidateQueryParams.skuId = undefined
  await loadOfferSkuList(candidateQueryParams.offerId, candidateOfferSkuList)
}

const handleCandidateOfferSkuChange = () => {
  const offerSku = candidateOfferSkuList.value.find(
    (item) => item.id === candidateQueryParams.offerSkuId
  )
  candidateQueryParams.skuId = offerSku?.productSkuId
}

const handleBatchWindowChange = async () => {
  batchQueryParams.offerId = undefined
  batchQueryParams.offerSkuId = undefined
  batchQueryParams.skuId = undefined
  batchOfferSkuList.value = []
  await loadOfferList(batchQueryParams.windowId, batchOfferList)
}

const handleBatchOfferChange = async () => {
  batchQueryParams.offerSkuId = undefined
  batchQueryParams.skuId = undefined
  await loadOfferSkuList(batchQueryParams.offerId, batchOfferSkuList)
}

const handleBatchOfferSkuChange = () => {
  const offerSku = batchOfferSkuList.value.find((item) => item.id === batchQueryParams.offerSkuId)
  batchQueryParams.skuId = offerSku?.productSkuId
}

const getCandidateList = async () => {
  candidateLoading.value = true
  try {
    const data = await PublicationDeliveryBatchApi.getCandidatePage(candidateQueryParams)
    candidateList.value = data.list || []
    candidateTotal.value = data.total || 0
  } finally {
    candidateLoading.value = false
  }
}

const handleCandidateQuery = async () => {
  candidateQueryParams.pageNo = 1
  await getCandidateList()
}

const resetCandidateQuery = async () => {
  candidateQueryFormRef.value?.resetFields()
  candidateQueryParams.pageNo = 1
  candidateQueryParams.pageSize = 10
  candidateQueryParams.skuId = undefined
  candidateOfferList.value = []
  candidateOfferSkuList.value = []
  await getCandidateList()
}

const getBatchList = async () => {
  batchLoading.value = true
  try {
    const data = await PublicationDeliveryBatchApi.getBatchPage(batchQueryParams)
    batchList.value = data.list || []
    batchTotal.value = data.total || 0
  } finally {
    batchLoading.value = false
  }
}

const handleBatchQuery = async () => {
  batchQueryParams.pageNo = 1
  await getBatchList()
}

const resetBatchQuery = async () => {
  batchQueryFormRef.value?.resetFields()
  batchQueryParams.pageNo = 1
  batchQueryParams.pageSize = 10
  batchQueryParams.skuId = undefined
  batchOfferList.value = []
  batchOfferSkuList.value = []
  await getBatchList()
}

const handleCreateAndDeliver = async (row: PublicationDeliveryCandidateRespVO) => {
  if (
    !row.schoolId ||
    !row.stationId ||
    !row.windowId ||
    !row.offerId ||
    !row.offerSkuId ||
    !row.skuId
  ) {
    message.error('待发货聚合数据不完整')
    return
  }
  try {
    await message.confirm(
      `确认发货 ${row.stationNameSnapshot || '-'} / ${row.productNameSnapshot || '-'}，数量 ${
        row.totalCount || 0
      } 本？`
    )
  } catch {
    return
  }
  await PublicationDeliveryBatchApi.createAndDeliver({
    schoolId: row.schoolId,
    stationId: row.stationId,
    windowId: row.windowId,
    offerId: row.offerId,
    offerSkuId: row.offerSkuId,
    skuId: row.skuId
  })
  message.success('发货成功')
  await Promise.all([getCandidateList(), getBatchList()])
}

const openBatchDetail = async (id?: number) => {
  if (!id) {
    return
  }
  batchDetail.value = await PublicationDeliveryBatchApi.getBatch(id)
  detailVisible.value = true
}

onMounted(async () => {
  await Promise.all([
    loadWindowList(),
    SchoolApi.getSchoolSimpleList().then((data) => {
      schoolList.value = data
    }),
    StationApi.getStationSimpleList().then((data) => {
      stationList.value = data
    }),
    getCandidateList(),
    getBatchList()
  ])
})
</script>
