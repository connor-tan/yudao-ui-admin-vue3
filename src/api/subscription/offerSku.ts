import request from '@/config/axios'

export interface SubscriptionOfferSku {
  id?: number
  offerId?: number
  productSkuId?: number
  productSkuName?: string
  price?: number
  stock?: number
  targetPeriod?: string
  volumeLabel?: string
  editionLabel?: string
  isbn?: string
  applicableGradeCatalogIds?: number[]
  applicableGradeNames?: string[]
  sort?: number
  status?: number
  maxQuantityPerStudent?: number
  remark?: string
  createTime?: string
}

export const SubscriptionOfferSkuApi = {
  getOfferSkuList: async (offerId: number) => {
    return await request.get({ url: '/subscription/offer-sku/list', params: { offerId } })
  },

  syncOfferSku: async (offerId: number) => {
    return await request.post({ url: '/subscription/offer-sku/sync', params: { offerId } })
  },

  createOfferSku: async (data: SubscriptionOfferSku) => {
    return await request.post({ url: '/subscription/offer-sku/create', data })
  },

  updateOfferSku: async (data: SubscriptionOfferSku) => {
    return await request.put({ url: '/subscription/offer-sku/update', data })
  },

  batchUpdateOfferSku: async (data: { offerId: number; skus: SubscriptionOfferSku[] }) => {
    return await request.put({ url: '/subscription/offer-sku/batch-update', data })
  },

  deleteOfferSku: async (id: number) => {
    return await request.delete({ url: '/subscription/offer-sku/delete', params: { id } })
  }
}
