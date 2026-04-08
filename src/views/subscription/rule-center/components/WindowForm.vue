<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="640px">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="110px"
    >
      <el-form-item label="窗口名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入窗口名称" />
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker
          v-model="formData.startTime"
          class="!w-full"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="请选择开始时间"
        />
      </el-form-item>
      <el-form-item label="结束时间" prop="endTime">
        <el-date-picker
          v-model="formData.endTime"
          class="!w-full"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="请选择结束时间"
        />
      </el-form-item>
      <el-form-item label="目标学年" prop="targetYearStart">
        <el-select v-model="targetYearKey" class="!w-full" filterable placeholder="请选择目标学年">
          <el-option
            v-for="item in windowYearList"
            :key="buildSubscriptionTargetYearKey(item.yearStart, item.yearEnd)"
            :label="item.name"
            :value="buildSubscriptionTargetYearKey(item.yearStart, item.yearEnd)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="规则模板" prop="templateId">
        <el-select
          v-model="formData.templateId"
          :disabled="!!formData.templateLocked"
          class="!w-full"
          clearable
          filterable
          placeholder="请选择规则模板"
        >
          <el-option
            v-for="item in templateOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="模板摘要">
        <el-descriptions v-if="templateSummary" :column="1" border class="!w-full">
          <el-descriptions-item label="模板名称">
            <div class="flex items-center gap-8px">
              <span>{{ templateSummary.name }}</span>
              <el-tag v-if="formData.templateLocked" size="small" type="warning">已锁定</el-tag>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="目标周期">
            {{ getSubscriptionTargetPeriodLabel(templateSummary.targetPeriod) }}
          </el-descriptions-item>
          <el-descriptions-item label="年级判定">
            {{ getSubscriptionGradeCalcRuleLabel(templateSummary.gradeCalcRule) }}
          </el-descriptions-item>
          <el-descriptions-item label="模板说明">
            {{ templateSummary.description || '-' }}
          </el-descriptions-item>
        </el-descriptions>
        <el-empty v-else :image-size="72" description="请选择规则模板" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import {
  buildSubscriptionTargetYearKey,
  getSubscriptionGradeCalcRuleLabel,
  getSubscriptionTargetPeriodLabel
} from '@/utils/subscription'
import {
  SubscriptionSupportApi,
  type SubscriptionSupportWindowYearSimple
} from '@/api/subscription/support'
import { SubscriptionWindowApi, type SubscriptionWindow } from '@/api/subscription/window'
import {
  SubscriptionWindowTemplateApi,
  type SubscriptionWindowTemplateSimple
} from '@/api/subscription/windowTemplate'

defineOptions({ name: 'SubscriptionWindowForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref<'create' | 'update'>('create')
const windowYearList = ref<SubscriptionSupportWindowYearSimple[]>([])
const templateList = ref<SubscriptionWindowTemplateSimple[]>([])
const formRef = ref()
const targetYearKey = ref<string>()
const formData = ref<SubscriptionWindow>({
  id: undefined,
  name: '',
  startTime: undefined,
  endTime: undefined,
  targetYearStart: undefined,
  targetYearEnd: undefined,
  templateId: undefined,
  templateNameSnapshot: '',
  targetPeriod: '',
  gradeCalcRule: '',
  templateLocked: false,
  status: 0,
  remark: ''
})

const formRules = reactive({
  name: [{ required: true, message: '窗口名称不能为空', trigger: 'blur' }],
  startTime: [{ required: true, message: '开始时间不能为空', trigger: 'change' }],
  endTime: [{ required: true, message: '结束时间不能为空', trigger: 'change' }],
  targetYearStart: [
    {
      validator: (_rule: any, _value: any, callback: any) => {
        if (!formData.value.targetYearStart || !formData.value.targetYearEnd) {
          callback(new Error('目标学年不能为空'))
          return
        }
        callback()
      },
      trigger: 'change'
    }
  ],
  templateId: [
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (formType.value === 'create' || !formData.value.templateLocked) {
          if (!value) {
            callback(new Error('规则模板不能为空'))
            return
          }
        }
        callback()
      },
      trigger: 'change'
    }
  ],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
})

