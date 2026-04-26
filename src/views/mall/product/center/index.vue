<template>
  <el-alert
    title="刊物商品不再按年级拆 SPU。请在统一商品页中维护刊物基础资料，并在 SKU 上配置周期、版本和适用年级。"
    type="success"
  />
  <ProductSpu />
</template>

<script lang="ts" setup>
import ProductSpu from '@/views/mall/product/spu/index.vue'

defineOptions({ name: 'ProductCenter' })
</script>
