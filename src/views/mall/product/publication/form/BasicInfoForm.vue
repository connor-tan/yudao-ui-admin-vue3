<template>
  <el-form ref="formRef" :disabled="isDetail" :model="formData" :rules="rules" label-width="120px">
    <el-form-item label="商品名称" prop="name">
      <el-input
        v-model="formData.name"
        :autosize="{ minRows: 2, maxRows: 2 }"
        :clearable="true"
        :show-word-limit="true"
        class="w-80!"
        maxlength="64"
        placeholder="请输入刊物商品名称"
        type="textarea"
      />
    </el-form-item>
    <el-form-item label="商品分类" prop="categoryId">
      <el-cascader
        v-model="formData.categoryId"
        :options="categoryList"
        :props="defaultProps"
        class="w-80!"
        clearable
        filterable
        placeholder="请选择商品分类"
      />
      <el-button :icon="RefreshRight" class="ml-1" size="small" @click="refreshCategoryList" />
    </el-form-item>
    <el-form-item label="商品品牌" prop="brandId">
      <el-select v-model="formData.brandId" class="w-80!" clearable placeholder="请选择商品品牌">
        <el-option
          v-for="item in brandList"
          :key="item.id"
          :label="item.name"
          :value="item.id as number"
        />
      </el-select>
      <el-button :icon="RefreshRight" class="ml-1" size="small" @click="refreshBrandList" />
    </el-form-item>
    <el-form-item label="商品关键字" prop="keyword">
      <el-input v-model="formData.keyword" class="w-80!" placeholder="请输入商品关键字" />
    </el-form-item>
    <el-form-item label="商品简介" prop="introduction">
      <el-input
        v-model="formData.introduction"
        :autosize="{ minRows: 2, maxRows: 2 }"
        :clearable="true"
        :show-word-limit="true"
        class="w-80!"
        maxlength="128"
        placeholder="请输入商品简介"
        type="textarea"
      />
    </el-form-item>
    <el-form-item label="商品封面图" prop="picUrl">
      <UploadImg v-model="formData.picUrl" :disabled="isDetail" height="80px" />
    </el-form-item>
    <el-form-item label="商品轮播图" prop="sliderPicUrls">
      <UploadImgs v-model="formData.sliderPicUrls" :disabled="isDetail" />
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'
import { RefreshRight } from '@element-plus/icons-vue'
import { copyValueToTarget } from '@/utils'
import { propTypes } from '@/utils/propTypes'
import { defaultProps, handleTree } from '@/utils/tree'
import * as ProductCategoryApi from '@/api/mall/product/category'
import * as ProductBrandApi from '@/api/mall/product/brand'
import type { CategoryVO } from '@/api/mall/product/category'
import type { BrandVO } from '@/api/mall/product/brand'
import type { PublicationProductVO } from '@/api/mall/product/publicationProduct'

defineOptions({ name: 'PublicationBasicInfoForm' })

const props = defineProps({
  propFormData: {
    type: Object as PropType<PublicationProductVO>,
    default: () => ({})
  },
  isDetail: propTypes.bool.def(false)
})

const message = useMessage()
const formRef = ref()
const categoryList = ref<CategoryVO[]>([])
const brandList = ref<BrandVO[]>([])
const formData = reactive<PublicationProductVO>({
  name: '',
  categoryId: undefined,
  keyword: '',
  picUrl: '',
  sliderPicUrls: [],
  introduction: '',
  brandId: undefined
})
const rules = reactive({
  name: [required],
  categoryId: [required],
  keyword: [required],
  introduction: [required],
  picUrl: [required],
  sliderPicUrls: [required]
})

watch(
  () => props.propFormData,
  (data) => {
    if (!data) return
    copyValueToTarget(formData, data)
  },
  { immediate: true }
)

const emit = defineEmits(['update:activeName'])
const validate = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    Object.assign(props.propFormData, {
      name: formData.name,
      categoryId: formData.categoryId,
      keyword: formData.keyword,
      picUrl: formData.picUrl,
      sliderPicUrls: formData.sliderPicUrls,
      introduction: formData.introduction,
      brandId: formData.brandId
    })
  } catch (e) {
    message.error('【基础信息】不完善，请填写相关信息')
    emit('update:activeName', 'basic')
    throw e
  }
}
defineExpose({ validate })

const refreshCategoryList = async () => {
  const data = await ProductCategoryApi.getCategoryList({
    status: 0,
    domainType: 'PUBLICATION'
  })
  categoryList.value = handleTree(data, 'id')
}

const refreshBrandList = async () => {
  brandList.value = await ProductBrandApi.getSimpleBrandList()
}

onMounted(async () => {
  await refreshCategoryList()
  await refreshBrandList()
})
</script>
