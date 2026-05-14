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
            刊物 SKU 负责承载册别、版本和适用年级，同一个刊物 SPU 不再按年级拆分。
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
          <el-table-column
            v-if="isPeriodicalPublication"
            align="center"
            label="默认期次"
            min-width="120"
          >
            <template #default="{ row }">
              <el-button link type="primary" @click="openTemplateDialog(row)">
                {{ getTemplateCount(row) }} 期
              </el-button>
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

  <Dialog
    v-model="templateDialogVisible"
    :title="`默认期次模板${currentTemplateSku?.name ? ' - ' + currentTemplateSku.name : ''}`"
    width="980px"
  >
    <el-form v-if="!isDetail" :inline="true" :model="templateGenerateForm" label-width="92px">
      <el-form-item label="起始期号">
        <el-input-number v-model="templateGenerateForm.startIssueNo" :min="1" :step="1" class="!w-120px" />
      </el-form-item>
      <el-form-item label="生成期数">
        <el-input-number v-model="templateGenerateForm.issueCount" :min="1" :step="1" class="!w-120px" />
      </el-form-item>
      <el-form-item label="名称前缀">
        <el-input v-model="templateGenerateForm.issueNamePrefix" class="!w-120px" placeholder="第" />
      </el-form-item>
      <el-form-item label="首发偏移">
        <el-input-number
          v-model="templateGenerateForm.firstPublishOffsetDays"
          :min="0"
          :step="1"
          class="!w-120px"
        />
      </el-form-item>
      <el-form-item label="发刊间隔">
        <el-input-number
          v-model="templateGenerateForm.publishIntervalDays"
          :min="1"
          :step="1"
          class="!w-120px"
        />
      </el-form-item>
      <el-form-item label="首配偏移">
        <el-input-number
          v-model="templateGenerateForm.firstDeliveryOffsetDays"
          :min="0"
          :step="1"
          class="!w-120px"
        />
      </el-form-item>
      <el-form-item label="配送间隔">
        <el-input-number
          v-model="templateGenerateForm.deliveryIntervalDays"
          :min="1"
          :step="1"
          class="!w-120px"
        />
      </el-form-item>
      <el-form-item>
        <el-button plain type="primary" @click="generateTemplateRows">批量生成</el-button>
        <el-button @click="addTemplateRow">新增期次</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="templateRows" border max-height="420">
      <el-table-column align="center" label="期号" width="100">
        <template #default="{ row }">
          <template v-if="isDetail">{{ row.issueNo }}</template>
          <el-input-number v-else v-model="row.issueNo" :min="1" :step="1" class="!w-82px" />
        </template>
      </el-table-column>
      <el-table-column label="期次名称" min-width="150">
        <template #default="{ row }">
          <template v-if="isDetail">{{ row.issueName || '-' }}</template>
          <el-input v-else v-model="row.issueName" placeholder="请输入期次名称" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="发刊偏移" width="130">
        <template #default="{ row }">
          <template v-if="isDetail">{{ formatOffset(row.publishOffsetDays) }}</template>
          <el-input-number
            v-else
            v-model="row.publishOffsetDays"
            :min="0"
            :step="1"
            class="!w-100px"
          />
        </template>
      </el-table-column>
      <el-table-column align="center" label="配送偏移" width="130">
        <template #default="{ row }">
          <template v-if="isDetail">{{ formatOffset(row.deliveryOffsetDays) }}</template>
          <el-input-number
            v-else
            v-model="row.deliveryOffsetDays"
            :min="0"
            :step="1"
            class="!w-100px"
          />
        </template>
      </el-table-column>
      <el-table-column align="center" label="排序" width="100">
        <template #default="{ row }">
          <template v-if="isDetail">{{ row.sort }}</template>
          <el-input-number v-else v-model="row.sort" :min="0" :step="1" class="!w-82px" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" width="90">
        <template #default="{ row }">
          <el-tag v-if="isDetail" :type="row.status === 0 ? 'success' : 'info'">
            {{ row.status === 0 ? '启用' : '停用' }}
          </el-tag>
          <el-switch v-else v-model="row.status" :active-value="0" :inactive-value="1" />
        </template>
      </el-table-column>
      <el-table-column label="备注" min-width="150">
        <template #default="{ row }">
          <template v-if="isDetail">{{ row.remark || '-' }}</template>
          <el-input v-else v-model="row.remark" placeholder="请输入备注" />
        </template>
      </el-table-column>
      <el-table-column v-if="!isDetail" align="center" fixed="right" label="操作" width="80">
        <template #default="{ $index }">
          <el-button link type="danger" @click="deleteTemplateRow($index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <el-button v-if="!isDetail" type="primary" @click="confirmTemplateDialog">保 存</el-button>
      <el-button @click="templateDialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
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
const isPeriodicalPublication = computed(
  () => formData.publicationExt?.issueMode === ProductSpuApi.PUBLICATION_ISSUE_MODE_PERIODICAL
)
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
const templateDialogVisible = ref(false)
const currentTemplateSku = ref<Sku>()
const templateRows = ref<ProductSpuApi.PublicationSkuIssueTemplate[]>([])
const templateGenerateForm = reactive({
  startIssueNo: 1,
  issueCount: 12,
  issueNamePrefix: '第',
  firstPublishOffsetDays: 0,
  publishIntervalDays: 30,
  firstDeliveryOffsetDays: 0,
  deliveryIntervalDays: 30
})

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
        issueTemplates: isPeriodicalPublication.value ? item.issueTemplates || [] : [],
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

