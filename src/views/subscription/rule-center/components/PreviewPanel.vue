<template>
  <div>
    <ContentWrap>
      <el-form :inline="true" class="-mb-15px" label-width="88px">
        <el-form-item label="学生">
          <el-select
            v-model="studentId"
            class="!w-320px"
            clearable
            filterable
            remote
            reserve-keyword
            :remote-method="loadStudentList"
            placeholder="请输入学生姓名搜索"
          >
            <el-option
              v-for="item in studentList"
              :key="item.id"
              :label="item.currentSchoolName ? `${item.studentName}（${item.currentSchoolName}）` : item.studentName"
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
          type="warning"
          :closable="false"
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
                  </div>
                  <div class="mt-8px text-13px text-gray-500">
                    {{ publication.publicationTitleName || '-' }} / {{ publication.categoryName || '-' }}
                  </div>
                  <el-table
                    class="mt-12px"
                    :data="publication.skus || []"
                    :show-overflow-tooltip="true"
                    :stripe="true"
                  >
                    <el-table-column label="SKU" min-width="220">
                      <template #default="{ row }">
                        {{ [row.volumeLabel, row.editionLabel].filter(Boolean).join(' / ') || `SKU#${row.productSkuId}` }}
                      </template>
                    </el-table-column>
                    <el-table-column label="ISBN" min-width="160" prop="isbn" />
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
        </template>
      </template>
    </ContentWrap>
  </div>
</template>

<script setup lang="ts">
import { fenToYuan } from '@/utils'
import {
  SubscriptionSupportApi,
  type SubscriptionSupportStudentSimple
} from '@/api/subscription/support'
import { SubscriptionPreviewApi, type SubscriptionRulePreviewRespVO } from '@/api/subscription/preview'

defineOptions({ name: 'SubscriptionPreviewPanel' })

const props = defineProps<{
  windowId?: number
}>()

const message = useMessage()
const loading = ref(false)
const studentId = ref<number>()
const studentList = ref<SubscriptionSupportStudentSimple[]>([])
const previewData = ref<SubscriptionRulePreviewRespVO>()

const loadStudentList = async (keyword?: string) => {
  studentList.value = await SubscriptionSupportApi.getStudentSimpleList(keyword)
}

const handlePreview = async () => {
  if (!props.windowId) {
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

watch(
  () => props.windowId,
  () => {
    studentId.value = undefined
    studentList.value = []
    previewData.value = undefined
  }
)
</script>
