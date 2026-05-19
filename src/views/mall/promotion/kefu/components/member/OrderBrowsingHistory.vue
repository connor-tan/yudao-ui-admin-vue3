<template>
  <div v-loading="loading">
    <OrderItem v-for="item in list" :key="item.id" :order="item" class="mb-10px" />
    <el-empty v-if="!loading && list.length === 0" description="暂无交易订单" :image-size="80" />
  </div>
</template>

<script lang="ts" setup>
import OrderItem from '@/views/mall/promotion/kefu/components/message/OrderItem.vue'
import { KeFuConversationRespVO } from '@/api/mall/promotion/kefu/conversation'
import { getOrderPage } from '@/api/mall/trade/order'

defineOptions({ name: 'OrderBrowsingHistory' })

const list = ref<any[]>([]) // 列表
const total = ref(0) // 总数
const loading = ref(false) // 加载中
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: 0
})
const skipGetMessageList = computed(() => {
  // 已加载到最后一页的话则不触发新的消息获取
  return total.value === 0 || Math.ceil(total.value / queryParams.pageSize) <= queryParams.pageNo
}) // 跳过消息获取

/** 获得浏览记录 */
const getHistoryList = async (val: KeFuConversationRespVO) => {
  queryParams.pageNo = 1
  queryParams.userId = val.userId
  total.value = 0
  list.value = []
  loading.value = true
  try {
    const res = await getOrderPage(queryParams)
    total.value = res.total
    list.value = res.list || []
  } finally {
    loading.value = false
  }
}

/** 加载下一页数据 */
const loadMore = async () => {
  if (loading.value || skipGetMessageList.value) {
    return
  }
  const nextPageNo = queryParams.pageNo + 1
  loading.value = true
  try {
    const res = await getOrderPage({ ...queryParams, pageNo: nextPageNo })
    queryParams.pageNo = nextPageNo
    total.value = res.total
    list.value = list.value.concat(res.list || [])
  } finally {
    loading.value = false
  }
}
defineExpose({ getHistoryList, loadMore })
</script>
