<!-- 商品发布 - 基础设置 -->
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
        placeholder="请输入商品名称"
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
        @change="handleCategoryChange"
      />
      <el-button :icon="RefreshRight" class="ml-1" size="small" @click="refreshCategoryList" />
    </el-form-item>
    <el-form-item v-if="!hasBizScene" label="字段说明">
      <div class="w-80 text-13px text-gray-500">
        请选择商品分类，系统会根据分类所属业务场景自动展示普通商品或刊物商品字段。
      </div>
    </el-form-item>
    <el-form-item v-if="isNormalScene" label="商品品牌" prop="brandId">
      <el-select v-model="formData.brandId" class="w-80!" placeholder="请选择商品品牌">
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

    <template v-if="isPublicationScene">
      <el-divider content-position="left">刊物信息</el-divider>
      <el-form-item label="出版社" prop="publicationExt.publisherId">
        <el-select
          v-model="formData.publicationExt!.publisherId"
          class="w-80!"
          clearable
          placeholder="请选择出版社"
        >
          <el-option
            v-for="item in publisherList"
            :key="item.id"
            :label="item.name"
            :value="item.id as number"
          />
        </el-select>
        <el-button :icon="RefreshRight" class="ml-1" size="small" @click="refreshPublisherList" />
      </el-form-item>
      <el-form-item label="刊物类型" prop="publicationExt.publicationTypeId">
        <el-select
          v-model="formData.publicationExt!.publicationTypeId"
          class="w-80!"
          clearable
          placeholder="请选择刊物类型"
          @change="handlePublicationTypeChange"
        >
          <el-option
            v-for="item in publicationTypeList"
            :key="item.id"
            :label="item.name"
            :value="item.id as number"
          />
        </el-select>
        <el-button :icon="RefreshRight" class="ml-1" size="small" @click="refreshPublicationTypeList" />
      </el-form-item>
      <el-form-item v-if="selectedPublicationType" label="标识规则">
        <div class="w-80">
          <el-alert
            :closable="false"
            :show-icon="true"
            :title="publicationTypeIdentifierHint"
            :type="requiresTitleIdentifierRule ? 'warning' : 'info'"
          />
        </div>
      </el-form-item>
      <el-form-item label="出刊周期" prop="publicationExt.issueCycle">
        <el-select
          v-model="formData.publicationExt!.issueCycle"
          class="w-80!"
          clearable
          placeholder="请选择出刊周期"
        >
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.EDU_CYCLE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="selectedPublicationType" :required="requiresTitleIdentifierRule" label="刊物标识">
        <div class="w-80 text-12px text-gray-500">
          {{
            requiresTitleIdentifierRule
              ? '以下 3 个字段至少填写 1 项。'
              : '以下 3 个字段按需填写，当前刊物类型不要求必填。'
          }}
        </div>
      </el-form-item>
      <el-form-item label="ISSN" prop="publicationExt.issn">
        <el-input
          v-model="formData.publicationExt!.issn"
          class="w-80!"
          :placeholder="getTitleIdentifierPlaceholder('ISSN')"
        />
      </el-form-item>
      <el-form-item label="CN 刊号" prop="publicationExt.cnCode">
        <el-input
          v-model="formData.publicationExt!.cnCode"
          class="w-80!"
          :placeholder="getTitleIdentifierPlaceholder('CN 刊号')"
        />
      </el-form-item>
      <el-form-item label="邮发代号" prop="publicationExt.postDistributionCode">
        <el-input
          v-model="formData.publicationExt!.postDistributionCode"
          class="w-80!"
          :placeholder="getTitleIdentifierPlaceholder('邮发代号')"
        />
      </el-form-item>
    </template>
  </el-form>
</template>

<script lang="ts" setup>
import { computed, PropType } from 'vue'
import { cloneDeep } from 'lodash-es'
import { copyValueToTarget } from '@/utils'
import { propTypes } from '@/utils/propTypes'
import { defaultProps, handleTree } from '@/utils/tree'
import { DICT_TYPE, getStrDictOptions } from '@/utils/dict'
import type { Spu } from '@/api/mall/product/spu'
import * as ProductSpuApi from '@/api/mall/product/spu'
import * as ProductCategoryApi from '@/api/mall/product/category'
import { CategoryVO } from '@/api/mall/product/category'
import * as ProductBrandApi from '@/api/mall/product/brand'
import { BrandVO } from '@/api/mall/product/brand'
import * as PublicationPublisherApi from '@/api/edu/publicationPublisher'
import * as PublicationTypeApi from '@/api/edu/publicationType'
import { RefreshRight } from '@element-plus/icons-vue'
import {
  createNormalSku,
  createPublicationSku,
  createPublicationSpuExt,
  resolveCategoryBizScene
} from './helpers'

defineOptions({ name: 'ProductSpuInfoForm' })

type SpuInfoFormData = Spu & {
  sliderPicUrls: string[]
  publicationExt: NonNullable<Spu['publicationExt']>
}

