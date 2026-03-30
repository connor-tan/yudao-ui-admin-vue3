<template>
  <!-- 列表 -->
  <ContentWrap>
    <el-button
      type="primary"
      plain
      @click="openForm('create')"
      v-hasPermi="['edu:school:create']"
    >
      <Icon icon="ep:plus" class="mr-5px" /> 新增
    </el-button>
      <el-button
          type="danger"
          plain
          :disabled="isEmpty(checkedIds)"
          @click="handleDeleteBatch"
          v-hasPermi="['edu:school:delete']"
      >
        <Icon icon="ep:delete" class="mr-5px" /> 批量删除
      </el-button>
    <el-table
        row-key="id"
        v-loading="loading"
        :data="list"
        :stripe="true"
        :show-overflow-tooltip="true"
        @selection-change="handleRowCheckboxChange"
    >
          <el-table-column type="selection" width="55" />
      <el-table-column label="学年ID" align="center" prop="id" />
      <el-table-column label="学年开始" align="center" prop="yearStart" />
      <el-table-column label="学年结束" align="center" prop="yearEnd" />
      <el-table-column
        label="开学日期"
        align="center"
        prop="startDate"
        :formatter="schoolYearDateFormatter"
      />
      <el-table-column
        label="放假日期"
        align="center"
        prop="endDate"
        :formatter="schoolYearDateFormatter"
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['edu:school:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['edu:school:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>
    <!-- 表单弹窗：添加/修改 -->
    <SchoolYearForm ref="formRef" @success="getList" />
</template>
<script setup lang="ts">
import { dateFormatter, dateFormatter2 } from '@/utils/formatTime'
import { isEmpty } from '@/utils/is'
import { SchoolApi, SchoolYear } from '@/api/edu/school'
import SchoolYearForm from './SchoolYearForm.vue'

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const props = defineProps<{
  schoolId?: number // 学校ID（主表的关联字段）
}>()
const loading = ref(false) // 列表的加载中
const list = ref<SchoolYear[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  schoolId: undefined as unknown
})

const schoolYearDateFormatter = (row: SchoolYear, column: unknown, cellValue: unknown) => {
  if (Array.isArray(cellValue) && cellValue.length === 3) {
    const [year, month, day] = cellValue
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }
  return dateFormatter2(row, column as never, cellValue)
}

/** 监听主表的关联字段的变化，加载对应的子表数据 */
watch(
  () => props.schoolId,
  (val: number) => {
    if (!val) {
      list.value = [] // 清空列表
      return
    }
    queryParams.schoolId = val
    handleQuery()
  },
    { immediate: true, deep: true }
)

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await SchoolApi.getSchoolYearPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  if (!props.schoolId) {
    message.error('请选择一个学校信息')
    return
  }
  formRef.value.open(type, id, props.schoolId)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await SchoolApi.deleteSchoolYear(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除学年 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await SchoolApi.deleteSchoolYearList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: SchoolYear[]) => {
  checkedIds.value = records
    .map((item) => item.id)
    .filter((id): id is number => id !== undefined)
}
</script>
