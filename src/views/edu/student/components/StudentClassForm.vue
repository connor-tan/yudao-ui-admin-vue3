<template>
  <el-form
    ref="formRef"
    v-loading="formLoading"
    :model="formData"
    :rules="formRules"
    label-width="0px"
    :inline-message="true"
  >
    <el-table :data="formData" class="-mt-10px">
      <el-table-column label="序号" type="index" width="80" />
      <el-table-column label="班级" min-width="260">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.classId`" :rules="formRules.classId" class="mb-0px!">
            <el-select
              v-model="row.classId"
              filterable
              clearable
              placeholder="请选择班级"
              class="!w-full"
            >
              <el-option
                v-for="schoolClass in classOptions"
                :key="schoolClass.id"
                :label="formatClassLabel(schoolClass)"
                :value="schoolClass.id"
              />
            </el-select>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="入班日期" min-width="160">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.startDate`" :rules="formRules.startDate" class="mb-0px!">
            <el-date-picker
              v-model="row.startDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择入班日期"
              class="!w-full"
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="离班日期" min-width="160">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.endDate`" :rules="formRules.endDate" class="mb-0px!">
            <el-date-picker
              v-model="row.endDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择离班日期"
              class="!w-full"
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column align="center" fixed="right" label="操作" width="80">
        <template #default="{ $index }">
          <el-button link type="danger" @click="handleDelete($index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-form>
  <el-row justify="center" class="mt-3">
    <el-button :disabled="!schoolId" round @click="handleAdd">+ 添加学生班级记录</el-button>
  </el-row>
</template>

<script setup lang="ts">
import { SchoolApi, type SchoolClassSimple } from '@/api/edu/school'
import { StudentApi, type StudentClass } from '@/api/edu/student'

const props = defineProps<{
  studentId?: number
  schoolId?: number
}>()

const schoolId = computed(() => props.schoolId)
const formLoading = ref(false)
const formData = ref<StudentClass[]>([])
const classOptions = ref<SchoolClassSimple[]>([])
const validateEndDate = (rule: any, value: string | undefined, callback: (error?: Error) => void) => {
  const field = String(rule.field || '')
  const index = Number(field.split('.')[0])
  const startDate = Number.isNaN(index) ? undefined : formData.value[index]?.startDate
  if (value && startDate && value < startDate) {
    callback(new Error('离班日期不能早于入班日期'))
    return
  }
  callback()
}
const formRules = reactive({
  classId: [{ required: true, message: '班级不能为空', trigger: 'change' }],
  startDate: [{ required: true, message: '入班日期不能为空', trigger: 'change' }],
  endDate: [{ validator: validateEndDate, trigger: 'change' }]
})
const formRef = ref()

const formatClassLabel = (schoolClass: SchoolClassSimple) => {
  if (schoolClass.schoolYearName) {
    return `${schoolClass.className} / ${schoolClass.schoolYearName}`
  }
  return schoolClass.className
}

const syncClassValue = () => {
  const validClassIds = new Set(classOptions.value.map((item) => item.id))
  formData.value = formData.value.map((item) => ({
    ...item,
    classId: item.classId && validClassIds.has(item.classId) ? item.classId : undefined
  }))
}

const loadClassOptions = async (nextSchoolId?: number) => {
  if (!nextSchoolId) {
    classOptions.value = []
    syncClassValue()
    return
  }
  classOptions.value = await SchoolApi.getSchoolClassSimpleList(nextSchoolId)
  syncClassValue()
}

watch(
  () => props.schoolId,
  async (val) => {
    await loadClassOptions(val)
  },
  { immediate: true }
)

watch(
  () => props.studentId,
  async (val) => {
    formData.value = []
    if (!val) {
      return
    }
    try {
      formLoading.value = true
      formData.value = await StudentApi.getStudentClassListByStudentId(val)
    } finally {
      formLoading.value = false
    }
  },
  { immediate: true }
)

const handleAdd = () => {
  formData.value.push({
    id: undefined,
    studentId: props.studentId,
    classId: undefined,
    startDate: undefined,
    endDate: undefined
  })
}

const handleDelete = (index: number) => {
  formData.value.splice(index, 1)
}

const validate = () => {
  return formRef.value.validate()
}

const getData = () => {
  return formData.value.map((item) => ({
    id: item.id,
    classId: item.classId,
    startDate: item.startDate,
    endDate: item.endDate
  }))
}

defineExpose({ validate, getData })
</script>
