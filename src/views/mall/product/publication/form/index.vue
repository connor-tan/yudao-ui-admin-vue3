<template>
  <ContentWrap v-loading="formLoading">
    <el-tabs v-model="activeName">
      <el-tab-pane label="基础信息" name="basic">
        <BasicInfoForm
          ref="basicRef"
          v-model:activeName="activeName"
          :is-detail="isDetail"
          :propFormData="formData"
        />
      </el-tab-pane>
      <el-tab-pane label="刊物信息" name="publication">
        <PublicationInfoForm
          ref="publicationRef"
          v-model:activeName="activeName"
          :is-detail="isDetail"
          :propFormData="formData"
        />
      </el-tab-pane>
      <el-tab-pane label="价格库存" name="sku">
        <PublicationSkuForm
          ref="skuRef"
          v-model:activeName="activeName"
          :is-detail="isDetail"
          :propFormData="formData"
        />
      </el-tab-pane>
      <el-tab-pane label="物流设置" name="delivery">
        <DeliveryForm
          ref="deliveryRef"
          v-model:activeName="activeName"
          :is-detail="isDetail"
          :propFormData="formData"
        />
      </el-tab-pane>
      <el-tab-pane label="商品详情" name="description">
        <DescriptionForm
          ref="descriptionRef"
          v-model:activeName="activeName"
          :is-detail="isDetail"
          :propFormData="formData"
        />
      </el-tab-pane>
      <el-tab-pane label="其它设置" name="other">
        <OtherForm
          ref="otherRef"
          v-model:activeName="activeName"
          :is-detail="isDetail"
          :propFormData="formData"
        />
      </el-tab-pane>
    </el-tabs>
    <el-form>
      <el-form-item style="float: right">
        <el-button v-if="!isDetail" :loading="formLoading" type="primary" @click="submitForm">
          保存
        </el-button>
        <el-button @click="close">返回</el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { cloneDeep } from 'lodash-es'
import { isEmpty } from '@/utils/is'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { convertToInteger, floatToFixed2, formatToFraction } from '@/utils'
import {
  normalizePublicationTargetPeriod,
  PUBLICATION_TARGET_PERIOD_FULL_YEAR
} from '@/utils/publication'
import * as PublicationProductApi from '@/api/mall/product/publicationProduct'
import BasicInfoForm from './BasicInfoForm.vue'
import PublicationInfoForm from './PublicationInfoForm.vue'
import PublicationSkuForm from './PublicationSkuForm.vue'
import DescriptionForm from './DescriptionForm.vue'
import DeliveryForm from './DeliveryForm.vue'
import OtherForm from './OtherForm.vue'

defineOptions({ name: 'ProductPublicationForm' })

const { t } = useI18n()
const message = useMessage()
const { push, currentRoute } = useRouter()
const { params, name } = useRoute()
const { delView } = useTagsViewStore()

const formLoading = ref(false)
const activeName = ref('basic')
const isDetail = ref(false)
const basicRef = ref()
const publicationRef = ref()
const skuRef = ref()
const deliveryRef = ref()
const descriptionRef = ref()
const otherRef = ref()
const createDefaultSku = (): PublicationProductApi.PublicationProductSkuVO => ({
  name: '',
  price: 0,
  marketPrice: 0,
  costPrice: 0,
  barCode: '',
  picUrl: '',
  stock: 0,
  weight: 0,
  volume: 0,
  firstBrokeragePrice: 0,
  secondBrokeragePrice: 0,
  volumeLabel: '',
  editionLabel: '',
  targetPeriod: PUBLICATION_TARGET_PERIOD_FULL_YEAR,
  isbn: '',
  remark: ''
})

const createDefaultFormData = (): PublicationProductApi.PublicationProductVO => ({
  domainType: 'PUBLICATION',
  name: '',
  keyword: '',
  introduction: '',
  description: '',
  categoryId: undefined,
  brandId: undefined,
  picUrl: '',
  sliderPicUrls: [],
  sort: 0,
  specType: false,
  deliveryTypes: [],
  deliveryTemplateId: undefined,
  giveIntegral: 0,
  subCommissionType: false,
  salesCount: 0,
  virtualSalesCount: 0,
  browseCount: 0,
  publicationTitleId: undefined,
  publicationTitleName: '',
  publicationTypeId: undefined,
  publicationTypeCode: '',
  publicationTypeName: '',
  publicationTypeIdentifierRule: '',
  publisherId: undefined,
  publisherName: '',
  issueCycle: '',
  issn: '',
  cnCode: '',
  postDistributionCode: '',
  applicableGradeCatalogIds: [],
  applicableGradeNames: [],
  skus: [createDefaultSku()]
})

