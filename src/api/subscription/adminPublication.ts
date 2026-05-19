import request from '@/config/axios'

export interface AdminSubscriptionPublicationRespVO {
  window?: {
    id?: number
    name?: string
    targetYearCatalogId?: number
    targetYearNameSnapshot?: string
    targetYearStart?: number
    targetYearEnd?: number
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
    blockedReason?: string
    blockedReasonDesc?: string
  }
  blockedReason?: string
  blockedReasonDesc?: string
  offers?: AdminSubscriptionPublicationOffer[]
}

export interface AdminSubscriptionPublicationOffer {
  offerId?: number
  productSpuId?: number
  productName?: string
  picUrl?: string
  visible?: boolean
  reason?: string
  reasonDesc?: string
  purchasable?: boolean
  purchaseUnavailableReasonDesc?: string
  finalSkus?: AdminSubscriptionPublicationOfferSku[]
}

export interface AdminSubscriptionPublicationOfferSku {
  offerSkuId?: number
  productSkuId?: number
  productSkuName?: string
  price?: number
  stock?: number
  purchasable?: boolean
  maxQuantityPerStudent?: number
  orderedQuantity?: number
  remainingQuantity?: number
  purchaseUnavailableReasonDesc?: string
  isbn?: string
  applicableGradeNames?: string[]
  reason?: string
  matchedRuleId?: number
  matchedRuleName?: string
  gradeApplicabilityOverride?: boolean
}

export const AdminSubscriptionPublicationApi = {
  getPublicationList: async (studentId: number) => {
    return await request.get<AdminSubscriptionPublicationRespVO>({
      url: '/subscription/admin/publication/list',
      params: { studentId }
    })
  }
}
