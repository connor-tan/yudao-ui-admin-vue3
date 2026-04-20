<template>
  <div>
    <SkuForm
      ref="skuFormRef"
      :key="skuFormKey"
      v-model:activeName="innerActiveName"
      :is-detail="isDetail"
      :prop-form-data="formData"
    />
    <el-form ref="extraFormRef" :disabled="isDetail" :model="formData" label-width="0">
      <el-form-item class="mt-20px mb-0">
        <div class="w-full">
          <div class="mb-10px text-14px font-600">SKU 刊物信息</div>
          <el-table :data="formData.skus || []" border max-height="420" size="small">
            <el-table-column v-if="formData.specType" align="center" label="规格" min-width="160">
              <template #default="{ row }">
                {{ formatProperties(row.properties) }}
              </template>
            </el-table-column>
            <el-table-column align="center" label="册别" min-width="140">
              <template #default="{ row }">
                <el-input v-model="row.volumeLabel" placeholder="如：上册、下册" />
              </template>
            </el-table-column>
            <el-table-column align="center" label="版本" min-width="160">
              <template #default="{ row }">
                <el-input v-model="row.editionLabel" placeholder="如：基础版、进阶版" />
              </template>
            </el-table-column>
            <el-table-column align="center" label="适用周期" min-width="140">
              <template #default="{ row }">
                <el-select v-model="row.targetPeriod" placeholder="请选择周期">
                  <el-option
                    v-for="item in targetPeriodOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column align="center" label="ISBN" min-width="180">
              <template #default="{ row }">
                <el-input v-model="row.isbn" placeholder="请输入 ISBN" />
              </template>
            </el-table-column>
            <el-table-column align="center" label="备注" min-width="180">
              <template #default="{ row }">
                <el-input v-model="row.remark" placeholder="请输入备注" />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'
import { copyValueToTarget } from '@/utils'
import {
  normalizePublicationTargetPeriod,
  PUBLICATION_TARGET_PERIOD_OPTIONS
} from '@/utils/publication'
import { propTypes } from '@/utils/propTypes'
import type { PublicationProductVO } from '@/api/mall/product/publicationProduct'
import type { Property } from '@/api/mall/product/spu'
import * as PublicationTypeApi from '@/api/mall/product/publicationType'
import SkuForm from '@/views/mall/product/spu/form/SkuForm.vue'

defineOptions({ name: 'PublicationSkuForm' })

const props = defineProps({
  propFormData: {
    type: Object as PropType<PublicationProductVO>,
    default: () => ({})
  },
  activeName: propTypes.string.def(''),
  isDetail: propTypes.bool.def(false)
})

const message = useMessage()
const skuFormRef = ref()
const extraFormRef = ref()
const innerActiveName = ref(props.activeName)
const skuFormKey = ref(0)
const formData = reactive<PublicationProductVO>({
  specType: false,
  subCommissionType: false,
  skus: []
})
const targetPeriodOptions = PUBLICATION_TARGET_PERIOD_OPTIONS

function normalizeSkuTargetPeriod() {
  formData.skus?.forEach((item) => {
    item.targetPeriod = normalizePublicationTargetPeriod(item.targetPeriod)
  })
}

watch(
  () => props.activeName,
  (value) => {
    innerActiveName.value = value
  }
)

watch(
  () => props.propFormData,
  (data) => {
    if (!data) return
    copyValueToTarget(formData, data)
    normalizeSkuTargetPeriod()
    skuFormKey.value += 1
  },
  { immediate: true }
)

const formatProperties = (properties?: Property[]) => {
  if (!properties?.length) {
    return '默认规格'
  }
  return properties.map((item) => item.valueName || item.propertyName).join(' / ')
}

const emit = defineEmits(['update:activeName'])
const validate = async () => {
  try {
    normalizeSkuTargetPeriod()
    await skuFormRef.value?.validate()
    if (
      PublicationTypeApi.requiresSkuIsbn(props.propFormData.publicationTypeIdentifierRule) &&
      formData.skus?.some((item) => !item.isbn)
    ) {
      throw new Error('图书类刊物的 ISBN 不能为空')
    }
    Object.assign(props.propFormData, {
      specType: formData.specType,
      subCommissionType: formData.subCommissionType,
      skus: formData.skus
    })
  } catch (e) {
    message.error('【价格库存】不完善，请填写 SKU 与刊物信息')
    emit('update:activeName', 'sku')
    throw e
  }
}
defineExpose({ validate })
</script>
