<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form ref="formRef" v-loading="formLoading" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="类型编码" prop="code">
        <el-input v-model="formData.code" placeholder="请输入刊物类型编码" />
      </el-form-item>
      <el-form-item label="类型名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入刊物类型名称" />
      </el-form-item>
      <el-form-item label="标识规则" prop="identifierRule">
        <el-select v-model="formData.identifierRule" class="w-full" placeholder="请选择标识规则">
          <el-option
            v-for="item in PublicationTypeApi.PUBLICATION_TYPE_IDENTIFIER_RULE_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" class="!w-240px" controls-position="right" />
      </el-form-item>
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
import * as PublicationTypeApi from '@/api/mall/product/publicationType'

defineOptions({ name: 'ProductPublicationTypeForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref<'create' | 'update'>('create')
const formRef = ref()
const formData = ref<PublicationTypeApi.PublicationTypeVO>({
  id: undefined,
  code: '',
  name: '',
  identifierRule: PublicationTypeApi.PUBLICATION_TYPE_IDENTIFIER_RULE_NONE,
  sort: 0,
  status: CommonStatusEnum.ENABLE,
  remark: ''
})
const formRules = reactive({
  code: [required],
  name: [required],
  identifierRule: [required],
  sort: [required],
  status: [required]
})

const resetForm = () => {
  formData.value = {
    id: undefined,
    code: '',
    name: '',
    identifierRule: PublicationTypeApi.PUBLICATION_TYPE_IDENTIFIER_RULE_NONE,
    sort: 0,
    status: CommonStatusEnum.ENABLE,
    remark: ''
  }
  formRef.value?.resetFields()
}

const open = async (type: 'create' | 'update', id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t(`action.${type}`)
  formType.value = type
  resetForm()
  if (!id) return
  formLoading.value = true
  try {
    const data = await PublicationTypeApi.getPublicationType(id)
    formData.value = {
      ...data,
      identifierRule: data.identifierRule || PublicationTypeApi.PUBLICATION_TYPE_IDENTIFIER_RULE_NONE
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
  formLoading.value = true
  try {
    if (formType.value === 'create') {
      await PublicationTypeApi.createPublicationType(formData.value)
      message.success(t('common.createSuccess'))
    } else {
      await PublicationTypeApi.updatePublicationType(formData.value)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}
</script>
