<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="720px">
    <el-form ref="formRef" v-loading="formLoading" :model="formData" :rules="formRules" label-width="110px">
      <el-form-item label="主档编码" prop="code">
        <el-input v-model="formData.code" placeholder="请输入刊物主档编码" />
      </el-form-item>
      <el-form-item label="主档名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入刊物主档名称" />
      </el-form-item>
      <el-form-item v-if="lockedTypeName" label="刊物类型">
        <el-input :model-value="lockedTypeName" disabled />
      </el-form-item>
      <el-form-item v-else label="刊物类型" prop="typeId">
        <el-select v-model="formData.typeId" class="w-full" placeholder="请选择刊物类型">
          <el-option
            v-for="item in typeList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="出版社" prop="publisherId">
        <el-select v-model="formData.publisherId" class="w-full" placeholder="请选择出版社">
          <el-option
            v-for="item in publisherList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="刊物周期" prop="issueCycle">
        <el-input v-model="formData.issueCycle" placeholder="请输入刊物周期，如月刊、学期刊" />
      </el-form-item>
      <el-form-item label="ISSN" prop="issn">
        <el-input v-model="formData.issn" placeholder="请输入 ISSN" />
      </el-form-item>
      <el-form-item label="CN 刊号" prop="cnCode">
        <el-input v-model="formData.cnCode" placeholder="请输入 CN 刊号" />
      </el-form-item>
      <el-form-item label="邮发代号" prop="postDistributionCode">
        <el-input v-model="formData.postDistributionCode" placeholder="请输入邮发代号" />
      </el-form-item>
      <el-alert
        v-if="titleIdentifierRequired"
        class="mb-18px"
        :closable="false"
        show-icon
        :type="titleIdentifierBlank ? 'warning' : 'success'"
      >
        <template #title>
          {{
            titleIdentifierBlank
              ? '当前刊物类型启用前需至少填写 ISSN、CN 刊号或邮发代号'
              : '当前刊物类型的主档标识已满足启用要求'
          }}
        </template>
      </el-alert>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" placeholder="请输入备注" type="textarea" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { CommonStatusEnum } from '@/utils/constants'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as PublicationTitleApi from '@/api/mall/product/publicationTitle'
import * as PublicationTypeApi from '@/api/mall/product/publicationType'
import * as PublicationPublisherApi from '@/api/mall/product/publicationPublisher'

defineOptions({ name: 'ProductPublicationTitleForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref<'create' | 'update'>('create')
const formRef = ref()
const typeList = ref<PublicationTypeApi.PublicationTypeSimpleVO[]>([])
const publisherList = ref<PublicationPublisherApi.PublicationPublisherSimpleVO[]>([])
const lockedTypeName = ref('')
const formData = ref<PublicationTitleApi.PublicationTitleVO>({
  id: undefined,
  code: '',
  name: '',
  typeId: undefined as unknown as number,
  publisherId: undefined as unknown as number,
  issueCycle: '',
  status: CommonStatusEnum.ENABLE,
  issn: '',
  cnCode: '',
  postDistributionCode: '',
  remark: ''
})
const formRules = reactive({
  code: [required],
  name: [required],
  typeId: [required],
  publisherId: [required],
  issueCycle: [required],
  status: [required]
})
const currentType = computed(() => typeList.value.find((item) => item.id === formData.value.typeId))
const titleIdentifierRequired = computed(() => {
  return (
    formData.value.status === CommonStatusEnum.ENABLE &&
    PublicationTypeApi.requiresTitleIdentifier(currentType.value?.identifierRule)
  )
})
const titleIdentifierBlank = computed(() => {
  return !formData.value.issn && !formData.value.cnCode && !formData.value.postDistributionCode
})

const resetForm = () => {
  lockedTypeName.value = ''
  formData.value = {
    id: undefined,
    code: '',
    name: '',
    typeId: undefined as unknown as number,
    publisherId: undefined as unknown as number,
    issueCycle: '',
    status: CommonStatusEnum.ENABLE,
    issn: '',
    cnCode: '',
    postDistributionCode: '',
    remark: ''
  }
  formRef.value?.resetFields()
}

const open = async (type: 'create' | 'update', id?: number, presetTypeId?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t(`action.${type}`)
  formType.value = type
  resetForm()
  ;[typeList.value, publisherList.value] = await Promise.all([
    PublicationTypeApi.getPublicationTypeSimpleList(),
    PublicationPublisherApi.getPublicationPublisherSimpleList()
  ])
  if (!id) {
    if (presetTypeId) {
      formData.value.typeId = presetTypeId as unknown as number
      lockedTypeName.value = typeList.value.find((item) => item.id === presetTypeId)?.name || ''
    }
    return
  }
  formLoading.value = true
  try {
    formData.value = await PublicationTitleApi.getPublicationTitle(id)
    if (presetTypeId) {
      lockedTypeName.value =
        typeList.value.find((item) => item.id === formData.value.typeId)?.name ||
        typeList.value.find((item) => item.id === presetTypeId)?.name ||
        ''
    }
  } finally {
    formLoading.value = false
  }
}
defineExpose({ open })

const emit = defineEmits(['success'])
const submitForm = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return
  if (titleIdentifierRequired.value && titleIdentifierBlank.value) {
    message.error('当前刊物类型启用前需至少填写 ISSN、CN 刊号或邮发代号')
    return
  }
  formLoading.value = true
  try {
    if (formType.value === 'create') {
      await PublicationTitleApi.createPublicationTitle(formData.value)
      message.success(t('common.createSuccess'))
    } else {
      await PublicationTitleApi.updatePublicationTitle(formData.value)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}
</script>
