<template>
  <el-tabs v-model="activeTab" @tab-change="handleTabChange">
    <el-tab-pane label="批量升班" name="execute">
      <ContentWrap>
        <div class="mb-12px text-14px font-600">执行配置</div>
        <el-form
          ref="formRef"
          v-loading="formLoading"
          :model="formData"
          :rules="formRules"
          label-width="120px"
        >
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="来源学年" prop="fromYearStart">
                <el-select
                  v-model="formData.fromYearStart"
                  filterable
                  placeholder="请选择来源学年"
                  class="!w-full"
                >
                  <el-option
                    v-for="schoolYear in schoolYearOptions"
                    :key="schoolYear.yearStart"
                    :label="schoolYear.name"
                    :value="schoolYear.yearStart"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="目标学年" prop="toYearStart">
                <el-select
                  v-model="formData.toYearStart"
                  filterable
                  placeholder="请选择目标学年"
                  class="!w-full"
                >
                  <el-option
                    v-for="schoolYear in schoolYearOptions"
                    :key="schoolYear.yearStart"
                    :label="schoolYear.name"
                    :value="schoolYear.yearStart"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="24">
              <el-form-item label="学校范围" prop="scopeType">
                <el-radio-group v-model="formData.scopeType">
                  <el-radio-button label="ALL">全部学校</el-radio-button>
                  <el-radio-button label="SCHOOL">指定学校</el-radio-button>
                  <el-radio-button label="AREA">按地区筛学校</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12" v-if="formData.scopeType === 'SCHOOL'">
              <el-form-item label="指定学校" prop="schoolIds">
                <el-select
                  v-model="formData.schoolIds"
                  multiple
                  filterable
                  collapse-tags
                  collapse-tags-tooltip
                  placeholder="请选择学校"
                  class="!w-full"
                >
                  <el-option
                    v-for="school in schoolList"
                    :key="school.id"
                    :label="school.schoolName"
                    :value="school.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12" v-else-if="formData.scopeType === 'AREA'">
              <el-form-item label="所在地区" prop="areaId">
                <el-cascader
                  v-model="formData.areaId"
                  :options="areaList"
                  :props="searchAreaProps"
                  placeholder="请选择地区"
                  clearable
                  filterable
                  class="!w-full"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" v-else>
              <el-form-item label="范围说明">
                <div class="text-[var(--el-text-color-secondary)]">
                  当前将处理所有学校的升班预览和执行
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="自动建班" prop="autoCreateClass">
                <el-switch v-model="formData.autoCreateClass" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="末级自动毕业" prop="graduateTerminalStudent">
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

        <div class="mt-12px flex flex-wrap items-center justify-between gap-12px">
          <div class="flex flex-wrap items-center gap-12px">
            <el-button @click="resetExecuteForm">重置</el-button>
            <el-button
              :loading="previewLoading"
              type="primary"
              @click="handlePreview"
              v-hasPermi="['edu:student-promotion:query']"
            >
              预览
            </el-button>
            <el-button
              :disabled="!canExecute"
              :loading="formLoading"
              type="success"
              @click="handleExecute"
              v-hasPermi="['edu:student-promotion:update']"
            >
              确认执行
            </el-button>
          </div>
          <div
            v-if="lastExecutedTaskId"
            class="text-13px text-[var(--el-text-color-secondary)]"
          >
            最近一次执行任务ID：{{ lastExecutedTaskId }}
          </div>
        </div>
      </ContentWrap>

      <ContentWrap>
        <el-alert
          v-if="previewDirty"
          type="warning"
          :closable="false"
          class="mb-12px"
          title="你已修改逐人调整配置，请重新预览后再执行"
        />

        <template v-if="previewData">
          <div class="mb-12px text-14px font-600">预览摘要</div>
          <el-descriptions :column="4" border class="mb-16px">
            <el-descriptions-item label="总学校数">
              {{ previewData.summary.totalSchoolCount }}
            </el-descriptions-item>
            <el-descriptions-item label="可执行学校数">
              {{ previewData.summary.readySchoolCount }}
            </el-descriptions-item>
            <el-descriptions-item label="跳过学校数">
              {{ previewData.summary.skippedSchoolCount }}
            </el-descriptions-item>
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
          </el-descriptions>

          <el-tabs v-model="activePreviewTab">
            <el-tab-pane label="学校预览" name="schools">
              <el-table
                :data="previewData.schools"
                max-height="300px"
                :stripe="true"
                :show-overflow-tooltip="true"
              >
                <el-table-column label="学校名称" prop="schoolName" min-width="180" />
                <el-table-column label="学校状态" width="110">
                  <template #default="scope">
                    <el-tag :type="getSchoolStatusTagType(scope.row.status)">
                      {{ getSchoolStatusLabel(scope.row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="原因" min-width="180">
                  <template #default="scope">
                    {{ getSchoolReasonLabel(scope.row.reason) }}
                  </template>
                </el-table-column>
                <el-table-column label="总人数" prop="totalCount" width="90" />
                <el-table-column label="升班人数" prop="promotedCount" width="90" />
                <el-table-column label="留级人数" prop="repeatCount" width="90" />
                <el-table-column label="毕业人数" prop="graduatedCount" width="90" />
                <el-table-column label="跳过人数" prop="skippedCount" width="90" />
                <el-table-column label="缺失目标班级人数" prop="missingTargetClassCount" width="130" />
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="学生明细" name="items">
              <el-table
                :data="previewData.items"
                max-height="420px"
                :stripe="true"
                :show-overflow-tooltip="true"
              >
                <el-table-column label="学校名称" prop="schoolName" min-width="180" />
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
            </el-tab-pane>
          </el-tabs>
        </template>

        <el-empty v-else description="请选择学年和范围后进行预览" />
      </ContentWrap>
    </el-tab-pane>

    <el-tab-pane label="批次历史" name="tasks">
      <ContentWrap>
        <div class="mb-12px text-14px font-600">任务回滚</div>
        <div class="flex flex-wrap items-center gap-12px">
          <el-input-number
            v-model="rollbackTaskId"
            :min="1"
            controls-position="right"
            placeholder="请输入任务ID"
          />
          <el-input
            v-model="rollbackRemark"
            placeholder="请输入回滚备注"
            class="!w-320px"
          />
          <el-button
            :disabled="!rollbackTaskId"
            :loading="rollbackLoading"
            type="danger"
            plain
            @click="handleRollback()"
            v-hasPermi="['edu:student-promotion:update']"
          >
            回滚任务
          </el-button>
        </div>
      </ContentWrap>

      <ContentWrap>
        <el-form
          ref="taskQueryFormRef"
          class="-mb-15px"
          :model="taskQueryParams"
          :inline="true"
          label-width="82px"
        >
          <el-form-item label="任务ID" prop="id">
            <el-input
              v-model="taskQueryParams.id"
              placeholder="请输入任务ID"
              clearable
              @keyup.enter="handleTaskQuery"
              class="!w-220px"
            />
          </el-form-item>
          <el-form-item label="来源学年" prop="fromYearStart">
            <el-select
              v-model="taskQueryParams.fromYearStart"
              filterable
              clearable
              placeholder="请选择来源学年"
              class="!w-220px"
            >
              <el-option
                v-for="schoolYear in schoolYearOptions"
                :key="schoolYear.yearStart"
                :label="schoolYear.name"
                :value="schoolYear.yearStart"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="目标学年" prop="toYearStart">
            <el-select
              v-model="taskQueryParams.toYearStart"
              filterable
              clearable
              placeholder="请选择目标学年"
              class="!w-220px"
            >
              <el-option
                v-for="schoolYear in schoolYearOptions"
                :key="schoolYear.yearStart"
                :label="schoolYear.name"
                :value="schoolYear.yearStart"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="任务状态" prop="status">
            <el-select
              v-model="taskQueryParams.status"
              clearable
              placeholder="请选择任务状态"
              class="!w-220px"
            >
              <el-option
                v-for="item in promotionTaskStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间" prop="createTime">
            <el-date-picker
              v-model="taskQueryParams.createTime"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="daterange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item>
            <el-button @click="handleTaskQuery">
              <Icon icon="ep:search" class="mr-5px" /> 搜索
            </el-button>
            <el-button @click="resetTaskQuery">
              <Icon icon="ep:refresh" class="mr-5px" /> 重置
            </el-button>
          </el-form-item>
        </el-form>
      </ContentWrap>

      <ContentWrap>
        <el-table
          row-key="id"
          v-loading="taskLoading"
          :data="taskList"
          :stripe="true"
          :show-overflow-tooltip="true"
          @expand-change="handleTaskExpandChange"
        >
          <el-table-column type="expand">
            <template #default="scope">
              <el-table
                v-loading="taskBatchLoadingMap[scope.row.id]"
                :data="taskBatchMap[scope.row.id] || []"
                :stripe="true"
                :show-overflow-tooltip="true"
              >
                <el-table-column label="学校名称" prop="schoolName" min-width="180" />
                <el-table-column label="来源学年" prop="fromSchoolYearName" min-width="120" />
                <el-table-column label="目标学年" prop="toSchoolYearName" min-width="120" />
                <el-table-column label="状态" width="110">
                  <template #default="batchScope">
                    <el-tag :type="getBatchStatusTagType(batchScope.row.status)">
                      {{ getBatchStatusLabel(batchScope.row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="总人数" prop="totalCount" width="90" />
                <el-table-column label="升班人数" prop="promotedCount" width="90" />
                <el-table-column label="留级人数" prop="repeatCount" width="90" />
                <el-table-column label="毕业人数" prop="graduatedCount" width="90" />
                <el-table-column label="跳过人数" prop="skippedCount" width="90" />
                <el-table-column label="原因" min-width="180">
                  <template #default="batchScope">
                    {{ getBatchReasonLabel(batchScope.row.reason) }}
                  </template>
                </el-table-column>
                <el-table-column label="备注" prop="remark" min-width="180" />
                <el-table-column
                  label="创建时间"
                  prop="createTime"
                  width="180"
                  :formatter="dateFormatter"
                />
              </el-table>
            </template>
          </el-table-column>
          <el-table-column label="任务ID" prop="id" width="100" />
          <el-table-column label="来源学年" min-width="120">
            <template #default="scope">
              {{ formatYearRange(scope.row.fromYearStart) }}
            </template>
          </el-table-column>
          <el-table-column label="目标学年" min-width="120">
            <template #default="scope">
              {{ formatYearRange(scope.row.toYearStart) }}
            </template>
          </el-table-column>
          <el-table-column label="范围类型" width="110">
            <template #default="scope">
              {{ getScopeTypeLabel(scope.row.scopeType) }}
            </template>
          </el-table-column>
          <el-table-column label="任务状态" width="110">
            <template #default="scope">
              <el-tag :type="getTaskStatusTagType(scope.row.status)">
                {{ getTaskStatusLabel(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="学校统计" min-width="180">
            <template #default="scope">
              总 {{ scope.row.totalSchoolCount }} / 成 {{ scope.row.successSchoolCount }} / 跳
              {{ scope.row.skippedSchoolCount }} / 失 {{ scope.row.failedSchoolCount }}
            </template>
          </el-table-column>
          <el-table-column label="学生统计" min-width="220">
            <template #default="scope">
              总 {{ scope.row.totalCount }} / 升 {{ scope.row.promotedCount }} / 留
              {{ scope.row.repeatCount }} / 毕 {{ scope.row.graduatedCount }} / 跳
              {{ scope.row.skippedCount }}
            </template>
          </el-table-column>
          <el-table-column label="备注" prop="remark" min-width="180" />
          <el-table-column
            label="创建时间"
            prop="createTime"
            width="180"
            :formatter="dateFormatter"
          />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button
                v-if="scope.row.rollbackable"
                link
                type="danger"
                :loading="rollbackLoading && rollbackTaskId === scope.row.id"
                @click="handleRollback(scope.row.id)"
                v-hasPermi="['edu:student-promotion:update']"
              >
                回滚
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <Pagination
          :total="taskTotal"
          v-model:page="taskQueryParams.pageNo"
          v-model:limit="taskQueryParams.pageSize"
          @pagination="getTaskList"
        />
      </ContentWrap>
    </el-tab-pane>

    <el-tab-pane label="学生流转" name="flows">
      <ContentWrap>
        <el-form
          ref="flowQueryFormRef"
          class="-mb-15px"
          :model="flowQueryParams"
          :inline="true"
          label-width="82px"
        >
          <el-form-item label="任务ID" prop="taskId">
            <el-input
              v-model="flowQueryParams.taskId"
              placeholder="请输入任务ID"
              clearable
              @keyup.enter="handleFlowQuery"
              class="!w-220px"
            />
          </el-form-item>
          <el-form-item label="批次ID" prop="batchId">
            <el-input
              v-model="flowQueryParams.batchId"
              placeholder="请输入批次ID"
              clearable
              @keyup.enter="handleFlowQuery"
              class="!w-220px"
            />
          </el-form-item>
          <el-form-item label="学生姓名" prop="studentName">
            <el-input
              v-model="flowQueryParams.studentName"
              placeholder="请输入学生姓名"
              clearable
              @keyup.enter="handleFlowQuery"
              class="!w-220px"
            />
          </el-form-item>
          <el-form-item label="流转类型" prop="changeType">
            <el-select
              v-model="flowQueryParams.changeType"
              clearable
              placeholder="请选择流转类型"
              class="!w-220px"
            >
              <el-option
                v-for="item in promotionFlowTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="生效日期" prop="effectiveDate">
            <el-date-picker
              v-model="flowQueryParams.effectiveDate"
              value-format="YYYY-MM-DD"
              type="daterange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item>
            <el-button @click="handleFlowQuery">
              <Icon icon="ep:search" class="mr-5px" /> 搜索
            </el-button>
            <el-button @click="resetFlowQuery">
              <Icon icon="ep:refresh" class="mr-5px" /> 重置
            </el-button>
          </el-form-item>
        </el-form>
      </ContentWrap>

      <ContentWrap>
        <el-table
          row-key="id"
          v-loading="flowLoading"
          :data="flowList"
          :stripe="true"
          :show-overflow-tooltip="true"
        >
          <el-table-column label="流转ID" prop="id" width="100" />
          <el-table-column label="任务ID" prop="taskId" width="100" />
          <el-table-column label="批次ID" prop="batchId" width="100" />
          <el-table-column label="学生姓名" prop="studentName" min-width="120" />
          <el-table-column label="流转类型" width="110">
            <template #default="scope">
              <el-tag :type="getFlowTypeTagType(scope.row.changeType)">
                {{ getFlowTypeLabel(scope.row.changeType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="原班级" prop="fromClassName" min-width="180" />
          <el-table-column label="目标班级" prop="toClassName" min-width="180" />
          <el-table-column
            label="生效日期"
            prop="effectiveDate"
            width="120"
            :formatter="dateFormatter2"
          />
          <el-table-column label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getFlowStatusTagType(scope.row.status)">
                {{ getFlowStatusLabel(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="自动建班" width="90">
            <template #default="scope">
              {{ scope.row.targetClassCreated ? '是' : '-' }}
            </template>
          </el-table-column>
          <el-table-column label="备注" prop="remark" min-width="180" />
          <el-table-column
            label="创建时间"
            prop="createTime"
            width="180"
            :formatter="dateFormatter"
          />
        </el-table>
        <Pagination
          :total="flowTotal"
          v-model:page="flowQueryParams.pageNo"
          v-model:limit="flowQueryParams.pageSize"
          @pagination="getFlowList"
        />
      </ContentWrap>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import * as AreaApi from '@/api/system/area'
import { dateFormatter, dateFormatter2 } from '@/utils/formatTime'
import { SchoolApi, type SchoolClassSimple, type SchoolSimple } from '@/api/edu/school'
import {
  GLOBAL_PROMOTION_SCHOOL_REASON_LABELS,
  GLOBAL_PROMOTION_SCHOOL_STATUS_LABELS,
  PROMOTION_ACTION_LABELS,
  PROMOTION_BATCH_STATUS_LABELS,
  PROMOTION_FLOW_STATUS_LABELS,
  PROMOTION_FLOW_TYPE_LABELS,
  PROMOTION_REASON_LABELS,
  PROMOTION_SCOPE_TYPE_LABELS,
  PROMOTION_TASK_STATUS_LABELS,
  StudentPromotionApi,
  type StudentFlow,
  type StudentGlobalPromotionItem,
  type StudentGlobalPromotionPreviewRespVO,
  type StudentGlobalPromotionReqVO,
  type StudentPromotionAdjustment,
  type StudentPromotionBatch,
  type StudentPromotionTask,
  type StudentPromotionYearOption
} from '@/api/edu/student/promotion'
import { defaultProps } from '@/utils/tree'

defineOptions({ name: 'StudentPromotionManage' })

const message = useMessage()

const activeTab = ref('execute')
const formLoading = ref(false)
const previewLoading = ref(false)
const rollbackLoading = ref(false)
const taskLoading = ref(false)
const flowLoading = ref(false)
const schoolList = ref<SchoolSimple[]>([])
const schoolYearOptions = ref<StudentPromotionYearOption[]>([])
const areaList = ref<AreaApi.AreaNodeVO[]>([])
const targetClassOptionsMap = ref<Record<string, SchoolClassSimple[]>>({})
const previewData = ref<StudentGlobalPromotionPreviewRespVO>()
const activePreviewTab = ref('schools')
const previewDirty = ref(false)
const lastExecutedTaskId = ref<number>()
const rollbackTaskId = ref<number>()
const rollbackRemark = ref<string>()
const adjustmentMap = ref<Record<number, StudentPromotionAdjustment>>({})
const taskList = ref<StudentPromotionTask[]>([])
const taskTotal = ref(0)
const taskBatchMap = ref<Record<number, StudentPromotionBatch[]>>({})
const taskBatchLoadingMap = ref<Record<number, boolean>>({})
const flowList = ref<StudentFlow[]>([])
const flowTotal = ref(0)

const searchAreaProps = {
  ...defaultProps,
  checkStrictly: true
}

const formData = ref<StudentGlobalPromotionReqVO>({
  fromYearStart: undefined,
  toYearStart: undefined,
  scopeType: 'ALL',
  schoolIds: [],
  areaId: undefined,
  autoCreateClass: false,
  graduateTerminalStudent: true,
  remark: undefined,
  adjustments: []
})

const taskQueryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  id: undefined as number | undefined,
  fromYearStart: undefined as number | undefined,
  toYearStart: undefined as number | undefined,
  status: undefined as number | undefined,
  createTime: undefined as string[] | undefined
})

const flowQueryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  taskId: undefined as number | undefined,
  batchId: undefined as number | undefined,
  studentName: undefined as string | undefined,
  changeType: undefined as string | undefined,
  effectiveDate: undefined as string[] | undefined
})

const formRef = ref()
const taskQueryFormRef = ref()
const flowQueryFormRef = ref()

const promotionTaskStatusOptions = Object.entries(PROMOTION_TASK_STATUS_LABELS).map(([value, label]) => ({
  value: Number(value),
  label
}))

const promotionFlowTypeOptions = Object.entries(PROMOTION_FLOW_TYPE_LABELS).map(([value, label]) => ({
  value,
  label
}))

const validateSchoolScope = (_rule, value, callback) => {
  if (formData.value.scopeType === 'SCHOOL' && (!value || value.length === 0)) {
    callback(new Error('请选择学校'))
    return
  }
  callback()
}

const validateAreaScope = (_rule, value, callback) => {
  if (formData.value.scopeType === 'AREA' && !value) {
    callback(new Error('请选择地区'))
    return
  }
  callback()
}

const formRules = reactive({
  fromYearStart: [{ required: true, message: '来源学年不能为空', trigger: 'change' }],
  toYearStart: [{ required: true, message: '目标学年不能为空', trigger: 'change' }],
  scopeType: [{ required: true, message: '学校范围不能为空', trigger: 'change' }],
  schoolIds: [{ validator: validateSchoolScope, trigger: 'change' }],
  areaId: [{ validator: validateAreaScope, trigger: 'change' }]
})

const canExecute = computed(
  () =>
    !!previewData.value &&
    !previewDirty.value &&
    (previewData.value.summary.promotedCount > 0 ||
      previewData.value.summary.repeatCount > 0 ||
      previewData.value.summary.graduatedCount > 0)
)

const schoolYearIdMap = computed<Record<number, number>>(() => {
  const result: Record<number, number> = {}
  previewData.value?.schools.forEach((item) => {
    if (item.toSchoolYearId) {
      result[item.schoolId] = item.toSchoolYearId
    }
  })
  return result
})

const buildClassCacheKey = (schoolId: number, schoolYearId: number) => `${schoolId}_${schoolYearId}`

const loadSchoolList = async () => {
  schoolList.value = await SchoolApi.getSchoolSimpleList()
}

const loadSchoolYearOptions = async () => {
  schoolYearOptions.value = await StudentPromotionApi.getYearOptions()
}

const loadAreaList = async () => {
  areaList.value = await AreaApi.getEnabledAreaTree()
}

const ensureTargetClassOptions = async (schoolId?: number, schoolYearId?: number) => {
  if (!schoolId || !schoolYearId) {
    return
  }
  const cacheKey = buildClassCacheKey(schoolId, schoolYearId)
  if (targetClassOptionsMap.value[cacheKey]) {
    return
  }
  targetClassOptionsMap.value[cacheKey] = await SchoolApi.getSchoolClassSimpleList(schoolId, schoolYearId)
}

const buildAdjustments = (): StudentPromotionAdjustment[] => {
  return Object.values(adjustmentMap.value)
    .filter((item) => !!item.action)
    .map((item) => ({
      studentId: item.studentId,
      action: item.action,
      targetClassId: item.targetClassId
    }))
}

const buildPayload = (): StudentGlobalPromotionReqVO => {
  return {
    ...formData.value,
    adjustments: buildAdjustments()
  }
}

const handlePreview = async () => {
  await formRef.value.validate()
  previewLoading.value = true
  try {
    previewData.value = await StudentPromotionApi.previewGlobal(buildPayload())
    activePreviewTab.value = 'schools'
    previewDirty.value = false
  } finally {
    previewLoading.value = false
  }
}

const handleExecute = async () => {
  if (!canExecute.value) {
    message.warning(previewDirty.value ? '请先重新预览逐人调整结果' : '当前没有符合升班条件的学生')
    return
  }
  await formRef.value.validate()
  await message.confirm('确认执行批量升班吗？')
  formLoading.value = true
  try {
    const data = await StudentPromotionApi.executeGlobal(buildPayload())
    previewData.value = {
      summary: data.summary,
      schools: data.schools,
      items: previewData.value?.items || []
    }
    activePreviewTab.value = 'schools'
    previewDirty.value = false
    lastExecutedTaskId.value = data.taskId
    rollbackTaskId.value = data.taskId
    message.success(
      `执行成功：任务 ${data.taskId}，升班 ${data.summary.promotedCount} 人，留级 ${data.summary.repeatCount} 人，毕业 ${data.summary.graduatedCount} 人`
    )
    if (activeTab.value === 'tasks') {
      await getTaskList()
    }
  } finally {
    formLoading.value = false
  }
}

const handleRollback = async (taskId?: number) => {
  const targetTaskId = taskId ?? rollbackTaskId.value
  if (!targetTaskId) {
    message.warning('请输入要回滚的任务ID')
    return
  }
  await message.confirm(`确认回滚任务 ${targetTaskId} 吗？`)
  rollbackLoading.value = true
  rollbackTaskId.value = targetTaskId
  try {
    const data = await StudentPromotionApi.rollbackGlobal({
      taskId: targetTaskId,
      remark: rollbackRemark.value
    })
    message.success(
      `回滚成功：恢复学校 ${data.rolledBackSchoolCount} 所，恢复学生 ${data.rolledBackStudentCount} 人`
    )
    if (activeTab.value === 'tasks') {
      taskBatchMap.value[targetTaskId] = []
      await getTaskList()
    }
    if (activeTab.value === 'flows') {
      await getFlowList()
    }
  } finally {
    rollbackLoading.value = false
  }
}

const getTaskList = async () => {
  taskLoading.value = true
  try {
    const data = await StudentPromotionApi.getTaskPage(taskQueryParams)
    taskList.value = data.list
    taskTotal.value = data.total
  } finally {
    taskLoading.value = false
  }
}

const handleTaskQuery = () => {
  taskQueryParams.pageNo = 1
  getTaskList()
}

const resetTaskQuery = () => {
  taskQueryFormRef.value?.resetFields()
  handleTaskQuery()
}

const loadTaskBatchList = async (taskId: number) => {
  if (taskBatchMap.value[taskId]?.length) {
    return
  }
  taskBatchLoadingMap.value[taskId] = true
  try {
    taskBatchMap.value[taskId] = await StudentPromotionApi.getTaskBatchList(taskId)
  } finally {
    taskBatchLoadingMap.value[taskId] = false
  }
}

const handleTaskExpandChange = async (row: StudentPromotionTask, expandedRows: StudentPromotionTask[]) => {
  if (!expandedRows.some((item) => item.id === row.id)) {
    return
  }
  await loadTaskBatchList(row.id)
}

const getFlowList = async () => {
  flowLoading.value = true
  try {
    const data = await StudentPromotionApi.getFlowPage(flowQueryParams)
    flowList.value = data.list
    flowTotal.value = data.total
  } finally {
    flowLoading.value = false
  }
}

const handleFlowQuery = () => {
  flowQueryParams.pageNo = 1
  getFlowList()
}

const resetFlowQuery = () => {
  flowQueryFormRef.value?.resetFields()
  handleFlowQuery()
}

const handleTabChange = (tabName: string | number) => {
  if (tabName === 'tasks' && taskList.value.length === 0) {
    getTaskList()
  }
  if (tabName === 'flows' && flowList.value.length === 0) {
    getFlowList()
  }
}

const getAdjustmentAction = (studentId: number) => adjustmentMap.value[studentId]?.action

const getAdjustmentTargetClassId = (studentId: number) => adjustmentMap.value[studentId]?.targetClassId

const handleAdjustmentActionChange = async (row: StudentGlobalPromotionItem, action?: string) => {
  if (!action) {
    delete adjustmentMap.value[row.studentId]
    previewDirty.value = true
    return
  }
  await ensureTargetClassOptions(row.schoolId, schoolYearIdMap.value[row.schoolId])
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

const getSelectableClassOptions = (row: StudentGlobalPromotionItem) => {
  const action = getAdjustmentAction(row.studentId)
  const schoolYearId = schoolYearIdMap.value[row.schoolId]
  if (!action || !schoolYearId) {
    return []
  }
  const cacheKey = buildClassCacheKey(row.schoolId, schoolYearId)
  const options = targetClassOptionsMap.value[cacheKey] || []
  if (action === 'REPEAT') {
    return options.filter((item) => item.schoolGradeId === row.fromSchoolGradeId)
  }
  if (action === 'PROMOTE') {
    return options.filter((item) => item.schoolGradeId === row.toSchoolGradeId)
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

const getSchoolStatusLabel = (status?: string) =>
  GLOBAL_PROMOTION_SCHOOL_STATUS_LABELS[status || ''] || status || '-'

const getSchoolStatusTagType = (status?: string) => {
  if (status === 'SUCCESS' || status === 'READY') {
    return 'success'
  }
  if (status === 'FAILED') {
    return 'danger'
  }
  return 'info'
}

const getSchoolReasonLabel = (reason?: string) =>
  GLOBAL_PROMOTION_SCHOOL_REASON_LABELS[reason || ''] || reason || '-'

const getScopeTypeLabel = (scopeType?: string) =>
  PROMOTION_SCOPE_TYPE_LABELS[scopeType || ''] || scopeType || '-'

const getTaskStatusLabel = (status?: number) =>
  status !== undefined ? PROMOTION_TASK_STATUS_LABELS[status] || `${status}` : '-'

const getTaskStatusTagType = (status?: number) => {
  if (status === 1) {
    return 'success'
  }
  if (status === 2) {
    return 'warning'
  }
  if (status === 3) {
    return 'danger'
  }
  if (status === 4) {
    return 'info'
  }
  return ''
}

const getBatchStatusLabel = (status?: number) =>
  status !== undefined ? PROMOTION_BATCH_STATUS_LABELS[status] || `${status}` : '-'

const getBatchStatusTagType = (status?: number) => {
  if (status === 1) {
    return 'success'
  }
  if (status === 2) {
    return 'info'
  }
  if (status === 3) {
    return 'danger'
  }
  if (status === 4) {
    return 'warning'
  }
  return ''
}

const getBatchReasonLabel = (reason?: string) =>
  GLOBAL_PROMOTION_SCHOOL_REASON_LABELS[reason || ''] || reason || '-'

const getFlowTypeLabel = (changeType?: string) =>
  PROMOTION_FLOW_TYPE_LABELS[changeType || ''] || changeType || '-'

const getFlowTypeTagType = (changeType?: string) => {
  if (changeType === 'PROMOTE') {
    return 'success'
  }
  if (changeType === 'REPEAT') {
    return 'danger'
  }
  if (changeType === 'GRADUATE') {
    return 'warning'
  }
  if (changeType === 'TRANSFER') {
    return 'info'
  }
  return ''
}

const getFlowStatusLabel = (status?: number) =>
  status !== undefined ? PROMOTION_FLOW_STATUS_LABELS[status] || `${status}` : '-'

const getFlowStatusTagType = (status?: number) => {
  if (status === 1) {
    return 'success'
  }
  if (status === 2) {
    return 'warning'
  }
  return ''
}

const formatYearRange = (yearStart?: number) => {
  if (!yearStart) {
    return '-'
  }
  return `${yearStart}-${yearStart + 1}学年`
}

const resetExecuteForm = () => {
  formData.value = {
    fromYearStart: undefined,
    toYearStart: undefined,
    scopeType: 'ALL',
    schoolIds: [],
    areaId: undefined,
    autoCreateClass: false,
    graduateTerminalStudent: true,
    remark: undefined,
    adjustments: []
  }
  previewData.value = undefined
  activePreviewTab.value = 'schools'
  previewDirty.value = false
  adjustmentMap.value = {}
  targetClassOptionsMap.value = {}
  lastExecutedTaskId.value = undefined
  rollbackTaskId.value = undefined
  rollbackRemark.value = undefined
  formRef.value?.resetFields()
}

watch(
  () => [
    formData.value.fromYearStart,
    formData.value.toYearStart,
    formData.value.scopeType,
    formData.value.areaId,
    JSON.stringify(formData.value.schoolIds || []),
    formData.value.autoCreateClass,
    formData.value.graduateTerminalStudent
  ],
  () => {
    previewData.value = undefined
    activePreviewTab.value = 'schools'
    previewDirty.value = false
    adjustmentMap.value = {}
    targetClassOptionsMap.value = {}
  }
)

watch(
  () => formData.value.scopeType,
  (scopeType) => {
    if (scopeType !== 'AREA') {
      formData.value.areaId = undefined
    }
    if (scopeType !== 'SCHOOL') {
      formData.value.schoolIds = []
    }
  }
)

onMounted(async () => {
  formLoading.value = true
  try {
    await Promise.all([loadSchoolList(), loadSchoolYearOptions(), loadAreaList()])
  } finally {
    formLoading.value = false
  }
})
</script>
