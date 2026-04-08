<template>
  <ContentWrap>
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
      label-width="68px"
    >
      <el-form-item label="主档名称" prop="name">
        <el-input
          v-model="queryParams.name"
          class="!w-240px"
          clearable
          placeholder="请输入刊物主档名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="刊物类型" prop="typeId">
        <el-select v-model="queryParams.typeId" class="!w-240px" clearable placeholder="请选择刊物类型">
          <el-option
            v-for="item in typeList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="出版社" prop="publisherId">
        <el-select v-model="queryParams.publisherId" class="!w-240px" clearable placeholder="请选择出版社">
          <el-option
            v-for="item in publisherList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
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
          v-hasPermi="['product:publication-title:create']"
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
      <el-table-column label="编码" prop="code" min-width="140" />
      <el-table-column label="主档名称" prop="name" min-width="180" />
      <el-table-column label="刊物类型" prop="typeName" min-width="120" />
      <el-table-column label="出版社" prop="publisherName" min-width="180" />
      <el-table-column label="周期" prop="issueCycle" min-width="100" />
      <el-table-column align="center" label="状态" prop="status" width="90">
        <template #default="{ row }">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="row.status" />
        </template>
      </el-table-column>
      <el-table-column label="ISSN/CN" min-width="220">
        <template #default="{ row }">
          <span>{{ row.issn || '-' }}</span>
          <span class="mx-1">/</span>
          <span>{{ row.cnCode || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="邮发代号" prop="postDistributionCode" min-width="120" />
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
            v-hasPermi="['product:publication-title:update']"
            link
            type="primary"
            @click="openForm('update', row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-hasPermi="['product:publication-title:delete']"
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

  <TitleForm ref="formRef" @success="handleQuery" />
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as PublicationTitleApi from '@/api/mall/product/publicationTitle'
import * as PublicationTypeApi from '@/api/mall/product/publicationType'
import * as PublicationPublisherApi from '@/api/mall/product/publicationPublisher'
import TitleForm from './TitleForm.vue'

defineOptions({ name: 'ProductPublicationTitle' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(false)
const total = ref(0)
const list = ref<PublicationTitleApi.PublicationTitleVO[]>([])
const typeList = ref<PublicationTypeApi.PublicationTypeSimpleVO[]>([])
const publisherList = ref<PublicationPublisherApi.PublicationPublisherSimpleVO[]>([])
const queryFormRef = ref()
const formRef = ref()
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  typeId: undefined,
  publisherId: undefined,
  status: undefined,
  createTime: []
})

const getList = async () => {
  loading.value = true
  try {
    const data = await PublicationTitleApi.getPublicationTitlePage(queryParams)
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

const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await PublicationTitleApi.deletePublicationTitle(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

onMounted(async () => {
  ;[typeList.value, publisherList.value] = await Promise.all([
    PublicationTypeApi.getPublicationTypeSimpleList(),
    PublicationPublisherApi.getPublicationPublisherSimpleList()
  ])
  getList()
})
</script>
