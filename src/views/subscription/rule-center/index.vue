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
      <el-form-item label="目标学年" prop="targetYearCatalogId">
        <el-select
          v-model="queryParams.targetYearCatalogId"
          class="!w-240px"
          clearable
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
        <el-select
          v-model="queryParams.targetPeriod"
          class="!w-240px"
          clearable
          placeholder="请选择目标周期"
        >
          <el-option
            v-for="option in SUBSCRIPTION_TARGET_PERIOD_OPTIONS"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" class="!w-240px" clearable placeholder="请选择状态">
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
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="list"
      :show-overflow-tooltip="true"
      :stripe="true"
      highlight-current-row
      @current-change="handleCurrentChange"
    >
      <el-table-column align="center" label="编号" prop="id" width="80" />
      <el-table-column align="center" label="窗口名称" min-width="160" prop="name" />
      <el-table-column align="center" label="目标学年" min-width="140" prop="targetYearNameSnapshot" />
      <el-table-column align="center" label="目标周期" min-width="100">
        <template #default="scope">
          {{ getSubscriptionTargetPeriodLabel(scope.row.targetPeriod) }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="年级策略" min-width="180">
        <template #default="scope">
          {{ scope.row.gradePolicyName || '按目标学年自动解析' }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="开始时间" min-width="180" prop="startTime" />
      <el-table-column align="center" label="结束时间" min-width="180" prop="endTime" />
      <el-table-column align="center" label="状态" width="90">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="创建时间"
        prop="createTime"
        width="180"
      />
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

  <WindowForm ref="formRef" @success="handleFormSuccess" />

  <ContentWrap>
    <el-tabs v-if="currentWindowId" v-model="activeTab">
      <el-tab-pane label="窗口刊物" name="offer">
        <OfferPanel :window-id="currentWindowId" />
      </el-tab-pane>
      <el-tab-pane
        v-hasPermi="['subscription:preview:query']"
        label="规则预览"
        name="preview"
      >
        <PreviewPanel :window-id="currentWindowId" />
      </el-tab-pane>
    </el-tabs>
    <el-empty v-else description="请选择一个订刊窗口" />
  </ContentWrap>
</template>

<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import {
  getSubscriptionTargetPeriodLabel,
  SUBSCRIPTION_TARGET_PERIOD_OPTIONS
} from '@/utils/subscription'
import {
  SubscriptionSupportApi,
  type SubscriptionSupportWindowYearSimple
} from '@/api/subscription/support'
import { SubscriptionWindowApi, type SubscriptionWindow } from '@/api/subscription/window'
import WindowForm from './components/WindowForm.vue'
import PreviewPanel from './components/PreviewPanel.vue'
import OfferPanel from './components/OfferPanel.vue'

defineOptions({ name: 'SubscriptionRuleCenter' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(false)
const total = ref(0)
const list = ref<SubscriptionWindow[]>([])
const windowYearList = ref<SubscriptionSupportWindowYearSimple[]>([])
const activeTab = ref('offer')
const queryFormRef = ref()
const tableRef = ref()
const currentWindowId = ref<number>()
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined as string | undefined,
  targetYearCatalogId: undefined as number | undefined,
  targetPeriod: undefined as string | undefined,
  status: undefined as number | undefined
})

const buildWindowQueryParams = () => {
  const params: Record<string, any> = {
    pageNo: queryParams.pageNo,
    pageSize: queryParams.pageSize,
    name: queryParams.name,
    targetYearCatalogId: queryParams.targetYearCatalogId,
    targetPeriod: queryParams.targetPeriod,
    status: queryParams.status
  }
  return params
}

const loadWindowYearList = async () => {
  windowYearList.value = await SubscriptionSupportApi.getWindowYearSimpleList()
}

const getList = async () => {
  loading.value = true
  try {
    const data = await SubscriptionWindowApi.getWindowPage(buildWindowQueryParams())
    list.value = data.list
    total.value = data.total
    const currentRow =
      (currentWindowId.value && list.value.find((item) => item.id === currentWindowId.value)) ||
      list.value[0]
    currentWindowId.value = currentRow?.id
    await nextTick()
    tableRef.value?.setCurrentRow(currentRow)
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

const handleCurrentChange = (row?: SubscriptionWindow) => {
  currentWindowId.value = row?.id
}

const formRef = ref()
const openForm = (type: 'create' | 'update', id?: number) => {
  formRef.value.open(type, id)
}

const handleFormSuccess = async () => {
  await getList()
}

const handleUpdateStatus = async (id: number, status: number) => {
  try {
    if (status === 0) {
      await message.confirm('确认启用该订刊窗口？')
    } else {
      await message.confirm('确认停用该订刊窗口？')
    }
    await SubscriptionWindowApi.updateWindowStatus({ id, status })
    message.success(t('common.updateSuccess'))
    await getList()
  } catch {}
}

onMounted(async () => {
  await loadWindowYearList()
  await getList()
})
</script>
