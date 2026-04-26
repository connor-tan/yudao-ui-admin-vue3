<!-- 商品发布 - 库存价格 -->
<template>
  <el-form
    ref="formRef"
    v-loading="formLoading"
    :disabled="isDetail"
    :model="formData"
    :rules="rules"
    label-width="120px"
  >
    <template v-if="!hasBizScene">
      <el-form-item label="SKU 说明">
        <div class="w-80 text-13px text-gray-500">
          请先在基础设置中选择商品分类，系统会根据分类所属场景自动切换 SKU 编辑结构。
        </div>
      </el-form-item>
    </template>

    <template v-else-if="isPublicationScene">
      <el-form-item label="刊物 SKU">
        <div class="w-80">
          <div class="mb-12px text-12px text-gray-500">
            刊物 SKU 负责承载周期、版本和适用年级，同一个刊物 SPU 不再按年级拆分。
          </div>
          <el-button v-if="!isDetail" type="primary" plain @click="addPublicationSku">
            新增 SKU
          </el-button>
        </div>
      </el-form-item>
      <el-form-item>
        <el-table :data="formData.skus || []" border class="w-full" max-height="520">
          <el-table-column label="图片" min-width="80">
            <template #default="{ row }">
              <template v-if="isDetail">
                <el-image
                  v-if="row.picUrl"
                  :src="row.picUrl"
                  class="h-50px w-50px"
                  @click="imagePreview(row.picUrl)"
                />
              </template>
              <UploadImg v-else v-model="row.picUrl" height="50px" width="50px" />
            </template>
          </el-table-column>
          <el-table-column label="SKU 名称" min-width="180">
            <template #default="{ row }">
              <template v-if="isDetail">{{ row.name || '-' }}</template>
              <el-input v-else v-model="row.name" placeholder="请输入 SKU 名称" />
            </template>
          </el-table-column>
          <el-table-column label="商品条码" min-width="160">
            <template #default="{ row }">
              <template v-if="isDetail">{{ row.barCode || '-' }}</template>
              <el-input v-else v-model="row.barCode" />
            </template>
          </el-table-column>
          <el-table-column label="售卖周期" min-width="120">
            <template #default="{ row }">
              <template v-if="isDetail">{{ formatTargetPeriod(row.publicationExt?.targetPeriod) }}</template>
              <el-select v-else v-model="row.publicationExt.targetPeriod" placeholder="请选择周期">
                <el-option
                  v-for="item in ProductSpuApi.PUBLICATION_TARGET_PERIOD_OPTIONS"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="册别" min-width="120">
            <template #default="{ row }">
              <template v-if="isDetail">
                {{ formatPublicationDict(DICT_TYPE.EDU_PUBLICATION_VOLUME, row.publicationExt?.volumeLabel) }}
              </template>
              <el-select
                v-else
                v-model="row.publicationExt.volumeLabel"
                clearable
                filterable
                placeholder="请选择册别"
              >
                <el-option
                  v-for="item in getStrDictOptions(DICT_TYPE.EDU_PUBLICATION_VOLUME)"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="版本" min-width="140">
            <template #default="{ row }">
              <template v-if="isDetail">
                {{ formatPublicationDict(DICT_TYPE.EDU_PUBLICATION_EDITION, row.publicationExt?.editionLabel) }}
              </template>
              <el-select
                v-else
                v-model="row.publicationExt.editionLabel"
                clearable
                filterable
                placeholder="请选择版本"
              >
                <el-option
                  v-for="item in getStrDictOptions(DICT_TYPE.EDU_PUBLICATION_EDITION)"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column :label="isbnColumnLabel" min-width="160">
            <template #default="{ row }">
              <template v-if="isDetail">{{ row.publicationExt?.isbn || '-' }}</template>
              <el-input v-else v-model="row.publicationExt.isbn" :placeholder="isbnInputPlaceholder" />
            </template>
          </el-table-column>
          <el-table-column label="适用年级" min-width="220">
            <template #default="{ row }">
              <template v-if="isDetail">
                {{ row.applicableGradeNames?.join('、') || '-' }}
              </template>
              <el-select
                v-else
                v-model="row.applicableGradeCatalogIds"
                class="w-full"
                clearable
                collapse-tags
                collapse-tags-tooltip
                multiple
                placeholder="请选择适用年级"
              >
                <el-option
                  v-for="item in gradeCatalogList"
                  :key="item.id"
                  :label="item.gradeName"
                  :value="item.id"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="销售价" min-width="140">
            <template #default="{ row }">
              <template v-if="isDetail">{{ row.price }}</template>
              <el-input-number
                v-else
                v-model="row.price"
                :min="0"
                :precision="2"
                :step="0.1"
                class="w-100%"
                controls-position="right"
              />
            </template>
          </el-table-column>
          <el-table-column label="市场价" min-width="140">
            <template #default="{ row }">
              <template v-if="isDetail">{{ row.marketPrice }}</template>
              <el-input-number
                v-else
                v-model="row.marketPrice"
                :min="0"
                :precision="2"
                :step="0.1"
                class="w-100%"
                controls-position="right"
              />
            </template>
          </el-table-column>
          <el-table-column label="成本价" min-width="140">
            <template #default="{ row }">
              <template v-if="isDetail">{{ row.costPrice }}</template>
              <el-input-number
                v-else
                v-model="row.costPrice"
                :min="0"
                :precision="2"
                :step="0.1"
                class="w-100%"
                controls-position="right"
              />
            </template>
          </el-table-column>
          <el-table-column label="库存" min-width="120">
            <template #default="{ row }">
              <template v-if="isDetail">{{ row.stock }}</template>
              <el-input-number
                v-else
                v-model="row.stock"
                :min="0"
                class="w-100%"
                controls-position="right"
              />
            </template>
          </el-table-column>
          <el-table-column label="状态" min-width="110">
            <template #default="{ row }">
              <dict-tag v-if="isDetail" :type="DICT_TYPE.COMMON_STATUS" :value="row.status" />
              <el-switch
                v-else
                v-model="row.status"
                :active-value="0"
                :inactive-value="1"
                active-text="启用"
                inactive-text="停用"
                inline-prompt
              />
            </template>
          </el-table-column>
          <el-table-column v-if="!isDetail" fixed="right" label="操作" width="90">
            <template #default="{ row }">
              <el-button link type="danger" @click="deletePublicationSku(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item v-if="selectedPublicationType" :required="requiresSkuIsbnRule" label="ISBN 要求">
        <div class="w-80">
          <el-alert
            :closable="false"
            :show-icon="true"
            :title="skuIsbnHint"
            :type="requiresSkuIsbnRule ? 'warning' : 'info'"
          />
        </div>
      </el-form-item>
    </template>

    <template v-else>
      <el-form-item label="分销类型" prop="subCommissionType">
        <el-radio-group
          v-model="formData.subCommissionType"
          class="w-80"
          @change="changeSubCommissionType"
        >
          <el-radio :value="false">默认设置</el-radio>
          <el-radio :value="true" class="radio">单独设置</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="商品规格" prop="specType">
        <el-radio-group v-model="formData.specType" class="w-80" @change="onChangeSpec">
          <el-radio :value="false" class="radio">单规格</el-radio>
          <el-radio :value="true">多规格</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="!formData.specType">
        <SkuList
          ref="skuListRef"
          :prop-form-data="formData"
          :property-list="propertyList"
          :rule-config="ruleConfig"
        />
      </el-form-item>
      <el-form-item v-if="formData.specType" label="商品属性">
        <el-button class="mb-10px mr-15px" @click="openAttributeAddForm">添加属性</el-button>
        <ProductAttributes
          :is-detail="isDetail"
          :property-list="propertyList"
          @success="generateSkus"
        />
      </el-form-item>
      <template v-if="formData.specType && propertyList.length > 0">
        <el-form-item v-if="!isDetail" label="批量设置">
          <SkuList :is-batch="true" :prop-form-data="formData" :property-list="propertyList" />
        </el-form-item>
        <el-form-item label="规格列表">
          <SkuList
            ref="skuListRef"
            :is-detail="isDetail"
            :prop-form-data="formData"
            :property-list="propertyList"
            :rule-config="ruleConfig"
          />
        </el-form-item>
      </template>
    </template>
  </el-form>

  <ProductPropertyAddForm ref="attributesAddFormRef" :propertyList="propertyList" />
