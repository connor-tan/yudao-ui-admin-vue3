<template>
  <ContentWrap>
    <el-form
      ref="typeQueryFormRef"
      :inline="true"
      :model="typeQueryParams"
      class="-mb-15px"
      label-width="68px"
    >
      <el-form-item label="类型名称" prop="name">
        <el-input
          v-model="typeQueryParams.name"
          class="!w-240px"
          clearable
          placeholder="请输入刊物类型名称"
          @keyup.enter="handleTypeQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="typeQueryParams.status"
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
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="typeQueryParams.createTime"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
          end-placeholder="结束日期"
          start-placeholder="开始日期"
          type="daterange"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleTypeQuery"><Icon class="mr-5px" icon="ep:search" />搜索</el-button>
        <el-button @click="resetTypeQuery"><Icon class="mr-5px" icon="ep:refresh" />重置</el-button>
        <el-button
          v-hasPermi="['product:publication-type:create']"
          plain
          type="primary"
          @click="openTypeForm('create')"
        >
          <Icon class="mr-5px" icon="ep:plus" />新增刊物类型
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table
      ref="typeTableRef"
      v-loading="typeLoading"
      :data="typeList"
      :show-overflow-tooltip="true"
      :stripe="true"
      highlight-current-row
      row-key="id"
      @current-change="handleTypeCurrentChange"
    >
      <el-table-column label="编号" prop="id" width="90" />
      <el-table-column label="编码" prop="code" min-width="140" />
      <el-table-column label="名称" prop="name" min-width="140" />
      <el-table-column label="排序" prop="sort" width="90" />
      <el-table-column align="center" label="状态" prop="status" width="90">
        <template #default="{ row }">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="row.status" />
        </template>
      </el-table-column>
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
            v-hasPermi="['product:publication-type:update']"
            link
            type="primary"
            @click="openTypeForm('update', row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-hasPermi="['product:publication-type:delete']"
            link
            type="danger"
            @click="handleTypeDelete(row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      v-model:limit="typeQueryParams.pageSize"
      v-model:page="typeQueryParams.pageNo"
      :total="typeTotal"
      @pagination="getTypeList"
    />
  </ContentWrap>

  <ContentWrap>
    <div v-if="!currentTypeRow" class="py-40px text-center text-[var(--el-text-color-secondary)]">
      请选择一个刊物类型
    </div>
    <template v-else>
      <div class="mb-12px flex items-center gap-12px">
        <el-button
          v-hasPermi="['product:publication-title:create']"
          plain
          type="primary"
          @click="openTitleForm('create')"
        >
          <Icon class="mr-5px" icon="ep:plus" />新增刊物主档
        </el-button>
        <el-tag type="primary">{{ currentTypeRow.name }}</el-tag>
      </div>
      <el-table
        v-loading="titleLoading"
        :data="titleList"
        :show-overflow-tooltip="true"
        :stripe="true"
      >
        <el-table-column label="编号" prop="id" width="90" />
        <el-table-column label="编码" prop="code" min-width="140" />
        <el-table-column label="主档名称" prop="name" min-width="180" />
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
        <el-table-column align="center" fixed="right" label="操作" width="220">
          <template #default="{ row }">
            <el-button
              v-hasPermi="['product:publication-title:update']"
              link
              type="primary"
              @click="openTitleForm('update', row.id)"
            >
              编辑
            </el-button>
            <el-button
              v-hasPermi="['product:publication-title:update']"
              link
              type="primary"
              @click="openChangeTypeDialog(row)"
            >
              变更类型
            </el-button>
            <el-button
              v-hasPermi="['product:publication-title:delete']"
              link
              type="danger"
              @click="handleTitleDelete(row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <Pagination
        v-model:limit="titleQueryParams.pageSize"
        v-model:page="titleQueryParams.pageNo"
        :total="titleTotal"
        @pagination="getTitleList"
      />
    </template>
  </ContentWrap>

  <TypeForm ref="typeFormRef" @success="handleTypeFormSuccess" />
  <TitleForm ref="titleFormRef" @success="handleTitleFormSuccess" />
  <Dialog v-model="changeTypeDialogVisible" title="变更刊物类型" width="420px">
    <el-form
      ref="changeTypeFormRef"
      v-loading="changeTypeLoading"
      :model="changeTypeForm"
      :rules="changeTypeRules"
      label-width="90px"
    >
      <el-form-item label="当前主档">
        <el-input :model-value="changeTypeTitleName" disabled />
      </el-form-item>
      <el-form-item label="当前类型">
        <el-input :model-value="currentTypeRow?.name" disabled />
      </el-form-item>
      <el-form-item label="目标类型" prop="targetTypeId">
        <el-select
          v-model="changeTypeForm.targetTypeId"
          class="w-full"
          clearable
          placeholder="请选择目标刊物类型"
        >
          <el-option
            v-for="item in changeTypeOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="changeTypeLoading" type="primary" @click="submitChangeType">
        确 定
      </el-button>
      <el-button @click="changeTypeDialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as PublicationTypeApi from '@/api/mall/product/publicationType'
import * as PublicationTitleApi from '@/api/mall/product/publicationTitle'
import TypeForm from '../type/TypeForm.vue'
import TitleForm from '../title/TitleForm.vue'

defineOptions({ name: 'ProductPublicationMeta' })

const message = useMessage()
const { t } = useI18n()

