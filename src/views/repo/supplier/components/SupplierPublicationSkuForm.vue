<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="720px">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="110px"
    >
      <el-form-item label="供应商" prop="supplierId">
        <el-input :model-value="supplierDisplayName" disabled />
      </el-form-item>
      <el-form-item label="刊物 SKU" prop="skuId">
        <el-select
          v-model="formData.skuId"
          class="!w-1/1"
          filterable
          remote
          :remote-method="loadPublicationSkuOptions"
          :loading="publicationSkuLoading"
          placeholder="请输入刊物、SKU 或 ISBN 搜索"
        >
          <el-option
            v-for="item in publicationSkuOptions"
            :key="item.skuId"
            :label="formatPublicationSkuLabel(item)"
            :value="item.skuId!"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formData.sort" :precision="0" class="!w-1/1" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" :disabled="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import type { FormInstance } from 'element-plus'
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import type { SupplierVO } from '@/api/repo/supplier'
import {
  SupplierPublicationSkuApi,
  type PublicationSkuVO,
  type SupplierPublicationSkuVO
} from '@/api/repo/supplierPublicationSku'

defineOptions({ name: 'RepoSupplierPublicationSkuForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const selectedSupplier = ref<Partial<SupplierVO>>({})
const publicationSkuOptions = ref<PublicationSkuVO[]>([])
const publicationSkuLoading = ref(false)
type RelationFormData = Partial<SupplierPublicationSkuVO> & {
  status: number
}

const createFormData = (): RelationFormData => ({
  id: undefined,
  supplierId: undefined,
  skuId: undefined,
  status: CommonStatusEnum.ENABLE,
  sort: 0,
  remark: undefined
})
const formData = ref<RelationFormData>(createFormData())
const supplierDisplayName = computed(
  () =>
    selectedSupplier.value.name ||
    formData.value.supplierName ||
    (formData.value.supplierId ? `供应商 #${formData.value.supplierId}` : '')
)
const formRules = reactive({
  supplierId: [{ required: true, message: '供应商不能为空', trigger: 'change' }],
  skuId: [{ required: true, message: '刊物 SKU 不能为空', trigger: 'change' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
  sort: [{ required: true, message: '排序不能为空', trigger: 'blur' }]
})
const formRef = ref<FormInstance>()

const formatPublicationSkuLabel = (item: PublicationSkuVO) => {
  return `${item.productName || '-'} / ${item.productSkuName || `SKU-${item.skuId}`} ${
    item.isbn ? ` / ${item.isbn}` : ''
  }`
}

const loadPublicationSkuOptions = async (keyword?: string) => {
  publicationSkuLoading.value = true
  try {
    const data = await SupplierPublicationSkuApi.getPublicationSkuPage({
      pageNo: 1,
      pageSize: 30,
      keyword
    })
    publicationSkuOptions.value = data.list || []
  } finally {
    publicationSkuLoading.value = false
  }
}

const open = async (type: string, id?: number, supplier?: Partial<SupplierVO>) => {
  if (!supplier?.id) {
    message.error('请选择一个供应商')
    return
  }
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  selectedSupplier.value = supplier
  formData.value.supplierId = supplier.id
  formLoading.value = true
  try {
    await loadPublicationSkuOptions()
    if (id) {
      const data = await SupplierPublicationSkuApi.getSupplierPublicationSku(id)
      formData.value = {
        ...data,
        supplierId: supplier.id,
        status: data.status ?? CommonStatusEnum.ENABLE,
        sort: data.sort ?? 0
      }
      if (data.skuId && !publicationSkuOptions.value.some((item) => item.skuId === data.skuId)) {
        publicationSkuOptions.value.unshift({
          spuId: data.spuId,
          skuId: data.skuId,
          productName: data.productNameSnapshot,
          productSkuName: data.productSkuNameSnapshot,
          isbn: data.isbn
        })
      }
    }
  } finally {
    formLoading.value = false
  }
}
defineExpose({ open })

const emit = defineEmits(['success'])
const submitForm = async () => {
  await formRef.value?.validate()
  formLoading.value = true
  try {
    if (formType.value === 'create') {
      await SupplierPublicationSkuApi.createSupplierPublicationSku(formData.value)
      message.success(t('common.createSuccess'))
    } else {
      await SupplierPublicationSkuApi.updateSupplierPublicationSku(formData.value)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const resetForm = () => {
  selectedSupplier.value = {}
  formData.value = createFormData()
  formRef.value?.resetFields()
}
</script>
