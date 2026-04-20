<template>
  <div>
    <ContentWrap>
      <el-form :inline="true" class="-mb-15px" label-width="88px">
        <el-form-item label="学校">
          <el-select
            v-model="schoolId"
            class="!w-280px"
            clearable
            filterable
            placeholder="请先选择学校"
          >
            <el-option
              v-for="item in schoolList"
              :key="item.id"
              :label="item.schoolName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="学生">
          <el-select
            v-model="studentId"
            class="!w-320px"
            clearable
            :disabled="!schoolId"
            filterable
            remote
            reserve-keyword
            :loading="studentLoading"
            :remote-method="loadStudentList"
            :placeholder="schoolId ? '请输入学生姓名搜索' : '请先选择学校'"
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
          <el-descriptions-item label="学生">{{ previewData.studentName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="学校">{{ previewData.schoolName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="有效年级">
            {{
              previewData.effectiveGradeName
                ? `${previewData.effectiveGradeName}${previewData.effectiveGradeAliasName ? `（${previewData.effectiveGradeAliasName}）` : ''}`
                : '-'
            }}
          </el-descriptions-item>
        </el-descriptions>

        <el-alert
          v-if="previewData.blockedReason"
          :title="previewData.blockedReason"
          :closable="false"
          type="warning"
        />

        <template v-else>
          <el-empty v-if="!previewData.publications?.length" description="当前窗口下暂无可见刊物" />
          <div v-else class="flex flex-col gap-12px">
            <el-card v-for="publication in previewData.publications" :key="publication.windowSpuId" shadow="never">
              <div class="flex items-start gap-12px">
                <el-image :src="publication.picUrl" class="h-72px w-72px flex-none" fit="cover" />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-8px">
                    <div class="truncate text-16px font-600">{{ publication.productName }}</div>
                    <el-tag v-if="publication.recommendFlag" type="success">推荐</el-tag>
                    <el-tag v-if="publication.visibilityReasonDesc" type="info">
                      {{ publication.visibilityReasonDesc }}
                    </el-tag>
                    <el-tag v-if="publication.gradeApplicabilityOverride" type="warning">
                      例外年级
                    </el-tag>
                  </div>
                  <div v-if="publication.matchedRule?.id" class="mt-6px text-12px text-gray-500">
                    命中特殊规则：{{ getSubscriptionRuleEffectTypeLabel(publication.matchedRule.effectType) }} /
                    {{ getSubscriptionRuleScopeTypeLabel(publication.matchedRule.scopeType) }} /
                    #{{ publication.matchedRule.id }}
                  </div>
                  <div class="mt-8px text-13px text-gray-500">
                    {{ publication.publicationTitleName || '-' }} / {{ publication.categoryName || '-' }}
                  </div>
                  <el-table
                    :data="publication.skus || []"
                    :show-overflow-tooltip="true"
                    :stripe="true"
                    class="mt-12px"
                  >
                    <el-table-column label="SKU" min-width="220">
                      <template #default="{ row }">
                        {{ [row.volumeLabel, row.editionLabel].filter(Boolean).join(' / ') || `SKU#${row.productSkuId}` }}
                      </template>
                    </el-table-column>
                    <el-table-column label="ISBN" min-width="160" prop="isbn" />
                    <el-table-column align="center" label="适用周期" min-width="110">
                      <template #default="{ row }">
                        {{ getSubscriptionTargetPeriodLabel(row.targetPeriod) }}
                      </template>
                    </el-table-column>
                    <el-table-column align="center" label="价格" min-width="90">
                      <template #default="{ row }">¥ {{ fenToYuan(row.price || 0) }}</template>
                    </el-table-column>
                    <el-table-column align="center" label="库存" min-width="90" prop="stock" />
                    <el-table-column align="center" label="每生限购" min-width="110" prop="maxQuantityPerStudent" />
                  </el-table>
                </div>
              </div>
            </el-card>
          </div>
          <el-divider v-if="previewData.diagnostics?.length" />
          <el-table
            v-if="previewData.diagnostics?.length"
            :data="previewData.diagnostics"
            :show-overflow-tooltip="true"
            :stripe="true"
          >
            <el-table-column label="刊物" min-width="220" prop="productName" />
            <el-table-column align="center" label="最终结果" min-width="90">
              <template #default="{ row }">
                <el-tag :type="row.visible ? 'success' : 'info'">
                  {{ row.visible ? '可见' : '不可见' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="原因" min-width="220" prop="reasonDesc" />
            <el-table-column align="center" label="可售SKU/总数" min-width="110">
              <template #default="{ row }">
                {{ row.enabledSkuCount || 0 }}/{{ row.totalSkuCount || 0 }}
              </template>
            </el-table-column>
            <el-table-column align="center" label="窗口周期" min-width="110">
              <template #default="{ row }">
                {{ getSubscriptionTargetPeriodLabel(row.windowTargetPeriod) }}
              </template>
            </el-table-column>
            <el-table-column align="center" label="周期不匹配SKU" min-width="130">
              <template #default="{ row }">
                <el-tag v-if="row.enabledPeriodMismatchedSkuCount" type="warning">
                  {{ row.enabledPeriodMismatchedSkuCount }}
                </el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="特殊规则" min-width="180">
              <template #default="{ row }">
                <span v-if="row.matchedRule?.id">
                  {{ getSubscriptionRuleEffectTypeLabel(row.matchedRule.effectType) }} /
                  {{ getSubscriptionRuleScopeTypeLabel(row.matchedRule.scopeType) }} /
                  #{{ row.matchedRule.id }}
                </span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="适用年级例外" min-width="130">
              <template #default="{ row }">
                <el-tag v-if="row.gradeApplicabilityOverride" type="warning">是</el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </template>
    </ContentWrap>
  </div>
</template>

<script setup lang="ts">
import { fenToYuan } from '@/utils'
import { SchoolApi, type SchoolSimple } from '@/api/edu/school'
import {
  SubscriptionSupportApi,
  type SubscriptionSupportStudentSimple
} from '@/api/subscription/support'
import { SubscriptionPreviewApi, type SubscriptionRulePreviewRespVO } from '@/api/subscription/preview'
import {
  getSubscriptionRuleEffectTypeLabel,
  getSubscriptionRuleScopeTypeLabel,
  getSubscriptionTargetPeriodLabel
} from '@/utils/subscription'

defineOptions({ name: 'SubscriptionPreviewPanel' })

const props = defineProps<{
  windowId?: number
}>()

const message = useMessage()
const loading = ref(false)
const studentLoading = ref(false)
const schoolId = ref<number>()
const schoolList = ref<SchoolSimple[]>([])
const studentId = ref<number>()
const studentList = ref<SubscriptionSupportStudentSimple[]>([])
const previewData = ref<SubscriptionRulePreviewRespVO>()

const buildStudentOptionLabel = (item: SubscriptionSupportStudentSimple) => {
  const meta = [item.gradeName, item.studentCode].filter(Boolean).join(' / ')
  return meta ? `${item.studentName}（${meta}）` : item.studentName || ''
}

const loadStudentList = async (keyword?: string) => {
  if (!schoolId.value) {
    studentList.value = []
    return
  }
  if (!keyword?.trim()) {
    studentList.value = []
    return
  }
  studentLoading.value = true
  try {
    studentList.value = await SubscriptionSupportApi.getStudentSimpleListBySchool(schoolId.value, keyword)
  } finally {
    studentLoading.value = false
  }
}

const handlePreview = async () => {
  if (!props.windowId) {
    return
  }
  if (!schoolId.value) {
    message.warning('请先选择学校')
    return
  }
  if (!studentId.value) {
    message.warning('请先选择学生')
    return
  }
  loading.value = true
  try {
    previewData.value = await SubscriptionPreviewApi.execute({
      windowId: props.windowId,
      studentId: studentId.value
    })
  } finally {
    loading.value = false
  }
}

watch(schoolId, () => {
  studentId.value = undefined
  studentList.value = []
  previewData.value = undefined
})

watch(
  () => props.windowId,
  () => {
    schoolId.value = undefined
    studentId.value = undefined
    schoolList.value = []
    studentList.value = []
    previewData.value = undefined
    loadSchoolList()
  }
)

const loadSchoolList = async () => {
  schoolList.value = await SchoolApi.getSchoolSimpleList()
}

onMounted(() => {
  loadSchoolList()
})
</script>
