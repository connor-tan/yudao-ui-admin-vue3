<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="入学批次" prop="entryYear">
        <el-input-number v-model="formData.entryYear" :controls="false" :min="2000" placeholder="请输入入学批次" />
      </el-form-item>
      <el-form-item label="年级" prop="schoolGradeId">
        <el-select v-model="formData.schoolGradeId" filterable placeholder="请选择学校年级">
          <el-option
            v-for="grade in schoolGradeList"
            :key="grade.id"
            :label="formatGradeLabel(grade.gradeNo, grade.gradeName, grade.aliasName)"
            :value="grade.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="学年" prop="schoolYearId">
        <el-select v-model="formData.schoolYearId" filterable placeholder="请选择学年">
          <el-option
            v-for="schoolYear in schoolYearList"
            :key="schoolYear.id"
            :label="schoolYear.name"
            :value="schoolYear.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="班级号" prop="classNo">
        <el-input-number v-model="formData.classNo" :controls="false" :min="1" placeholder="请输入班级号" />
      </el-form-item>
      <el-form-item label="班级名称" prop="className">
        <el-input v-model="formData.className" placeholder="为空时自动生成，例如 2023级一年级1班" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { formatGradeLabel } from '@/utils/edu'
import {
  SchoolApi,
  type SchoolClass,
  type SchoolGradeSimple,
  type SchoolYearSimple
} from '@/api/edu/school'

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const schoolGradeList = ref<SchoolGradeSimple[]>([])
const schoolYearList = ref<SchoolYearSimple[]>([])
const formData = ref<SchoolClass>({
  id: undefined,
  schoolId: undefined,
  entryYear: undefined,
  schoolGradeId: undefined,
  schoolYearId: undefined,
  classNo: undefined,
  className: undefined
})
const formRules = reactive({
  schoolId: [{ required: true, message: '学校ID不能为空', trigger: 'blur' }],
  entryYear: [{ required: true, message: '入学批次不能为空', trigger: 'blur' }],
  schoolGradeId: [{ required: true, message: '学校年级不能为空', trigger: 'change' }],
  schoolYearId: [{ required: true, message: '学校学年不能为空', trigger: 'change' }],
  classNo: [{ required: true, message: '班级号不能为空', trigger: 'blur' }]
})
const formRef = ref()

const loadOptions = async (schoolId?: number) => {
  if (!schoolId) {
    schoolGradeList.value = []
    schoolYearList.value = []
    return
  }
  const [schoolGradeOptions, schoolYearOptions] = await Promise.all([
    SchoolApi.getSchoolGradeSimpleList(schoolId),
    SchoolApi.getSchoolYearSimpleList(schoolId)
  ])
  schoolGradeList.value = schoolGradeOptions
  schoolYearList.value = schoolYearOptions
}

const open = async (type: string, id?: number, schoolId?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t(`action.${type}`)
  formType.value = type
  resetForm()
  formData.value.schoolId = schoolId
  formLoading.value = true
  try {
    await loadOptions(schoolId)
    if (id) {
      formData.value = await SchoolApi.getSchoolClass(id)
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
    const data: SchoolClass = {
      id: formData.value.id,
      schoolId: formData.value.schoolId,
      entryYear: formData.value.entryYear,
      schoolGradeId: formData.value.schoolGradeId,
      schoolYearId: formData.value.schoolYearId,
      classNo: formData.value.classNo,
      className: formData.value.className
    }
    if (formType.value === 'create') {
      await SchoolApi.createSchoolClass(data)
      message.success(t('common.createSuccess'))
    } else {
      await SchoolApi.updateSchoolClass(data)
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
    entryYear: undefined,
    schoolGradeId: undefined,
    schoolYearId: undefined,
    classNo: undefined,
    className: undefined
  }
  formRef.value?.resetFields()
}
</script>
