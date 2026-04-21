<template>
  <ContentWrap>
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
      label-width="68px"
    >
      <el-form-item label="站点名称" prop="stationName">
        <el-input
          v-model="queryParams.stationName"
          class="!w-240px"
          clearable
          placeholder="请输入站点名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="所在地区" prop="areaId">
        <el-cascader
          v-model="queryParams.areaId"
          :options="areaList"
          :props="searchAreaProps"
          class="!w-240px"
          clearable
          filterable
          placeholder="请选择地区"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" class="!w-180px" clearable placeholder="请选择状态">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon class="mr-5px" icon="ep:search" />搜索</el-button>
        <el-button @click="resetQuery"><Icon class="mr-5px" icon="ep:refresh" />重置</el-button>
        <el-button
          v-hasPermi="['edu:station:create']"
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
    <el-table v-loading="loading" :data="list">
      <el-table-column label="编号" prop="id" width="90" />
      <el-table-column label="站点名称" prop="stationName" min-width="160" />
      <el-table-column label="所在地区" min-width="120">
        <template #default="{ row }">
          {{ getAreaLastName(row.areaName) }}
        </template>
      </el-table-column>
      <el-table-column label="联系人" prop="contactName" width="100" />
      <el-table-column label="联系电话" prop="contactMobile" width="130" />
      <el-table-column label="学校数" prop="schoolCount" width="90" />
      <el-table-column align="center" label="状态" prop="status" width="90">
        <template #default="{ row }">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="row.status" />
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="sort" width="90" />
      <el-table-column label="站点地址" prop="stationAddress" min-width="220" show-overflow-tooltip />
      <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="创建时间"
        prop="createTime"
        width="180"
      />
      <el-table-column align="center" fixed="right" label="操作" width="140">
        <template #default="{ row }">
          <el-button
            v-hasPermi="['edu:station:update']"
            link
            type="primary"
            @click="openForm('update', row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-hasPermi="['edu:station:delete']"
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

  <StationForm ref="formRef" @success="getList" />
</template>

<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as AreaApi from '@/api/system/area'
import { defaultProps } from '@/utils/tree'
import { StationApi, type Station } from '@/api/edu/station'
import StationForm from './StationForm.vue'

defineOptions({ name: 'EduStation' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(false)
const total = ref(0)
const list = ref<Station[]>([])
const areaList = ref<AreaApi.AreaNodeVO[]>([])
const queryFormRef = ref()
const formRef = ref()
const searchAreaProps = {
  ...defaultProps,
  checkStrictly: true
}
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  stationName: undefined,
  areaId: undefined,
  status: undefined
})

const loadAreaList = async () => {
  if (areaList.value.length > 0) {
    return
  }
  areaList.value = await AreaApi.getEnabledAreaTree()
}

const getAreaLastName = (areaName?: string) => {
  return areaName?.split(' ').filter(Boolean).pop() || areaName || ''
}

const getList = async () => {
  loading.value = true
  try {
    const data = await StationApi.getStationPage(queryParams)
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

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await StationApi.deleteStation(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

onMounted(() => {
  loadAreaList()
  getList()
})
</script>