</template>

<script lang="ts" setup>
import { computed, PropType } from 'vue'
import { cloneDeep } from 'lodash-es'
import { copyValueToTarget } from '@/utils'
import { propTypes } from '@/utils/propTypes'
import {
  getPropertyList,
  PropertyAndValues,
  RuleConfig,
  SkuList
} from '@/views/mall/product/spu/components/index'
import ProductAttributes from './ProductAttributes.vue'
import ProductPropertyAddForm from './ProductPropertyAddForm.vue'
import type { Sku, Spu } from '@/api/mall/product/spu'
import * as ProductSpuApi from '@/api/mall/product/spu'
import * as PublicationTypeApi from '@/api/edu/publicationType'
import { SchoolApi } from '@/api/edu/school'
import { DICT_TYPE, getDictLabel, getStrDictOptions } from '@/utils/dict'
import { createImageViewer } from '@/components/ImageViewer'
import { createNormalSku, createPublicationSku } from './helpers'

defineOptions({ name: 'ProductSpuSkuForm' })

const ruleConfig: RuleConfig[] = [
  {
    name: 'stock',
    rule: (arg) => arg >= 0,
    message: '商品库存必须大于等于 0'
  },
  {
    name: 'price',
    rule: (arg) => arg >= 0.01,
    message: '商品销售价格必须大于等于 0.01 元'
  },
  {
    name: 'marketPrice',
    rule: (arg) => arg >= 0.01,
    message: '商品市场价格必须大于等于 0.01 元'
  },
  {
    name: 'costPrice',
    rule: (arg) => arg >= 0,
    message: '商品成本价格必须大于等于 0 元'
  }
]

