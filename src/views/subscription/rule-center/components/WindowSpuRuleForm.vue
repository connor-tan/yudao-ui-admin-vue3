<template>
  <Dialog v-model="dialogVisible" :title="`特殊规则：${productName}`" width="980px">
    <div class="mb-12px">
      <el-button type="primary" plain @click="openRuleDialog('create')">
        <Icon class="mr-5px" icon="ep:plus" />
        新增规则
      </el-button>
    </div>

    <el-table v-loading="loading" :data="list" :show-overflow-tooltip="true" :stripe="true">
      <el-table-column label="规则效果" min-width="100">
        <template #default="{ row }">
          {{ getSubscriptionRuleEffectTypeLabel(row.effectType) }}
        </template>
      </el-table-column>
      <el-table-column label="规则范围" min-width="120">
        <template #default="{ row }">
          {{ getSubscriptionRuleScopeTypeLabel(row.scopeType) }}
        </template>
      </el-table-column>
      <el-table-column label="学校" min-width="180" prop="schoolName" />
      <el-table-column label="年级" min-width="180">
        <template #default="{ row }">
          {{ row.gradeAliasName ? `${row.gradeName}（${row.gradeAliasName}）` : row.gradeName || '-' }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="排序" min-width="80" prop="sort" />
      <el-table-column label="备注" min-width="180" prop="remark" />
      <el-table-column align="center" label="操作" width="140">
        <template #default="{ row }">
          <el-button link type="primary" @click="openRuleDialog('update', row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row.id!)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />

    <Dialog v-model="ruleDialogVisible" :title="ruleDialogType === 'create' ? '新增规则' : '编辑规则'" width="620px">
      <el-form ref="formRef" v-loading="formLoading" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="规则效果" prop="effectType">
          <el-radio-group v-model="formData.effectType">
            <el-radio
              v-for="item in SUBSCRIPTION_RULE_EFFECT_TYPE_OPTIONS"
              :key="item.value"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="规则范围" prop="scopeType">
          <el-select v-model="formData.scopeType" class="!w-full" placeholder="请选择规则范围">
            <el-option
              v-for="item in SUBSCRIPTION_RULE_SCOPE_TYPE_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="requiresSchool" label="学校" prop="schoolId">
          <el-select v-model="formData.schoolId" class="!w-full" filterable placeholder="请选择学校">
            <el-option
              v-for="item in schoolList"
              :key="item.id"
              :label="item.schoolName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="requiresGrade" label="年级" prop="gradeCatalogId">
          <el-select v-model="formData.gradeCatalogId" class="!w-full" filterable placeholder="请选择年级">
            <el-option
              v-for="item in gradeList"
              :key="item.id"
              :label="buildGradeLabel(item)"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" class="!w-full" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remark" :rows="3" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :disabled="formLoading" type="primary" @click="submitRuleForm">确 定</el-button>
        <el-button @click="ruleDialogVisible = false">取 消</el-button>
      </template>
    </Dialog>
  </Dialog>
</template>

<script setup lang="ts">
import { SchoolApi, type GradeCatalog, type SchoolSimple } from '@/api/edu/school'
import {
  SubscriptionWindowSpuRuleApi,
  type SubscriptionWindowSpuRule
} from '@/api/subscription/windowSpuRule'
import {
  getSubscriptionRuleEffectTypeLabel,
  getSubscriptionRuleScopeTypeLabel,
  SUBSCRIPTION_RULE_EFFECT_TYPE_OPTIONS,
  SUBSCRIPTION_RULE_SCOPE_TYPE_OPTIONS
} from '@/utils/subscription'

defineOptions({ name: 'SubscriptionWindowSpuRuleForm' })

const message = useMessage()
const dialogVisible = ref(false)
const ruleDialogVisible = ref(false)
const loading = ref(false)
const formLoading = ref(false)
const total = ref(0)
const windowSpuId = ref<number>()
const productName = ref('')
const schoolList = ref<SchoolSimple[]>([])
const gradeList = ref<GradeCatalog[]>([])
const list = ref<SubscriptionWindowSpuRule[]>([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  windowSpuId: undefined as number | undefined
})
const ruleDialogType = ref<'create' | 'update'>('create')
const formRef = ref()
const formData = ref<SubscriptionWindowSpuRule>({
  id: undefined,
  windowSpuId: 0,
  effectType: 'INCLUDE',
  scopeType: 'ALL',
  schoolId: undefined,
  gradeCatalogId: undefined,
  sort: 0,
  remark: undefined
})

const requiresSchool = computed(() =>
  formData.value.scopeType === 'SCHOOL' || formData.value.scopeType === 'SCHOOL_GRADE'
)
const requiresGrade = computed(() =>
  formData.value.scopeType === 'GRADE' || formData.value.scopeType === 'SCHOOL_GRADE'
)

const formRules = reactive({
  effectType: [{ required: true, message: '规则效果不能为空', trigger: 'change' }],
  scopeType: [{ required: true, message: '规则范围不能为空', trigger: 'change' }],
  schoolId: [
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (requiresSchool.value && !value) {
          callback(new Error('学校不能为空'))
          return
        }
        callback()
      },
      trigger: 'change'
    }
  ],
  gradeCatalogId: [
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (requiresGrade.value && !value) {
          callback(new Error('年级不能为空'))
          return
        }
        callback()
      },
      trigger: 'change'
    }
  ],
  sort: [{ required: true, message: '排序不能为空', trigger: 'blur' }]
})

