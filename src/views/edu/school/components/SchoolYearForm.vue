<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="全局学年" prop="yearCatalogId">
        <el-select v-model="formData.yearCatalogId" class="!w-full" filterable placeholder="请选择全局学年">
          <el-option
            v-for="item in yearCatalogList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="学年开始">
        <el-input :model-value="selectedYearCatalog?.yearStart || ''" readonly />
      </el-form-item>
      <el-form-item label="学年结束">
        <el-input :model-value="selectedYearCatalog?.yearEnd || ''" readonly />
      </el-form-item>
      <el-form-item label="开学日期" prop="startDate">
        <el-date-picker
          v-model="formData.startDate"
          placeholder="选择开学日期"
          type="date"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="放假日期" prop="endDate">
        <el-date-picker
          v-model="formData.endDate"
          placeholder="选择放假日期"
          type="date"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { YearCatalogApi, type YearCatalogSimple } from '@/api/edu/yearCatalog'
import { SchoolApi, type SchoolYear } from '@/api/edu/school'

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
type SchoolYearFormData = {
  id?: number
  schoolId?: number
  yearCatalogId?: number
  yearStart?: number
  yearEnd?: number
  startDate?: string
  endDate?: string
}

const formData = ref<SchoolYearFormData>({
  id: undefined,
  schoolId: undefined,
  yearCatalogId: undefined,
  yearStart: undefined,
  yearEnd: undefined,
  startDate: undefined,
  endDate: undefined
})
const yearCatalogList = ref<YearCatalogSimple[]>([])
const formRules = reactive({
  schoolId: [{ required: true, message: '学校ID不能为空', trigger: 'blur' }],
  yearCatalogId: [{ required: true, message: '全局学年不能为空', trigger: 'change' }],
  startDate: [{ required: true, message: '开学日期不能为空', trigger: 'change' }],
  endDate: [{ required: true, message: '放假日期不能为空', trigger: 'change' }]
})
const formRef = ref()
const selectedYearCatalog = computed(() =>
  yearCatalogList.value.find((item) => item.id === formData.value.yearCatalogId)
)

// Compatible with old LocalDate array responses during backend rollout.
const normalizeSchoolYearDate = (value?: string | number[]): string | undefined => {
  if (Array.isArray(value) && value.length === 3) {
    const [year, month, day] = value
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }
  return typeof value === 'string' ? value : undefined
}

const open = async (type: string, id?: number, schoolId?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t(`action.${type}`)
  formType.value = type
  resetForm()
  formData.value.schoolId = schoolId
  yearCatalogList.value = await YearCatalogApi.getYearCatalogSimpleList()
  if (!id) {
    return
  }
  formLoading.value = true
  try {
    const schoolYear = await SchoolApi.getSchoolYear(id)
    formData.value = {
      id: schoolYear.id,
      schoolId: schoolYear.schoolId,
      yearCatalogId: schoolYear.yearCatalogId,
      yearStart: schoolYear.yearStart,
      yearEnd: schoolYear.yearEnd,
      startDate: normalizeSchoolYearDate((schoolYear as SchoolYear & { startDate?: string | number[] }).startDate),
      endDate: normalizeSchoolYearDate((schoolYear as SchoolYear & { endDate?: string | number[] }).endDate)
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
    const data: SchoolYear = {
      id: formData.value.id,
      schoolId: formData.value.schoolId,
      yearCatalogId: formData.value.yearCatalogId,
      startDate: formData.value.startDate,
      endDate: formData.value.endDate
    }
    if (formType.value === 'create') {
      await SchoolApi.createSchoolYear(data)
      message.success(t('common.createSuccess'))
    } else {
      await SchoolApi.updateSchoolYear(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    id: undefined,
    schoolId: undefined,
    yearCatalogId: undefined,
    yearStart: undefined,
    yearEnd: undefined,
    startDate: undefined,
    endDate: undefined
  }
  formRef.value?.resetFields()
}
</script>