const typeLoading = ref(false)
const typeTotal = ref(0)
const typeList = ref<PublicationTypeApi.PublicationTypeVO[]>([])
const typeTableRef = ref()
const typeQueryFormRef = ref()
const typeFormRef = ref()
const currentTypeRow = ref<PublicationTypeApi.PublicationTypeVO>()
const typeQueryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  status: undefined,
  createTime: []
})

const titleLoading = ref(false)
const titleTotal = ref(0)
const titleList = ref<PublicationTitleApi.PublicationTitleVO[]>([])
const titleFormRef = ref()
const changeTypeDialogVisible = ref(false)
const changeTypeLoading = ref(false)
const changeTypeFormRef = ref()
const changeTypeTitleName = ref('')
const changeTypeOptions = ref<PublicationTypeApi.PublicationTypeSimpleVO[]>([])
const titleQueryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  typeId: undefined,
  publisherId: undefined,
  status: undefined,
  createTime: []
})
const changeTypeForm = reactive({
  id: undefined as number | undefined,
  targetTypeId: undefined as number | undefined
})
const changeTypeRules = reactive({
  targetTypeId: [required]
})

const getTypeList = async () => {
  typeLoading.value = true
  try {
    const data = await PublicationTypeApi.getPublicationTypePage(typeQueryParams)
    typeList.value = data.list
    typeTotal.value = data.total
    if (!typeList.value.length) {
      currentTypeRow.value = undefined
      titleList.value = []
      titleTotal.value = 0
      titleQueryParams.typeId = undefined
      await nextTick()
      typeTableRef.value?.setCurrentRow(null)
      return
    }
    const matchedCurrent = currentTypeRow.value
      ? typeList.value.find((item) => item.id === currentTypeRow.value?.id)
      : undefined
    if (!matchedCurrent) {
      currentTypeRow.value = undefined
      titleList.value = []
      titleTotal.value = 0
      titleQueryParams.typeId = undefined
      await nextTick()
      typeTableRef.value?.setCurrentRow(null)
      return
    }
    await nextTick()
    typeTableRef.value?.setCurrentRow(matchedCurrent)
    await getTitleList()
  } finally {
    typeLoading.value = false
  }
}

const getTitleList = async () => {
  if (!currentTypeRow.value?.id) {
    titleList.value = []
    titleTotal.value = 0
    return
  }
  titleLoading.value = true
  try {
    const data = await PublicationTitleApi.getPublicationTitlePage(titleQueryParams)
    titleList.value = data.list
    titleTotal.value = data.total
  } finally {
    titleLoading.value = false
  }
}

const handleTypeQuery = () => {
  typeQueryParams.pageNo = 1
  getTypeList()
}

const resetTypeQuery = () => {
  typeQueryFormRef.value?.resetFields()
  handleTypeQuery()
}

const handleTypeCurrentChange = (row?: PublicationTypeApi.PublicationTypeVO) => {
  currentTypeRow.value = row
  titleQueryParams.pageNo = 1
  titleQueryParams.typeId = row?.id
  getTitleList()
}

const openTypeForm = (type: 'create' | 'update', id?: number) => {
  typeFormRef.value.open(type, id)
}

const openTitleForm = (type: 'create' | 'update', id?: number) => {
  if (type === 'create' && !currentTypeRow.value?.id) {
    message.error('请选择一个刊物类型')
    return
  }
  titleFormRef.value.open(type, id, currentTypeRow.value?.id)
}

const handleTypeDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await PublicationTypeApi.deletePublicationType(id)
    message.success(t('common.delSuccess'))
    if (currentTypeRow.value?.id === id) {
      currentTypeRow.value = undefined
    }
    await getTypeList()
  } catch {}
}

const handleTitleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await PublicationTitleApi.deletePublicationTitle(id)
    message.success(t('common.delSuccess'))
    await getTitleList()
  } catch {}
}

const handleTypeFormSuccess = async () => {
  await getTypeList()
}

const handleTitleFormSuccess = async () => {
  await getTitleList()
}

const resetChangeTypeForm = () => {
  changeTypeTitleName.value = ''
  changeTypeOptions.value = []
  changeTypeForm.id = undefined
  changeTypeForm.targetTypeId = undefined
  changeTypeFormRef.value?.resetFields()
}

const openChangeTypeDialog = async (row: PublicationTitleApi.PublicationTitleVO) => {
  resetChangeTypeForm()
  changeTypeLoading.value = true
  try {
    const options = await PublicationTypeApi.getPublicationTypeSimpleList()
    changeTypeOptions.value = options.filter((item) => item.id !== row.typeId)
    if (!changeTypeOptions.value.length) {
      message.warning('暂无可变更的目标刊物类型')
      return
    }
    changeTypeTitleName.value = row.name
    changeTypeForm.id = row.id
    changeTypeDialogVisible.value = true
  } finally {
    changeTypeLoading.value = false
  }
}

const submitChangeType = async () => {
  const valid = await changeTypeFormRef.value?.validate()
  if (!valid || !changeTypeForm.id || !changeTypeForm.targetTypeId) return
  changeTypeLoading.value = true
  try {
    const detail = await PublicationTitleApi.getPublicationTitle(changeTypeForm.id)
    await PublicationTitleApi.updatePublicationTitle({
      ...detail,
      typeId: changeTypeForm.targetTypeId
    })
    message.success('变更类型成功')
    changeTypeDialogVisible.value = false
    await getTitleList()
  } finally {
    changeTypeLoading.value = false
  }
}

onMounted(() => {
  getTypeList()
})
</script>
