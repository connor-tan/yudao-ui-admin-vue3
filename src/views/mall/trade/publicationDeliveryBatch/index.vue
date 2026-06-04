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
          <el-form-item label="配送方式" prop="deliveryType">
            <el-select
              v-model="candidateQueryParams.deliveryType"
              class="!w-180px"
              clearable
              placeholder="请选择配送方式"
            >
              <el-option
                v-for="item in publicationDeliveryTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
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
          <el-form-item label="期号" prop="issueNo">
            <el-input-number
              v-model="candidateQueryParams.issueNo"
              :min="1"
              :step="1"
              class="!w-180px"
            />
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
          <el-form-item label="仓库" prop="warehouseId">
            <el-select
              v-model="candidateQueryParams.warehouseId"
              class="!w-240px"
              clearable
              filterable
              placeholder="请选择仓库"
            >
              <el-option
                v-for="item in warehouseList"
                :key="item.id"
                :label="item.name"
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
          ref="candidateTableRef"
          v-loading="candidateLoading"
          :data="candidateList"
          :row-key="getCandidateGroupKey"
          :show-overflow-tooltip="true"
          :stripe="true"
          class="mt-20px"
          @expand-change="handleCandidateGroupExpandChange"
        >
          <el-table-column type="expand" width="48">
            <template #default="{ row }">
              <el-table
                v-loading="candidateChildLoadingMap[getCandidateGroupKey(row)]"
                :data="candidateChildMap[getCandidateGroupKey(row)] || []"
                :show-overflow-tooltip="true"
                :stripe="true"
                border
                class="my-10px"
              >
                <el-table-column align="center" label="刊物" min-width="200" prop="productNameSnapshot" />
                <el-table-column align="left" label="刊物 SKU" min-width="280">
                  <template #default="childScope">
                    <div class="font-500 leading-5">
                      {{ formatCandidateSkuName(childScope.row) }}
                    </div>
                    <div
                      v-if="buildCandidateSkuMeta(childScope.row).length"
                      class="mt-4px flex flex-wrap gap-4px"
                    >
                      <el-tag
                        v-for="item in buildCandidateSkuMeta(childScope.row)"
                        :key="item.label"
                        effect="plain"
                        size="small"
                        type="info"
                      >
                        {{ item.label }}：{{ item.value }}
                      </el-tag>
                    </div>
                    <div class="mt-4px text-xs text-gray-500">
                      窗口SKU #{{ childScope.row.offerSkuId || '-' }} / 商品SKU #{{
                        childScope.row.skuId || '-'
                      }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column align="center" label="期次" min-width="140">
                  <template #default="childScope">
                    <div>第 {{ childScope.row.issueNo }} 期</div>
                    <div class="text-xs text-gray-500">{{ childScope.row.issueName || '-' }}</div>
                  </template>
                </el-table-column>
                <el-table-column
                  align="center"
                  label="计划配送"
                  min-width="120"
                  prop="plannedDeliveryDate"
                />
                <el-table-column align="center" label="待发数量" prop="totalCount" width="100" />
                <el-table-column align="center" label="已到货" prop="receivedCount" width="90" />
                <el-table-column align="center" label="可发" prop="availableCount" width="90" />
                <el-table-column align="center" label="缺口" width="90">
                  <template #default="childScope">
                    <el-tag :type="(childScope.row.shortageCount || 0) > 0 ? 'danger' : 'success'">
                      {{ childScope.row.shortageCount || 0 }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column align="center" label="订单数" prop="orderCount" width="90" />
                <el-table-column align="center" label="学生数" prop="studentCount" width="90" />
                <el-table-column align="center" fixed="right" label="操作" width="120">
                  <template #default="childScope">
                    <el-button
                      v-hasPermi="['trade:publication-delivery-batch:create']"
                      link
                      type="primary"
                      @click="handleCreateAndDeliver(childScope.row)"
                    >
                      确认发货
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div
                v-if="candidateChildTotalMap[getCandidateGroupKey(row)] > 0"
                class="flex justify-end"
              >
                <Pagination
                  v-model:limit="candidateChildPageSizeMap[getCandidateGroupKey(row)]"
                  v-model:page="candidateChildPageNoMap[getCandidateGroupKey(row)]"
                  :total="candidateChildTotalMap[getCandidateGroupKey(row)] || 0"
                  @pagination="loadCandidateChildPage(row, true)"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" label="配送方式" width="110">
            <template #default="{ row }">{{ formatDeliveryType(row.deliveryType) }}</template>
          </el-table-column>
          <el-table-column align="center" label="学校" min-width="160" prop="schoolNameSnapshot" />
          <el-table-column align="center" label="仓库" min-width="140" prop="warehouseNameSnapshot" />
          <el-table-column
            align="center"
            label="订刊窗口"
            min-width="160"
            prop="windowNameSnapshot"
          />
          <el-table-column align="center" label="刊物数" prop="publicationGroupCount" width="100" />
          <el-table-column align="center" label="期次数" prop="issueGroupCount" width="100" />
          <el-table-column align="center" label="待发数量" prop="totalCount" width="100" />
          <el-table-column align="center" label="可发" prop="availableCount" width="90" />
          <el-table-column align="center" label="缺口" width="90">
            <template #default="{ row }">
              <el-tag :type="(row.shortageCount || 0) > 0 ? 'danger' : 'success'">
                {{ row.shortageCount || 0 }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" label="订单数" prop="orderCount" width="100" />
          <el-table-column align="center" label="学生数" prop="studentCount" width="100" />
          <el-table-column align="center" fixed="right" label="操作" width="130">
            <template #default="{ row }">
              <el-button
                v-hasPermi="['trade:publication-delivery-batch:create']"
                link
                type="primary"
                @click="handleCreateGroupAndDeliver(row)"
              >
                {{ row.deliveryType === DeliveryTypeEnum.EXPRESS.type ? '展开录入' : '全部发货' }}
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
          <el-form-item label="配送方式" prop="deliveryType">
            <el-select
              v-model="batchQueryParams.deliveryType"
              class="!w-180px"
              clearable
              placeholder="请选择配送方式"
            >
              <el-option
                v-for="item in publicationDeliveryTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
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
          <el-form-item label="期号" prop="issueNo">
            <el-input-number
              v-model="batchQueryParams.issueNo"
              :min="1"
              :step="1"
              class="!w-180px"
            />
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
          <el-form-item label="仓库" prop="warehouseId">
            <el-select
              v-model="batchQueryParams.warehouseId"
              class="!w-240px"
              clearable
              filterable
              placeholder="请选择仓库"
            >
              <el-option
                v-for="item in warehouseList"
                :key="item.id"
                :label="item.name"
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
          <el-table-column align="center" label="配送方式" width="110">
            <template #default="{ row }">{{ formatDeliveryType(row.deliveryType) }}</template>
          </el-table-column>
          <el-table-column align="center" label="学校" min-width="160" prop="schoolNameSnapshot" />
          <el-table-column align="center" label="仓库" min-width="140" prop="warehouseNameSnapshot" />
          <el-table-column
            align="center"
            label="订刊窗口"
            min-width="160"
            prop="windowNameSnapshot"
          />
          <el-table-column align="center" label="刊物" min-width="200" prop="productNameSnapshot" />
          <el-table-column align="center" label="期次" min-width="130">
            <template #default="{ row }">
              <div>第 {{ row.issueNo }} 期</div>
              <div class="text-xs text-gray-500">{{ row.issueName || '-' }}</div>
            </template>
          </el-table-column>
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
      <el-descriptions-item label="配送方式">
        {{ formatDeliveryType(batchDetail.deliveryType) }}
      </el-descriptions-item>
      <el-descriptions-item label="期次">
        第 {{ batchDetail.issueNo }} 期 {{ batchDetail.issueName || '' }}
      </el-descriptions-item>
      <el-descriptions-item label="仓库">{{
        batchDetail.warehouseNameSnapshot || '-'
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
      <el-table-column align="center" label="订单期次" min-width="110">
        <template #default="{ row }">#{{ row.orderIssueId }}</template>
      </el-table-column>
      <el-table-column align="center" label="期次" min-width="120">
        <template #default="{ row }">第 {{ row.issueNo }} 期 {{ row.issueName || '' }}</template>
      </el-table-column>
      <el-table-column align="center" label="学生" min-width="120" prop="studentNameSnapshot" />
      <el-table-column align="center" label="班级" min-width="140" prop="classNameSnapshot" />
      <el-table-column align="center" label="数量" width="80" prop="count" />
      <el-table-column align="center" label="物流" min-width="180">
        <template #default="{ row }">
          <template v-if="row.logisticsNo">
            {{ deliveryExpressLabel(row.logisticsId) || row.logisticsId }} / {{ row.logisticsNo }}
          </template>
          <span v-else>-</span>
        </template>
      </el-table-column>
    </el-table>
  </Dialog>

  <Dialog v-model="expressDialogVisible" title="刊物快递期次发货" width="1080px">
    <el-descriptions v-if="expressCandidate" :column="3" border class="mb-20px">
      <el-descriptions-item label="学校">{{ expressCandidate.schoolNameSnapshot || '-' }}</el-descriptions-item>
      <el-descriptions-item label="刊物">{{ expressCandidate.productNameSnapshot }}</el-descriptions-item>
      <el-descriptions-item label="期次">
        第 {{ expressCandidate.issueNo }} 期 {{ expressCandidate.issueName || '' }}
      </el-descriptions-item>
      <el-descriptions-item label="待发">
        {{ expressCandidate.totalCount || 0 }} 本 / {{ expressCandidate.orderCount || 0 }} 单
      </el-descriptions-item>
      <el-descriptions-item label="可发">
        {{ expressCandidate.availableCount || 0 }} 本 / 缺口 {{ expressCandidate.shortageCount || 0 }}
      </el-descriptions-item>
    </el-descriptions>
    <el-form :inline="true" label-width="92px">
      <el-form-item label="批量导入">
        <el-input
          v-model="expressImportText"
          :autosize="{ minRows: 2, maxRows: 4 }"
          class="!w-680px"
          placeholder="每行：订单期次ID,物流公司ID,物流单号"
          type="textarea"
        />
      </el-form-item>
      <el-form-item>
        <el-button plain type="primary" @click="applyExpressImport">填充物流</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="expressLoading" :data="expressItemList" border>
      <el-table-column align="center" label="订单号" min-width="180" prop="orderNo" />
      <el-table-column align="center" label="订单期次" min-width="110">
        <template #default="{ row }">#{{ row.orderIssueId }}</template>
      </el-table-column>
      <el-table-column align="center" label="学生" min-width="120" prop="studentNameSnapshot" />
      <el-table-column align="center" label="班级" min-width="140" prop="classNameSnapshot" />
      <el-table-column align="center" label="数量" width="80" prop="count" />
      <el-table-column align="center" label="物流公司" min-width="180">
        <template #default="{ row }">
          <el-select v-model="row.logisticsId" filterable placeholder="请选择物流公司">
            <el-option
              v-for="item in deliveryExpressList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column align="center" label="物流单号" min-width="180">
        <template #default="{ row }">
          <el-input v-model="row.logisticsNo" placeholder="请输入物流单号" />
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button :loading="expressSubmitting" type="primary" @click="submitExpressDelivery">
        确认发货
      </el-button>
      <el-button @click="expressDialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { dateFormatter, formatDate } from '@/utils/formatTime'
import { DeliveryTypeEnum, PublicationDeliveryBatchStatusEnum } from '@/utils/constants'
import { SubscriptionWindowApi, type SubscriptionWindowSimple } from '@/api/subscription/window'
import { SubscriptionOfferApi, type SubscriptionOffer } from '@/api/subscription/offer'
import { SubscriptionOfferSkuApi, type SubscriptionOfferSku } from '@/api/subscription/offerSku'
import { SchoolApi, type SchoolSimple } from '@/api/edu/school'
import { WarehouseApi, type WarehouseVO } from '@/api/repo/warehouse'
import * as DeliveryExpressApi from '@/api/mall/trade/delivery/express'
import {
  PublicationDeliveryBatchApi,
  type PublicationDeliveryBatchRespVO,
  type PublicationDeliveryCandidateGroupRespVO,
  type PublicationDeliveryCandidateItemRespVO,
  type PublicationDeliveryCandidatePageReqVO,
  type PublicationDeliveryCandidateRespVO
} from '@/api/mall/trade/publicationDeliveryBatch'

defineOptions({ name: 'TradePublicationDeliveryBatch' })

const message = useMessage()
const activeTab = ref('candidate')

const windowList = ref<SubscriptionWindowSimple[]>([])
const schoolList = ref<SchoolSimple[]>([])
const warehouseList = ref<WarehouseVO[]>([])
const candidateOfferList = ref<SubscriptionOffer[]>([])
const candidateOfferSkuList = ref<SubscriptionOfferSku[]>([])
const batchOfferList = ref<SubscriptionOffer[]>([])
const batchOfferSkuList = ref<SubscriptionOfferSku[]>([])
const deliveryExpressList = ref<DeliveryExpressApi.DeliveryExpressVO[]>([])
const publicationDeliveryTypeOptions = [
  { value: DeliveryTypeEnum.SCHOOL.type, label: '学校配送' },
  { value: DeliveryTypeEnum.EXPRESS.type, label: '快递配送' }
]
const PUBLICATION_EXPRESS_BATCH_ITEM_LIMIT = 500
const DEFAULT_CANDIDATE_CHILD_PAGE_SIZE = 10

const candidateLoading = ref(false)
const candidateTotal = ref(0)
const candidateList = ref<PublicationDeliveryCandidateGroupRespVO[]>([])
const candidateTableRef = ref()
const candidateChildMap = ref<Record<string, PublicationDeliveryCandidateRespVO[]>>({})
const candidateChildLoadingMap = ref<Record<string, boolean>>({})
const candidateChildTotalMap = ref<Record<string, number>>({})
const candidateChildPageNoMap = ref<Record<string, number>>({})
const candidateChildPageSizeMap = ref<Record<string, number>>({})
const candidateQueryFormRef = ref()
const candidateQueryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  deliveryType: undefined as number | undefined,
  schoolId: undefined as number | undefined,
  warehouseId: undefined as number | undefined,
  windowId: undefined as number | undefined,
  offerId: undefined as number | undefined,
  offerSkuId: undefined as number | undefined,
  skuId: undefined as number | undefined,
  issueId: undefined as number | undefined,
  issueNo: undefined as number | undefined
})
const candidateAppliedQueryParams = ref<PublicationDeliveryCandidatePageReqVO>({})

const batchLoading = ref(false)
const batchTotal = ref(0)
const batchList = ref<PublicationDeliveryBatchRespVO[]>([])
const batchQueryFormRef = ref()
const batchQueryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  batchNo: undefined as string | undefined,
  deliveryType: undefined as number | undefined,
  schoolId: undefined as number | undefined,
  warehouseId: undefined as number | undefined,
  windowId: undefined as number | undefined,
  offerId: undefined as number | undefined,
  offerSkuId: undefined as number | undefined,
  skuId: undefined as number | undefined,
  issueId: undefined as number | undefined,
  issueNo: undefined as number | undefined,
  deliveryTime: undefined as string[] | undefined
})

