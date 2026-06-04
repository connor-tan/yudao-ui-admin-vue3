<template>
  <ContentWrap>
    <el-form
      ref="queryFormRef"
      class="-mb-15px"
      :inline="true"
      :model="queryParams"
      label-width="88px"
    >
      <el-form-item label="供应商名称" prop="name">
        <el-input
          v-model="queryParams.name"
          class="!w-240px"
          clearable
          placeholder="请输入供应商名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="供应商编码" prop="code">
        <el-input
          v-model="queryParams.code"
          class="!w-180px"
          clearable
          placeholder="请输入供应商编码"
          @keyup.enter="handleQuery"
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
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          v-hasPermi="['repo:supplier:create']"
          plain
          type="primary"
          @click="openForm('create')"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          v-hasPermi="['repo:supplier:export']"
          :loading="exportLoading"
          plain
          type="success"
          @click="handleExport"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table
      v-loading="loading"
      row-key="id"
      :data="list"
      :show-overflow-tooltip="true"
      :stripe="true"
      highlight-current-row
      @current-change="handleCurrentChange"
    >
      <el-table-column align="center" label="供应商名称" min-width="180" prop="name" />
      <el-table-column align="center" label="编码" min-width="100" prop="code" />
      <el-table-column align="center" label="联系人" min-width="120" prop="contactName" />
      <el-table-column align="center" label="联系电话" min-width="140" prop="contactMobile" />
      <el-table-column align="center" label="地址" min-width="220" prop="address" />
      <el-table-column align="center" label="排序" width="80" prop="sort" />
      <el-table-column align="center" label="状态" width="100" prop="status">
        <template #default="{ row }">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="row.status" />
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="创建时间"
        prop="createTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column align="center" fixed="right" label="操作" width="120">
        <template #default="{ row }">
          <el-button
            v-hasPermi="['repo:supplier:update']"
            link
            type="primary"
            @click="openForm('update', row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-hasPermi="['repo:supplier:delete']"
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

  <SupplierForm ref="formRef" @success="getList" />

  <ContentWrap>
    <el-tabs model-value="publicationSku">
      <el-tab-pane label="供应刊物" name="publicationSku">
        <SupplierPublicationSkuList :supplier="currentRow" />
      </el-tab-pane>
    </el-tabs>
  </ContentWrap>
</template>

<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { SupplierApi, type SupplierVO } from '@/api/repo/supplier'
import SupplierForm from './SupplierForm.vue'
import SupplierPublicationSkuList from './components/SupplierPublicationSkuList.vue'

defineOptions({ name: 'RepoSupplier' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(false)
const list = ref<SupplierVO[]>([])
const total = ref(0)
const queryFormRef = ref()
const exportLoading = ref(false)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined as string | undefined,
  code: undefined as string | undefined,
  status: undefined as number | undefined
})
const currentRow = ref<Partial<SupplierVO>>({})

const getList = async () => {
  loading.value = true
  try {
    const data = await SupplierApi.getSupplierPage(queryParams)
    list.value = data.list || []
    total.value = data.total || 0
    if (currentRow.value.id) {
      currentRow.value = list.value.find((item) => item.id === currentRow.value.id) || {}
    }
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

const handleDelete = async (id?: number) => {
  if (!id) return
  try {
    await message.delConfirm()
    await SupplierApi.deleteSupplier(id)
    message.success(t('common.delSuccess'))
    if (currentRow.value.id === id) {
      currentRow.value = {}
    }
    await getList()
  } catch {}
}

const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await SupplierApi.exportSupplier(queryParams)
    download.excel(data, '仓库供应商.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

const handleCurrentChange = (row?: SupplierVO) => {
  currentRow.value = row || {}
}

onMounted(() => {
  getList()
})
</script>
