<template>
  <el-alert
    :closable="false"
    show-icon
    title="使用前请先在目标数据库中创建消息表"
    type="info"
    style="margin-bottom: 16px"
  >
    <template #default>
      <div style="margin-top: 4px">
        <el-text size="small" type="info">
          设备消息将以固定结构写入目标表，请先执行以下建表 SQL：
        </el-text>
        <div style="position: relative; margin-top: 8px">
          <el-input
            v-model="createTableSQL"
            :autosize="{ minRows: 3, maxRows: 12 }"
            readonly
            type="textarea"
            style="font-family: monospace; font-size: 12px"
          />
          <el-button
            :icon="DocumentCopy"
            circle
            size="small"
            style="position: absolute; top: 8px; right: 8px"
            @click="handleCopySQL"
          />
        </div>
      </div>
    </template>
  </el-alert>
  <el-form-item label="JDBC 地址" prop="config.jdbcUrl">
    <el-input
      v-model="config.jdbcUrl"
      placeholder="请输入JDBC连接地址，如：jdbc:mysql://localhost:3306/iot_data"
    />
  </el-form-item>
  <el-form-item label="用户名" prop="config.username">
    <el-input v-model="config.username" placeholder="请输入数据库用户名" />
  </el-form-item>
  <el-form-item label="密码" prop="config.password">
    <el-input v-model="config.password" placeholder="请输入数据库密码" show-password type="password" />
  </el-form-item>
  <el-form-item label="目标表名" prop="config.tableName">
    <el-input v-model="config.tableName" placeholder="请输入目标表名，如：iot_device_message_sink" />
  </el-form-item>
</template>
<script lang="ts" setup>
import { DocumentCopy } from '@element-plus/icons-vue'
import { DatabaseConfig, IotDataSinkTypeEnum } from '@/api/iot/rule/data/sink'
import { useVModel } from '@vueuse/core'
import { isEmpty } from '@/utils/is'
import { useClipboard } from '@vueuse/core'

defineOptions({ name: 'DatabaseConfigForm' })

const props = defineProps<{
  modelValue: any
}>()
const emit = defineEmits(['update:modelValue'])
const config = useVModel(props, 'modelValue', emit) as Ref<DatabaseConfig>
const message = useMessage()

const createTableSQL = ref(`CREATE TABLE iot_device_message_sink (
    id VARCHAR(64) NOT NULL COMMENT '消息ID',
    device_id BIGINT NOT NULL COMMENT '设备编号',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户编号',
    method VARCHAR(128) COMMENT '请求方法',
    report_time DATETIME COMMENT '上报时间',
    data TEXT COMMENT '完整消息JSON',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id) USING BTREE,
    INDEX idx_create_time (create_time ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'IoT 设备消息流转目标表';`)

/** 复制建表 SQL */
const { copy } = useClipboard()
const handleCopySQL = async () => {
  await copy(createTableSQL.value)
  message.success('建表 SQL 已复制到剪贴板')
}

/** 组件初始化 */
onMounted(() => {
  if (!isEmpty(config.value)) {
    return
  }
  config.value = {
    type: IotDataSinkTypeEnum.DATABASE + '', // 序列化成对应类型时使用
    jdbcUrl: '',
    username: '',
    password: '',
    tableName: 'iot_device_message_sink'
  }
})
</script>