const detailVisible = ref(false)
const batchDetail = ref<PublicationDeliveryBatchRespVO>()
const expressDialogVisible = ref(false)
const expressLoading = ref(false)
const expressSubmitting = ref(false)
const expressCandidate = ref<PublicationDeliveryCandidateRespVO>()
const expressItemList = ref<PublicationDeliveryCandidateItemRespVO[]>([])
const expressImportText = ref('')

const getBatchStatusLabel = (status?: number) => {
  return status === PublicationDeliveryBatchStatusEnum.DELIVERED.status ? '已发货' : '-'
}

const formatDeliveryType = (deliveryType?: number) => {
  if (deliveryType === DeliveryTypeEnum.SCHOOL.type) {
    return '学校配送'
  }
  if (deliveryType === DeliveryTypeEnum.EXPRESS.type) {
    return '快递配送'
  }
  return '-'
}

const deliveryExpressLabel = (id?: number) => {
  if (!id) {
    return ''
  }
  return deliveryExpressList.value.find((item) => item.id === id)?.name || ''
}

const getCandidateGroupKey = (row: PublicationDeliveryCandidateGroupRespVO) => {
  return [
    row.deliveryType || 0,
    row.schoolId || 0,
    row.warehouseId || 0,
    row.windowId || 0
  ].join('_')
}

