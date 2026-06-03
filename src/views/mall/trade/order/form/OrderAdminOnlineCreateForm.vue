<template>
  <Dialog v-model="dialogVisible" title="在线下单" width="1120px">
    <el-form ref="formRef" v-loading="formLoading" :model="formData" label-width="92px">
      <el-divider content-position="left">学生</el-divider>
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="区域">
            <el-tree-select
              v-model="formData.areaId"
              :data="areaList"
              :props="defaultProps"
              :render-after-expand="true"
              class="w-full"
              clearable
              filterable
              @change="handleAreaChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="学校">
            <el-select
              v-model="formData.schoolId"
              class="w-full"
              clearable
              filterable
              placeholder="请选择学校"
              @change="handleSchoolChange"
            >
              <el-option
                v-for="item in selectableSchoolList"
                :key="item.id"
                :label="item.schoolName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="学生姓名">
            <el-input
              v-model="formData.studentName"
              clearable
              placeholder="请输入学生姓名"
              @keyup.enter="loadStudents"
            >
              <template #append>
                <el-button @click="loadStudents">
                  <Icon icon="ep:search" />
                </el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-table
        v-loading="studentLoading"
        :data="studentList"
        border
        highlight-current-row
        max-height="180"
        @current-change="handleStudentSelect"
      >
        <el-table-column label="学生" min-width="130" prop="studentName" />
        <el-table-column label="学校" min-width="180" prop="currentSchoolName" />
        <el-table-column label="家长" min-width="140">
          <template #default="{ row }">
            {{ row.parentNickname || row.belongTo || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="家长手机" min-width="140" prop="parentMobile" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">{{ getStudentStatusLabel(row.status) }}</template>
        </el-table-column>
      </el-table>
      <el-alert
        v-if="selectedStudent && !selectedStudent.belongTo"
        class="mt-10px"
        type="warning"
        show-icon
        :closable="false"
        title="该学生未绑定家长，不能在线下单"
      />

      <el-divider content-position="left">刊物</el-divider>
      <el-table
        ref="publicationTableRef"
        v-loading="publicationLoading"
        :data="publicationRows"
        :row-key="(row) => row.rowKey"
        border
        max-height="260"
        @selection-change="handlePublicationSelectionChange"
      >
        <el-table-column type="selection" width="50" :selectable="isPublicationSelectable" />
        <el-table-column label="刊物" min-width="180" prop="productName" show-overflow-tooltip />
        <el-table-column label="规格" min-width="160" prop="productSkuName" show-overflow-tooltip />
        <el-table-column label="ISBN" min-width="130" prop="isbn" show-overflow-tooltip />
        <el-table-column label="适用年级" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">{{ row.applicableGradeNames?.join('、') || '-' }}</template>
        </el-table-column>
        <el-table-column label="单价" width="90">
          <template #default="{ row }">{{ fenToYuan(row.price) }}</template>
        </el-table-column>
        <el-table-column label="可购" width="80" prop="remainingQuantity" />
        <el-table-column label="数量" width="130">
          <template #default="{ row }">
            <el-input-number
              v-model="row.count"
              :disabled="!isSelectedPublication(row)"
              :min="1"
              :max="getPublicationMaxCount(row)"
              :precision="0"
              class="!w-100px"
              controls-position="right"
              @change="clearSettlement"
            />
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="150">
          <template #default="{ row }">
            <el-tag v-if="isPublicationSelectable(row)" type="success">可下单</el-tag>
            <el-tag v-else type="info">
              {{ row.purchaseUnavailableReasonDesc || '不可下单' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-divider content-position="left">配送</el-divider>
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="配送方式">
            <el-radio-group v-model="formData.deliveryType" @change="clearSettlement">
              <el-radio :label="DeliveryTypeEnum.SCHOOL.type">学校配送</el-radio>
              <el-radio :label="DeliveryTypeEnum.EXPRESS.type">快递配送</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="商家备注">
            <el-input v-model="formData.remark" clearable placeholder="请输入商家备注" />
          </el-form-item>
        </el-col>
      </el-row>

      <template v-if="formData.deliveryType === DeliveryTypeEnum.EXPRESS.type">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="地址来源">
              <el-radio-group v-model="formData.addressMode" @change="clearSettlement">
                <el-radio label="book" :disabled="!addressList.length">家长地址</el-radio>
                <el-radio label="manual">手填地址</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col v-if="formData.addressMode === 'book'" :span="16">
            <el-form-item label="收件地址">
              <el-select
                v-model="formData.addressId"
                class="w-full"
                clearable
                placeholder="请选择家长地址"
                @change="clearSettlement"
              >
                <el-option
                  v-for="item in selectableAddressList"
                  :key="item.id"
                  :label="formatAddress(item)"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-if="formData.addressMode === 'manual'" :gutter="16">
          <el-col :span="8">
            <el-form-item label="收件人">
              <el-input v-model="formData.receiverName" clearable placeholder="请输入收件人" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="手机号">
              <el-input v-model="formData.receiverMobile" clearable placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="所在地">
              <el-tree-select
                v-model="formData.receiverAreaId"
                :data="areaList"
                :props="defaultProps"
                :render-after-expand="true"
                class="w-full"
                filterable
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="详细地址">
              <el-input
                v-model="formData.receiverDetailAddress"
                :rows="2"
                type="textarea"
                placeholder="请输入详细地址"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </template>

      <el-divider content-position="left">结算</el-divider>
      <el-row :gutter="16">
        <el-col :span="18">
          <el-descriptions v-if="settlementData?.price" :column="4" border>
            <el-descriptions-item label="商品金额">
              {{ fenToYuan(settlementData.price.totalPrice) }}
            </el-descriptions-item>
            <el-descriptions-item label="运费">
              {{ fenToYuan(settlementData.price.deliveryPrice) }}
            </el-descriptions-item>
            <el-descriptions-item label="优惠">
              {{ fenToYuan(settlementData.price.discountPrice) }}
            </el-descriptions-item>
            <el-descriptions-item label="应付">
              {{ fenToYuan(settlementData.price.payPrice) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-col>
        <el-col :span="6" class="text-right">
          <el-button :loading="settlementLoading" @click="handleSettlement">
            <Icon icon="ep:money" class="mr-5px" />
            结算预览
          </el-button>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">创建并付款</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import type { FormInstance } from 'element-plus'
import * as AreaApi from '@/api/system/area'
import { SchoolApi, type School } from '@/api/edu/school'
import { StudentApi, type Student, getStudentStatusLabel } from '@/api/edu/student'
import * as TradeOrderApi from '@/api/mall/trade/order'
import {
  AdminSubscriptionPublicationApi,
  type AdminSubscriptionPublicationOfferSku
} from '@/api/subscription/adminPublication'
import { defaultProps } from '@/utils/tree'
import { DeliveryTypeEnum } from '@/utils/constants'

defineOptions({ name: 'OrderAdminOnlineCreateForm' })

const emit = defineEmits(['success'])
const message = useMessage()
const { push } = useRouter()

type AddressMode = 'book' | 'manual'

type PublicationRow = AdminSubscriptionPublicationOfferSku & {
  rowKey: string
  offerId?: number
  productName?: string
  count: number
}

const createFormData = () => ({
  areaId: undefined as number | undefined,
  schoolId: undefined as number | undefined,
  studentName: '',
  deliveryType: DeliveryTypeEnum.SCHOOL.type,
  addressMode: 'book' as AddressMode,
  addressId: undefined as number | undefined,
  receiverName: '',
  receiverMobile: '',
  receiverAreaId: undefined as number | undefined,
  receiverDetailAddress: '',
  remark: ''
})

const dialogVisible = ref(false)
const formLoading = ref(false)
const studentLoading = ref(false)
const publicationLoading = ref(false)
const settlementLoading = ref(false)
const formRef = ref<FormInstance>()
const publicationTableRef = ref()
const formData = ref(createFormData())
const areaList = ref<AreaApi.AreaNodeVO[]>([])
const schoolList = ref<School[]>([])
const studentList = ref<Student[]>([])
const selectedStudent = ref<Student>()
const addressList = ref<TradeOrderApi.AdminOnlineAddressRespVO[]>([])
const publicationRows = ref<PublicationRow[]>([])
const selectedPublications = ref<PublicationRow[]>([])
const settlementData = ref<any>()

const selectableSchoolList = computed(() =>
  schoolList.value.filter((item): item is School & { id: number } => item.id !== undefined)
)
const selectableAddressList = computed(() =>
  addressList.value.filter(
    (item): item is TradeOrderApi.AdminOnlineAddressRespVO & { id: number } => item.id !== undefined
  )
)

const open = async () => {
  resetForm()
  dialogVisible.value = true
  formLoading.value = true
  try {
    if (!areaList.value.length) {
      areaList.value = await AreaApi.getEnabledAreaTree()
    }
    await loadSchools()
  } finally {
    formLoading.value = false
  }
}
defineExpose({ open })

const resetForm = () => {
  formData.value = createFormData()
  selectedStudent.value = undefined
  studentList.value = []
  addressList.value = []
  publicationRows.value = []
  selectedPublications.value = []
  settlementData.value = undefined
  formRef.value?.resetFields()
}

const loadSchools = async (schoolName?: string) => {
  const data = await SchoolApi.getSchoolPage({
    pageNo: 1,
    pageSize: 100,
    areaId: formData.value.areaId,
    schoolName
  })
  schoolList.value = data.list || []
}

const handleAreaChange = async () => {
  formData.value.schoolId = undefined
  await loadSchools()
  resetStudentSelection()
}

const handleSchoolChange = async () => {
  resetStudentSelection()
  await loadStudents()
}

const resetStudentSelection = () => {
  selectedStudent.value = undefined
  studentList.value = []
  addressList.value = []
  publicationRows.value = []
  selectedPublications.value = []
  settlementData.value = undefined
}

const loadStudents = async () => {
  if (!formData.value.schoolId) {
    message.warning('请先选择学校')
    return
  }
  studentLoading.value = true
  try {
    const data = await StudentApi.getStudentPage({
      pageNo: 1,
      pageSize: 50,
      currentSchoolId: formData.value.schoolId,
      studentName: formData.value.studentName || undefined
    })
    studentList.value = data.list || []
  } finally {
    studentLoading.value = false
  }
}

const handleStudentSelect = async (row?: Student) => {
  selectedStudent.value = row
  publicationRows.value = []
  selectedPublications.value = []
  addressList.value = []
  settlementData.value = undefined
  if (!row?.id || !row.belongTo) {
    return
  }
  await Promise.all([loadPublications(row.id), loadAddresses(row.id)])
}

const loadPublications = async (studentId: number) => {
  publicationLoading.value = true
  try {
    const data = await AdminSubscriptionPublicationApi.getPublicationList(studentId)
    publicationRows.value = (data.offers || []).flatMap((offer) =>
      (offer.finalSkus || []).map((sku) => ({
        ...sku,
        offerId: offer.offerId,
        productName: offer.productName,
        rowKey: `${offer.offerId || 0}-${sku.offerSkuId || 0}-${sku.productSkuId || 0}`,
        count: 1
      }))
    )
  } finally {
    publicationLoading.value = false
  }
}

const loadAddresses = async (studentId: number) => {
  addressList.value = await TradeOrderApi.getAdminOnlineAddressList(studentId)
  formData.value.addressMode = addressList.value.length ? 'book' : 'manual'
  formData.value.addressId =
    addressList.value.find((item) => item.defaultStatus)?.id || addressList.value[0]?.id
}

const isPublicationSelectable = (row: PublicationRow) =>
  Boolean(row.purchasable) && getPublicationMaxCount(row) > 0

const isSelectedPublication = (row: PublicationRow) =>
  selectedPublications.value.some((item) => item.rowKey === row.rowKey)

const getPublicationMaxCount = (row: PublicationRow) => {
  const remaining = row.remainingQuantity ?? 0
  return Math.max(0, remaining)
}

const handlePublicationSelectionChange = (rows: PublicationRow[]) => {
  selectedPublications.value = rows
  clearSettlement()
}

const clearSettlement = () => {
  settlementData.value = undefined
}

const formatAddress = (item: TradeOrderApi.AdminOnlineAddressRespVO) =>
  `${item.name || ''} ${item.mobile || ''} ${item.areaName || ''} ${item.detailAddress || ''}`

const trimToUndefined = (value?: string) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

const validateForm = () => {
  if (!selectedStudent.value?.id) {
    message.error('请选择学生')
    return false
  }
  if (!selectedStudent.value.belongTo) {
    message.error('该学生未绑定家长，不能在线下单')
    return false
  }
  if (!selectedPublications.value.length) {
    message.error('请选择刊物')
    return false
  }
  for (const row of selectedPublications.value) {
    if (!row.offerSkuId || !row.productSkuId) {
      message.error('刊物 SKU 信息不完整')
      return false
    }
    if (!row.count || row.count < 1 || row.count > getPublicationMaxCount(row)) {
      message.error(`${row.productName || '刊物'}购买数量超出可购范围`)
      return false
    }
  }
  if (formData.value.deliveryType === DeliveryTypeEnum.EXPRESS.type) {
    if (formData.value.addressMode === 'book') {
      if (!formData.value.addressId) {
        message.error('请选择家长地址')
        return false
      }
    } else if (
      !trimToUndefined(formData.value.receiverName) ||
      !trimToUndefined(formData.value.receiverMobile) ||
      !formData.value.receiverAreaId ||
      !trimToUndefined(formData.value.receiverDetailAddress)
    ) {
      message.error('请填写完整快递地址')
      return false
    }
  }
  return true
}

const buildRequest = (): TradeOrderApi.AdminOnlineCreateReqVO => {
  const isExpress = formData.value.deliveryType === DeliveryTypeEnum.EXPRESS.type
  const useBookAddress = isExpress && formData.value.addressMode === 'book'
  return {
    studentId: selectedStudent.value?.id,
    deliveryType: formData.value.deliveryType,
    items: selectedPublications.value.map((item) => ({
      offerSkuId: item.offerSkuId,
      skuId: item.productSkuId,
      count: item.count
    })),
    addressId: useBookAddress ? formData.value.addressId : undefined,
    receiverName:
      isExpress && !useBookAddress ? trimToUndefined(formData.value.receiverName) : undefined,
    receiverMobile:
      isExpress && !useBookAddress ? trimToUndefined(formData.value.receiverMobile) : undefined,
    receiverAreaId: isExpress && !useBookAddress ? formData.value.receiverAreaId : undefined,
    receiverDetailAddress:
      isExpress && !useBookAddress
        ? trimToUndefined(formData.value.receiverDetailAddress)
        : undefined,
    remark: trimToUndefined(formData.value.remark)
  }
}

const handleSettlement = async () => {
  if (!validateForm()) {
    return
  }
  settlementLoading.value = true
  try {
    settlementData.value = await TradeOrderApi.settlementAdminOnlineOrder(buildRequest())
  } finally {
    settlementLoading.value = false
  }
}

const submitForm = async () => {
  if (!validateForm()) {
    return
  }
  formLoading.value = true
  try {
    const data = await TradeOrderApi.createAdminOnlineOrder(buildRequest())
    dialogVisible.value = false
    emit('success', true)
    await push({
      name: 'PayCashier',
      query: {
        id: data.payOrderId,
        returnUrl: encodeURIComponent(`/mall/trade/order/detail/${data.id}`),
        hideWallet: '1'
      }
    })
  } finally {
    formLoading.value = false
  }
}

const fenToYuan = (value?: number) => `￥${((value || 0) / 100).toFixed(2)}`
</script>
