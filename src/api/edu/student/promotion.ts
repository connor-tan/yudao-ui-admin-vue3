import request from '@/config/axios'

export interface StudentPromotionAdjustment {
  studentId: number
  action?: string
  targetClassId?: number
}

export interface StudentPromotionReqVO {
  schoolId?: number
  fromSchoolYearId?: number
  toSchoolYearId?: number
  autoCreateClass?: boolean
  graduateTerminalStudent?: boolean
  remark?: string
  adjustments?: StudentPromotionAdjustment[]
}

export interface StudentPromotionSummary {
  totalCount: number
  promotedCount: number
  pendingAdvanceCount: number
  repeatCount: number
  skippedCount: number
  missingTargetClassCount: number
}

export interface StudentPromotionItem {
  studentId: number
  studentName: string
  entryYear: number
  fromClassId?: number
  fromSchoolGradeId?: number
  fromClassName?: string
  fromGradeName?: string
  fromGradeAliasName?: string
  toClassId?: number
  toSchoolGradeId?: number
  toClassName?: string
  toGradeName?: string
  toGradeAliasName?: string
  targetClassMissing: boolean
  action: string
  reason?: string
}

export interface StudentPromotionPreviewRespVO {
  summary: StudentPromotionSummary
  items: StudentPromotionItem[]
}

export interface StudentPromotionExecuteRespVO {
  batchId: number
  summary: StudentPromotionSummary
}

export interface StudentPromotionYearOption {
  yearStart: number
  yearEnd: number
  name: string
}

export interface StudentGlobalPromotionReqVO {
  fromYearStart?: number
  toYearStart?: number
  scopeType?: string
  schoolIds?: number[]
  areaId?: number
  autoCreateClass?: boolean
  graduateTerminalStudent?: boolean
  remark?: string
  adjustments?: StudentPromotionAdjustment[]
}

export interface StudentGlobalPromotionSummary {
  totalSchoolCount: number
  readySchoolCount: number
  skippedSchoolCount: number
  failedSchoolCount: number
  totalCount: number
  promotedCount: number
  pendingAdvanceCount: number
  repeatCount: number
  skippedCount: number
  missingTargetClassCount: number
}

export interface StudentGlobalPromotionSchool {
  schoolId: number
  schoolName: string
  fromSchoolYearId?: number
  toSchoolYearId?: number
  batchId?: number
  status: string
  reason?: string
  totalCount: number
  promotedCount: number
  pendingAdvanceCount: number
  repeatCount: number
  skippedCount: number
  missingTargetClassCount: number
}

export interface StudentGlobalPromotionItem {
  schoolId: number
  schoolName: string
  studentId: number
  studentName: string
  entryYear: number
  fromSchoolGradeId?: number
  fromClassName?: string
  fromGradeName?: string
  fromGradeAliasName?: string
  toSchoolGradeId?: number
  toClassId?: number
  toClassName?: string
  toGradeName?: string
  toGradeAliasName?: string
  targetClassMissing: boolean
  action: string
  reason?: string
}

export interface StudentGlobalPromotionPreviewRespVO {
  summary: StudentGlobalPromotionSummary
  schools: StudentGlobalPromotionSchool[]
  items: StudentGlobalPromotionItem[]
}

export interface StudentGlobalPromotionExecuteRespVO {
  taskId: number
  summary: StudentGlobalPromotionSummary
  schools: StudentGlobalPromotionSchool[]
}

export interface StudentPromotionTask {
  id: number
  fromYearStart: number
  toYearStart: number
  scopeType: string
  autoCreateClass: boolean
  graduateTerminalStudent: boolean
  totalSchoolCount: number
  successSchoolCount: number
  skippedSchoolCount: number
  failedSchoolCount: number
  totalCount: number
  promotedCount: number
  repeatCount: number
  pendingAdvanceCount: number
  skippedCount: number
  status: number
  rollbackable: boolean
  remark?: string
  createTime?: string
}

export interface StudentPromotionBatch {
  id: number
  schoolId: number
  schoolName?: string
  fromSchoolYearId?: number
  fromSchoolYearName?: string
  toSchoolYearId?: number
  toSchoolYearName?: string
  totalCount: number
  promotedCount: number
  repeatCount: number
  pendingAdvanceCount: number
  skippedCount: number
  status: number
  reason?: string
  remark?: string
  createTime?: string
}

export interface StudentFlow {
  id: number
  taskId?: number
  batchId?: number
  studentId: number
  studentName?: string
  fromClassId?: number
  fromClassName?: string
  toClassId?: number
  toClassName?: string
  changeType: string
  effectiveDate?: string
  status: number
  targetClassCreated?: boolean
  remark?: string
  createTime?: string
}

