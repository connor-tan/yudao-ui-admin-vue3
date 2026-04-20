<template>
  <el-alert title="重要提示，按年级进行SPU分类。例如：一年级的语文书和二年级的语文书，属于两种不同的商品。" type="success" />
  <ContentWrap>
    <el-tabs v-model="activeDomainTab">
      <el-tab-pane label="刊物商品" name="PUBLICATION" />
      <el-tab-pane label="普通商品" name="NORMAL" />
    </el-tabs>
  </ContentWrap>

  <KeepAlive>
    <component :is="currentComponent" />
  </KeepAlive>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue'
import { useCache } from '@/hooks/web/useCache'
import ProductSpu from '@/views/mall/product/spu/index.vue'
import ProductPublication from '@/views/mall/product/publication/index.vue'

defineOptions({ name: 'ProductCenter' })

const PRODUCT_CENTER_DOMAIN_TAB_CACHE_KEY = 'product-center-domain-tab'
const { wsCache } = useCache()
const route = useRoute()

const activeDomainTab = ref<'NORMAL' | 'PUBLICATION'>(
  wsCache.get(PRODUCT_CENTER_DOMAIN_TAB_CACHE_KEY) || 'NORMAL'
)

const currentComponent = computed(() =>
  activeDomainTab.value === 'PUBLICATION' ? ProductPublication : ProductSpu
)

watch(
  activeDomainTab,
  (value) => {
    wsCache.set(PRODUCT_CENTER_DOMAIN_TAB_CACHE_KEY, value)
  },
  { immediate: true }
)

watch(
  () => route.query.domainType,
  (value) => {
    if (value === 'NORMAL' || value === 'PUBLICATION') {
      activeDomainTab.value = value
    }
  },
  { immediate: true }
)
</script>
