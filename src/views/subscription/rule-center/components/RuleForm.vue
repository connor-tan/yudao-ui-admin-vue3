<template>
  <Dialog v-model="dialogVisible" title="特殊规则" width="1100px">
    <div class="mb-12px flex justify-between">
      <div class="text-14px text-[var(--el-text-color-secondary)]">
        当前刊物：{{ offer?.productName || '窗口级规则' }}
      </div>
      <el-button plain type="primary" @click="openEditor()">新增规则</el-button>
    </div>
    <el-table v-loading="loading" :data="list" :show-overflow-tooltip="true" :stripe="true">
      <el-table-column label="规则名称" min-width="160" prop="name" />
      <el-table-column align="center" label="作用" width="100">
        <template #default="{ row }">{{ getSubscriptionRuleEffectTypeLabel(row.effectType) }}</template>
      </el-table-column>
      <el-table-column align="center" label="年级突破" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.allowGradeOverride" type="warning">允许</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="条件" min-width="260">
        <template #default="{ row }">
          <el-tag v-for="condition in row.conditions || []" :key="condition.id" class="mr-4px">
            {{ getFactorName(condition.factor) }} = {{ condition.valueName || condition.value }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" width="90">
        <template #default="{ row }">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="row.status" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="150">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEditor(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
  </Dialog>

  <Dialog v-model="editorVisible" title="编辑规则" width="720px">
    <el-form ref="formRef" :model="formData" label-width="110px">
      <el-form-item label="规则名称" required>
        <el-input v-model="formData.name" placeholder="请输入规则名称" />
      </el-form-item>
      <el-form-item label="作用" required>
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
      <el-form-item label="年级突破">
        <el-switch v-model="formData.allowGradeOverride" />
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
      <el-form-item label="条件" required>
        <div class="w-full">
          <div
            v-for="(condition, index) in formData.conditions"
            :key="index"
            class="mb-8px flex items-center gap-8px"
          >
            <el-select
              v-model="condition.factor"
              class="!w-190px"
              placeholder="选择因子"
              @change="handleFactorChange(condition)"
            >
              <el-option
                v-for="item in getConditionFactorOptions()"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              />
            </el-select>
            <el-select
              v-model="condition.value"
              class="!w-220px"
              clearable
              filterable
              placeholder="请选择因子值"
              @change="handleValueChange(condition)"
            >
              <el-option
                v-for="item in getRuleValueOptions(condition.factor)"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-input
              v-model="condition.valueName"
              class="!w-180px"
              disabled
              placeholder="展示值自动生成"
            />
            <el-button link type="danger" @click="formData.conditions?.splice(index, 1)">删除</el-button>
          </div>
          <div class="mb-8px text-12px text-[var(--el-text-color-secondary)]">
            “学生年级”用于限定人群；“窗口 SKU”仅在刊物级规则中出现，用于精确限定某个 SKU。
          </div>
          <el-button plain @click="addCondition">添加条件</el-button>
        </div>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="formData.remark" :rows="3" type="textarea" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :loading="submitLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="editorVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import {
  getSubscriptionRuleEffectTypeLabel,
  SUBSCRIPTION_RULE_EFFECT_TYPE_OPTIONS
} from '@/utils/subscription'
import {
  SubscriptionSupportApi,
  type SubscriptionRuleConditionValue
} from '@/api/subscription/support'
import { SubscriptionOfferApi, type SubscriptionOffer } from '@/api/subscription/offer'
import {
  SubscriptionRuleApi,
  type SubscriptionRule,
  type SubscriptionRuleCondition,
  type SubscriptionRuleScope
} from '@/api/subscription/rule'

defineOptions({ name: 'SubscriptionRuleForm' })

type RuleValueOption = SubscriptionRuleConditionValue

type RuleFactorOption = {
  code: string
  name: string
}

const RULE_FACTOR = {
  STUDENT_GRADE: 'STUDENT_GRADE',
  OFFER_SKU: 'OFFER_SKU'
} as const

const message = useMessage()
const dialogVisible = ref(false)
const editorVisible = ref(false)
const loading = ref(false)
const submitLoading = ref(false)
const windowId = ref<number>()
const offerId = ref<number>()
const offer = ref<SubscriptionOffer>()
const list = ref<SubscriptionRule[]>([])
const total = ref(0)
const factorOptions = ref<RuleFactorOption[]>([])
const conditionValueOptions = ref<Record<string, RuleValueOption[]>>({})
const queryParams = reactive({ pageNo: 1, pageSize: 10 })
const formData = ref<SubscriptionRule>({})

const currentScope = computed<SubscriptionRuleScope>(() => (offerId.value ? 'OFFER' : 'WINDOW'))

const open = async (currentWindowId: number, currentOfferId?: number) => {
  windowId.value = currentWindowId
  offerId.value = currentOfferId
  offer.value = undefined
  conditionValueOptions.value = {}
  queryParams.pageNo = 1
  dialogVisible.value = true
  const tasks: Promise<any>[] = [loadFactors(), getList()]
  if (currentOfferId) {
    tasks.push(SubscriptionOfferApi.getOffer(currentOfferId).then((data) => (offer.value = data)))
  }
  await Promise.all(tasks)
}
defineExpose({ open })

const loadFactors = async () => {
  const data = await SubscriptionSupportApi.getRuleFactorList()
  factorOptions.value = data || []
}

const getFactorName = (code?: string) =>
  factorOptions.value.find((item) => item.code === code)?.name || code || '-'

const getConditionFactorOptions = () =>
  factorOptions.value.filter((item) => item.code !== RULE_FACTOR.OFFER_SKU || !!offerId.value)

const loadRuleValueOptions = async (factor?: string) => {
  if (!factor || conditionValueOptions.value[factor]) {
    return
  }
  conditionValueOptions.value[factor] = await SubscriptionSupportApi.getRuleConditionValues({
    factor,
    windowId: windowId.value,
    offerId: offerId.value
  })
}

const ensureRuleValueOptions = async (conditions: SubscriptionRuleCondition[] = []) => {
  const factors = Array.from(new Set(conditions.map((item) => item.factor).filter(Boolean))) as string[]
  await Promise.all(factors.map((factor) => loadRuleValueOptions(factor)))
}

const getRuleValueOptions = (factor?: string): RuleValueOption[] => {
  if (!factor) {
    return []
  }
  return conditionValueOptions.value[factor] || []
}

const fillConditionValueName = (condition: SubscriptionRuleCondition) => {
  const option = getRuleValueOptions(condition.factor).find((item) => item.value === condition.value)
  condition.valueName = option?.label || condition.valueName || condition.value
}

const handleFactorChange = async (condition: SubscriptionRuleCondition) => {
  condition.operator = 'EQ'
  condition.value = ''
  condition.valueName = ''
  await loadRuleValueOptions(condition.factor)
}

const handleValueChange = (condition: SubscriptionRuleCondition) => {
  fillConditionValueName(condition)
}

const getList = async () => {
  if (!windowId.value) return
  loading.value = true
  try {
    const data = await SubscriptionRuleApi.getRulePage({
      ...queryParams,
      windowId: windowId.value,
      scope: currentScope.value,
      offerId: offerId.value
    })
    list.value = data.list || []
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
}

const openEditor = async (row?: SubscriptionRule) => {
  formData.value = row
    ? JSON.parse(JSON.stringify(row))
    : {
        windowId: windowId.value,
        offerId: offerId.value,
        name: '',
        effectType: 'EXCLUDE',
        allowGradeOverride: false,
        status: 0,
        conditions: [{ factor: RULE_FACTOR.STUDENT_GRADE, operator: 'EQ', value: '', valueName: '' }]
      }
  await ensureRuleValueOptions(formData.value.conditions)
  editorVisible.value = true
}

const addCondition = async () => {
  if (!formData.value.conditions) {
    formData.value.conditions = []
  }
  const condition = {
    factor: RULE_FACTOR.STUDENT_GRADE,
    operator: 'EQ',
    value: '',
    valueName: ''
  }
  formData.value.conditions.push(condition)
  await loadRuleValueOptions(condition.factor)
}

const submitForm = async () => {
  if (!formData.value.name || !formData.value.effectType || !formData.value.conditions?.length) {
    message.warning('请补全规则名称、作用和条件')
    return
  }
  if (formData.value.conditions.some((item) => !item.factor || !item.value)) {
    message.warning('请补全规则条件')
    return
  }
  submitLoading.value = true
  try {
    formData.value.windowId = windowId.value
    formData.value.offerId = offerId.value
    await ensureRuleValueOptions(formData.value.conditions)
    formData.value.conditions.forEach((item) => {
      item.operator = 'EQ'
      fillConditionValueName(item)
    })
    if (formData.value.id) {
      await SubscriptionRuleApi.updateRule(formData.value)
    } else {
      await SubscriptionRuleApi.createRule(formData.value)
    }
    message.success('保存成功')
    editorVisible.value = false
    await getList()
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = async (id?: number) => {
  if (!id) return
  await message.delConfirm()
  await SubscriptionRuleApi.deleteRule(id)
  message.success('删除成功')
  await getList()
}
</script>
