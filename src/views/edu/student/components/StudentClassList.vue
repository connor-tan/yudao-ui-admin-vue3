<template>
  <ContentWrap>
    <el-table row-key="id" v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="学生班级ID" align="center" prop="id" />
      <el-table-column label="班级" align="center" prop="className" min-width="180" />
      <el-table-column label="入班日期" align="center" prop="startDate" />
      <el-table-column label="离班日期" align="center" prop="endDate" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
    </el-table>
  </ContentWrap>
</template>
<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import { StudentApi, StudentClass } from '@/api/edu/student'

const props = defineProps<{
  studentId?: number
}>()
const loading = ref(false)
const list = ref<StudentClass[]>([])

const getList = async () => {
  if (!props.studentId) {
    list.value = []
    return
  }
  loading.value = true
  try {
    list.value = await StudentApi.getStudentClassListByStudentId(props.studentId)
  } finally {
    loading.value = false
  }
}

watch(
  () => props.studentId,
  () => {
    getList()
  },
  { immediate: true }
)
</script>
