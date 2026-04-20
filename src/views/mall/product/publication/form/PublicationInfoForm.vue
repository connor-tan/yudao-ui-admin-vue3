<template>
  <el-form ref="formRef" :disabled="isDetail" :model="formData" :rules="rules" label-width="120px">
    <el-form-item label="刊物主档" prop="publicationTitleId">
      <el-select
        v-model="formData.publicationTitleId"
        class="w-80!"
        filterable
        placeholder="请选择刊物主档"
        @change="handleTitleChange"
      >
        <el-option
          v-for="item in titleList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <el-button :icon="RefreshRight" class="ml-1" size="small" @click="refreshTitleList" />
    </el-form-item>
    <el-form-item label="刊物类型">
      <el-input v-model="formData.publicationTypeName" class="w-80!" disabled />
    </el-form-item>
    <el-form-item label="出版社">
      <el-input v-model="formData.publisherName" class="w-80!" disabled />
    </el-form-item>
    <el-form-item label="刊物周期">
      <el-input v-model="formData.issueCycle" class="w-80!" disabled />
    </el-form-item>
    <el-form-item label="适用年级" prop="applicableGradeCatalogIds">
      <el-select
        v-model="formData.applicableGradeCatalogIds"
        class="w-80!"
        filterable
        multiple
        placeholder="请选择适用年级"
      >
        <el-option
          v-for="item in gradeList"
          :key="item.id"
          :label="buildGradeLabel(item)"
          :value="item.id"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="ISSN">
      <el-input v-model="formData.issn" class="w-80!" disabled />
    </el-form-item>
    <el-form-item label="CN 刊号">
      <el-input v-model="formData.cnCode" class="w-80!" disabled />
    </el-form-item>
    <el-form-item label="邮发代号">
      <el-input v-model="formData.postDistributionCode" class="w-80!" disabled />
    </el-form-item>
    <el-alert
      v-if="titleIdentifierMissing"
      class="mb-18px"
      :closable="false"
      show-icon
      title="当前刊物主档缺少 ISSN、CN 刊号或邮发代号，请先完善主档信息"
      type="warning"
    />
  </el-form>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'
import { RefreshRight } from '@element-plus/icons-vue'
import { copyValueToTarget } from '@/utils'
import { propTypes } from '@/utils/propTypes'
import * as PublicationProductApi from '@/api/mall/product/publicationProduct'
import * as PublicationTitleApi from '@/api/mall/product/publicationTitle'
import * as PublicationTypeApi from '@/api/mall/product/publicationType'

defineOptions({ name: 'PublicationInfoForm' })

const props = defineProps({
  propFormData: {
    type: Object as PropType<PublicationProductApi.PublicationProductVO>,
    default: () => ({})
  },
  isDetail: propTypes.bool.def(false)
})

const message = useMessage()
const formRef = ref()
const titleList = ref<PublicationTitleApi.PublicationTitleSimpleVO[]>([])
const gradeList = ref<PublicationProductApi.PublicationGradeSimpleVO[]>([])
const formData = reactive<PublicationProductApi.PublicationProductVO>({
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
  applicableGradeCatalogIds: []
})
const rules = reactive({
  publicationTitleId: [required],
  applicableGradeCatalogIds: [required]
})
const titleIdentifierMissing = computed(() => {
  return (
    PublicationTypeApi.requiresTitleIdentifier(formData.publicationTypeIdentifierRule) &&
    !formData.issn &&
    !formData.cnCode &&
    !formData.postDistributionCode
  )
})

watch(
  () => props.propFormData,
  (data) => {
    if (!data) return
    copyValueToTarget(formData, data)
  },
  { immediate: true }
)

const buildGradeLabel = (item: PublicationProductApi.PublicationGradeSimpleVO) => {
  return item.aliasName ? `${item.gradeName}（${item.aliasName} / ${item.gradeNo}）` : `${item.gradeName}（${item.gradeNo}）`
}

const syncTitleFields = (title?: PublicationTitleApi.PublicationTitleVO | null) => {
  formData.publicationTitleName = title?.name || ''
  formData.publicationTypeId = title?.typeId
  formData.publicationTypeCode = title?.typeCode || ''
  formData.publicationTypeName = title?.typeName || ''
  formData.publicationTypeIdentifierRule = title?.typeIdentifierRule || ''
  formData.publisherId = title?.publisherId
  formData.publisherName = title?.publisherName || ''
  formData.issueCycle = title?.issueCycle || ''
  formData.issn = title?.issn || ''
  formData.cnCode = title?.cnCode || ''
  formData.postDistributionCode = title?.postDistributionCode || ''
}

const handleTitleChange = async (publicationTitleId?: number) => {
  if (!publicationTitleId) {
    syncTitleFields(null)
    return
  }
  const title = await PublicationTitleApi.getPublicationTitle(publicationTitleId)
  syncTitleFields(title)
}

const refreshTitleList = async () => {
  titleList.value = await PublicationTitleApi.getPublicationTitleSimpleList()
}

const refreshGradeList = async () => {
  gradeList.value = await PublicationProductApi.getPublicationGradeSimpleList()
}

const emit = defineEmits(['update:activeName'])
const validate = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    if (titleIdentifierMissing.value) {
      throw new Error('当前刊物主档缺少 ISSN、CN 刊号或邮发代号')
    }
    Object.assign(props.propFormData, {
      publicationTitleId: formData.publicationTitleId,
      publicationTitleName: formData.publicationTitleName,
      publicationTypeId: formData.publicationTypeId,
      publicationTypeCode: formData.publicationTypeCode,
      publicationTypeName: formData.publicationTypeName,
      publicationTypeIdentifierRule: formData.publicationTypeIdentifierRule,
      publisherId: formData.publisherId,
      publisherName: formData.publisherName,
      issueCycle: formData.issueCycle,
      issn: formData.issn,
      cnCode: formData.cnCode,
      postDistributionCode: formData.postDistributionCode,
      applicableGradeCatalogIds: formData.applicableGradeCatalogIds
    })
  } catch (e) {
    message.error('【刊物信息】不完善，请填写相关信息')
    emit('update:activeName', 'publication')
    throw e
  }
}
defineExpose({ validate })

onMounted(async () => {
  await Promise.all([refreshTitleList(), refreshGradeList()])
})
</script>
