<template>
  <doc-alert title="地区 & IP" url="https://doc.iocoder.cn/area-and-ip/" />

  <!-- 操作栏 -->
  <ContentWrap>
    <el-button
      type="success"
      plain
      :disabled="checkedIds.length === 0"
      @click="handleBatchStatusChange(CommonStatusEnum.ENABLE)"
    >
      <Icon icon="ep:select" class="mr-5px" /> 批量启用
    </el-button>
    <el-button
      type="warning"
      plain
      :disabled="checkedIds.length === 0"
      @click="handleBatchStatusChange(CommonStatusEnum.DISABLE)"
    >
      <Icon icon="ep:close-bold" class="mr-5px" /> 批量关闭
    </el-button>
    <el-button plain :disabled="checkedIds.length === 0" @click="clearCheckedIds">
      <Icon icon="ep:refresh-left" class="mr-5px" /> 清空选择
    </el-button>
    <el-button type="primary" plain @click="openForm()">
      <Icon icon="ep:plus" class="mr-5px" /> IP 查询
    </el-button>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <div style="width: 100%; height: 700px">
      <!-- AutoResizer 自动调节大小 -->
      <el-auto-resizer>
        <template #default="{ height, width }">
          <!-- Virtualized Table 虚拟化表格：高性能，解决表格在大数据量下的卡顿问题 -->
          <el-table-v2
            v-loading="loading"
            :columns="columns"
            :data="list"
            :width="width"
            :height="height"
            expand-column-key="id"
          />
        </template>
      </el-auto-resizer>
    </div>
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <AreaForm ref="formRef" />
</template>
<script setup lang="tsx">
import { Column, ElCheckbox, ElSwitch, TableV2FixedDir } from 'element-plus'
import AreaForm from './AreaForm.vue'
import * as AreaApi from '@/api/system/area'
import { CommonStatusEnum } from '@/utils/constants'

defineOptions({ name: 'SystemArea' })

const message = useMessage()
const { t } = useI18n()

const checkedIdSet = ref<Set<number>>(new Set())
const checkedIds = computed(() => Array.from(checkedIdSet.value))

// 表格的 column 字段
const columns: Column[] = [
  {
    key: 'selection',
    dataKey: 'selection',
    title: '选择',
    width: 70,
    fixed: TableV2FixedDir.LEFT,
    align: 'center',
    cellRenderer: ({ rowData }) => (
      <ElCheckbox
        modelValue={checkedIdSet.value.has(rowData.id)}
        onChange={(value: boolean) => handleCheckedChange(rowData.id, value)}
      />
    )
  },
  {
    dataKey: 'id', // 需要渲染当前列的数据字段
    title: '编号', // 显示在单元格表头的文本
    width: 400, // 当前列的宽度，必须设置
    fixed: TableV2FixedDir.LEFT, // 是否固定列
    key: 'id' // 树形展开对应的 key
  },
  {
    dataKey: 'name',
    title: '地名',
    width: 200
  },
  {
    key: 'status',
    dataKey: 'status',
    title: '状态',
    width: 120,
    fixed: TableV2FixedDir.RIGHT,
    cellRenderer: ({ rowData }) => (
      <ElSwitch
        v-model={rowData.status}
        active-value={CommonStatusEnum.ENABLE}
        inactive-value={CommonStatusEnum.DISABLE}
        loading={areaStatusUpdating.value[rowData.id]}
        class="ml-4px"
        onChange={(val) => handleStatusChanged(rowData, val)}
      />
    )
  }
]
const loading = ref(true) // 列表的加载中
const list = ref<AreaApi.AreaNodeVO[]>([]) // 表格的数据

/** 获得数据列表 */
const getList = async () => {
  loading.value = true
  try {
    list.value = await AreaApi.getAreaTree()
  } finally {
    loading.value = false
  }
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = () => {
  formRef.value.open()
}

/** 勾选操作 */
const handleCheckedChange = (id: number, checked: boolean) => {
  const nextCheckedIdSet = new Set(checkedIdSet.value)
  if (checked) {
    nextCheckedIdSet.add(id)
  } else {
    nextCheckedIdSet.delete(id)
  }
  checkedIdSet.value = nextCheckedIdSet
}

const clearCheckedIds = () => {
  checkedIdSet.value = new Set()
}

/** 开启/关闭地区状态 */
const areaStatusUpdating = ref<Record<number, boolean>>({})
const handleStatusChanged = async (area: AreaApi.AreaNodeVO, val: number) => {
  const oldStatus =
    val === CommonStatusEnum.ENABLE ? CommonStatusEnum.DISABLE : CommonStatusEnum.ENABLE
  areaStatusUpdating.value[area.id] = true
  try {
    area.status = val
    await AreaApi.updateAreaStatus(area.id, val)
  } catch {
    area.status = oldStatus
    message.error('修改地区状态失败')
  } finally {
    areaStatusUpdating.value[area.id] = false
  }
}

/** 批量修改地区状态 */
const handleBatchStatusChange = async (status: number) => {
  const text = status === CommonStatusEnum.ENABLE ? '启用' : '关闭'
  try {
    await message.confirm(`确定要批量${text}选中的 ${checkedIds.value.length} 个地区吗？仅操作勾选节点本身。`)
    await AreaApi.updateAreaStatusBatch(checkedIds.value, status)
    message.success(t('common.updateSuccess'))
    clearCheckedIds()
    await getList()
  } catch {}
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
