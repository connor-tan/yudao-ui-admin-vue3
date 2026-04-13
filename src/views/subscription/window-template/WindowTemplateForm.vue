<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="640px">
    <el-form ref="formRef" v-loading="formLoading" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="模板名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入模板名称" />
      </el-form-item>
      <el-form-item label="目标周期" prop="targetPeriod">
        <el-select
          v-model="formData.targetPeriod"
          :disabled="!!formData.builtIn"
          class="!w-240px"
          placeholder="请选择目标周期"
        >
          <el-option
            v-for="item in SUBSCRIPTION_TARGET_PERIOD_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="年级判定" prop="gradeCalcRule">
        <el-radio-group v-model="formData.gradeCalcRule" :disabled="!!formData.builtIn">
          <el-radio
            v-for="item in SUBSCRIPTION_GRADE_CALC_RULE_OPTIONS"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="解析模式" prop="gradeResolveMode">
        <el-radio-group v-model="formData.gradeResolveMode" :disabled="!!formData.builtIn">
          <el-radio
            v-for="item in SUBSCRIPTION_GRADE_RESOLVE_MODE_OPTIONS"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="模板说明" prop="description">
        <el-input v-model="formData.description" :rows="3" placeholder="请输入模板说明" type="textarea" />
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
        <el-input v-model="formData.remark" :rows="3" placeholder="请输入备注" type="textarea" />
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
import {
  SUBSCRIPTION_GRADE_CALC_RULE_OPTIONS,
  SUBSCRIPTION_GRADE_RESOLVE_MODE_OPTIONS,
  SUBSCRIPTION_TARGET_PERIOD_OPTIONS
} from '@/utils/subscription'
import { SubscriptionWindowTemplateApi, type SubscriptionWindowTemplate } from '@/api/subscription/windowTemplate'

defineOptions({ name: 'SubscriptionWindowTemplateForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref<'create' | 'update'>('create')
const formRef = ref()
const formData = ref<SubscriptionWindowTemplate>({
  id: undefined,
  name: '',
  targetPeriod: 'FULL_YEAR',
  gradeCalcRule: 'CURRENT_GRADE',
  gradeResolveMode: 'CURRENT_CHAIN',
  description: '',
  status: CommonStatusEnum.ENABLE,
  sort: 0,
  builtIn: false,
  remark: ''
})

const formRules = reactive({
  name: [required],
  targetPeriod: [required],
  gradeCalcRule: [required],
  gradeResolveMode: [required],
  status: [required],
  sort: [required]
})

const resetForm = () => {
  formData.value = {
    id: undefined,
    name: '',
    targetPeriod: 'FULL_YEAR',
    gradeCalcRule: 'CURRENT_GRADE',
    gradeResolveMode: 'CURRENT_CHAIN',
    description: '',
    status: CommonStatusEnum.ENABLE,
    sort: 0,
    builtIn: false,
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
    formData.value = await SubscriptionWindowTemplateApi.getWindowTemplate(id)
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
      await SubscriptionWindowTemplateApi.createWindowTemplate(formData.value)
      message.success(t('common.createSuccess'))
    } else {
      await SubscriptionWindowTemplateApi.updateWindowTemplate(formData.value)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}
</script>