const normalizePublicationProductFormData = (
  data: PublicationProductApi.PublicationProductVO
): PublicationProductApi.PublicationProductVO => {
  const normalized = {
    ...createDefaultFormData(),
    ...data
  }
  normalized.sliderPicUrls = Array.isArray(data.sliderPicUrls) ? data.sliderPicUrls : []
  normalized.deliveryTypes = Array.isArray(data.deliveryTypes) ? data.deliveryTypes : []
  normalized.applicableGradeCatalogIds = Array.isArray(data.applicableGradeCatalogIds)
    ? data.applicableGradeCatalogIds
    : []
  normalized.applicableGradeNames = Array.isArray(data.applicableGradeNames)
    ? data.applicableGradeNames
    : []
  normalized.skus = Array.isArray(data.skus) && data.skus.length
    ? data.skus.map((item) => ({
        ...createDefaultSku(),
        ...item,
        targetPeriod: normalizePublicationTargetPeriod(item.targetPeriod)
      }))
    : [createDefaultSku()]
  return normalized
}

const formData = ref<PublicationProductApi.PublicationProductVO>(createDefaultFormData())

const getDetail = async () => {
  if (name === 'ProductPublicationDetail') {
    isDetail.value = true
  }
  const id = params.id as unknown as number
  if (!id) return
  formLoading.value = true
  try {
    const res = normalizePublicationProductFormData(
      (await PublicationProductApi.getPublicationProduct(id)) as PublicationProductApi.PublicationProductVO
    )
    res.skus?.forEach((item) => {
      if (isDetail.value) {
        item.price = floatToFixed2(item.price)
        item.marketPrice = floatToFixed2(item.marketPrice)
        item.costPrice = floatToFixed2(item.costPrice)
        item.firstBrokeragePrice = floatToFixed2(item.firstBrokeragePrice)
        item.secondBrokeragePrice = floatToFixed2(item.secondBrokeragePrice)
      } else {
        item.price = formatToFraction(item.price)
        item.marketPrice = formatToFraction(item.marketPrice)
        item.costPrice = formatToFraction(item.costPrice)
        item.firstBrokeragePrice = formatToFraction(item.firstBrokeragePrice)
        item.secondBrokeragePrice = formatToFraction(item.secondBrokeragePrice)
      }
    })
    formData.value = res
  } finally {
    formLoading.value = false
  }
}

const submitForm = async () => {
  formLoading.value = true
  try {
    await basicRef.value?.validate()
    await publicationRef.value?.validate()
    await skuRef.value?.validate()
    await deliveryRef.value?.validate()
    await descriptionRef.value?.validate()
    await otherRef.value?.validate()
    const deepCopyFormData = cloneDeep(formData.value) as PublicationProductApi.PublicationProductVO
    if (isEmpty(deepCopyFormData.name)) {
      message.error('商品名称不能为空')
      return
    }
    const skuList = deepCopyFormData.skus || []
    skuList.forEach((item) => {
      item.name = deepCopyFormData.name
      item.price = convertToInteger(item.price)
      item.marketPrice = convertToInteger(item.marketPrice)
      item.costPrice = convertToInteger(item.costPrice)
      item.firstBrokeragePrice = convertToInteger(item.firstBrokeragePrice)
      item.secondBrokeragePrice = convertToInteger(item.secondBrokeragePrice)
    })
    deepCopyFormData.skus = skuList
    const newSliderPicUrls: string[] = []
    deepCopyFormData.sliderPicUrls?.forEach((item: any) => {
      typeof item === 'object' ? newSliderPicUrls.push(item.url) : newSliderPicUrls.push(item)
    })
    deepCopyFormData.sliderPicUrls = newSliderPicUrls
    if (!deepCopyFormData.id) {
      await PublicationProductApi.createPublicationProduct(deepCopyFormData)
      message.success(t('common.createSuccess'))
    } else {
      await PublicationProductApi.updatePublicationProduct(deepCopyFormData)
      message.success(t('common.updateSuccess'))
    }
    close()
  } finally {
    formLoading.value = false
  }
}

const close = () => {
  delView(unref(currentRoute))
  push({ name: 'ProductCenter' })
}

onMounted(async () => {
  await getDetail()
})
</script>