const buildGradeLabel = (item: GradeCatalog) =>
  item.aliasName ? `${item.gradeName}（${item.aliasName} / ${item.gradeNo}）` : `${item.gradeName}（${item.gradeNo}）`

watch(
  () => formData.value.scopeType,
  (value) => {
    if (value === 'ALL') {
      formData.value.schoolId = undefined
      formData.value.gradeCatalogId = undefined
    } else if (value === 'SCHOOL') {
      formData.value.gradeCatalogId = undefined
    } else if (value === 'GRADE') {
      formData.value.schoolId = undefined
    }
  }
)

const loadOptions = async () => {
  if (schoolList.value.length > 0 && gradeList.value.length > 0) {
    return
  }
  const [schools, grades] = await Promise.all([
    SchoolApi.getSchoolSimpleList(),
    SchoolApi.getGradeCatalogSimpleList()
  ])
  schoolList.value = schools
  gradeList.value = grades
}

const getList = async () => {
  if (!windowSpuId.value) {
    list.value = []
    total.value = 0
    return
  }
  loading.value = true
  try {
    const data = await SubscriptionWindowSpuRuleApi.getPage({
      ...queryParams,
      windowSpuId: windowSpuId.value
    })
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const open = async (selectedWindowSpuId: number, selectedProductName: string) => {
  await loadOptions()
  dialogVisible.value = true
  windowSpuId.value = selectedWindowSpuId
  productName.value = selectedProductName
  queryParams.windowSpuId = selectedWindowSpuId
  queryParams.pageNo = 1
  await getList()
}
defineExpose({ open })

const openRuleDialog = (type: 'create' | 'update', row?: SubscriptionWindowSpuRule) => {
  ruleDialogType.value = type
  ruleDialogVisible.value = true
  formData.value = row
    ? { ...row }
    : {
        id: undefined,
        windowSpuId: windowSpuId.value!,
        effectType: 'INCLUDE',
        scopeType: 'ALL',
        schoolId: undefined,
        gradeCatalogId: undefined,
        sort: 0,
        remark: undefined
      }
  nextTick(() => formRef.value?.clearValidate())
}

const submitRuleForm = async () => {
  await formRef.value.validate()
  formLoading.value = true
  try {
    if (ruleDialogType.value === 'create') {
      await SubscriptionWindowSpuRuleApi.create(formData.value)
      message.success('新增成功')
    } else {
      await SubscriptionWindowSpuRuleApi.update(formData.value)
      message.success('更新成功')
    }
    ruleDialogVisible.value = false
    await getList()
  } finally {
    formLoading.value = false
  }
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await SubscriptionWindowSpuRuleApi.delete(id)
    message.success('删除成功')
    await getList()
  } catch {}
}
</script>
