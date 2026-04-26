import request from '@/config/axios'

export interface SubscriptionPreviewSku {
  offerSkuId: number
  productSkuId: number
  productSkuName?: string
  decisionStatus?: string
  decisionStatusName?: string
  price?: number
  stock?: number
  targetPeriod?: string
  volumeLabel?: string
  editionLabel?: string
  isbn?: string
  applicableGradeCatalogIds?: number[]
  applicableGradeNames?: string[]
  reason?: string
  matchedRuleId?: number
  matchedRuleName?: string
  gradeApplicabilityOverride?: boolean
}

export interface SubscriptionPreviewOffer {
  offerId: number
  productSpuId: number
  productName?: string
  picUrl?: string
  visible?: boolean
  reason?: string
  reasonDesc?: string
  totalOfferSkuCount?: number
  candidateSkuCount?: number
  finalSkuCount?: number
  matchedRuleId?: number
  matchedRuleName?: string
  gradeApplicabilityOverride?: boolean
  finalSkus?: SubscriptionPreviewSku[]
  diagnosticSkus?: SubscriptionPreviewSku[]
}

export interface SubscriptionRulePreviewRespVO {
  window?: {
    id?: number
    name?: string
    targetYearNameSnapshot?: string
    targetPeriod?: string
  }
  student?: {
    studentId?: number
    studentName?: string
    schoolId?: number
    schoolName?: string
    classId?: number
    className?: string
    gradeCatalogId?: number
    gradeName?: string
    gradeResolveSource?: string
    blockedReason?: string
    blockedReasonDesc?: string
  }
  blockedReason?: string
  blockedReasonDesc?: string
  decisions?: SubscriptionPreviewOffer[]
}

export const SubscriptionPreviewApi = {
  previewStudent: async (params: { windowId?: number; studentId: number }) => {
    return await request.get({ url: '/subscription/preview/student', params })
  }
}
