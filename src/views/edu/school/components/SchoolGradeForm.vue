<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="年级阶段" prop="stage">
        <el-select v-model="formData.stage" placeholder="请选择年级阶段" @change="handleStageChange">
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.EDU_STAGE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="年级标识" prop="gradeCatalogId">
        <el-select
          v-model="formData.gradeCatalogId"
          :disabled="!formData.stage"
          filterable
          placeholder="请先选择年级阶段"
        >
          <el-option
            v-for="catalog in filteredGradeCatalogList"
            :key="catalog.id"
            :label="`${catalog.gradeNo} / ${catalog.gradeName}`"
            :value="catalog.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { DICT_TYPE, getStrDictOptions } from '@/utils/dict'
import { SchoolApi, type GradeCatalog, type SchoolGrade } from '@/api/edu/school'

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const gradeCatalogList = ref<GradeCatalog[]>([])
const formData = ref<SchoolGrade & { stage?: string }>({
  id: undefined,
  schoolId: undefined,
  gradeCatalogId: undefined,
  stage: undefined
})
const formRules = reactive({
  schoolId: [{ required: true, message: '学校ID不能为空', trigger: 'blur' }],
  stage: [{ required: true, message: '年级阶段不能为空', trigger: 'change' }],
  gradeCatalogId: [{ required: true, message: '年级标识不能为空', trigger: 'change' }]
})
const formRef = ref()

const filteredGradeCatalogList = computed(() =>
  gradeCatalogList.value.filter((item) => item.stage === formData.value.stage)
)

const loadGradeCatalogList = async () => {
  if (gradeCatalogList.value.length > 0) {
    return
  }
  gradeCatalogList.value = await SchoolApi.getGradeCatalogSimpleList()
}

const handleStageChange = () => {
  const existed = filteredGradeCatalogList.value.some((item) => item.id === formData.value.gradeCatalogId)
  if (!existed) {
    formData.value.gradeCatalogId = undefined
  }
}

const open = async (type: string, id?: number, schoolId?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t(`action.${type}`)
  formType.value = type
  resetForm()
  formData.value.schoolId = schoolId
  formLoading.value = true
  try {
    await loadGradeCatalogList()
    if (id) {
      const schoolGrade = await SchoolApi.getSchoolGrade(id)
      formData.value = {
        id: schoolGrade.id,
        schoolId: schoolGrade.schoolId,
        gradeCatalogId: schoolGrade.gradeCatalogId,
        stage: schoolGrade.stage
      }
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
    const data: SchoolGrade = {
      id: formData.value.id,
      schoolId: formData.value.schoolId,
      gradeCatalogId: formData.value.gradeCatalogId
    }
    if (formType.value === 'create') {
      await SchoolApi.createSchoolGrade(data)
      message.success(t('common.createSuccess'))
    } else {
      await SchoolApi.updateSchoolGrade(data)
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
    gradeCatalogId: undefined,
    stage: undefined
  }
  formRef.value?.resetFields()
}
</script>
