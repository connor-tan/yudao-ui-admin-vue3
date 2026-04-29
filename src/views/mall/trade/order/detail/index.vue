<template>
  <ContentWrap>
    <!-- 订单信息 -->
    <el-descriptions title="订单信息">
      <el-descriptions-item label="订单号: ">{{ formData.no }}</el-descriptions-item>
      <el-descriptions-item label="买家: ">{{ formData?.user?.nickname }}</el-descriptions-item>
      <el-descriptions-item label="订单类型: ">
        <dict-tag :type="DICT_TYPE.TRADE_ORDER_TYPE" :value="formData.type!" />
      </el-descriptions-item>
      <el-descriptions-item label="订单来源: ">
        <dict-tag :type="DICT_TYPE.TERMINAL" :value="formData.terminal!" />
      </el-descriptions-item>
      <el-descriptions-item label="买家留言: ">{{ formData.userRemark }}</el-descriptions-item>
      <el-descriptions-item label="商家备注: ">{{ formData.remark }}</el-descriptions-item>
      <el-descriptions-item label="支付单号: ">{{ formData.payOrderId }}</el-descriptions-item>
      <el-descriptions-item label="付款方式: ">
        <dict-tag :type="DICT_TYPE.PAY_CHANNEL_CODE" :value="formData.payChannelCode!" />
      </el-descriptions-item>
      <el-descriptions-item v-if="formData.brokerageUser" label="推广用户: ">
        {{ formData.brokerageUser?.nickname }}
      </el-descriptions-item>
    </el-descriptions>

    <!-- 订单状态 -->
    <el-descriptions :column="1" title="订单状态">
      <el-descriptions-item label="订单状态: ">
        <dict-tag :type="DICT_TYPE.TRADE_ORDER_STATUS" :value="formData.status!" />
      </el-descriptions-item>
      <el-descriptions-item v-hasPermi="['trade:order:update']" label-class-name="no-colon">
        <el-button
          v-if="formData.status! === TradeOrderStatusEnum.UNPAID.status"
          type="primary"
          @click="updatePrice"
        >
          调整价格
        </el-button>
        <el-button type="primary" @click="remark">备注</el-button>
      </el-descriptions-item>
    </el-descriptions>

    <!-- 商品信息 -->
    <el-descriptions title="商品信息">
      <el-descriptions-item labelClassName="no-colon">
        <el-table :data="formData.items" border class="w-full">
          <el-table-column label="商品" prop="spuName" min-width="180">
            <template #default="{ row }">
              {{ row.spuName }}
              <el-tag v-for="property in row.properties" :key="property.propertyId">
                {{ property.propertyName }}: {{ property.valueName }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="配送单" min-width="180">
            <template #default="{ row }">
              <template v-if="row.deliveryId && deliveryMap[row.deliveryId]">
                <div>#{{ row.deliveryId }}</div>
                <div class="text-xs text-gray-500">
                  <dict-tag
                    :type="DICT_TYPE.TRADE_DELIVERY_TYPE"
                    :value="deliveryMap[row.deliveryId].deliveryType ?? ''"
                  />
                </div>
              </template>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="订刊归属" min-width="260">
            <template #default="{ row }">
              <template v-if="row.subscriptionStudentId">
                <div>学生：{{ row.subscriptionStudentNameSnapshot }}</div>
                <div>学校：{{ row.subscriptionSchoolNameSnapshot }}</div>
                <div>班级：{{ row.subscriptionClassNameSnapshot || '-' }}</div>
                <div>年级：{{ row.subscriptionGradeNameSnapshot }}</div>
              </template>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="商品原价" prop="price" width="150">
            <template #default="{ row }">{{ fenToYuan(row.price) }}元</template>
          </el-table-column>
          <el-table-column label="数量" prop="count" width="100" />
          <el-table-column label="合计" prop="payPrice" width="150">
            <template #default="{ row }">{{ fenToYuan(row.payPrice) }}元</template>
          </el-table-column>
          <el-table-column label="售后状态" prop="afterSaleStatus" width="120">
            <template #default="{ row }">
              <dict-tag
                :type="DICT_TYPE.TRADE_ORDER_ITEM_AFTER_SALE_STATUS"
                :value="row.afterSaleStatus"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions v-if="hasDeliveries" title="配送信息">
      <el-descriptions-item labelClassName="no-colon">
        <el-table :data="formData.deliveries" border>
          <el-table-column label="配送单" min-width="120">
            <template #default="{ row }">#{{ row.id }}</template>
          </el-table-column>
          <el-table-column label="配送方式" min-width="120">
            <template #default="{ row }">
              <dict-tag :type="DICT_TYPE.TRADE_DELIVERY_TYPE" :value="row.deliveryType" />
            </template>
          </el-table-column>
          <el-table-column label="配送状态" min-width="120">
            <template #default="{ row }">
              <dict-tag :type="DICT_TYPE.TRADE_ORDER_STATUS" :value="row.status" />
            </template>
          </el-table-column>
          <el-table-column label="配送信息" min-width="320">
            <template #default="{ row }">
              <template v-if="row.deliveryType === DeliveryTypeEnum.EXPRESS.type">
                <div>收件人：{{ row.receiverName }} {{ row.receiverMobile }}</div>
                <div>{{ row.receiverAreaName }} {{ row.receiverDetailAddress }}</div>
                <div v-if="row.logisticsId || row.logisticsNo">
                  物流：{{ deliveryExpressLabel(row.logisticsId) || '-' }}
                  {{ row.logisticsNo || '' }}
                </div>
              </template>
              <template v-else-if="row.deliveryType === DeliveryTypeEnum.STATION.type">
                <div>学校：{{ row.schoolNameSnapshot }}</div>
                <div>站点：{{ row.stationNameSnapshot }}</div>
                <div>地址：{{ row.stationAddressSnapshot || '-' }}</div>
                <div>联系人：{{ row.contactName || '-' }} {{ row.contactMobile || '' }}</div>
              </template>
            </template>
          </el-table-column>
          <el-table-column label="时间" min-width="220">
            <template #default="{ row }">
              <div>发货：{{ row.deliveryTime ? formatDate(row.deliveryTime) : '-' }}</div>
              <div>收货：{{ row.receiveTime ? formatDate(row.receiveTime) : '-' }}</div>
            </template>
          </el-table-column>
          <el-table-column
            v-if="showOrderUpdateActions"
            label="操作"
            fixed="right"
            min-width="200"
          >
            <template #default="{ row }">
              <el-button
                v-if="
                  row.deliveryType === DeliveryTypeEnum.EXPRESS.type &&
                  row.status === TradeOrderStatusEnum.UNDELIVERED.status
                "
                link
                type="primary"
                @click="delivery(row)"
              >
                发货
              </el-button>
              <el-button
                v-if="
                  row.deliveryType === DeliveryTypeEnum.EXPRESS.type &&
                  row.status === TradeOrderStatusEnum.UNDELIVERED.status
                "
                link
                type="primary"
                @click="updateAddress(row)"
              >
                修改地址
              </el-button>
              <el-button
                v-if="
                  row.deliveryType === DeliveryTypeEnum.STATION.type &&
                  row.status === TradeOrderStatusEnum.UNDELIVERED.status
                "
                link
                type="primary"
                @click="handleStationDelivery(row)"
              >
                标记配送
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions :column="4">
      <!-- 第一层 -->
      <el-descriptions-item label="商品总额: ">
        {{ fenToYuan(formData.totalPrice!) }} 元
      </el-descriptions-item>
      <el-descriptions-item label="运费金额: ">
        {{ fenToYuan(formData.deliveryPrice!) }} 元
      </el-descriptions-item>
      <el-descriptions-item label="订单调价: ">
        {{ fenToYuan(formData.adjustPrice!) }} 元
      </el-descriptions-item>
      <el-descriptions-item v-for="item in 1" :key="item" label-class-name="no-colon" />
      <!-- 第二层 -->
      <el-descriptions-item>
        <template #label><span style="color: red">优惠劵优惠: </span></template>
        {{ fenToYuan(formData.couponPrice!) }} 元
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label><span style="color: red">VIP 优惠: </span></template>
        {{ fenToYuan(formData.vipPrice!) }} 元
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label><span style="color: red">活动优惠: </span></template>
        {{ fenToYuan(formData.discountPrice!) }} 元
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label><span style="color: red">积分抵扣: </span></template>
        {{ fenToYuan(formData.pointPrice!) }} 元
      </el-descriptions-item>
      <!-- 第三层 -->
      <el-descriptions-item v-for="item in 3" :key="item" label-class-name="no-colon" />
      <el-descriptions-item label="应付金额: ">
        {{ fenToYuan(formData.payPrice!) }} 元
      </el-descriptions-item>
    </el-descriptions>

    <!-- 物流信息 -->
    <el-descriptions v-if="!hasDeliveries" :column="4" title="收货信息">
      <el-descriptions-item label="配送方式: ">
        <dict-tag :type="DICT_TYPE.TRADE_DELIVERY_TYPE" :value="formData.deliveryType!" />
      </el-descriptions-item>
      <el-descriptions-item label="收货人: ">{{ formData.receiverName }}</el-descriptions-item>
      <el-descriptions-item label="联系电话: ">{{ formData.receiverMobile }}</el-descriptions-item>
      <!-- 快递配送 -->
      <div v-if="formData.deliveryType === DeliveryTypeEnum.EXPRESS.type">
        <el-descriptions-item v-if="formData.receiverDetailAddress" label="收货地址: ">
          {{ formData.receiverAreaName }} {{ formData.receiverDetailAddress }}
          <el-link
            v-clipboard:copy="formData.receiverAreaName + ' ' + formData.receiverDetailAddress"
            v-clipboard:success="clipboardSuccess"
            icon="ep:document-copy"
            type="primary"
          />
        </el-descriptions-item>
        <el-descriptions-item v-if="formData.logisticsId" label="物流公司: ">
          {{ deliveryExpressList.find((item) => item.id === formData.logisticsId)?.name }}
        </el-descriptions-item>
        <el-descriptions-item v-if="formData.logisticsId" label="运单号: ">
          {{ formData.logisticsNo }}
        </el-descriptions-item>
        <el-descriptions-item v-if="formData.deliveryTime" label="发货时间: ">
          {{ formatDate(formData.deliveryTime) }}
        </el-descriptions-item>
        <el-descriptions-item v-for="item in 2" :key="item" label-class-name="no-colon" />
        <el-descriptions-item v-if="expressTrackList.length > 0" label="物流详情: ">
          <el-timeline>
            <el-timeline-item
              v-for="(express, index) in expressTrackList"
              :key="index"
              :timestamp="formatDate(express.time)"
            >
              {{ express.content }}
            </el-timeline-item>
          </el-timeline>
        </el-descriptions-item>
      </div>
      <!-- 自提门店 -->
      <div v-if="formData.deliveryType === DeliveryTypeEnum.PICK_UP.type">
        <el-descriptions-item v-if="formData.pickUpStoreId" label="自提门店: ">
          {{ pickUpStore?.name }}
        </el-descriptions-item>
      </div>
    </el-descriptions>

    <!-- 订单日志 -->
    <el-descriptions title="订单操作日志">
      <el-descriptions-item labelClassName="no-colon">
        <el-timeline>
          <el-timeline-item
            v-for="(log, index) in formData.logs"
            :key="index"
            :timestamp="formatDate(log.createTime!)"
            placement="top"
          >
            <div class="el-timeline-right-content">
              {{ log.content }}
            </div>
            <template #dot>
              <span
                :style="{ backgroundColor: getUserTypeColor(log.userType!) }"
                class="dot-node-style"
              >
                {{ getDictLabel(DICT_TYPE.USER_TYPE, log.userType)[0] }}
              </span>
            </template>
          </el-timeline-item>
        </el-timeline>
      </el-descriptions-item>
    </el-descriptions>
  </ContentWrap>

  <!-- 各种操作的弹窗 -->
  <OrderDeliveryForm ref="deliveryFormRef" @success="getDetail" />
  <OrderUpdateRemarkForm ref="updateRemarkForm" @success="getDetail" />
  <OrderUpdateAddressForm ref="updateAddressFormRef" @success="getDetail" />
  <OrderUpdatePriceForm ref="updatePriceFormRef" @success="getDetail" />
</template>
<script lang="ts" setup>
import * as TradeOrderApi from '@/api/mall/trade/order'
import { fenToYuan } from '@/utils'
import { formatDate } from '@/utils/formatTime'
import { DICT_TYPE, getDictLabel, getDictObj } from '@/utils/dict'
import OrderUpdateRemarkForm from '@/views/mall/trade/order/form/OrderUpdateRemarkForm.vue'
import OrderDeliveryForm from '@/views/mall/trade/order/form/OrderDeliveryForm.vue'
import OrderUpdateAddressForm from '@/views/mall/trade/order/form/OrderUpdateAddressForm.vue'
import OrderUpdatePriceForm from '@/views/mall/trade/order/form/OrderUpdatePriceForm.vue'
import * as DeliveryExpressApi from '@/api/mall/trade/delivery/express'
import { computed } from 'vue'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { DeliveryTypeEnum, TradeOrderStatusEnum } from '@/utils/constants'
import * as DeliveryPickUpStoreApi from '@/api/mall/trade/delivery/pickUpStore'
import { propTypes } from '@/utils/propTypes'

defineOptions({ name: 'TradeOrderDetail' })

const message = useMessage() // 消息弹窗

/** 获得 userType 颜色 */
const getUserTypeColor = (type: number) => {
  const dict = getDictObj(DICT_TYPE.USER_TYPE, type)
  switch (dict?.colorType) {
    case 'success':
      return '#67C23A'
    case 'info':
      return '#909399'
    case 'warning':
      return '#E6A23C'
    case 'danger':
      return '#F56C6C'
  }
  return '#409EFF'
}

// 订单详情
const createFormData = (): TradeOrderApi.OrderVO => ({
  items: [],
  logs: [],
  deliveries: []
})
const formData = ref<TradeOrderApi.OrderVO>(createFormData())
const hasDeliveries = computed(() => (formData.value.deliveries?.length || 0) > 0)
const deliveryMap = computed<Record<number, TradeOrderApi.OrderDeliveryRespVO>>(() =>
  (formData.value.deliveries || []).reduce(
    (acc, delivery) => {
      if (delivery.id != null) {
        acc[delivery.id] = delivery
      }
      return acc
    },
    {} as Record<number, TradeOrderApi.OrderDeliveryRespVO>
  )
)
const showOrderUpdateActions = computed(() => true)

/** 各种操作 */
const updateRemarkForm = ref<InstanceType<typeof OrderUpdateRemarkForm>>() // 订单备注表单 Ref
const remark = () => {
  updateRemarkForm.value?.open(formData.value)
}
const deliveryFormRef = ref<InstanceType<typeof OrderDeliveryForm>>() // 发货表单 Ref
const delivery = (delivery?: TradeOrderApi.OrderDeliveryRespVO) => {
  if (delivery?.id) {
    deliveryFormRef.value?.open({
      deliveryId: delivery.id,
      logisticsId: delivery.logisticsId || null,
      logisticsNo: delivery.logisticsNo || ''
    })
    return
  }
  deliveryFormRef.value?.open({
    id: formData.value.id ?? undefined,
    logisticsId: formData.value.logisticsId ?? null,
    logisticsNo: formData.value.logisticsNo || ''
  })
}
const updateAddressFormRef = ref<InstanceType<typeof OrderUpdateAddressForm>>() // 收货地址表单 Ref
const updateAddress = (delivery?: TradeOrderApi.OrderDeliveryRespVO) => {
  const expressDelivery =
    delivery || formData.value.deliveries?.find((item) => item.deliveryType === DeliveryTypeEnum.EXPRESS.type)
  if (!expressDelivery) {
    return
  }
  updateAddressFormRef.value?.open({
    id: formData.value.id,
    receiverName: expressDelivery.receiverName || '',
    receiverMobile: expressDelivery.receiverMobile || '',
    receiverAreaId: expressDelivery.receiverAreaId || null,
    receiverDetailAddress: expressDelivery.receiverDetailAddress || ''
  })
}
const updatePriceFormRef = ref<InstanceType<typeof OrderUpdatePriceForm>>() // 订单调价表单 Ref
const updatePrice = () => {
  updatePriceFormRef.value?.open(formData.value)
}

const handleStationDelivery = async (delivery: TradeOrderApi.OrderDeliveryRespVO) => {
  if (!delivery.id) {
    return
  }
  try {
    await message.confirm('确认已完成该学校配送单的站点配送吗？')
    await TradeOrderApi.stationDeliveryOrder(delivery.id)
    message.success('操作成功')
    await getDetail()
  } catch {}
}

const deliveryExpressLabel = (id?: number | null) => {
  if (!id) {
    return ''
  }
  return deliveryExpressList.value.find((item) => item.id === id)?.name || ''
}

/** 获得详情 */
const { params } = useRoute() // 查询参数
const props = defineProps({
  id: propTypes.number.def(undefined), // 订单ID
  showPickUp: propTypes.bool.def(true) // 显示核销按钮
})
const id = (params.id || props.id) as unknown as number
const getDetail = async () => {
  if (id) {
    const res = await TradeOrderApi.getOrder(id)
    // 没有表单信息则关闭页面返回
    if (!res) {
      message.error('交易订单不存在')
      close()
      return
    }
    formData.value = res
  }
}

/** 关闭 tag */
const { delView } = useTagsViewStore() // 视图操作
const { push, currentRoute } = useRouter() // 路由
const close = () => {
  delView(unref(currentRoute))
  push({ name: 'TradeOrder' })
}

/** 复制 */
const clipboardSuccess = () => {
  message.success('复制成功')
}

/** 初始化 **/
const deliveryExpressList = ref<DeliveryExpressApi.DeliveryExpressVO[]>([]) // 物流公司
const expressTrackList = ref<TradeOrderApi.OrderExpressTrackRespVO[]>([]) // 物流详情
const pickUpStore = ref<DeliveryPickUpStoreApi.DeliveryPickUpStoreVO>() // 自提门店
onMounted(async () => {
  await getDetail()
  const hasExpressDelivery =
    formData.value.deliveryType === DeliveryTypeEnum.EXPRESS.type ||
    (formData.value.deliveries || []).some(
      (item) => item.deliveryType === DeliveryTypeEnum.EXPRESS.type
    )
  // 如果存在快递配送单，则查询物流公司
  if (hasExpressDelivery) {
    deliveryExpressList.value = await DeliveryExpressApi.getSimpleDeliveryExpressList()
    if (formData.value.logisticsId && !hasDeliveries.value) {
      expressTrackList.value = await TradeOrderApi.getExpressTrackList(formData.value.id!)
    }
  } else if (formData.value.deliveryType === DeliveryTypeEnum.PICK_UP.type) {
    if (formData.value.pickUpStoreId) {
      pickUpStore.value = await DeliveryPickUpStoreApi.getDeliveryPickUpStore(formData.value.pickUpStoreId)
    }
  }
})
</script>
<style lang="scss" scoped>
:deep(.el-descriptions) {
  &:not(:nth-child(1)) {
    margin-top: 20px;
  }

  .el-descriptions__title {
    display: flex;
    align-items: center;

    &::before {
      display: inline-block;
      width: 3px;
      height: 20px;
      margin-right: 10px;
      background-color: #409eff;
      content: '';
    }
  }

  .el-descriptions-item__container {
    margin: 0 10px;

    .no-colon {
      margin: 0;

      &::after {
        content: '';
      }
    }
  }
}

// 时间线样式调整
:deep(.el-timeline) {
  margin: 10px 0 0 160px;

  .el-timeline-item__wrapper {
    position: relative;
    top: -20px;

    .el-timeline-item__timestamp {
      position: absolute !important;
      top: 10px;
      left: -150px;
    }
  }

  .el-timeline-right-content {
    display: flex;
    align-items: center;
    min-height: 30px;
    padding: 10px;
    border-radius: var(--el-card-border-radius);
    background-color: var(--app-content-bg-color);

    &::before {
      position: absolute;
      top: 10px;
      left: 13px; /* 将伪元素水平居中 */
      border-color: transparent var(--app-content-bg-color) transparent transparent; /* 尖角颜色，左侧朝向 */
      border-style: solid;
      border-width: 8px; /* 调整尖角大小 */
      content: ''; /* 必须设置 content 属性 */
    }
  }

  .dot-node-style {
    position: absolute;
    left: -5px;
    display: flex;
    width: 20px;
    height: 20px;
    font-size: 10px;
    color: #fff;
    border-radius: 50%;
    justify-content: center;
    align-items: center;
  }
}
</style>