export interface StudentGlobalPromotionRollbackReqVO {
  taskId: number
  remark?: string
}

export interface StudentGlobalPromotionRollbackRespVO {
  taskId: number
  rolledBackSchoolCount: number
  rolledBackStudentCount: number
}

export const PROMOTION_ACTION_LABELS: Record<string, string> = {
  PROMOTE: '升班',
  REPEAT: '留级',
  PENDING_ADVANCE: '待升学',
  GRADUATE: '毕业',
  SKIP: '跳过'
}

export const PROMOTION_REASON_LABELS: Record<string, string> = {
  READY: '目标班级已存在',
  MANUAL_TARGET_CLASS: '已按人工指定目标班级',
  MANUAL_REPEAT: '已按人工指定留级班级',
  TARGET_CLASS_AUTO_CREATE: '目标班级不存在，将自动创建',
  TARGET_CLASS_NOT_FOUND: '目标班级不存在',
  TERMINAL_GRADE_PENDING_ADVANCE: '已处于末级，转待升学',
  TERMINAL_GRADE_GRADUATE: '已处于末级，执行毕业',
  TERMINAL_GRADE_SKIP: '已处于末级，未开启自动转待升学',
  GRADE_SEQUENCE_GAP: '学校年级配置不完整，无法推导下一年级',
  MULTI_CURRENT_CLASS: '学生存在多条当前班级记录',
  STUDENT_NOT_READING: '学生当前不是在读状态'
}

export const GLOBAL_PROMOTION_SCHOOL_STATUS_LABELS: Record<string, string> = {
  READY: '待执行',
  SKIP: '跳过',
  SUCCESS: '执行成功',
  FAILED: '执行失败'
}

export const PROMOTION_SCOPE_TYPE_LABELS: Record<string, string> = {
  ALL: '全部学校',
  SCHOOL: '指定学校',
  AREA: '按地区筛学校'
}

export const PROMOTION_TASK_STATUS_LABELS: Record<number, string> = {
  0: '执行中',
  1: '执行成功',
  2: '部分成功',
  3: '执行失败',
  4: '已回滚'
}

export const PROMOTION_BATCH_STATUS_LABELS: Record<number, string> = {
  1: '执行成功',
  2: '跳过',
  3: '执行失败',
  4: '已回滚'
}

export const PROMOTION_FLOW_TYPE_LABELS: Record<string, string> = {
  ENROLL: '入学',
  PROMOTE: '升班',
  TRANSFER: '转班',
  REPEAT: '留级',
  PENDING_ADVANCE: '待升学',
  GRADUATE: '毕业'
}

export const PROMOTION_FLOW_STATUS_LABELS: Record<number, string> = {
  1: '有效',
  2: '已回滚'
}

export const GLOBAL_PROMOTION_SCHOOL_REASON_LABELS: Record<string, string> = {
  SOURCE_SCHOOL_YEAR_NOT_FOUND: '学校缺少来源学年',
  TARGET_SCHOOL_YEAR_NOT_FOUND: '学校缺少目标学年',
  NO_ELIGIBLE_STUDENTS: '没有符合升班条件的学生'
}

export const StudentPromotionApi = {
  preview: async (data: StudentPromotionReqVO) => {
    return await request.post<StudentPromotionPreviewRespVO>({ url: '/edu/student/promotion/preview', data })
  },

  execute: async (data: StudentPromotionReqVO) => {
    return await request.post<StudentPromotionExecuteRespVO>({ url: '/edu/student/promotion/execute', data })
  },

  getYearOptions: async () => {
    return await request.get<StudentPromotionYearOption[]>({ url: '/edu/student/promotion/year-options' })
  },

  getTaskPage: async (params: any) => {
    return await request.get({ url: '/edu/student/promotion/task/page', params })
  },

  getTaskBatchList: async (taskId: number) => {
    return await request.get<StudentPromotionBatch[]>({
      url: '/edu/student/promotion/task-batch/list',
      params: { taskId }
    })
  },

  getFlowPage: async (params: any) => {
    return await request.get({ url: '/edu/student/promotion/flow/page', params })
  },

  previewGlobal: async (data: StudentGlobalPromotionReqVO) => {
    return await request.post<StudentGlobalPromotionPreviewRespVO>({
      url: '/edu/student/promotion/global-preview',
      data
    })
  },

  executeGlobal: async (data: StudentGlobalPromotionReqVO) => {
    return await request.post<StudentGlobalPromotionExecuteRespVO>({
      url: '/edu/student/promotion/global-execute',
      data
    })
  },

  rollbackGlobal: async (data: StudentGlobalPromotionRollbackReqVO) => {
    return await request.post<StudentGlobalPromotionRollbackRespVO>({
      url: '/edu/student/promotion/global-rollback',
      data
    })
  }
}
