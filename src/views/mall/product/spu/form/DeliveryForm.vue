<!-- 商品发布 - 物流设置 -->
<template>
  <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px" :disabled="isDetail">
    <template v-if="!hasBizScene">
      <el-form-item label="配置说明">
        <div class="w-80 text-13px text-gray-500">
          请先在基础设置中选择商品分类，再配置对应的物流或履约信息。
        </div>
      </el-form-item>
    </template>
    <template v-else>
      <el-form-item label="配送方式" prop="deliveryTypes">
        <el-checkbox-group v-model="formData.deliveryTypes" class="w-80">
          <el-checkbox
            v-for="dict in deliveryTypeOptions"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item v-if="isPublicationScene" label="站点说明">
        <div class="w-80 text-13px text-gray-500">
          站点配送按学生学校绑定站点履约；混合配送只在订单中按配送组自动聚合，不在商品中配置。
        </div>
      </el-form-item>
      <el-form-item
        v-if="formData.deliveryTypes?.includes(DeliveryTypeEnum.EXPRESS.type)"
        label="运费模板"
        prop="deliveryTemplateId"
      >
        <el-select v-model="formData.deliveryTemplateId" class="w-80" placeholder="请选择运费模板">
          <el-option
            v-for="item in deliveryTemplateList"
            :key="item.id"
            :label="item.name"
            :value="item.id as number"
          />
        </el-select>
      </el-form-item>
    </template>
  </el-form>
</template>
<script lang="ts" setup>
import { computed, PropType } from 'vue'
import { copyValueToTarget } from '@/utils'
import { propTypes } from '@/utils/propTypes'
import type { Spu } from '@/api/mall/product/spu'
import * as ProductSpuApi from '@/api/mall/product/spu'
import * as ExpressTemplateApi from '@/api/mall/trade/delivery/expressTemplate'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { DeliveryTypeEnum } from '@/utils/constants'

defineOptions({ name: 'ProductDeliveryForm' })

const message = useMessage() // 消息弹窗

const props = defineProps({
  propFormData: {
    type: Object as PropType<Spu>,
    default: () => {}
  },
  isDetail: propTypes.bool.def(false) // 是否作为详情组件
})
const formRef = ref() // 表单 Ref
const formData = reactive<Spu>({
  bizScene: undefined,
  deliveryTypes: [], // 配送方式
  deliveryTemplateId: undefined // 运费模版
})
const hasBizScene = computed(() => !!formData.bizScene)
const isPublicationScene = computed(() => formData.bizScene === ProductSpuApi.BIZ_SCENE_PUBLICATION)
const isNormalScene = computed(() => formData.bizScene === ProductSpuApi.BIZ_SCENE_NORMAL)
const allowedDeliveryTypeValues = computed(() => {
  if (isPublicationScene.value) {
    return [DeliveryTypeEnum.EXPRESS.type, DeliveryTypeEnum.STATION.type]
  }
  if (isNormalScene.value) {
    return [DeliveryTypeEnum.EXPRESS.type, DeliveryTypeEnum.PICK_UP.type]
  }
  return []
})
const deliveryTypeOptions = computed(() =>
  getIntDictOptions(DICT_TYPE.TRADE_DELIVERY_TYPE).filter((dict) =>
    allowedDeliveryTypeValues.value.includes(dict.value)
  )
)
const validateDeliveryTypes = (_rule, value, callback) => {
  if (!hasBizScene.value) {
    callback()
    return
  }
  if (!value || value.length === 0) {
    callback(new Error('请选择配送方式'))
    return
  }
  if (value.some((deliveryType) => !allowedDeliveryTypeValues.value.includes(deliveryType))) {
    callback(new Error('配送方式不符合当前商品分类'))
    return
  }
  callback()
}
const validateDeliveryTemplate = (_rule, value, callback) => {
  if (
    !hasBizScene.value ||
    !formData.deliveryTypes?.includes(DeliveryTypeEnum.EXPRESS.type) ||
    value
  ) {
    callback()
    return
  }
  callback(new Error('请选择运费模板'))
}
const rules = reactive({
  deliveryTypes: [{ validator: validateDeliveryTypes, trigger: 'change' }],
  deliveryTemplateId: [{ validator: validateDeliveryTemplate, trigger: 'change' }]
})

/** 将传进来的值赋值给 formData */
watch(
  () => props.propFormData,
  (data) => {
    if (!data) {
      return
    }
    copyValueToTarget(formData, data)
  },
  {
    immediate: true,
    deep: true
  }
)

/** 表单校验 */
const emit = defineEmits(['update:activeName'])
const validate = async () => {
  if (!formRef) return
  try {
    await unref(formRef)?.validate()
    // 校验通过更新数据
    Object.assign(props.propFormData, {
      deliveryTypes: formData.deliveryTypes || [],
      deliveryTemplateId: formData.deliveryTemplateId
    })
  } catch (e) {
    message.error('【物流设置】不完善，请填写相关信息')
    emit('update:activeName', 'delivery')
    throw e // 目的截断之后的校验
  }
}
defineExpose({ validate })

/** 初始化 */
const deliveryTemplateList = ref<Awaited<ReturnType<typeof ExpressTemplateApi.getSimpleTemplateList>>>([]) // 运费模版
onMounted(async () => {
  deliveryTemplateList.value = await ExpressTemplateApi.getSimpleTemplateList()
})
</script>
