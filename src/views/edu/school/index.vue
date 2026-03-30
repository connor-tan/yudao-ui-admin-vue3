<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="学校名称" prop="schoolName">
        <el-input
          v-model="queryParams.schoolName"
          placeholder="请输入学校名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="所在地区" prop="areaId">
        <el-cascader
          v-model="queryParams.areaId"
          :options="areaList"
          :props="searchAreaProps"
          placeholder="请选择地区"
          clearable
          filterable
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="学校地址" prop="schoolAddress">
        <el-input
          v-model="queryParams.schoolAddress"
          placeholder="请输入学校地址"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="学校代码" prop="code">
        <el-input
          v-model="queryParams.code"
          placeholder="请输入学校代码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['edu:school:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['edu:school:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
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
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      row-key="id"
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
      highlight-current-row
      @current-change="handleCurrentChange"
      @selection-change="handleRowCheckboxChange"
    >
      <el-table-column type="selection" width="55" />
      <!--      <el-table-column label="学校ID" align="center" prop="id" />-->
      <el-table-column label="学校名称" align="center" prop="schoolName" />
      <el-table-column label="所在地区" align="center" min-width="100px">
        <template #default="scope">
          {{ getAreaLastName(scope.row.areaName) }}
        </template>
      </el-table-column>
      <el-table-column label="学校地址" align="center" prop="schoolAddress" />
      <!--      <el-table-column label="学校代码" align="center" prop="code" />-->
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" min-width="120px">
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
  <SchoolForm ref="formRef" @success="getList" />
  <!-- 子表的列表 -->
  <ContentWrap>
    <el-tabs model-value="schoolGrade">
      <el-tab-pane label="年级定义" name="schoolGrade">
        <SchoolGradeList :school-id="currentRow.id" />
      </el-tab-pane>
      <el-tab-pane label="学年" name="schoolYear">
        <SchoolYearList :school-id="currentRow.id" />
      </el-tab-pane>
      <el-tab-pane label="班级" name="schoolClass">
        <SchoolClassList :school-id="currentRow.id" />
      </el-tab-pane>
    </el-tabs>
  </ContentWrap>
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import * as AreaApi from '@/api/system/area'
import { SchoolApi, School } from '@/api/edu/school'
import { defaultProps } from '@/utils/tree'
import SchoolForm from './SchoolForm.vue'
import SchoolGradeList from './components/SchoolGradeList.vue'
import SchoolYearList from './components/SchoolYearList.vue'
import SchoolClassList from './components/SchoolClassList.vue'

/** 学校信息 列表 */
defineOptions({ name: 'School' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<School[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const areaList = ref([])
const searchAreaProps = {
  ...defaultProps,
  checkStrictly: true
}
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  schoolName: undefined as string | undefined,
  areaId: undefined as number | undefined,
  schoolAddress: undefined as string | undefined,
  code: undefined as string | undefined
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

const loadAreaList = async () => {
  if (areaList.value.length > 0) {
    return
  }
  areaList.value = await AreaApi.getAreaTree()
}

const getAreaLastName = (areaName?: string) => {
  return areaName?.split(' ').filter(Boolean).pop() || areaName || ''
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await SchoolApi.getSchoolPage(queryParams)
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

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await SchoolApi.deleteSchool(id)
    message.success(t('common.delSuccess'))
    currentRow.value = {}
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除学校信息 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await SchoolApi.deleteSchoolList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: School[]) => {
  checkedIds.value = records.map((item) => item.id!)
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await SchoolApi.exportSchool(queryParams)
    download.excel(data, '学校信息.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 选中行操作 */
const currentRow = ref<Partial<School>>({}) // 选中行
const handleCurrentChange = (row?: School) => {
  currentRow.value = row || {}
}

/** 初始化 **/
onMounted(() => {
  loadAreaList()
  getList()
})
</script>