const message = useMessage()
const formLoading = ref(false)
const props = defineProps({
  propFormData: {
    type: Object as PropType<Spu>,
    default: () => ({})
  },
  isDetail: propTypes.bool.def(false)
})
const attributesAddFormRef = ref()
const formRef = ref()
const propertyList = ref<PropertyAndValues[]>([])
const skuListRef = ref()
const formData = reactive<Spu>({
  bizScene: undefined,
  specType: false,
  subCommissionType: false,
  publicationExt: {},
  skus: []
})
const rules = reactive({
  specType: [required],
  subCommissionType: [required]
})

const publicationTypeList = ref<PublicationTypeApi.PublicationTypeSimpleVO[]>([])
const gradeCatalogList = ref<any[]>([])
const hasBizScene = computed(() => !!formData.bizScene)
const isPublicationScene = computed(() => formData.bizScene === ProductSpuApi.BIZ_SCENE_PUBLICATION)
const isNormalScene = computed(() => formData.bizScene === ProductSpuApi.BIZ_SCENE_NORMAL)
const selectedPublicationType = computed(() =>
  publicationTypeList.value.find((item) => item.id === formData.publicationExt?.publicationTypeId)
)
const requiresSkuIsbnRule = computed(() =>
  PublicationTypeApi.requiresSkuIsbn(selectedPublicationType.value?.identifierRule)
)
const isbnColumnLabel = computed(() => (requiresSkuIsbnRule.value ? 'ISBN（必填）' : 'ISBN'))
const isbnInputPlaceholder = computed(() =>
  requiresSkuIsbnRule.value ? '请输入 ISBN（当前刊物类型必填）' : '请输入 ISBN'
)
const skuIsbnHint = computed(() =>
  requiresSkuIsbnRule.value
    ? '当前刊物类型要求每个 SKU 都填写 ISBN。'
    : '当前刊物类型对 ISBN 不做必填要求。'
)

