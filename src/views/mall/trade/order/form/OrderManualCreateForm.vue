<template>
  <Dialog v-model="dialogVisible" title="手动创建订单" width="920px">
    <el-form ref="formRef" v-loading="formLoading" :model="formData" label-width="110px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="默认配送方式">
            <el-select v-model="formData.deliveryType" clearable placeholder="请选择" class="w-full">
              <el-option
                v-for="item in deliveryTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="整单金额">
            <el-input-number
              v-model="formData.manualOrderPriceYuan"
              :min="0.01"
              :precision="2"
              :step="1"
              class="!w-220px"
              controls-position="right"
              placeholder="按商品合计"
            />
            <span class="ml-8px">元</span>
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">商品明细</el-divider>
      <div class="mb-10px flex justify-end">
        <el-button type="primary" plain @click="addItem">
          <Icon icon="ep:plus" class="mr-5px" />
          新增商品
        </el-button>
      </div>
      <el-table :data="formData.items" border>
        <el-table-column label="SKU 编号" min-width="130">
          <template #default="{ row }">
            <el-input-number
              v-model="row.skuId"
              :controls="false"
              :min="1"
              :precision="0"
              class="!w-full"
            />
          </template>
        </el-table-column>
        <el-table-column label="数量" width="110">
          <template #default="{ row }">
            <el-input-number
              v-model="row.count"
              :min="1"
              :precision="0"
              class="!w-full"
              controls-position="right"
            />
          </template>
        </el-table-column>
        <el-table-column label="配送方式" min-width="135">
          <template #default="{ row }">
            <el-select v-model="row.deliveryType" clearable placeholder="默认">
              <el-option
                v-for="item in deliveryTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="学生编号" min-width="130">
          <template #default="{ row }">
            <el-input-number
              v-model="row.studentId"
              :controls="false"
              :min="1"
              :precision="0"
              class="!w-full"
            />
          </template>
        </el-table-column>
        <el-table-column label="窗口 SKU" min-width="130">
          <template #default="{ row }">
            <el-input-number
              v-model="row.offerSkuId"
              :controls="false"
              :min="1"
              :precision="0"
              class="!w-full"
            />
          </template>
        </el-table-column>
        <el-table-column label="自定义单价" min-width="150">
          <template #default="{ row }">
            <el-input-number
              v-model="row.manualUnitPriceYuan"
              :min="0.01"
              :precision="2"
              :step="1"
              class="!w-full"
              controls-position="right"
              placeholder="SKU 售价"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="90" align="center">
          <template #default="{ $index }">
            <el-button
              :disabled="formData.items.length === 1"
              link
              type="danger"
              @click="removeItem($index)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <template v-if="hasExpressDelivery">
        <el-divider content-position="left">快递信息</el-divider>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="收件人">
              <el-input v-model="formData.receiverName" placeholder="请输入收件人名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号">
              <el-input v-model="formData.receiverMobile" placeholder="请输入收件人手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所在地">
              <el-tree-select
                v-model="formData.receiverAreaId"
                :data="areaList"
                :props="defaultProps"
                :render-after-expand="true"
                class="w-full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="详细地址">
              <el-input
                v-model="formData.receiverDetailAddress"
                :rows="2"
                placeholder="请输入收件人详细地址"
                type="textarea"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </template>

      <template v-if="hasPickUpDelivery">
        <el-divider content-position="left">自提信息</el-divider>
        <el-form-item label="自提门店">
          <el-select v-model="formData.pickUpStoreId" clearable filterable placeholder="请选择">
            <el-option
              v-for="item in props.pickUpStoreList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </template>

      <el-form-item label="商家备注">
        <el-input v-model="formData.remark" :rows="3" placeholder="请输入商家备注" type="textarea" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import type { FormInstance } from 'element-plus'
import * as AreaApi from '@/api/system/area'
import * as TradeOrderApi from '@/api/mall/trade/order'
import type { DeliveryPickUpStoreVO } from '@/api/mall/trade/delivery/pickUpStore'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { defaultProps } from '@/utils/tree'
import { DeliveryTypeEnum } from '@/utils/constants'

defineOptions({ name: 'OrderManualCreateForm' })

const props = defineProps<{
  pickUpStoreList: DeliveryPickUpStoreVO[]
}>()
const emit = defineEmits(['success'])
const message = useMessage()

type ManualOrderFormItem = Omit<TradeOrderApi.ManualOrderItemReqVO, 'manualUnitPrice'> & {
  manualUnitPriceYuan?: number
}

type ManualOrderFormData = Omit<
  TradeOrderApi.ManualOrderCreateReqVO,
  'items' | 'manualOrderPrice'
> & {
  items: ManualOrderFormItem[]
  manualOrderPriceYuan?: number
}

