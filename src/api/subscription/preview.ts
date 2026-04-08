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
  publications?: Array<{
    windowSpuId: number
    productSpuId: number
    productName: string
    picUrl?: string
    categoryId?: number
    categoryName?: string
    publicationTitleName?: string
    recommendFlag?: boolean
    skus: Array<{
      windowSkuId: number
      productSkuId: number
      volumeLabel?: string
      editionLabel?: string
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
