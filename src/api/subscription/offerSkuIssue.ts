import request from '@/config/axios'

export interface SubscriptionOfferSkuIssue {
  id?: number
  offerId?: number
  offerSkuId?: number
  issueNo?: number
  issueName?: string
  plannedPublishDate?: string
  plannedDeliveryDate?: string
  sort?: number
  status?: number
  remark?: string
  createTime?: string
}

export interface SubscriptionOfferSkuIssueGenerateReqVO {
  offerSkuId?: number
  startIssueNo?: number
  issueCount?: number
  issueNamePrefix?: string
  firstPublishDate?: string
  publishIntervalDays?: number
  firstDeliveryDate?: string
  deliveryIntervalDays?: number
}

export const SubscriptionOfferSkuIssueApi = {
  getIssueList: async (offerSkuId: number) => {
    return await request.get<SubscriptionOfferSkuIssue[]>({
      url: '/subscription/offer-sku-issue/list',
      params: { offerSkuId }
    })
  },

  createIssue: async (data: SubscriptionOfferSkuIssue) => {
    return await request.post<number>({ url: '/subscription/offer-sku-issue/create', data })
  },

  updateIssue: async (data: SubscriptionOfferSkuIssue) => {
    return await request.put<boolean>({ url: '/subscription/offer-sku-issue/update', data })
  },

  generateIssues: async (data: SubscriptionOfferSkuIssueGenerateReqVO) => {
    return await request.post<number>({ url: '/subscription/offer-sku-issue/generate', data })
  },

  deleteIssue: async (id: number) => {
    return await request.delete<boolean>({
      url: '/subscription/offer-sku-issue/delete',
      params: { id }
    })
  }
}
