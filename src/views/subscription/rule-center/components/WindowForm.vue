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
      <el-form-item label="开始日期" prop="startDate">
        <el-date-picker
          v-model="formData.startDate"
          class="!w-full"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择开始日期"
        />
      </el-form-item>
      <el-form-item label="结束日期" prop="endDate">
        <el-date-picker
          v-model="formData.endDate"
          class="!w-full"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择结束日期"
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
          <el-descriptions-item label="解析模式">
            {{ getSubscriptionGradeResolveModeLabel(templateSummary.gradeResolveMode) }}
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
  getSubscriptionGradeResolveModeLabel,
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
type SubscriptionWindowFormData = Omit<SubscriptionWindow, 'startTime' | 'endTime'> & {
  startDate?: string
  endDate?: string
}

const formData = ref<SubscriptionWindowFormData>({
  id: undefined,
  name: '',
  startDate: undefined,
  endDate: undefined,
  targetYearStart: undefined,
  targetYearEnd: undefined,
  templateId: undefined,
  templateNameSnapshot: '',
  targetPeriod: '',
  gradeCalcRule: '',
  gradeResolveMode: '',
  templateLocked: false,
  status: 1,
  remark: ''
})

const formRules = reactive({
  name: [{ required: true, message: '窗口名称不能为空', trigger: 'blur' }],
  startDate: [{ required: true, message: '开始日期不能为空', trigger: 'change' }],
  endDate: [
    { required: true, message: '结束日期不能为空', trigger: 'change' },
    {
      validator: (_rule: any, value: string, callback: any) => {
        if (!value || !formData.value.startDate) {
          callback()
          return
        }
        if (dayjs(value).isBefore(dayjs(formData.value.startDate), 'day')) {
          callback(new Error('结束日期不能早于开始日期'))
          return
        }
        callback()
      },
      trigger: 'change'
    }
  ],
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
      gradeResolveMode: formData.value.gradeResolveMode || '',
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
  if (
    formData.value.templateNameSnapshot ||
    formData.value.targetPeriod ||
    formData.value.gradeCalcRule ||
    formData.value.gradeResolveMode
  ) {
    return {
      id: formData.value.templateId || 0,
      code: '',
      name: formData.value.templateNameSnapshot || '历史窗口快照',
      targetPeriod: formData.value.targetPeriod || '',
      gradeCalcRule: formData.value.gradeCalcRule || '',
      gradeResolveMode: formData.value.gradeResolveMode || '',
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

watch(
  () => formData.value.startDate,
  () => {
    if (formData.value.endDate) {
      nextTick(() => formRef.value?.validateField('endDate'))
    }
  }
)

const resetForm = () => {
  formData.value = {
    id: undefined,
    name: '',
    startDate: undefined,
    endDate: undefined,
    targetYearStart: undefined,
    targetYearEnd: undefined,
    templateId: undefined,
    templateNameSnapshot: '',
    targetPeriod: '',
    gradeCalcRule: '',
    gradeResolveMode: '',
    templateLocked: false,
    status: 1,
    remark: ''
  }
  targetYearKey.value = undefined
  formRef.value?.resetFields()
}

const loadSupportData = async () => {
  const [windowYears, templateOptionsResp] = await Promise.all([
    SubscriptionSupportApi.getWindowYearSimpleList(),
    SubscriptionWindowTemplateApi.getWindowTemplateSimpleList()
  ])
  windowYearList.value = windowYears
  templateList.value = templateOptionsResp
}

const open = async (type: 'create' | 'update', id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t(`action.${type}`)
  formType.value = type
  resetForm()
  formLoading.value = true
  try {
    await loadSupportData()
    if (!id) {
      return
    }
    const data = await SubscriptionWindowApi.getWindow(id)
    formData.value = {
      ...data,
      startDate: data.startTime ? dayjs(data.startTime).format('YYYY-MM-DD') : undefined,
      endDate: data.endTime ? dayjs(data.endTime).format('YYYY-MM-DD') : undefined
    }
    targetYearKey.value = buildSubscriptionTargetYearKey(data.targetYearStart, data.targetYearEnd)
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
    const data: SubscriptionWindow = {
      id: formData.value.id,
      name: formData.value.name,
      startTime: formData.value.startDate ? `${formData.value.startDate} 00:00:00` : undefined,
      endTime: formData.value.endDate ? `${formData.value.endDate} 23:59:59` : undefined,
      targetYearStart: formData.value.targetYearStart,
      targetYearEnd: formData.value.targetYearEnd,
      templateId: formData.value.templateId,
      status: formData.value.status,
      remark: formData.value.remark
    }
    if (formType.value === 'create') {
      await SubscriptionWindowApi.createWindow(data)
      message.success(t('common.createSuccess'))
    } else {
      await SubscriptionWindowApi.updateWindow(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}
</script>
