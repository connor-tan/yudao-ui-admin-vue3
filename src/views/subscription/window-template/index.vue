<template>
  <ContentWrap>
    <el-form ref="queryFormRef" :inline="true" :model="queryParams" class="-mb-15px" label-width="82px">
      <el-form-item label="模板名称" prop="name">
        <el-input
          v-model="queryParams.name"
          class="!w-240px"
          clearable
          placeholder="请输入模板名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="目标周期" prop="targetPeriod">
        <el-select v-model="queryParams.targetPeriod" class="!w-240px" clearable placeholder="请选择目标周期">
          <el-option
            v-for="item in SUBSCRIPTION_TARGET_PERIOD_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
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
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
          end-placeholder="结束日期"
          start-placeholder="开始日期"
          type="daterange"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon class="mr-5px" icon="ep:search" />搜索</el-button>
        <el-button @click="resetQuery"><Icon class="mr-5px" icon="ep:refresh" />重置</el-button>
        <el-button
          v-hasPermi="['subscription:window-template:create']"
          plain
          type="primary"
          @click="openForm('create')"
        >
          <Icon class="mr-5px" icon="ep:plus" />新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="list" :show-overflow-tooltip="true" :stripe="true">
      <el-table-column label="编号" prop="id" width="90" />
      <el-table-column label="模板名称" prop="name" min-width="150" />
      <el-table-column label="目标周期" min-width="100">
        <template #default="{ row }">
          {{ getSubscriptionTargetPeriodLabel(row.targetPeriod) }}
        </template>
      </el-table-column>
      <el-table-column label="年级判定" min-width="120">
        <template #default="{ row }">
          {{ getSubscriptionGradeCalcRuleLabel(row.gradeCalcRule) }}
        </template>
      </el-table-column>
      <el-table-column label="解析模式" min-width="120">
        <template #default="{ row }">
          {{ getSubscriptionGradeResolveModeLabel(row.gradeResolveMode) }}
        </template>
      </el-table-column>
      <el-table-column label="模板说明" prop="description" min-width="220" show-overflow-tooltip />
      <el-table-column align="center" label="内置" width="70">
        <template #default="{ row }">
          <el-tag v-if="row.builtIn" type="success">是</el-tag>
          <span v-else>否</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" width="100">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            :active-value="0"
            :disabled="!checkPermi(['subscription:window-template:update'])"
            :inactive-value="1"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="sort" width="80" />
      <el-table-column :formatter="dateFormatter" align="center" label="创建时间" prop="createTime" width="180" />
      <el-table-column align="center" fixed="right" label="操作" width="150">
        <template #default="{ row }">
          <el-button
            v-hasPermi="['subscription:window-template:update']"
            link
            type="primary"
            @click="openForm('update', row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-if="!row.builtIn"
            v-hasPermi="['subscription:window-template:delete']"
            link
            type="danger"
            @click="handleDelete(row.id)"
          >
            删除
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

  <WindowTemplateForm ref="formRef" @success="getList" />
</template>

<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import { checkPermi } from '@/utils/permission'
import {
  getSubscriptionGradeCalcRuleLabel,
  getSubscriptionGradeResolveModeLabel,
  getSubscriptionTargetPeriodLabel,
  SUBSCRIPTION_TARGET_PERIOD_OPTIONS
} from '@/utils/subscription'
import { SubscriptionWindowTemplateApi, type SubscriptionWindowTemplate } from '@/api/subscription/windowTemplate'
import WindowTemplateForm from './WindowTemplateForm.vue'

defineOptions({ name: 'SubscriptionWindowTemplate' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(false)
const total = ref(0)
const list = ref<SubscriptionWindowTemplate[]>([])
const queryFormRef = ref()
const formRef = ref()
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  targetPeriod: undefined,
  status: undefined,
  createTime: []
})

const getList = async () => {
  loading.value = true
  try {
    const data = await SubscriptionWindowTemplateApi.getWindowTemplatePage(queryParams)
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

const openForm = (type: 'create' | 'update', id?: number) => {
  formRef.value.open(type, id)
}

const handleStatusChange = async (row: SubscriptionWindowTemplate) => {
  const oldStatus = row.status === 0 ? 1 : 0
  try {
    await SubscriptionWindowTemplateApi.updateWindowTemplateStatus({ id: row.id!, status: row.status! })
    message.success(t('common.updateSuccess'))
    await getList()
  } catch {
    row.status = oldStatus
  }
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await SubscriptionWindowTemplateApi.deleteWindowTemplate(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

onMounted(() => {
  getList()
})
</script>
