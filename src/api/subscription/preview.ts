import request from '@/config/axios'

export interface SubscriptionRulePreviewRespVO {
  studentId?: number
  studentName?: string
  schoolId?: number
  schoolName?: string
  effectiveGradeCatalogId?: number
  effectiveGradeNo?: string
  effectiveGradeName?: string
  effectiveGradeAliasName?: string
  blockedReason?: string
  diagnostics?: Array<{
    windowSpuId: number
    productSpuId: number
    productName?: string
    visible?: boolean
    reason?: string
    reasonDesc?: string
    gradeApplicabilityOverride?: boolean
    enabledSkuCount?: number
    totalSkuCount?: number
    windowTargetPeriod?: string
    enabledPeriodMismatchedSkuCount?: number
    matchedRule?: {
      id?: number
      effectType?: string
      scopeType?: string
      schoolId?: number
      gradeCatalogId?: number
    }
  }>
  publications?: Array<{
    windowSpuId: number
    productSpuId: number
    productName: string
    picUrl?: string
    categoryId?: number
    categoryName?: string
    publicationTitleName?: string
    recommendFlag?: boolean
    visibilityReason?: string
    visibilityReasonDesc?: string
    gradeApplicabilityOverride?: boolean
    matchedRule?: {
      id?: number
      effectType?: string
      scopeType?: string
      schoolId?: number
      gradeCatalogId?: number
    }
    skus: Array<{
      windowSkuId: number
      productSkuId: number
      volumeLabel?: string
      editionLabel?: string
      targetPeriod?: string
      isbn?: string
      price?: number
      stock?: number
      maxQuantityPerStudent?: number
    }>
  }>
}

export const SubscriptionPreviewApi = {
  execute: async (data: { windowId: number; studentId: number }) => {
    return await request.post({ url: '/subscription/preview/execute', data })
  }
}