const syncSkuFormData = (data?: Spu) => {
  if (!data) {
    return
  }
  copyValueToTarget(formData, data)
  if (isPublicationScene.value) {
    formData.skus =
      formData.skus?.map((item) => ({
        ...createPublicationSku(),
        ...item,
        publicationExt: {
          ...createPublicationSku().publicationExt,
          ...(item.publicationExt || {})
        },
        applicableGradeCatalogIds: item.applicableGradeCatalogIds || []
      })) || []
  } else if (isNormalScene.value) {
    propertyList.value = getPropertyList(data)
  } else {
    propertyList.value = []
  }
}

watch(
  () => props.propFormData,
  (data) => syncSkuFormData(data),
  {
    immediate: true
  }
)

watch(
  () => props.propFormData?.bizScene,
  () => syncSkuFormData(props.propFormData)
)

watch(
  () => props.propFormData?.publicationExt?.publicationTypeId,
  (publicationTypeId) => {
    formData.publicationExt = {
      ...(formData.publicationExt || {}),
      publicationTypeId
    }
  }
)

const emit = defineEmits(['update:activeName'])
const validate = async () => {
  if (!formRef) return
  try {
    if (!hasBizScene.value) {
      Object.assign(props.propFormData, {
        skus: cloneDeep(formData.skus || [])
      })
      return
    }
    if (isPublicationScene.value) {
      validatePublicationSkuList()
    } else {
      skuListRef.value.validateSku()
      await unref(formRef).validate()
    }
    Object.assign(props.propFormData, {
      specType: formData.specType,
      subCommissionType: formData.subCommissionType,
      skus: cloneDeep(formData.skus || [])
    })
  } catch (e) {
    message.error(e instanceof Error && e.message ? e.message : '【库存价格】不完善，请填写相关信息')
    emit('update:activeName', 'sku')
    throw e
  }
}
defineExpose({ validate })

const formatTargetPeriod = (value?: string) => {
  return ProductSpuApi.PUBLICATION_TARGET_PERIOD_OPTIONS.find((item) => item.value === value)?.label || '-'
}

const formatPublicationDict = (dictType: string, value?: string) => {
  if (!value) {
    return '-'
  }
  return getDictLabel(dictType, value) || value
}

const imagePreview = (imgUrl: string) => {
  createImageViewer({
    zIndex: 9999999,
    urlList: [imgUrl]
  })
}

const changeSubCommissionType = () => {
  for (const item of formData.skus || []) {
    item.firstBrokeragePrice = 0
    item.secondBrokeragePrice = 0
  }
}

const openAttributeAddForm = () => {
  attributesAddFormRef.value?.open?.()
}

const onChangeSpec = () => {
  propertyList.value = []
  formData.skus = [createNormalSku()]
}

const generateSkus = (propertyList: any[]) => {
  skuListRef.value.generateTableData(propertyList)
}

const addPublicationSku = () => {
  formData.skus = [...(formData.skus || []), createPublicationSku()]
}

const deletePublicationSku = (row: Sku) => {
  formData.skus = (formData.skus || []).filter((item) => item !== row)
}

const validatePublicationSkuList = () => {
  if (!formData.skus || formData.skus.length === 0) {
    throw new Error('刊物至少需要一个 SKU')
  }
  formData.skus.forEach((sku, index) => {
    if (!sku.name) {
      throw new Error(`第 ${index + 1} 行 SKU 名称不能为空`)
    }
    if (!sku.publicationExt?.targetPeriod) {
      throw new Error(`第 ${index + 1} 行售卖周期不能为空`)
    }
    if (!sku.applicableGradeCatalogIds || sku.applicableGradeCatalogIds.length === 0) {
      throw new Error(`第 ${index + 1} 行适用年级不能为空`)
    }
    if (requiresSkuIsbnRule.value && !sku.publicationExt?.isbn) {
      throw new Error(`第 ${index + 1} 行 ISBN 不能为空`)
    }
  })
}

onMounted(async () => {
  publicationTypeList.value = await PublicationTypeApi.getPublicationTypeSimpleList()
  gradeCatalogList.value = await SchoolApi.getGradeCatalogSimpleList()
})
</script>
