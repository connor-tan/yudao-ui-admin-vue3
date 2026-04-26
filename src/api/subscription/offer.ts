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

export const SubscriptionOfferApi = {
  getOfferPage: async (params: any) => {
    return await request.get({ url: '/subscription/offer/page', params })
  },

  getOffer: async (id: number) => {
    return await request.get({ url: '/subscription/offer/get', params: { id } })
  },

  batchCreateOffer: async (data: { windowId: number; productSpuIds: number[] }) => {
    return await request.post({ url: '/subscription/offer/batch-create', data })
  },

  updateOffer: async (data: SubscriptionOffer) => {
    return await request.put({ url: '/subscription/offer/update', data })
  },

  deleteOffer: async (id: number) => {
    return await request.delete({ url: '/subscription/offer/delete', params: { id } })
  }
}
