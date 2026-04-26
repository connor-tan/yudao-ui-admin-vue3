<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="640px">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-form-item label="窗口名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入窗口名称" />
      </el-form-item>
      <el-form-item label="开放时间" prop="timeRange">
        <el-date-picker
          v-model="formData.timeRange"
          class="!w-full"
          end-placeholder="结束时间"
          start-placeholder="开始时间"
          type="datetimerange"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </el-form-item>
      <el-form-item label="目标学年" prop="targetYearCatalogId">
        <el-select
          v-model="formData.targetYearCatalogId"
          class="!w-full"
          filterable
          placeholder="请选择目标学年"
        >
          <el-option
            v-for="item in windowYearList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="目标周期" prop="targetPeriod">
        <el-select v-model="formData.targetPeriod" class="!w-full" placeholder="请选择目标周期">
          <el-option
            v-for="item in SUBSCRIPTION_TARGET_PERIOD_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="年级策略">
        <el-alert
          :closable="false"
          title="按目标学年自动解析：优先使用目标学年班级；未升班且未开学时按当前年级推算下一年级。"
          type="info"
        />
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
        <el-input v-model="formData.remark" :rows="3" placeholder="请输入备注" type="textarea" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { SUBSCRIPTION_TARGET_PERIOD_OPTIONS } from '@/utils/subscription'
import {
  SubscriptionSupportApi,
  type SubscriptionSupportWindowYearSimple
} from '@/api/subscription/support'
import { SubscriptionWindowApi, type SubscriptionWindow } from '@/api/subscription/window'

defineOptions({ name: 'SubscriptionWindowForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref<'create' | 'update'>('create')
const windowYearList = ref<SubscriptionSupportWindowYearSimple[]>([])
const formRef = ref()

type WindowFormData = SubscriptionWindow & {
  timeRange?: string[]
}

const formData = ref<WindowFormData>({
  id: undefined,
  name: '',
  timeRange: undefined,
  targetYearCatalogId: undefined,
  targetPeriod: 'FULL_YEAR',
  status: 1,
  remark: ''
})

const formRules = reactive({
  name: [{ required: true, message: '窗口名称不能为空', trigger: 'blur' }],
  timeRange: [{ required: true, message: '开放时间不能为空', trigger: 'change' }],
  targetYearCatalogId: [{ required: true, message: '目标学年不能为空', trigger: 'change' }],
  targetPeriod: [{ required: true, message: '目标周期不能为空', trigger: 'change' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
})

const resetForm = () => {
  formData.value = {
    id: undefined,
    name: '',
    timeRange: undefined,
    targetYearCatalogId: undefined,
    targetPeriod: 'FULL_YEAR',
    status: 1,
    remark: ''
  }
  formRef.value?.resetFields()
}

const loadSupportData = async () => {
  windowYearList.value = await SubscriptionSupportApi.getWindowYearSimpleList()
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
      timeRange: data.startTime && data.endTime ? [data.startTime, data.endTime] : undefined
    }
  } finally {
    formLoading.value = false
  }
}
defineExpose({ open })

const emit = defineEmits(['success'])

const submitForm = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return
  const [startTime, endTime] = formData.value.timeRange || []
  formLoading.value = true
  try {
    const data: SubscriptionWindow = {
      id: formData.value.id,
      name: formData.value.name,
      startTime,
      endTime,
      targetYearCatalogId: formData.value.targetYearCatalogId,
      targetPeriod: formData.value.targetPeriod,
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
