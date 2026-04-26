<template>
  <Dialog v-model="dialogVisible" title="编辑窗口刊物" width="560px">
    <el-form ref="formRef" v-loading="formLoading" :model="formData" label-width="110px">
      <el-form-item label="刊物">
        <el-input :model-value="formData.productName" disabled />
      </el-form-item>
      <el-form-item label="推荐">
        <el-switch v-model="formData.recommendFlag" />
      </el-form-item>
      <el-form-item label="基础年级收窄">
        <el-select
          v-model="formData.gradeCatalogIds"
          class="!w-full"
          clearable
          collapse-tags
          collapse-tags-tooltip
          filterable
          multiple
          placeholder="不选择表示不额外收窄"
        >
          <el-option
            v-for="item in gradeList"
            :key="item.id"
            :label="item.gradeName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="排序">
        <el-input-number v-model="formData.sort" :min="0" class="!w-full" />
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="formData.remark" :rows="3" type="textarea" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { SchoolApi, type GradeCatalog } from '@/api/edu/school'
import { SubscriptionOfferApi, type SubscriptionOffer } from '@/api/subscription/offer'

defineOptions({ name: 'SubscriptionOfferForm' })

const message = useMessage()
const dialogVisible = ref(false)
const formLoading = ref(false)
const formRef = ref()
const gradeList = ref<GradeCatalog[]>([])
const formData = ref<SubscriptionOffer>({})

const open = async (id: number) => {
  dialogVisible.value = true
  formLoading.value = true
  try {
    const [offer, grades] = await Promise.all([
      SubscriptionOfferApi.getOffer(id),
      SchoolApi.getGradeCatalogSimpleList()
    ])
    formData.value = offer
    gradeList.value = grades
  } finally {
    formLoading.value = false
  }
}
defineExpose({ open })

const emit = defineEmits(['success'])
const submitForm = async () => {
  formLoading.value = true
  try {
    await SubscriptionOfferApi.updateOffer({
      id: formData.value.id,
      recommendFlag: formData.value.recommendFlag,
      sort: formData.value.sort,
      status: formData.value.status,
      remark: formData.value.remark,
      gradeCatalogIds: formData.value.gradeCatalogIds
    })
    message.success('更新成功')
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}
</script>
