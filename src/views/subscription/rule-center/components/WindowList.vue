<template>
  <ContentWrap>
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
      label-width="88px"
    >
      <el-form-item label="窗口名称" prop="name">
        <el-input
          v-model="queryParams.name"
          class="!w-240px"
          clearable
          placeholder="请输入窗口名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="目标学年" prop="targetSchoolYearId">
        <el-select
          v-model="queryParams.targetSchoolYearId"
          class="!w-240px"
          clearable
          filterable
          placeholder="请选择目标学年"
        >
          <el-option
            v-for="schoolYear in schoolYearList"
            :key="schoolYear.id"
            :label="schoolYear.name"
            :value="schoolYear.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="目标学期" prop="targetSemester">
        <el-select
          v-model="queryParams.targetSemester"
          class="!w-240px"
          clearable
          placeholder="请选择目标学期"
        >
          <el-option
            v-for="option in SUBSCRIPTION_SEMESTER_OPTIONS"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          class="!w-240px"
          clearable
          placeholder="请选择状态"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon class="mr-5px" icon="ep:search" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon class="mr-5px" icon="ep:refresh" />
          重置
        </el-button>
        <el-button
          v-hasPermi="['subscription:window:create']"
          plain
          type="primary"
          @click="openForm('create')"
        >
          <Icon class="mr-5px" icon="ep:plus" />
          新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="list" :show-overflow-tooltip="true" :stripe="true">
      <el-table-column align="center" label="编号" prop="id" width="80" />
      <el-table-column align="center" label="窗口名称" min-width="160" prop="name" />
      <el-table-column align="center" label="目标学年" min-width="140" prop="targetSchoolYearName" />
      <el-table-column align="center" label="目标学期" min-width="100">
        <template #default="scope">
          {{ getSubscriptionSemesterLabel(scope.row.targetSemester) }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="年级判定" min-width="140">
        <template #default="scope">
          {{ getSubscriptionGradeCalcRuleLabel(scope.row.gradeCalcRule) }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="开始时间" min-width="180" prop="startTime" />
      <el-table-column align="center" label="结束时间" min-width="180" prop="endTime" />
      <el-table-column align="center" label="状态" width="90">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column :formatter="dateFormatter" align="center" label="创建时间" prop="createTime" width="180" />
      <el-table-column align="center" label="操作" width="180">
        <template #default="scope">
          <el-button
            v-hasPermi="['subscription:window:update']"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-if="scope.row.status !== 0"
            v-hasPermi="['subscription:window:update']"
            link
            type="success"
            @click="handleUpdateStatus(scope.row.id, 0)"
          >
            启用
          </el-button>
          <el-button
            v-else
            v-hasPermi="['subscription:window:update']"
            link
            type="warning"
            @click="handleUpdateStatus(scope.row.id, 1)"
          >
            停用
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <WindowForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import {
  getSubscriptionGradeCalcRuleLabel,
  getSubscriptionSemesterLabel,
  SUBSCRIPTION_SEMESTER_OPTIONS
} from '@/utils/subscription'
import { SubscriptionSupportApi, type SubscriptionSupportSchoolYearSimple } from '@/api/subscription/support'
import { SubscriptionWindowApi, type SubscriptionWindow } from '@/api/subscription/window'
import WindowForm from './WindowForm.vue'

defineOptions({ name: 'SubscriptionWindowList' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(false)
const total = ref(0)
const list = ref<SubscriptionWindow[]>([])
const schoolYearList = ref<SubscriptionSupportSchoolYearSimple[]>([])
const queryFormRef = ref()
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined as string | undefined,
  targetSchoolYearId: undefined as number | undefined,
  targetSemester: undefined as number | undefined,
  status: undefined as number | undefined
})

const loadSchoolYearList = async () => {
  schoolYearList.value = await SubscriptionSupportApi.getSchoolYearSimpleList()
}

const getList = async () => {
  loading.value = true
  try {
    const data = await SubscriptionWindowApi.getWindowPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}

const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

const handleUpdateStatus = async (id: number, status: number) => {
  try {
    await message.confirm(status === 0 ? '确认启用该订刊窗口？' : '确认停用该订刊窗口？')
    await SubscriptionWindowApi.updateWindowStatus({ id, status })
    message.success(t('common.updateSuccess'))
    await getList()
  } catch {}
}

onMounted(async () => {
  await loadSchoolYearList()
  await getList()
})
</script>
