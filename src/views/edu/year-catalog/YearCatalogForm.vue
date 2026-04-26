<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="480px">
    <el-form ref="formRef" v-loading="formLoading" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="开始年份" prop="yearStart">
        <el-input-number
          v-model="formData.yearStart"
          :controls="false"
          :min="2000"
          class="!w-full"
          placeholder="请输入开始年份"
        />
      </el-form-item>
      <el-form-item label="结束年份" prop="yearEnd">
        <el-input-number
          v-model="formData.yearEnd"
          :controls="false"
          :min="2001"
          class="!w-full"
          placeholder="请输入结束年份"
        />
      </el-form-item>
      <div class="pl-100px text-12px text-[var(--el-text-color-secondary)]">
        学年目录固定为连续两年，例如 2026-2027 学年。
      </div>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { YearCatalogApi, type YearCatalog } from '@/api/edu/yearCatalog'

defineOptions({ name: 'EduYearCatalogForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref<'create' | 'update'>('create')
const formRef = ref()
const formData = ref<YearCatalog>({
  id: undefined,
  yearStart: undefined,
  yearEnd: undefined
})
const formRules = reactive({
  yearStart: [{ required: true, message: '开始年份不能为空', trigger: 'blur' }],
  yearEnd: [
    { required: true, message: '结束年份不能为空', trigger: 'blur' },
    {
      validator: (_rule: any, value: number | undefined, callback: any) => {
        if (value == null || formData.value.yearStart == null) {
          callback()
          return
        }
        if (value !== formData.value.yearStart + 1) {
          callback(new Error('结束年份必须等于开始年份 + 1'))
          return
        }
        callback()
      },
      trigger: 'blur'
    }
  ]
})

watch(
  () => formData.value.yearStart,
  () => {
    if (formData.value.yearEnd != null) {
      nextTick(() => formRef.value?.validateField('yearEnd'))
    }
  }
)

const resetForm = () => {
  formData.value = {
    id: undefined,
    yearStart: undefined,
    yearEnd: undefined
  }
  formRef.value?.resetFields()
}

const open = async (type: 'create' | 'update', id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t(`action.${type}`)
  formType.value = type
  resetForm()
  if (!id) {
    return
  }
  formLoading.value = true
  try {
    formData.value = await YearCatalogApi.getYearCatalog(id)
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
      await YearCatalogApi.createYearCatalog(formData.value)
      message.success(t('common.createSuccess'))
    } else {
      await YearCatalogApi.updateYearCatalog(formData.value)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}
</script>
