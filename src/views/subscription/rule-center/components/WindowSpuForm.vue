<template>
  <Dialog v-model="dialogVisible" title="编辑窗口刊物" width="640px">
    <el-form ref="formRef" v-loading="formLoading" :model="formData" :rules="formRules" label-width="110px">
      <el-form-item label="刊物商品">
        <el-input :model-value="productName" readonly />
      </el-form-item>
      <el-form-item label="基础可见年级" prop="gradeCatalogIds">
        <el-select
          v-model="formData.gradeCatalogIds"
          class="!w-full"
          filterable
          multiple
          placeholder="请选择基础可见年级"
        >
          <el-option
            v-for="item in gradeList"
            :key="item.id"
            :label="buildGradeLabel(item)"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="推荐配置" prop="recommendFlag">
        <el-radio-group v-model="formData.recommendFlag">
          <el-radio :label="true">推荐</el-radio>
          <el-radio :label="false">不推荐</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" class="!w-full" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="formData.remark" :rows="3" type="textarea" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { SchoolApi, type GradeCatalog } from '@/api/edu/school'
import { type SubscriptionWindowSpu, SubscriptionWindowSpuApi } from '@/api/subscription/windowSpu'

defineOptions({ name: 'SubscriptionWindowSpuForm' })

const message = useMessage()
const dialogVisible = ref(false)
const formLoading = ref(false)
const formRef = ref()
const productName = ref('')
const gradeList = ref<GradeCatalog[]>([])
const formData = ref({
  id: undefined as number | undefined,
  recommendFlag: false,
  sort: 0,
  gradeCatalogIds: [] as number[],
  remark: undefined as string | undefined
})

const formRules = reactive({
  gradeCatalogIds: [{ required: true, message: '基础可见年级不能为空', trigger: 'change' }],
  recommendFlag: [{ required: true, message: '推荐配置不能为空', trigger: 'change' }],
  sort: [{ required: true, message: '排序不能为空', trigger: 'blur' }]
})

const buildGradeLabel = (item: GradeCatalog) =>
  item.aliasName ? `${item.gradeName}（${item.aliasName} / ${item.gradeNo}）` : `${item.gradeName}（${item.gradeNo}）`

const loadGradeList = async () => {
  if (gradeList.value.length > 0) {
    return
  }
  gradeList.value = await SchoolApi.getGradeCatalogSimpleList()
}

const open = async (row: SubscriptionWindowSpu) => {
  await loadGradeList()
  dialogVisible.value = true
  productName.value = row.productName
  formData.value = {
    id: row.id,
    recommendFlag: !!row.recommendFlag,
    sort: row.sort ?? 0,
    gradeCatalogIds: [...(row.gradeCatalogIds || [])],
    remark: row.remark
  }
}
defineExpose({ open })

const emit = defineEmits(['success'])

const submitForm = async () => {
  await formRef.value.validate()
  formLoading.value = true
  try {
    await SubscriptionWindowSpuApi.updateWindowSpu({
      id: formData.value.id!,
      recommendFlag: formData.value.recommendFlag,
      sort: formData.value.sort,
      gradeCatalogIds: formData.value.gradeCatalogIds,
      remark: formData.value.remark
    })
    message.success('更新成功')
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}
</script>