const formatCandidateSkuName = (row: PublicationDeliveryCandidateRespVO) => {
  if (row.productSkuName) {
    return row.productSkuName
  }
  if (row.productNameSnapshot) {
    return row.productNameSnapshot
  }
  return row.skuId ? `SKU #${row.skuId}` : '-'
}

const buildCandidateSkuMeta = (row: PublicationDeliveryCandidateRespVO) => {
  return [
    {
      label: 'ISBN',
      value: row.isbn || ''
    }
  ].filter((item) => item.value)
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

const cloneCandidateQueryParams = (): PublicationDeliveryCandidatePageReqVO => ({
  ...candidateQueryParams
})

const getCandidateList = async () => {
  const queryParams = cloneCandidateQueryParams()
  candidateLoading.value = true
  try {
    const data = await PublicationDeliveryBatchApi.getCandidateGroupPage(queryParams)
    candidateList.value = data.list || []
    candidateTotal.value = data.total || 0
    candidateAppliedQueryParams.value = queryParams
    clearCandidateChildCache()
  } finally {
    candidateLoading.value = false
  }
}

const clearCandidateChildCache = () => {
  candidateChildMap.value = {}
  candidateChildLoadingMap.value = {}
  candidateChildTotalMap.value = {}
  candidateChildPageNoMap.value = {}
  candidateChildPageSizeMap.value = {}
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
  candidateQueryParams.issueId = undefined
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
  batchQueryParams.issueId = undefined
  batchOfferList.value = []
  batchOfferSkuList.value = []
  await getBatchList()
}

const buildCandidateGroupReq = (
  row: PublicationDeliveryCandidateGroupRespVO
): PublicationDeliveryCandidatePageReqVO => {
  const queryParams = candidateAppliedQueryParams.value
  return {
    deliveryType: row.deliveryType,
    schoolId: row.schoolId,
    warehouseId: row.warehouseId,
    windowId: row.windowId,
    offerId: queryParams.offerId,
    offerSkuId: queryParams.offerSkuId,
    skuId: queryParams.skuId,
    issueId: queryParams.issueId,
    issueNo: queryParams.issueNo
  }
}

const ensureCandidateChildPageState = (key: string) => {
  candidateChildPageNoMap.value[key] = candidateChildPageNoMap.value[key] || 1
  candidateChildPageSizeMap.value[key] =
    candidateChildPageSizeMap.value[key] || DEFAULT_CANDIDATE_CHILD_PAGE_SIZE
  candidateChildTotalMap.value[key] = candidateChildTotalMap.value[key] || 0
}

const loadCandidateChildPage = async (
  row: PublicationDeliveryCandidateGroupRespVO,
  force = false
) => {
  const key = getCandidateGroupKey(row)
  ensureCandidateChildPageState(key)
  if (!force && candidateChildMap.value[key]) {
    return
  }
  candidateChildLoadingMap.value[key] = true
  try {
    const data = await PublicationDeliveryBatchApi.getCandidateChildPage({
      ...buildCandidateGroupReq(row),
      pageNo: candidateChildPageNoMap.value[key],
      pageSize: candidateChildPageSizeMap.value[key]
    })
    candidateChildMap.value[key] = data.list || []
    candidateChildTotalMap.value[key] = data.total || 0
  } finally {
    candidateChildLoadingMap.value[key] = false
  }
}

const handleCandidateGroupExpandChange = async (
  row: PublicationDeliveryCandidateGroupRespVO,
  expandedRows: PublicationDeliveryCandidateGroupRespVO[]
) => {
  const expanded = expandedRows.some((item) => getCandidateGroupKey(item) === getCandidateGroupKey(row))
  if (expanded) {
    await loadCandidateChildPage(row)
  }
}

const expandCandidateGroup = async (row: PublicationDeliveryCandidateGroupRespVO) => {
  await loadCandidateChildPage(row)
  candidateTableRef.value?.toggleRowExpansion(row, true)
}

const handleCreateGroupAndDeliver = async (row: PublicationDeliveryCandidateGroupRespVO) => {
  if (row.deliveryType === DeliveryTypeEnum.EXPRESS.type) {
    await expandCandidateGroup(row)
    message.info('快递刊物请在子表中逐个刊物期次录入物流后发货')
    return
  }
  if ((row.shortageCount || 0) > 0) {
    message.error(`当前到货余额不足，缺口 ${row.shortageCount || 0} 本`)
    return
  }
  if (
    row.deliveryType !== DeliveryTypeEnum.SCHOOL.type ||
    !row.schoolId ||
    !row.warehouseId ||
    !row.windowId
  ) {
    message.error('待发货主表数据不完整')
    return
  }
  try {
    await message.confirm(
      `确认发货 ${row.schoolNameSnapshot || '-'} / ${row.warehouseNameSnapshot || '-'} / ${
        row.windowNameSnapshot || '-'
      } 下 ${row.issueGroupCount || 0} 个刊物期次，数量 ${row.totalCount || 0} 本？`
    )
  } catch {
    return
  }
  const result = await PublicationDeliveryBatchApi.createGroupAndDeliver(buildCandidateGroupReq(row))
  message.success(
    `发货成功，已创建 ${result.batchCount || 0} 个批次，数量 ${result.totalCount || 0} 本`
  )
  await Promise.all([getCandidateList(), getBatchList()])
}

const handleCreateAndDeliver = async (row: PublicationDeliveryCandidateRespVO) => {
  if ((row.shortageCount || 0) > 0) {
    message.error(`当前到货余额不足，缺口 ${row.shortageCount || 0} 本`)
    return
  }
  if (row.deliveryType === DeliveryTypeEnum.EXPRESS.type) {
    await openExpressDelivery(row)
    return
  }
  if (
    !row.schoolId ||
    row.deliveryType !== DeliveryTypeEnum.SCHOOL.type ||
    !row.warehouseId ||
    !row.windowId ||
    !row.offerId ||
    !row.offerSkuId ||
    !row.skuId ||
    !row.issueNo
  ) {
    message.error('待发货聚合数据不完整')
    return
  }
  try {
    await message.confirm(
      `确认发货 ${row.schoolNameSnapshot || '-'} / ${row.warehouseNameSnapshot || '-'} / ${
        row.productNameSnapshot || '-'
      }，数量 ${row.totalCount || 0} 本？`
    )
  } catch {
    return
  }
  await PublicationDeliveryBatchApi.createAndDeliver({
    deliveryType: row.deliveryType!,
    schoolId: row.schoolId!,
    warehouseId: row.warehouseId,
    windowId: row.windowId!,
    offerId: row.offerId!,
    offerSkuId: row.offerSkuId!,
    skuId: row.skuId!,
    issueId: row.issueId,
    issueNo: row.issueNo!
  })
  message.success('发货成功')
  await Promise.all([getCandidateList(), getBatchList()])
}

const buildCandidateReq = (
  row: PublicationDeliveryCandidateRespVO
): PublicationDeliveryCandidatePageReqVO => ({
  deliveryType: row.deliveryType,
  schoolId: row.schoolId,
  warehouseId: row.warehouseId,
  windowId: row.windowId,
  offerId: row.offerId,
  offerSkuId: row.offerSkuId,
  skuId: row.skuId,
  issueId: row.issueId,
  issueNo: row.issueNo
})

const openExpressDelivery = async (row: PublicationDeliveryCandidateRespVO) => {
  if ((row.orderCount || 0) > PUBLICATION_EXPRESS_BATCH_ITEM_LIMIT) {
    message.error(`快递刊物期次单批最多支持 ${PUBLICATION_EXPRESS_BATCH_ITEM_LIMIT} 条，请缩小筛选范围后再发货`)
    return
  }
  if (
    !row.schoolId ||
    !row.windowId ||
    !row.warehouseId ||
    !row.offerId ||
    !row.offerSkuId ||
    !row.skuId ||
    !row.issueNo
  ) {
    message.error('待发货聚合数据不完整')
    return
  }
  expressCandidate.value = row
  expressDialogVisible.value = true
  expressImportText.value = ''
  expressLoading.value = true
  try {
    const [expressList, items] = await Promise.all([
      deliveryExpressList.value.length
        ? Promise.resolve(deliveryExpressList.value)
        : DeliveryExpressApi.getSimpleDeliveryExpressList(),
      PublicationDeliveryBatchApi.getCandidateItemList(buildCandidateReq(row))
    ])
    deliveryExpressList.value = expressList
    expressItemList.value = (items || []).map((item) => ({
      ...item,
      logisticsId: item.logisticsId,
      logisticsNo: item.logisticsNo || ''
    }))
  } finally {
    expressLoading.value = false
  }
}

const applyExpressImport = () => {
  const lines = expressImportText.value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length === 0) {
    message.warning('请先粘贴物流数据')
    return
  }
  let appliedCount = 0
  lines.forEach((line) => {
    const [orderIssueIdText, logisticsIdText, logisticsNo] = line.split(/[,\t ]+/).map((item) => item.trim())
    const orderIssueId = Number(orderIssueIdText)
    const logisticsId = Number(logisticsIdText)
    if (!orderIssueId || !logisticsId || !logisticsNo) {
      return
    }
    const target = expressItemList.value.find((item) => item.orderIssueId === orderIssueId)
    if (!target) {
      return
    }
    target.logisticsId = logisticsId
    target.logisticsNo = logisticsNo
    appliedCount += 1
  })
  message.success(`已填充 ${appliedCount} 条物流`)
}

