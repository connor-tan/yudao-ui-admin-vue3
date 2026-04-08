import request from '@/config/axios'

export interface SubscriptionWindowSku {
  id: number
  windowSpuId: number
  productSkuId: number
  status: number
  sort: number
  maxQuantityPerStudent: number
  remark?: string
  price?: number
  stock?: number
  volumeLabel?: string
  editionLabel?: string
  isbn?: string
}

export interface SubscriptionWindowSkuBatchUpdateReqVO {
  windowSpuId: number
  items: Array<{
    id: number
    status: number
    sort: number
    maxQuantityPerStudent: number
    remark?: string
  }>
}

export const SubscriptionWindowSkuApi = {
  getListByWindowSpu: async (windowSpuId: number) => {
    return await request.get({ url: '/subscription/window-sku/list-by-window-spu', params: { windowSpuId } })
  },

  batchUpdate: async (data: SubscriptionWindowSkuBatchUpdateReqVO) => {
    return await request.put({ url: '/subscription/window-sku/batch-update', data })
  }
}
