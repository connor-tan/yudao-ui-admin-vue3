<template>
  <el-tree-select
    v-model="selectCategoryId"
    :data="categoryList"
    :props="treeProps"
    :check-strictly="!leafOnly"
    :multiple="multiple"
    :show-checkbox="multiple"
    class="w-1/1"
    node-key="id"
    placeholder="请选择商品分类"
  />
</template>
<script lang="ts" setup>
import { defaultProps, handleTree } from '@/utils/tree'
import * as ProductCategoryApi from '@/api/mall/product/category'
import { oneOfType } from 'vue-types'
import { propTypes } from '@/utils/propTypes'

/** 商品分类选择组件 */
defineOptions({ name: 'ProductCategorySelect' })

const props = defineProps({
  // 选中的ID
  modelValue: oneOfType<number | number[]>([Number, Array<Number>]),
  // 是否多选
  multiple: propTypes.bool.def(false),
  // 是否只允许选择叶子分类
  leafOnly: propTypes.bool.def(false),
  // 业务场景
  bizScene: propTypes.string.def(undefined),
  // 上级品类的编号
  parentId: propTypes.number.def(undefined)
})

/** 选中的分类 ID */
const selectCategoryId = computed({
  get: () => {
    return props.modelValue
  },
  set: (val: number | number[]) => {
    emit('update:modelValue', val)
  }
})

/** 分类选择 */
const emit = defineEmits(['update:modelValue'])

/** 初始化 **/
const categoryList = ref<ProductCategoryApi.CategoryVO[]>([]) // 分类树
const treeProps = computed(() => ({
  ...defaultProps,
  disabled: (data: ProductCategoryApi.CategoryVO) =>
    props.leafOnly && Array.isArray(data.children) && data.children.length > 0
}))

const loadCategoryList = async () => {
  const params: Record<string, any> = {}
  if (props.parentId !== undefined) {
    params.parentId = props.parentId
  }
  if (props.bizScene) {
    params.bizScene = props.bizScene
  }
  const data = await ProductCategoryApi.getCategoryList(params)
  categoryList.value = handleTree(data, 'id', 'parentId')
}

watch(() => [props.parentId, props.bizScene], loadCategoryList)
onMounted(loadCategoryList)
</script>