const createItem = (): ManualOrderFormItem => ({
  count: 1
})

const createFormData = (): ManualOrderFormData => ({
  items: [createItem()],
  deliveryType: DeliveryTypeEnum.EXPRESS.type,
  receiverName: '',
  receiverMobile: '',
  receiverAreaId: undefined,
  receiverDetailAddress: '',
  pickUpStoreId: undefined,
  remark: '',
  manualOrderPriceYuan: undefined
})

const dialogVisible = ref(false)
const formLoading = ref(false)
const formRef = ref<FormInstance>()
const areaList = ref<AreaApi.AreaNodeVO[]>([])
const formData = ref<ManualOrderFormData>(createFormData())

const deliveryTypeOptions = computed(() =>
  getIntDictOptions(DICT_TYPE.TRADE_DELIVERY_TYPE).filter(
    (item) => item.value !== DeliveryTypeEnum.MIXED.type
  )
)

const getEffectiveDeliveryType = (item: ManualOrderFormItem) =>
  item.deliveryType || formData.value.deliveryType
const hasExpressDelivery = computed(() =>
  formData.value.items.some(
    (item) => getEffectiveDeliveryType(item) === DeliveryTypeEnum.EXPRESS.type
  )
)
const hasPickUpDelivery = computed(() =>
  formData.value.items.some(
    (item) => getEffectiveDeliveryType(item) === DeliveryTypeEnum.PICK_UP.type
  )
)

const open = async () => {
  resetForm()
  if (!areaList.value.length) {
    areaList.value = await AreaApi.getEnabledAreaTree()
  }
  dialogVisible.value = true
}
defineExpose({ open })

const addItem = () => {
  formData.value.items.push(createItem())
}

const removeItem = (index: number) => {
  formData.value.items.splice(index, 1)
}

const yuanToFen = (value?: number) => {
  if (value === undefined || value === null) {
    return undefined
  }
  return Math.round(Number(value) * 100)
}

const trimToUndefined = (value?: string) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

const validateForm = () => {
  if (!formData.value.items.length) {
    message.error('请添加商品')
    return false
  }
  for (const [index, item] of formData.value.items.entries()) {
    if (!item.skuId) {
      message.error(`第 ${index + 1} 行商品 SKU 编号不能为空`)
      return false
    }
    if (!item.count || item.count <= 0) {
      message.error(`第 ${index + 1} 行数量必须大于 0`)
      return false
    }
    if (!getEffectiveDeliveryType(item)) {
      message.error(`第 ${index + 1} 行配送方式不能为空`)
      return false
    }
    if ((item.studentId && !item.offerSkuId) || (!item.studentId && item.offerSkuId)) {
      message.error(`第 ${index + 1} 行学生编号和窗口 SKU 需要同时填写`)
      return false
    }
  }
  if (hasExpressDelivery.value) {
    if (
      !trimToUndefined(formData.value.receiverName) ||
      !trimToUndefined(formData.value.receiverMobile) ||
      !formData.value.receiverAreaId ||
      !trimToUndefined(formData.value.receiverDetailAddress)
    ) {
      message.error('快递订单请填写完整收件信息')
      return false
    }
  }
  if (hasPickUpDelivery.value && !formData.value.pickUpStoreId) {
    message.error('自提订单请选择自提门店')
    return false
  }
  return true
}

const submitForm = async () => {
  if (!validateForm()) {
    return
  }
  formLoading.value = true
  try {
    const data: TradeOrderApi.ManualOrderCreateReqVO = {
      deliveryType: formData.value.deliveryType,
      manualOrderPrice: yuanToFen(formData.value.manualOrderPriceYuan),
      receiverName: trimToUndefined(formData.value.receiverName),
      receiverMobile: trimToUndefined(formData.value.receiverMobile),
      receiverAreaId: formData.value.receiverAreaId,
      receiverDetailAddress: trimToUndefined(formData.value.receiverDetailAddress),
      pickUpStoreId: formData.value.pickUpStoreId,
      remark: trimToUndefined(formData.value.remark),
      items: formData.value.items.map((item) => ({
        skuId: item.skuId,
        count: item.count,
        deliveryType: item.deliveryType,
        studentId: item.studentId,
        offerSkuId: item.offerSkuId,
        manualUnitPrice: yuanToFen(item.manualUnitPriceYuan)
      }))
    }
    const orderId = await TradeOrderApi.createManualOrder(data)
    message.success(`创建成功，订单编号：${orderId}`)
    dialogVisible.value = false
    emit('success', true)
  } finally {
    formLoading.value = false
  }
}

const resetForm = () => {
  formData.value = createFormData()
  formRef.value?.resetFields()
}
</script>