const props = defineProps({
  propFormData: {
    type: Object as PropType<Spu>,
    default: () => ({})
  },
  isDetail: propTypes.bool.def(false)
})

const message = useMessage()

const formRef = ref()
const formData = reactive<SpuInfoFormData>({
  bizScene: undefined,
  name: '',
  categoryId: undefined,
  keyword: '',
  picUrl: '',
  sliderPicUrls: [],
  introduction: '',
  brandId: undefined,
  publicationExt: createPublicationSpuExt(),
  skus: []
})

const lastCategoryId = ref<number | string | undefined>(undefined)
const lastBizScene = ref<string | undefined>(undefined)
const hasBizScene = computed(() => !!formData.bizScene)
const isPublicationScene = computed(() => formData.bizScene === ProductSpuApi.BIZ_SCENE_PUBLICATION)
const isNormalScene = computed(() => formData.bizScene === ProductSpuApi.BIZ_SCENE_NORMAL)
const selectedPublicationType = computed(() =>
  publicationTypeList.value.find((item) => item.id === formData.publicationExt?.publicationTypeId)
)
const requiresTitleIdentifierRule = computed(() =>
  PublicationTypeApi.requiresTitleIdentifier(selectedPublicationType.value?.identifierRule)
)
const publicationTypeIdentifierHint = computed(() =>
  PublicationTypeApi.getPublicationTypeIdentifierRuleHint(selectedPublicationType.value?.identifierRule)
)

const validateBrand = (_rule, value, callback) => {
  if (!isNormalScene.value || value) {
    callback()
    return
  }
  callback(new Error('请选择商品品牌'))
}
const validatePublicationPublisher = (_rule, value, callback) => {
  if (!isPublicationScene.value || value) {
    callback()
    return
  }
  callback(new Error('请选择出版社'))
}
const validatePublicationType = (_rule, value, callback) => {
  if (!isPublicationScene.value || value) {
    callback()
    return
  }
  callback(new Error('请选择刊物类型'))
}
const validateIssueCycle = (_rule, value, callback) => {
  if (!isPublicationScene.value || value) {
    callback()
    return
  }
  callback(new Error('请选择出刊周期'))
}
const validateTitleIdentifier = (_rule, _value, callback) => {
  if (
    !requiresTitleIdentifierRule.value ||
    formData.publicationExt.issn ||
    formData.publicationExt.cnCode ||
    formData.publicationExt.postDistributionCode
  ) {
    callback()
    return
  }
  callback(new Error('请至少填写 ISSN、CN 刊号、邮发代号之一'))
}

const rules = reactive({
  name: [required],
  categoryId: [required],
  keyword: [required],
  introduction: [required],
  picUrl: [required],
  sliderPicUrls: [required],
  brandId: [{ validator: validateBrand, trigger: 'change' }],
  'publicationExt.publisherId': [{ validator: validatePublicationPublisher, trigger: 'change' }],
  'publicationExt.publicationTypeId': [{ validator: validatePublicationType, trigger: 'change' }],
  'publicationExt.issueCycle': [{ validator: validateIssueCycle, trigger: 'change' }],
  'publicationExt.issn': [{ validator: validateTitleIdentifier, trigger: 'blur' }],
  'publicationExt.cnCode': [{ validator: validateTitleIdentifier, trigger: 'blur' }],
  'publicationExt.postDistributionCode': [{ validator: validateTitleIdentifier, trigger: 'blur' }]
})

watch(
  () => props.propFormData,
  (data) => {
    if (!data) {
      return
    }
    lastCategoryId.value = data.categoryId
    lastBizScene.value = data.bizScene
    copyValueToTarget(formData, {
      ...data,
      publicationExt: {
        ...createPublicationSpuExt(),
        ...(data.publicationExt || {})
      }
    })
  },
  {
    immediate: true,
    deep: true
  }
)

const emit = defineEmits(['update:activeName'])
const validate = async () => {
  if (!formRef) return
  try {
    await unref(formRef)?.validate()
    Object.assign(props.propFormData, buildInfoSubmitData())
  } catch (e) {
    message.error('【基础设置】不完善，请填写相关信息')
    emit('update:activeName', 'info')
    throw e
  }
}
defineExpose({ validate })

const brandList = ref<BrandVO[]>([])
const categoryList = ref<CategoryVO[]>([])
const publisherList = ref<PublicationPublisherApi.PublicationPublisherSimpleVO[]>([])
const publicationTypeList = ref<PublicationTypeApi.PublicationTypeSimpleVO[]>([])

async function refreshCategoryList() {
  const data = await ProductCategoryApi.getCategoryList({
    status: 0
  })
  categoryList.value = handleTree(data, 'id', 'parentId')
}

async function refreshBrandList() {
  brandList.value = await ProductBrandApi.getSimpleBrandList()
}

