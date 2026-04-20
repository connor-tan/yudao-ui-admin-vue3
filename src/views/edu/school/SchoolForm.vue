<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="学校名称" prop="schoolName">
        <el-input v-model="formData.schoolName" placeholder="请输入学校名称" />
      </el-form-item>
      <el-form-item label="办学学段" prop="stageCodes">
        <el-select
          v-model="formData.stageCodes"
          multiple
          collapse-tags
          collapse-tags-tooltip
          placeholder="请选择办学学段"
          class="w-1/1"
        >
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.EDU_STAGE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="所在地区" prop="areaId">
        <el-cascader
          v-model="formData.areaId"
          :options="areaList"
          :props="formAreaProps"
          class="w-1/1"
          clearable
          filterable
          placeholder="请选择学校所在地区"
        />
      </el-form-item>
      <el-form-item label="学校地址" prop="schoolAddressDetail">
        <el-input v-model="formData.schoolAddressDetail" class="w-1/1" placeholder="请输入详细地址">
          <template #prepend>
            <span :title="schoolAddressPrefix || '请选择地区'">
              {{ schoolAddressPrefix || '请选择地区' }}
            </span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="学校代码" prop="code">
        <el-input v-model="formData.code" placeholder="请输入学校代码" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { SchoolApi, School } from '@/api/edu/school'
import * as AreaApi from '@/api/system/area'
import { defaultProps, findPath } from '@/utils/tree'
import { DICT_TYPE, getStrDictOptions } from '@/utils/dict'
import type { FormRules } from 'element-plus'

/** 学校信息 表单 */
defineOptions({ name: 'SchoolForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const areaList = ref<AreaApi.AreaNodeVO[]>([]) // 地区列表
const formAreaProps = {
  ...defaultProps,
  checkStrictly: true
}
type SchoolFormData = {
  id?: number
  schoolName?: string
  areaId?: number
  schoolAddress?: string
  schoolAddressDetail?: string
  code?: string
  stageCodes: string[]
}

const formData = ref<SchoolFormData>({
  id: undefined,
  schoolName: undefined,
  areaId: undefined,
  schoolAddress: undefined,
  schoolAddressDetail: undefined,
  code: undefined,
  stageCodes: []
})
const formRules = reactive<FormRules<SchoolFormData>>({
  schoolName: [{ required: true, message: '学校名称不能为空', trigger: 'blur' }],
  stageCodes: [{ required: true, type: 'array', min: 1, message: '办学学段不能为空', trigger: 'change' }],
  areaId: [{ required: true, message: '学校所在地区不能为空', trigger: 'change' }],
  schoolAddressDetail: [{ required: true, message: '学校详细地址不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

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

const schoolAddressPrefix = computed(() => getAreaText(formData.value.areaId))

const getSchoolAddressDetail = (schoolAddress?: string, areaId?: number) => {
  const fullAddress = schoolAddress || ''
  const areaPrefixes = getAreaNamePath(areaId).map((_, index, path) => path.slice(index).join(''))
  const matchedPrefix = areaPrefixes.find((prefix) => prefix && fullAddress.startsWith(prefix))
  if (matchedPrefix) {
    return fullAddress.slice(matchedPrefix.length)
  }
  return fullAddress
}

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  formLoading.value = true
  try {
    let school: School | undefined
    // 修改时，设置数据
    if (id) {
      school = await SchoolApi.getSchool(id)
    }
    areaList.value = await AreaApi.getEnabledAreaTree(school?.areaId)
    if (school) {
      formData.value = {
        id: school.id,
        schoolName: school.schoolName,
        areaId: school.areaId,
        schoolAddress: school.schoolAddress,
        schoolAddressDetail: getSchoolAddressDetail(school.schoolAddress, school.areaId),
        code: school.code,
        stageCodes: school.stageCodes || []
      }
    }
  } finally {
    formLoading.value = false
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const schoolAddressDetail = formData.value.schoolAddressDetail || ''
    const data: School = {
      id: formData.value.id,
      schoolName: formData.value.schoolName,
      areaId: formData.value.areaId,
      schoolAddress: `${schoolAddressPrefix.value}${schoolAddressDetail}`,
      code: formData.value.code,
      stageCodes: formData.value.stageCodes
    }
    if (formType.value === 'create') {
      await SchoolApi.createSchool(data)
      message.success(t('common.createSuccess'))
    } else {
      await SchoolApi.updateSchool(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    schoolName: undefined,
    areaId: undefined,
    schoolAddress: undefined,
    schoolAddressDetail: undefined,
    code: undefined,
    stageCodes: []
  }
  formRef.value?.resetFields()
}
</script>