const submitExpressDelivery = async () => {
  const row = expressCandidate.value
  if (!row) {
    return
  }
  const invalidItem = expressItemList.value.find((item) => !item.logisticsId || !item.logisticsNo)
  if (invalidItem) {
    message.error(`请补全订单 ${invalidItem.orderNo || invalidItem.orderIssueId} 的物流信息`)
    return
  }
  expressSubmitting.value = true
  try {
    await PublicationDeliveryBatchApi.createAndDeliver({
      deliveryType: DeliveryTypeEnum.EXPRESS.type,
      schoolId: row.schoolId!,
      warehouseId: row.warehouseId,
      windowId: row.windowId!,
      offerId: row.offerId!,
      offerSkuId: row.offerSkuId!,
      skuId: row.skuId!,
      issueId: row.issueId,
      issueNo: row.issueNo!,
      expressItems: expressItemList.value.map((item) => ({
        orderIssueId: item.orderIssueId!,
        logisticsId: item.logisticsId!,
        logisticsNo: item.logisticsNo!
      }))
    })
    message.success('发货成功')
    expressDialogVisible.value = false
    await Promise.all([getCandidateList(), getBatchList()])
  } finally {
    expressSubmitting.value = false
  }
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
    WarehouseApi.getWarehouseSimpleList().then((data) => {
      warehouseList.value = data
    }),
    getCandidateList(),
    getBatchList(),
    DeliveryExpressApi.getSimpleDeliveryExpressList().then((data) => {
      deliveryExpressList.value = data
    })
  ])
})
</script>