const templateOptions = computed(() => {
  const exists = templateList.value.some((item) => item.id === formData.value.templateId)
  if (!formData.value.templateId || exists || !formData.value.templateNameSnapshot) {
    return templateList.value
  }
  return [
    {
      id: formData.value.templateId,
      code: '',
      name: formData.value.templateNameSnapshot,
      targetPeriod: formData.value.targetPeriod || '',
      gradeCalcRule: formData.value.gradeCalcRule || '',
      description: '',
      builtIn: false,
      status: 0
    },
    ...templateList.value
  ]
})

const templateSummary = computed(() => {
  const selectedTemplate = templateOptions.value.find((item) => item.id === formData.value.templateId)
  if (selectedTemplate) {
    return selectedTemplate
  }
  if (formData.value.templateNameSnapshot || formData.value.targetPeriod || formData.value.gradeCalcRule) {
    return {
      id: formData.value.templateId || 0,
      code: '',
      name: formData.value.templateNameSnapshot || '历史窗口快照',
      targetPeriod: formData.value.targetPeriod || '',
      gradeCalcRule: formData.value.gradeCalcRule || '',
      description: '',
      builtIn: false,
      status: 0
    }
  }
  return undefined
})

watch(targetYearKey, (value) => {
  if (!value) {
    formData.value.targetYearStart = undefined
    formData.value.targetYearEnd = undefined
    nextTick(() => formRef.value?.validateField('targetYearStart'))
    return
  }
  const [yearStart, yearEnd] = value.split('-').map((item) => Number(item))
  formData.value.targetYearStart = Number.isNaN(yearStart) ? undefined : yearStart
  formData.value.targetYearEnd = Number.isNaN(yearEnd) ? undefined : yearEnd
  nextTick(() => formRef.value?.validateField('targetYearStart'))
})

const loadWindowYearList = async () => {
  if (windowYearList.value.length > 0) {
    return
  }
  windowYearList.value = await SubscriptionSupportApi.getWindowYearSimpleList()
}

const loadTemplateList = async () => {
  templateList.value = await SubscriptionWindowTemplateApi.getWindowTemplateSimpleList()
}

const normalizeDateTimeValue = (value?: string | number) => {
  if (value === undefined || value === null || value === '') {
    return undefined
  }
  const datetime = dayjs(value)
  return datetime.isValid() ? datetime.format('YYYY-MM-DD HH:mm:ss') : undefined
}

const open = async (type: 'create' | 'update', id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = type === 'create' ? t('action.create') : t('action.update')
  formType.value = type
  resetForm()
  formLoading.value = true
  try {
    await Promise.all([loadWindowYearList(), loadTemplateList()])
    if (id) {
      formData.value = await SubscriptionWindowApi.getWindow(id)
      formData.value.startTime = normalizeDateTimeValue(formData.value.startTime)
      formData.value.endTime = normalizeDateTimeValue(formData.value.endTime)
      targetYearKey.value = buildSubscriptionTargetYearKey(
        formData.value.targetYearStart,
        formData.value.targetYearEnd
      )
    }
  } finally {
    formLoading.value = false
  }
}
defineExpose({ open })

const emit = defineEmits(['success'])

const submitForm = async () => {
  await formRef.value.validate()
  formLoading.value = true
  try {
    if (formType.value === 'create') {
      await SubscriptionWindowApi.createWindow(formData.value)
      message.success(t('common.createSuccess'))
    } else {
      await SubscriptionWindowApi.updateWindow(formData.value)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const resetForm = () => {
  targetYearKey.value = undefined
  formData.value = {
    id: undefined,
    name: '',
    startTime: undefined,
    endTime: undefined,
    targetYearStart: undefined,
    targetYearEnd: undefined,
    templateId: undefined,
    templateNameSnapshot: '',
    targetPeriod: '',
    gradeCalcRule: '',
    templateLocked: false,
    status: 0,
    remark: ''
  }
  formRef.value?.resetFields()
}
</script>
