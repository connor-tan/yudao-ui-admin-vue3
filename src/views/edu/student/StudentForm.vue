<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="720px">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="姓名" prop="studentName">
        <el-input v-model="formData.studentName" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="家长" prop="belongTo">
        <el-select
          v-model="formData.belongTo"
          remote
          filterable
          reserve-keyword
          clearable
          placeholder="请输入家长昵称或手机号搜索"
          :remote-method="searchParent"
          :loading="parentLoading"
          class="!w-full"
        >
          <el-option
            v-for="parent in parentOptions"
            :key="parent.id"
            :label="formatParentLabel(parent)"
            :value="parent.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="学校" prop="currentSchoolId">
        <el-select v-model="formData.currentSchoolId" filterable placeholder="请选择学校" class="!w-full">
          <el-option
            v-for="school in schoolList"
            :key="school.id"
            :label="school.schoolName"
            :value="school.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="入学年" prop="entryYear">
        <el-input-number
          v-model="formData.entryYear"
          :controls="false"
          :min="2000"
          placeholder="请输入入学年"
          class="!w-full"
        />
      </el-form-item>
      <el-form-item label="学号" prop="studentCode">
        <el-input-number
          v-model="formData.studentCode"
          :controls="false"
          :min="1"
          placeholder="请输入学号"
          class="!w-full"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio v-for="item in STUDENT_STATUS_OPTIONS" :key="item.value" :value="item.value">
            {{ item.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <el-tabs v-model="subTabsName">
      <el-tab-pane label="学生班级记录" name="studentClass">
        <StudentClassForm
          ref="studentClassFormRef"
          :student-id="formData.id"
          :school-id="formData.currentSchoolId"
        />
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { SchoolApi, type SchoolSimple } from '@/api/edu/school'
import { STUDENT_STATUS_OPTIONS, StudentApi, type Student } from '@/api/edu/student'
import { getUserPage, type UserVO } from '@/api/member/user'
import StudentClassForm from './components/StudentClassForm.vue'

interface ParentOption {
  id: number
  nickname?: string
  mobile?: string
}

defineOptions({ name: 'StudentForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const schoolList = ref<SchoolSimple[]>([])
const parentOptions = ref<ParentOption[]>([])
const parentLoading = ref(false)
const formData = ref<Student>({
  id: undefined,
  studentName: undefined,
  belongTo: undefined,
  currentSchoolId: undefined,
  entryYear: undefined,
  studentCode: undefined,
  status: 1
})
const formRules = reactive({
  studentName: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
  belongTo: [{ required: true, message: '家长不能为空', trigger: 'change' }],
  currentSchoolId: [{ required: true, message: '学校不能为空', trigger: 'change' }],
  entryYear: [{ required: true, message: '入学年不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
})
const formRef = ref()

const subTabsName = ref('studentClass')
const studentClassFormRef = ref()

const loadSchoolList = async () => {
  if (schoolList.value.length > 0) {
    return
  }
  schoolList.value = await SchoolApi.getSchoolSimpleList()
}

const ensureParentOption = (student?: Student) => {
  if (!student?.belongTo) {
    return
  }
  if (parentOptions.value.some((item) => item.id === student.belongTo)) {
    return
  }
  parentOptions.value.unshift({
    id: student.belongTo,
    nickname: student.parentNickname,
    mobile: student.parentMobile
  })
}

const formatParentLabel = (parent: ParentOption) => {
  if (parent.nickname && parent.mobile) {
    return `${parent.nickname}（${parent.mobile}）`
  }
  return parent.nickname || parent.mobile || String(parent.id)
}

const searchParent = async (query: string) => {
  parentLoading.value = true
  try {
    const params: Record<string, any> = { pageNo: 1, pageSize: 20 }
    if (query) {
      if (/^\d+$/.test(query)) {
        params.mobile = query
      } else {
        params.nickname = query
      }
    }
    const data = await getUserPage(params)
    parentOptions.value = (data.list || []).map((item: UserVO) => ({
      id: item.id,
      nickname: item.nickname,
      mobile: item.mobile
    }))
    ensureParentOption(formData.value)
  } finally {
    parentLoading.value = false
  }
}

const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t(`action.${type}`)
  formType.value = type
  resetForm()
  formLoading.value = true
  try {
    await Promise.all([loadSchoolList(), searchParent('')])
    if (id) {
      const data = await StudentApi.getStudent(id)
      formData.value = {
        id: data.id,
        studentName: data.studentName,
        belongTo: data.belongTo,
        parentNickname: data.parentNickname,
        parentMobile: data.parentMobile,
        currentSchoolId: data.currentSchoolId,
        currentSchoolName: data.currentSchoolName,
        entryYear: data.entryYear,
        studentCode: data.studentCode,
        status: data.status ?? 1
      }
      ensureParentOption(data)
    }
  } finally {
    formLoading.value = false
  }
}
defineExpose({ open })

const emit = defineEmits(['success'])
const submitForm = async () => {
  await formRef.value.validate()
  try {
    await studentClassFormRef.value.validate()
  } catch {
    subTabsName.value = 'studentClass'
    return
  }

  formLoading.value = true
  try {
    const data: Student = {
      id: formData.value.id,
      studentName: formData.value.studentName,
      belongTo: formData.value.belongTo,
      currentSchoolId: formData.value.currentSchoolId,
      entryYear: formData.value.entryYear,
      studentCode: formData.value.studentCode,
      status: formData.value.status,
      studentClasses: studentClassFormRef.value.getData()
    }
    if (formType.value === 'create') {
      await StudentApi.createStudent(data)
      message.success(t('common.createSuccess'))
    } else {
      await StudentApi.updateStudent(data)
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
    studentName: undefined,
    belongTo: undefined,
    currentSchoolId: undefined,
    entryYear: undefined,
    studentCode: undefined,
    status: 1
  }
  subTabsName.value = 'studentClass'
  parentOptions.value = []
  formRef.value?.resetFields()
}
</script>
