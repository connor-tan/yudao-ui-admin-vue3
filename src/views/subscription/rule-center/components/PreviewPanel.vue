<template>
  <div>
    <ContentWrap>
      <el-form :inline="true" class="-mb-15px" label-width="88px">
        <el-form-item label="学生">
          <el-select
            v-model="studentId"
            :loading="studentLoading"
            class="!w-360px"
            clearable
            filterable
            placeholder="请输入学生姓名搜索"
            remote
            reserve-keyword
            :remote-method="loadStudentList"
          >
            <el-option
              v-for="item in studentList"
              :key="item.id"
              :label="buildStudentOptionLabel(item)"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handlePreview">
            <Icon class="mr-5px" icon="ep:view" />
            预览
          </el-button>
        </el-form-item>
      </el-form>
    </ContentWrap>

    <ContentWrap v-loading="loading">
      <el-empty v-if="!previewData" description="请选择学生后执行规则预览" />
      <template v-else>
        <el-descriptions :column="3" border class="mb-16px">
          <el-descriptions-item label="学生">
            {{ previewData.student?.studentName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="学校">
            {{ previewData.student?.schoolName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="有效年级">
            {{ previewData.student?.gradeName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="年级来源">
            {{ getSubscriptionGradeResolveSourceLabel(previewData.student?.gradeResolveSource) }}
          </el-descriptions-item>
        </el-descriptions>

        <el-alert
          v-if="previewData.blockedReason"
          :closable="false"
          :title="previewData.blockedReasonDesc || previewData.blockedReason"
          type="warning"
        />

        <el-table
          v-else
          :data="previewData.decisions || []"
          :show-overflow-tooltip="true"
          :stripe="true"
        >
          <el-table-column label="刊物" min-width="220" prop="productName" />
          <el-table-column align="center" label="结果" width="90">
            <template #default="{ row }">
              <el-tag :type="row.visible ? 'success' : 'info'">
                {{ row.visible ? '可见' : '不可见' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="原因" min-width="180" prop="reasonDesc" />
          <el-table-column align="center" label="最终SKU" width="90" prop="finalSkuCount" />
          <el-table-column align="center" label="命中规则" width="130">
            <template #default="{ row }">
              {{ row.matchedRuleName || (row.matchedRuleId ? `#${row.matchedRuleId}` : '-') }}
            </template>
          </el-table-column>
          <el-table-column type="expand" width="55">
            <template #default="{ row }">
              <el-table :data="row.diagnosticSkus || row.finalSkus || []" border>
                <el-table-column align="center" label="判定" width="110">
                  <template #default="{ row: sku }">
                    <el-tag :type="getSkuDecisionTagType(sku.decisionStatus)">
                      {{ sku.decisionStatusName || sku.decisionStatus || '-' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="SKU" min-width="220" prop="productSkuName" />
                <el-table-column label="适用年级" min-width="160">
                  <template #default="{ row: sku }">
                    {{ sku.applicableGradeNames?.join('、') || '-' }}
                  </template>
                </el-table-column>
                <el-table-column align="center" label="周期" width="100">
                  <template #default="{ row: sku }">
                    {{ getSubscriptionTargetPeriodLabel(sku.targetPeriod) }}
                  </template>
                </el-table-column>
                <el-table-column align="center" label="册别" width="90">
                  <template #default="{ row: sku }">
                    {{ formatPublicationDict(DICT_TYPE.EDU_PUBLICATION_VOLUME, sku.volumeLabel) }}
                  </template>
                </el-table-column>
                <el-table-column align="center" label="版本" width="100">
                  <template #default="{ row: sku }">
                    {{ formatPublicationDict(DICT_TYPE.EDU_PUBLICATION_EDITION, sku.editionLabel) }}
                  </template>
                </el-table-column>
                <el-table-column align="center" label="价格" width="100">
                  <template #default="{ row: sku }">¥ {{ fenToYuan(sku.price || 0) }}</template>
                </el-table-column>
                <el-table-column align="center" label="库存" width="90" prop="stock" />
                <el-table-column align="center" label="年级突破" width="100">
                  <template #default="{ row: sku }">
                    <el-tag v-if="sku.gradeApplicabilityOverride" type="warning">是</el-tag>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </ContentWrap>
  </div>
</template>

<script setup lang="ts">
import { fenToYuan } from '@/utils'
import { DICT_TYPE, getDictLabel } from '@/utils/dict'
import { StudentApi, type Student } from '@/api/edu/student'
import { SubscriptionPreviewApi, type SubscriptionRulePreviewRespVO } from '@/api/subscription/preview'
import {
  getSubscriptionGradeResolveSourceLabel,
  getSubscriptionTargetPeriodLabel
} from '@/utils/subscription'

defineOptions({ name: 'SubscriptionPreviewPanel' })

const props = defineProps<{ windowId?: number }>()
const message = useMessage()
const loading = ref(false)
const studentLoading = ref(false)
const studentId = ref<number>()
type StudentOption = Student & { id: number }
const studentList = ref<StudentOption[]>([])
const previewData = ref<SubscriptionRulePreviewRespVO>()

const formatPublicationDict = (dictType: string, value?: string) => {
  if (!value) {
    return '-'
  }
  return getDictLabel(dictType, value) || value
}

const buildStudentOptionLabel = (item: Student) => {
  const meta = [item.currentSchoolName, item.studentCode].filter(Boolean).join(' / ')
  return meta ? `${item.studentName}（${meta}）` : item.studentName || ''
}

const getSkuDecisionTagType = (status?: string) => {
  if (status === 'FINAL') {
    return 'success'
  }
  if (status === 'EXCLUDED') {
    return 'danger'
  }
  return 'info'
}

const loadStudentList = async (keyword?: string) => {
  if (!keyword?.trim()) {
    studentList.value = []
    return
  }
  studentLoading.value = true
  try {
    const data = await StudentApi.getStudentPage({ pageNo: 1, pageSize: 20, studentName: keyword })
    studentList.value = (data.list || []).filter(
      (item: Student): item is StudentOption => item.id !== undefined
    )
  } finally {
    studentLoading.value = false
  }
}

const handlePreview = async () => {
  if (!props.windowId) return
  if (!studentId.value) {
    message.warning('请先选择学生')
    return
  }
  loading.value = true
  try {
    previewData.value = await SubscriptionPreviewApi.previewStudent({
      windowId: props.windowId,
      studentId: studentId.value
    })
  } finally {
    loading.value = false
  }
}

watch(
  () => props.windowId,
  () => {
    studentId.value = undefined
    previewData.value = undefined
  }
)
</script>