async function refreshPublisherList() {
  publisherList.value = await PublicationPublisherApi.getPublicationPublisherSimpleList()
}

async function refreshPublicationTypeList() {
  publicationTypeList.value = await PublicationTypeApi.getPublicationTypeSimpleList()
}

const handlePublicationTypeChange = async () => {
  syncSceneStateToParent()
  await nextTick()
  formRef.value?.clearValidate?.([
    'publicationExt.issn',
    'publicationExt.cnCode',
    'publicationExt.postDistributionCode'
  ])
}

const getTitleIdentifierPlaceholder = (fieldLabel: string) => {
  return requiresTitleIdentifierRule.value
    ? `请输入 ${fieldLabel}（当前类型要求至少填写 1 项）`
    : `请输入 ${fieldLabel}`
}

const buildInfoSubmitData = () => ({
  name: formData.name,
  categoryId: formData.categoryId,
  keyword: formData.keyword,
  picUrl: formData.picUrl,
  sliderPicUrls: cloneDeep(formData.sliderPicUrls || []),
  introduction: formData.introduction,
  bizScene: formData.bizScene,
  brandId: formData.brandId,
  publicationExt: isPublicationScene.value ? cloneDeep(formData.publicationExt) : undefined
})

const syncSceneStateToParent = (options: { syncSceneDefaults?: boolean } = {}) => {
  const sceneState: Partial<ProductSpuApi.Spu> = {
    name: formData.name,
    categoryId: formData.categoryId,
    keyword: formData.keyword,
    picUrl: formData.picUrl,
    sliderPicUrls: cloneDeep(formData.sliderPicUrls || []),
    introduction: formData.introduction,
    bizScene: formData.bizScene,
    brandId: formData.brandId,
    publicationExt: cloneDeep(formData.publicationExt)
  }
  if (options.syncSceneDefaults) {
    Object.assign(sceneState, {
      specType: formData.specType,
      subCommissionType: formData.subCommissionType,
      deliveryTypes: cloneDeep(formData.deliveryTypes || []),
      deliveryTemplateId: formData.deliveryTemplateId,
      giveIntegral: formData.giveIntegral,
      skus: cloneDeep(formData.skus || [])
    })
  }
  Object.assign(props.propFormData, sceneState)
}

const initializeSceneDefaults = (targetBizScene?: string) => {
  resetSceneSpecificData(targetBizScene)
}

const resetSceneSpecificData = (targetBizScene?: string) => {
  formData.brandId = undefined
  if (targetBizScene === ProductSpuApi.BIZ_SCENE_PUBLICATION) {
    formData.deliveryTypes = []
    formData.deliveryTemplateId = undefined
    formData.specType = false
    formData.subCommissionType = false
    formData.giveIntegral = 0
    formData.publicationExt = createPublicationSpuExt()
    formData.skus = [createPublicationSku()]
    return
  }
  if (targetBizScene === ProductSpuApi.BIZ_SCENE_NORMAL) {
    formData.deliveryTypes = []
    formData.deliveryTemplateId = undefined
    formData.specType = false
    formData.subCommissionType = false
    formData.publicationExt = createPublicationSpuExt()
    formData.skus = [createNormalSku()]
  }
}

const handleCategoryChange = async (categoryId?: number | string) => {
  if (!categoryId) {
    lastBizScene.value = formData.bizScene
    formData.bizScene = undefined
    lastCategoryId.value = undefined
    syncSceneStateToParent({ syncSceneDefaults: true })
    return
  }
  const targetBizScene = resolveCategoryBizScene(categoryList.value, categoryId)
  const previousBizScene = formData.bizScene || lastBizScene.value
  if (!targetBizScene) {
    formData.bizScene = undefined
    syncSceneStateToParent({ syncSceneDefaults: true })
    return
  }
  const isCrossSceneSwitch = !!previousBizScene && previousBizScene !== targetBizScene
  if (isCrossSceneSwitch) {
    try {
      await message.confirm(
        targetBizScene === ProductSpuApi.BIZ_SCENE_PUBLICATION
          ? '切换到刊物分类后，将重置品牌、配送方式和普通商品规格，并改为刊物 SKU 结构，确认继续吗？'
          : '切换到普通商品分类后，将清空刊物扩展、适用年级和刊物 SKU 结构，确认继续吗？'
      )
    } catch {
      formData.categoryId = lastCategoryId.value as any
      return
    }
    resetSceneSpecificData(targetBizScene)
  } else if (!previousBizScene) {
    initializeSceneDefaults(targetBizScene)
  }
  formData.bizScene = targetBizScene
  lastCategoryId.value = categoryId
  lastBizScene.value = targetBizScene
  syncSceneStateToParent({ syncSceneDefaults: isCrossSceneSwitch || !previousBizScene })
}

onMounted(async () => {
  await Promise.all([
    refreshCategoryList(),
    refreshBrandList(),
    refreshPublisherList(),
    refreshPublicationTypeList()
  ])
})
</script>
