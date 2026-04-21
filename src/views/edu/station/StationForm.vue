<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form ref="formRef" v-loading="formLoading" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="站点名称" prop="stationName">
        <el-input v-model="formData.stationName" placeholder="请输入站点名称" />
      </el-form-item>
      <el-form-item label="所在地区" prop="areaId">
        <el-cascader
          v-model="formData.areaId"
          :options="areaList"
          :props="formAreaProps"
          class="w-1/1"
          clearable
          :disabled="isAreaLocked"
          filterable
          placeholder="请选择站点所在地区"
        />
        <div v-if="isAreaLocked" class="mt-6px text-12px text-[var(--el-text-color-secondary)]">
          站点已绑定学校，所在地区不可修改。
        </div>
      </el-form-item>
      <el-form-item label="站点地址" prop="stationAddressDetail">
        <el-input v-model="formData.stationAddressDetail" class="w-1/1" placeholder="请输入详细地址">
          <template #prepend>
            <span :title="stationAddressPrefix || '请选择地区'">
              {{ stationAddressPrefix || '请选择地区' }}
            </span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="联系人" prop="contactName">
        <el-input v-model="formData.contactName" placeholder="请输入联系人" />
      </el-form-item>
      <el-form-item label="联系电话" prop="contactMobile">
        <el-input v-model="formData.contactMobile" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" class="!w-240px" controls-position="right" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :disabled="isDisableStatusLocked && dict.value === CommonStatusEnum.DISABLE"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
        <div
          v-if="isDisableStatusLocked"
          class="mt-6px text-12px text-[var(--el-text-color-secondary)]"
        >
          站点已绑定学校，不能停用；如需停用，请先解除学校绑定。
        </div>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" placeholder="请输入备注" type="textarea" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { CommonStatusEnum } from '@/utils/constants'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as AreaApi from '@/api/system/area'
import { defaultProps, findPath } from '@/utils/tree'
import { StationApi, type Station } from '@/api/edu/station'
import type { FormRules } from 'element-plus'

defineOptions({ name: 'EduStationForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref<'create' | 'update'>('create')
const formRef = ref()
const areaList = ref<AreaApi.AreaNodeVO[]>([])
const originalAreaId = ref<number>()
const boundSchoolCount = ref(0)
const formAreaProps = {
  ...defaultProps,
  checkStrictly: true
}
type StationFormData = {
  id?: number
  stationName?: string
  areaId?: number
  contactName?: string
  contactMobile?: string
  stationAddress?: string
  stationAddressDetail?: string
  sort?: number
  status?: number
  remark?: string
}

const formData = ref<StationFormData>({
  id: undefined,
  stationName: '',
  areaId: undefined,
  contactName: '',
  contactMobile: '',
  stationAddress: '',
  stationAddressDetail: '',
  sort: 0,
  status: CommonStatusEnum.ENABLE,
  remark: ''
})
const formRules = reactive<FormRules<StationFormData>>({
  stationName: [required],
  areaId: [required],
  stationAddressDetail: [required],
  sort: [required],
  status: [required]
})

const getAreaNamePath = (areaId?: number) => {
  if (!areaId || !areaList.value.length) {
    return []
  }
  const path = findPath<AreaApi.AreaNodeVO>(areaList.value, (node) => node.id === areaId) as
    | AreaApi.AreaNodeVO[]
    | null
  return path?.map((node) => node.name) || []
}

const getAreaText = (areaId?: number) => {
  return getAreaNamePath(areaId).join('')
}

const stationAddressPrefix = computed(() => getAreaText(formData.value.areaId))
const isAreaLocked = computed(() => formType.value === 'update' && boundSchoolCount.value > 0)
const isDisableStatusLocked = computed(() => formType.value === 'update' && boundSchoolCount.value > 0)

const getStationAddressDetail = (stationAddress?: string, areaId?: number) => {
  const fullAddress = stationAddress || ''
  const areaPrefixes = getAreaNamePath(areaId).map((_, index, path) => path.slice(index).join(''))
  const matchedPrefix = areaPrefixes.find((prefix) => prefix && fullAddress.startsWith(prefix))
  if (matchedPrefix) {
    return fullAddress.slice(matchedPrefix.length)
  }
  return fullAddress
}

const resetForm = () => {
  originalAreaId.value = undefined
  boundSchoolCount.value = 0
  formData.value = {
    id: undefined,
    stationName: '',
    areaId: undefined,
    contactName: '',
    contactMobile: '',
    stationAddress: '',
    stationAddressDetail: '',
    sort: 0,
    status: CommonStatusEnum.ENABLE,
    remark: ''
  }
  formRef.value?.resetFields()
}

const open = async (type: 'create' | 'update', id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t(`action.${type}`)
  formType.value = type
  resetForm()
  formLoading.value = true
  try {
    let station: Station | undefined
    if (id) {
      station = await StationApi.getStation(id)
    }
    areaList.value = await AreaApi.getEnabledAreaTree(station?.areaId)
    if (station) {
      originalAreaId.value = station.areaId
      boundSchoolCount.value = station.schoolCount || 0
      formData.value = {
        id: station.id,
        stationName: station.stationName,
        areaId: station.areaId,
        contactName: station.contactName,
        contactMobile: station.contactMobile,
        stationAddress: station.stationAddress,
        stationAddressDetail: getStationAddressDetail(station.stationAddress, station.areaId),
        sort: station.sort,
        status: station.status,
        remark: station.remark
      }
    }
  } finally {
    formLoading.value = false
  }
}
defineExpose({ open })

const emit = defineEmits(['success'])
const submitForm = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return
  formLoading.value = true
  try {
    const stationAddressDetail = formData.value.stationAddressDetail || ''
    const areaId = isAreaLocked.value ? originalAreaId.value : formData.value.areaId
    const data: Station = {
      id: formData.value.id,
      stationName: formData.value.stationName,
      areaId,
      contactName: formData.value.contactName,
      contactMobile: formData.value.contactMobile,
      stationAddress: `${getAreaText(areaId)}${stationAddressDetail}`,
      sort: formData.value.sort,
      status: formData.value.status,
      remark: formData.value.remark
    }
    if (formType.value === 'create') {
      await StationApi.createStation(data)
      message.success(t('common.createSuccess'))
    } else {
      await StationApi.updateStation(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}
</script>
