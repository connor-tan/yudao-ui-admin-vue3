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
          value-format="x"
          placeholder="请选择开始时间"
        />
      </el-form-item>
      <el-form-item label="结束时间" prop="endTime">
        <el-date-picker
          v-model="formData.endTime"
          class="!w-full"
          type="datetime"
          value-format="x"
          placeholder="请选择结束时间"
        />
      </el-form-item>
      <el-form-item label="目标学年" prop="targetSchoolYearId">
        <el-select v-model="formData.targetSchoolYearId" class="!w-full" filterable placeholder="请选择目标学年">
          <el-option
            v-for="schoolYear in schoolYearList"
            :key="schoolYear.id"
            :label="schoolYear.name"
            :value="schoolYear.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="目标学期" prop="targetSemester">
        <el-select v-model="formData.targetSemester" class="!w-full" placeholder="请选择目标学期">
          <el-option
            v-for="option in SUBSCRIPTION_SEMESTER_OPTIONS"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="年级判定">
        <div class="flex w-full items-center gap-12px">
          <el-input :model-value="gradeCalcRuleSummary" readonly />
          <el-button link type="primary" @click="toggleAdvancedMode">
            {{ advancedModeEnabled ? '关闭高级配置' : '高级配置' }}
          </el-button>
        </div>
      </el-form-item>
      <el-collapse-transition>
        <div v-show="advancedModeEnabled">
          <el-form-item label="判定方式" prop="gradeCalcRule">
            <el-radio-group v-model="formData.gradeCalcRule">
              <el-radio
                v-for="option in SUBSCRIPTION_GRADE_CALC_RULE_OPTIONS"
                :key="option.value"
                :label="option.value"
              >
                {{ option.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </div>
      </el-collapse-transition>
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
  getSubscriptionGradeCalcRuleLabel,
  SUBSCRIPTION_GRADE_CALC_RULE_OPTIONS,
  SUBSCRIPTION_SEMESTER_OPTIONS
} from '@/utils/subscription'
import { SubscriptionSupportApi, type SubscriptionSupportSchoolYearSimple } from '@/api/subscription/support'
import { SubscriptionWindowApi, type SubscriptionWindow } from '@/api/subscription/window'

defineOptions({ name: 'SubscriptionWindowForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('create')
const advancedModeEnabled = ref(false)
const schoolYearList = ref<SubscriptionSupportSchoolYearSimple[]>([])
const formRef = ref()
const formData = ref<SubscriptionWindow>({
  id: undefined,
  name: '',
  startTime: undefined,
  endTime: undefined,
  targetSchoolYearId: undefined,
  targetSemester: 1,
  gradeCalcRule: 'CURRENT_GRADE',
  status: 1,
  remark: ''
})

const formRules = reactive({
  name: [{ required: true, message: '窗口名称不能为空', trigger: 'blur' }],
  startTime: [{ required: true, message: '开始时间不能为空', trigger: 'change' }],
  endTime: [{ required: true, message: '结束时间不能为空', trigger: 'change' }],
  targetSchoolYearId: [{ required: true, message: '目标学年不能为空', trigger: 'change' }],
  targetSemester: [{ required: true, message: '目标学期不能为空', trigger: 'change' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
})

const gradeCalcRuleSummary = computed(() =>
  advancedModeEnabled.value
    ? getSubscriptionGradeCalcRuleLabel(formData.value.gradeCalcRule)
    : '当前学籍年级（系统自动计算）'
)

const loadSchoolYearList = async () => {
  if (schoolYearList.value.length > 0) {
    return
  }
  schoolYearList.value = await SubscriptionSupportApi.getSchoolYearSimpleList()
}

const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t(`action.${type}`)
  formType.value = type
  resetForm()
  formLoading.value = true
  try {
    await loadSchoolYearList()
    if (id) {
      formData.value = await SubscriptionWindowApi.getWindow(id)
      formData.value.startTime = formData.value.startTime ? dayjs(formData.value.startTime).valueOf() : undefined
      formData.value.endTime = formData.value.endTime ? dayjs(formData.value.endTime).valueOf() : undefined
      advancedModeEnabled.value = formData.value.gradeCalcRule === 'PROMOTED_GRADE'
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
    formData.value.gradeCalcRule = advancedModeEnabled.value
      ? formData.value.gradeCalcRule || 'CURRENT_GRADE'
      : 'CURRENT_GRADE'
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

const toggleAdvancedMode = () => {
  if (advancedModeEnabled.value) {
    advancedModeEnabled.value = false
    formData.value.gradeCalcRule = 'CURRENT_GRADE'
    return
  }
  advancedModeEnabled.value = true
  formData.value.gradeCalcRule = formData.value.gradeCalcRule || 'CURRENT_GRADE'
}

const resetForm = () => {
  advancedModeEnabled.value = false
  formData.value = {
    id: undefined,
    name: '',
    startTime: undefined,
    endTime: undefined,
    targetSchoolYearId: undefined,
    targetSemester: 1,
    gradeCalcRule: 'CURRENT_GRADE',
    status: 1,
    remark: ''
  }
  formRef.value?.resetFields()
}
</script>
