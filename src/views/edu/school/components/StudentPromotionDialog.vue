<template>
  <Dialog v-model="dialogVisible" title="一键升班" width="1400px">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="140px"
    >
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="来源学年" prop="fromSchoolYearId">
            <el-select v-model="formData.fromSchoolYearId" filterable placeholder="请选择来源学年" class="!w-full">
              <el-option
                v-for="schoolYear in schoolYearList"
                :key="schoolYear.id"
                :label="schoolYear.name"
                :value="schoolYear.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="目标学年" prop="toSchoolYearId">
            <el-select v-model="formData.toSchoolYearId" filterable placeholder="请选择目标学年" class="!w-full">
              <el-option
                v-for="schoolYear in schoolYearList"
                :key="schoolYear.id"
                :label="schoolYear.name"
                :value="schoolYear.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="自动创建目标班级" prop="autoCreateClass">
            <el-switch v-model="formData.autoCreateClass" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="末级学生自动毕业" prop="graduateTerminalStudent">
            <el-switch v-model="formData.graduateTerminalStudent" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="2"
          placeholder="请输入批量升班备注"
        />
      </el-form-item>
    </el-form>

    <el-alert
      v-if="previewDirty"
      type="warning"
      :closable="false"
      class="mb-12px"
      title="你已修改逐人调整配置，请重新预览后再执行"
    />

    <div class="mb-12px flex gap-12px">
      <el-button :loading="previewLoading" type="primary" @click="handlePreview">预览</el-button>
      <el-button
        :disabled="!canExecute"
        :loading="formLoading"
        type="success"
        @click="handleExecute"
      >
        确认执行
      </el-button>
    </div>

    <template v-if="previewData">
      <el-descriptions :column="6" border class="mb-12px">
        <el-descriptions-item label="总人数">
          {{ previewData.summary.totalCount }}
        </el-descriptions-item>
        <el-descriptions-item label="升班人数">
          {{ previewData.summary.promotedCount }}
        </el-descriptions-item>
        <el-descriptions-item label="留级人数">
          {{ previewData.summary.repeatCount }}
        </el-descriptions-item>
        <el-descriptions-item label="毕业人数">
          {{ previewData.summary.graduatedCount }}
        </el-descriptions-item>
        <el-descriptions-item label="跳过人数">
          {{ previewData.summary.skippedCount }}
        </el-descriptions-item>
        <el-descriptions-item label="缺失目标班级人数">
          {{ previewData.summary.missingTargetClassCount }}
        </el-descriptions-item>
      </el-descriptions>

      <el-table :data="previewData.items" max-height="500px" :stripe="true" :show-overflow-tooltip="true">
        <el-table-column label="学生姓名" prop="studentName" min-width="120" />
        <el-table-column label="入学批次" prop="entryYear" width="100" />
        <el-table-column label="来源班级" prop="fromClassName" min-width="180" />
        <el-table-column label="目标年级" prop="toGradeName" min-width="120" />
        <el-table-column label="目标班级" prop="toClassName" min-width="180" />
        <el-table-column label="动作" width="110">
          <template #default="scope">
            <el-tag :type="getActionTagType(scope.row.action)">
              {{ getActionLabel(scope.row.action) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="原因" min-width="180">
          <template #default="scope">
            {{ getReasonLabel(scope.row.reason) }}
          </template>
        </el-table-column>
        <el-table-column label="逐人调整" min-width="180">
          <template #default="scope">
            <el-select
              :model-value="getAdjustmentAction(scope.row.studentId)"
              clearable
              placeholder="跟随系统"
              class="!w-full"
              @change="(value) => handleAdjustmentActionChange(scope.row, value)"
            >
              <el-option label="人工指定升班班级" value="PROMOTE" />
              <el-option label="留级" value="REPEAT" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="调整目标班级" min-width="220">
          <template #default="scope">
            <el-select
              :model-value="getAdjustmentTargetClassId(scope.row.studentId)"
              :disabled="!getAdjustmentAction(scope.row.studentId)"
              clearable
              filterable
              placeholder="请选择目标班级"
              class="!w-full"
              @change="(value) => handleAdjustmentTargetClassChange(scope.row.studentId, value)"
            >
              <el-option
                v-for="schoolClass in getSelectableClassOptions(scope.row)"
                :key="schoolClass.id"
                :label="schoolClass.className"
                :value="schoolClass.id"
              />
            </el-select>
          </template>
        </el-table-column>
      </el-table>
    </template>

    <el-empty v-else description="请选择来源学年和目标学年后进行预览" />
  </Dialog>
</template>

<script setup lang="ts">
import { SchoolApi, type SchoolClassSimple, type SchoolYearSimple } from '@/api/edu/school'
import {
  PROMOTION_ACTION_LABELS,
  PROMOTION_REASON_LABELS,
  StudentPromotionApi,
  type StudentPromotionAdjustment,
  type StudentPromotionItem,
  type StudentPromotionPreviewRespVO,
  type StudentPromotionReqVO
} from '@/api/edu/student/promotion'

defineOptions({ name: 'StudentPromotionDialog' })

const message = useMessage()

const dialogVisible = ref(false)
const formLoading = ref(false)
const previewLoading = ref(false)
const schoolYearList = ref<SchoolYearSimple[]>([])
const targetClassOptions = ref<SchoolClassSimple[]>([])
const previewData = ref<StudentPromotionPreviewRespVO>()
const previewDirty = ref(false)
const adjustmentMap = ref<Record<number, StudentPromotionAdjustment>>({})
const formData = ref<StudentPromotionReqVO>({
  schoolId: undefined,
  fromSchoolYearId: undefined,
  toSchoolYearId: undefined,
  autoCreateClass: false,
  graduateTerminalStudent: true,
  remark: undefined,
  adjustments: []
})
const formRules = reactive({
  fromSchoolYearId: [{ required: true, message: '来源学年不能为空', trigger: 'change' }],
  toSchoolYearId: [{ required: true, message: '目标学年不能为空', trigger: 'change' }]
})
const formRef = ref()

const canExecute = computed(
  () =>
    !!previewData.value &&
    !previewDirty.value &&
    (previewData.value.summary.promotedCount > 0 ||
      previewData.value.summary.repeatCount > 0 ||
      previewData.value.summary.graduatedCount > 0)
)

const loadSchoolYearList = async (schoolId?: number) => {
  if (!schoolId) {
    schoolYearList.value = []
    return
  }
  schoolYearList.value = await SchoolApi.getSchoolYearSimpleList(schoolId)
}

const loadTargetClassOptions = async () => {
  if (!formData.value.schoolId || !formData.value.toSchoolYearId) {
    targetClassOptions.value = []
    return
  }
  targetClassOptions.value = await SchoolApi.getSchoolClassSimpleList(
    formData.value.schoolId,
    formData.value.toSchoolYearId
  )
}

const open = async (schoolId?: number) => {
  if (!schoolId) {
    message.error('请选择一个学校信息')
    return
  }
  dialogVisible.value = true
  resetForm()
  formData.value.schoolId = schoolId
  formLoading.value = true
  try {
    await loadSchoolYearList(schoolId)
  } finally {
    formLoading.value = false
  }
}
defineExpose({ open })

const emit = defineEmits(['success'])

const buildAdjustments = (): StudentPromotionAdjustment[] => {
  return Object.values(adjustmentMap.value)
    .filter((item) => !!item.action)
    .map((item) => ({
      studentId: item.studentId,
      action: item.action,
      targetClassId: item.targetClassId
    }))
}

const buildPayload = (): StudentPromotionReqVO => {
  return {
    ...formData.value,
    adjustments: buildAdjustments()
  }
}

const handlePreview = async () => {
  await formRef.value.validate()
  previewLoading.value = true
  try {
    await loadTargetClassOptions()
    previewData.value = await StudentPromotionApi.preview(buildPayload())
    previewDirty.value = false
  } finally {
    previewLoading.value = false
  }
}

const handleExecute = async () => {
  if (!previewData.value) {
    message.warning('请先完成预览')
    return
  }
  if (previewDirty.value) {
    message.warning('请先重新预览逐人调整结果')
    return
  }
  if (!canExecute.value) {
    message.warning('当前没有符合升班条件的学生')
    return
  }
  await formRef.value.validate()
  await message.confirm('确认执行一键升班吗？')
  formLoading.value = true
  try {
    const data = await StudentPromotionApi.execute(buildPayload())
    message.success(
      `执行成功：升班 ${data.summary.promotedCount} 人，留级 ${data.summary.repeatCount} 人，毕业 ${data.summary.graduatedCount} 人`
    )
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const getAdjustmentAction = (studentId: number) => adjustmentMap.value[studentId]?.action

const getAdjustmentTargetClassId = (studentId: number) => adjustmentMap.value[studentId]?.targetClassId

const handleAdjustmentActionChange = (row: StudentPromotionItem, action?: string) => {
  if (!action) {
    delete adjustmentMap.value[row.studentId]
    previewDirty.value = true
    return
  }
  adjustmentMap.value[row.studentId] = {
    studentId: row.studentId,
    action,
    targetClassId: undefined
  }
  previewDirty.value = true
}

const handleAdjustmentTargetClassChange = (studentId: number, targetClassId?: number) => {
  const adjustment = adjustmentMap.value[studentId]
  if (!adjustment) {
    return
  }
  adjustmentMap.value[studentId] = {
    ...adjustment,
    targetClassId
  }
  previewDirty.value = true
}

const getSelectableClassOptions = (row: StudentPromotionItem) => {
  const action = getAdjustmentAction(row.studentId)
  if (action === 'REPEAT') {
    return targetClassOptions.value.filter((item) => item.schoolGradeId === row.fromSchoolGradeId)
  }
  if (action === 'PROMOTE') {
    return targetClassOptions.value.filter((item) => item.schoolGradeId === row.toSchoolGradeId)
  }
  return []
}

const getActionLabel = (action?: string) => PROMOTION_ACTION_LABELS[action || ''] || action || '-'

const getActionTagType = (action?: string) => {
  if (action === 'PROMOTE') {
    return 'success'
  }
  if (action === 'REPEAT') {
    return 'danger'
  }
  if (action === 'GRADUATE') {
    return 'warning'
  }
  return 'info'
}

const getReasonLabel = (reason?: string) => PROMOTION_REASON_LABELS[reason || ''] || reason || '-'

const resetForm = () => {
  formData.value = {
    schoolId: undefined,
    fromSchoolYearId: undefined,
    toSchoolYearId: undefined,
    autoCreateClass: false,
    graduateTerminalStudent: true,
    remark: undefined,
    adjustments: []
  }
  targetClassOptions.value = []
  previewData.value = undefined
  previewDirty.value = false
  adjustmentMap.value = {}
  formRef.value?.resetFields()
}

watch(
  () => [
    formData.value.fromSchoolYearId,
    formData.value.toSchoolYearId,
    formData.value.autoCreateClass,
    formData.value.graduateTerminalStudent
  ],
  () => {
    previewData.value = undefined
    previewDirty.value = false
    adjustmentMap.value = {}
    targetClassOptions.value = []
  }
)
</script>
