import request from '@/config/axios'

export interface SubscriptionOffer {
  id?: number
  windowId?: number
  productSpuId?: number
  productName?: string
  categoryId?: number
  categoryName?: string
  picUrl?: string
  price?: number
  publisherId?: number
  publisherName?: string
  publicationTypeId?: number
  publicationTypeName?: string
  recommendFlag?: boolean
  sort?: number
  status?: number
  remark?: string
  gradeCatalogIds?: number[]
  gradeNames?: string[]
  enabledSkuCount?: number
  totalSkuCount?: number
  publication?: any
  createTime?: string
}

export interface SubscriptionOfferAvailable {
  productSpuId: number
  productName?: string
  categoryId?: number
  categoryName?: string
  picUrl?: string
  price?: number
  stock?: number
  publisherId?: number
  publisherName?: string
  publicationTypeId?: number
  publicationTypeName?: string
  issueCycle?: string
  added?: boolean
  matchedSkuCount?: number
  totalSkuCount?: number
  matchedGradeCatalogIds?: number[]
  matchedGradeNames?: string[]
  candidateStatus?: string
  disabledReason?: string
}

export interface SubscriptionOfferAvailablePageReq {
  windowId: number
  pageNo?: number
  pageSize?: number
  productName?: string
  categoryId?: number
  publisherId?: number
  publicationTypeId?: number
  issueCycle?: string
  gradeCatalogId?: number
  candidateStatus?: string
}

export interface SubscriptionOfferBatchCreateResp {
  createdOfferCount: number
  createdOfferSkuCount: number
  skippedCount: number
  createdOfferIds: number[]
  skippedItems: Array<{
    productSpuId?: number
    productName?: string
    reason?: string
  }>
}

export const SubscriptionOfferApi = {
  getOfferPage: async (params: any) => {
    return await request.get({ url: '/subscription/offer/page', params })
  },

  getAvailablePage: async (params: SubscriptionOfferAvailablePageReq) => {
    return await request.get({ url: '/subscription/offer/available-page', params })
  },

  getOffer: async (id: number) => {
    return await request.get({ url: '/subscription/offer/get', params: { id } })
  },

  batchCreateOffer: async (data: {
    windowId: number
    productSpuIds: number[]
  }): Promise<SubscriptionOfferBatchCreateResp> => {
    return await request.post({ url: '/subscription/offer/batch-create', data })
  },

  batchCreateByQuery: async (data: {
    windowId: number
    query: SubscriptionOfferAvailablePageReq
  }): Promise<SubscriptionOfferBatchCreateResp> => {
    return await request.post({ url: '/subscription/offer/batch-create-by-query', data })
  },

  updateOffer: async (data: SubscriptionOffer) => {
    return await request.put({ url: '/subscription/offer/update', data })
  },

  deleteOffer: async (id: number) => {
    return await request.delete({ url: '/subscription/offer/delete', params: { id } })
  }
}