watch(
  () => formData.publicationExt?.issueMode,
  (issueMode) => {
    if (issueMode === ProductSpuApi.PUBLICATION_ISSUE_MODE_PERIODICAL) {
      return
    }
    formData.skus = (formData.skus || []).map((sku) => ({
      ...sku,
      issueTemplates: []
    }))
    if (templateDialogVisible.value) {
      templateDialogVisible.value = false
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
    const skus = cloneDeep(formData.skus || [])
    if (isPublicationScene.value && !isPeriodicalPublication.value) {
      skus.forEach((sku) => {
        sku.issueTemplates = []
      })
    }
    Object.assign(props.propFormData, {
      specType: formData.specType,
      subCommissionType: formData.subCommissionType,
      skus
    })
  } catch (e) {
    message.error(e instanceof Error && e.message ? e.message : '【库存价格】不完善，请填写相关信息')
    emit('update:activeName', 'sku')
    throw e
  }
}
defineExpose({ validate })

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

const getTemplateCount = (row: Sku) =>
  (row.issueTemplates || []).filter((item) => item.status === undefined || item.status === 0).length

const openTemplateDialog = (row: Sku) => {
  currentTemplateSku.value = row
  templateRows.value = cloneDeep(row.issueTemplates || [])
  templateDialogVisible.value = true
}

const formatOffset = (value?: number) => (value === undefined || value === null ? '-' : `${value} 天`)

const formatIssueName = (prefix: string | undefined, issueNo: number) => {
  if (!prefix || prefix === '第') {
    return `第${issueNo}期`
  }
  return `${prefix}${issueNo}`
}

const generateTemplateRows = async () => {
  if (templateRows.value.length > 0) {
    try {
      await message.confirm('批量生成会覆盖当前默认期次模板，是否继续？')
    } catch {
      return
    }
  }
  const rows: ProductSpuApi.PublicationSkuIssueTemplate[] = []
  for (let i = 0; i < templateGenerateForm.issueCount; i++) {
    const issueNo = templateGenerateForm.startIssueNo + i
    rows.push({
      issueNo,
      issueName: formatIssueName(templateGenerateForm.issueNamePrefix, issueNo),
      publishOffsetDays:
        templateGenerateForm.firstPublishOffsetDays + i * templateGenerateForm.publishIntervalDays,
      deliveryOffsetDays:
        templateGenerateForm.firstDeliveryOffsetDays + i * templateGenerateForm.deliveryIntervalDays,
      sort: issueNo,
      status: 0,
      remark: ''
    })
  }
  templateRows.value = rows
}

const addTemplateRow = () => {
  const nextIssueNo = Math.max(0, ...templateRows.value.map((item) => item.issueNo || 0)) + 1
  templateRows.value = [
    ...templateRows.value,
    {
      issueNo: nextIssueNo,
      issueName: formatIssueName('第', nextIssueNo),
      publishOffsetDays: 0,
      deliveryOffsetDays: 0,
      sort: nextIssueNo,
      status: 0,
      remark: ''
    }
  ]
}

const deleteTemplateRow = (index: number) => {
  templateRows.value = templateRows.value.filter((_, itemIndex) => itemIndex !== index)
}

const validateTemplateRows = (rows: ProductSpuApi.PublicationSkuIssueTemplate[]) => {
  if (rows.length === 0) {
    throw new Error('期刊 SKU 默认期次模板不能为空')
  }
  const issueNos = new Set<number>()
  let hasEnabled = false
  rows.forEach((row, index) => {
    if (!row.issueNo || row.issueNo < 1) {
      throw new Error(`第 ${index + 1} 行期号不能为空`)
    }
    if (!row.issueName) {
      throw new Error(`第 ${index + 1} 行期次名称不能为空`)
    }
    if (issueNos.has(row.issueNo)) {
      throw new Error(`期号 ${row.issueNo} 重复`)
    }
    issueNos.add(row.issueNo)
    if ((row.publishOffsetDays ?? 0) < 0 || (row.deliveryOffsetDays ?? 0) < 0) {
      throw new Error(`第 ${index + 1} 行偏移天数不能小于 0`)
    }
    hasEnabled = hasEnabled || row.status === undefined || row.status === 0
  })
  if (!hasEnabled) {
    throw new Error('期刊 SKU 默认期次模板至少需要一条启用期次')
  }
}

const confirmTemplateDialog = () => {
  try {
    validateTemplateRows(templateRows.value)
  } catch (e) {
    message.error(e instanceof Error && e.message ? e.message : '默认期次模板不完善')
    return
  }
  if (currentTemplateSku.value) {
    currentTemplateSku.value.issueTemplates = cloneDeep(templateRows.value).sort(
      (a, b) => (a.sort || a.issueNo || 0) - (b.sort || b.issueNo || 0)
    )
  }
  templateDialogVisible.value = false
}

const validatePublicationSkuList = () => {
  if (!formData.skus || formData.skus.length === 0) {
    throw new Error('刊物至少需要一个 SKU')
  }
  formData.skus.forEach((sku, index) => {
    if (!sku.name) {
      throw new Error(`第 ${index + 1} 行 SKU 名称不能为空`)
    }
    if (!sku.applicableGradeCatalogIds || sku.applicableGradeCatalogIds.length === 0) {
      throw new Error(`第 ${index + 1} 行适用年级不能为空`)
    }
    if (requiresSkuIsbnRule.value && !sku.publicationExt?.isbn) {
      throw new Error(`第 ${index + 1} 行 ISBN 不能为空`)
    }
    if (isPeriodicalPublication.value && (sku.status === undefined || sku.status === 0)) {
      validateTemplateRows(sku.issueTemplates || [])
    }
  })
}

onMounted(async () => {
  publicationTypeList.value = await PublicationTypeApi.getPublicationTypeSimpleList()
  gradeCatalogList.value = await SchoolApi.getGradeCatalogSimpleList()
})
</script>
