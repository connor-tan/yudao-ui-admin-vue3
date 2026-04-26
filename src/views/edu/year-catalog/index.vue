<template>
  <ContentWrap>
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
      label-width="68px"
    >
      <el-form-item label="开始年份" prop="yearStart">
        <el-input-number
          v-model="queryParams.yearStart"
          :controls="false"
          :min="2000"
          class="!w-180px"
          placeholder="请输入开始年份"
        />
      </el-form-item>
      <el-form-item label="结束年份" prop="yearEnd">
        <el-input-number
          v-model="queryParams.yearEnd"
          :controls="false"
          :min="2001"
          class="!w-180px"
          placeholder="请输入结束年份"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon class="mr-5px" icon="ep:search" />搜索</el-button>
        <el-button @click="resetQuery"><Icon class="mr-5px" icon="ep:refresh" />重置</el-button>
        <el-button
          v-hasPermi="['edu:year-catalog:create']"
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
      <el-table-column label="编号" prop="id" width="100" />
      <el-table-column label="学年名称" prop="name" min-width="180" />
      <el-table-column label="开始年份" prop="yearStart" width="120" />
      <el-table-column label="结束年份" prop="yearEnd" width="120" />
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
            v-hasPermi="['edu:year-catalog:update']"
            link
            type="primary"
            @click="openForm('update', row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-hasPermi="['edu:year-catalog:delete']"
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

  <YearCatalogForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import { YearCatalogApi, type YearCatalog } from '@/api/edu/yearCatalog'
import YearCatalogForm from './YearCatalogForm.vue'

defineOptions({ name: 'EduYearCatalog' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(false)
const total = ref(0)
const list = ref<YearCatalog[]>([])
const queryFormRef = ref()
const formRef = ref()
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  yearStart: undefined as number | undefined,
  yearEnd: undefined as number | undefined
})

const getList = async () => {
  loading.value = true
  try {
    const data = await YearCatalogApi.getYearCatalogPage(queryParams)
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
    await YearCatalogApi.deleteYearCatalog(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

onMounted(() => {
  getList()
})
</script>
