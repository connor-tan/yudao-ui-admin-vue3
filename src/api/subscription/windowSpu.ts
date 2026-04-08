import request from '@/config/axios'
import qs from 'qs'

export interface SubscriptionWindowSpu {
  id: number
  windowId: number
  productSpuId: number
  productName: string
  categoryId?: number
  categoryName?: string
  picUrl?: string
  price?: number
  publicationTitleId?: number
  publicationTitleName?: string
  publicationTypeId?: number
  publicationTypeName?: string
  publisherId?: number
  publisherName?: string
  recommendFlag: boolean
  sort: number
  remark?: string
  gradeCatalogIds: number[]
  gradeNames?: string
  enabledSkuCount?: number
  totalSkuCount?: number
  createTime?: string
}

export interface SubscriptionWindowSpuAvailable {
  productSpuId: number
  productName: string
  categoryId?: number
  categoryName?: string
  picUrl?: string
  price?: number
  publicationTitleId?: number
  publicationTitleName?: string
  publicationTypeId?: number
  publicationTypeName?: string
  publisherId?: number
  publisherName?: string
  applicableGradeNames?: string
  matchedGradeCatalogIds?: number[]
  matchedGradeNames?: string
}

export interface SubscriptionWindowSpuBatchCreateReqVO {
  windowId: number
  baseGradeCatalogIds: number[]
  productSpuIds: number[]
}

export interface SubscriptionWindowSpuBatchCreateRespVO {
  createdWindowSpuCount: number
  createdGradeCount: number
  skippedCount: number
  skippedItems: Array<{
    productSpuId: number
    productName: string
    skippedGradeCatalogIds?: number[]
    skippedGradeNames?: string
    reason: string
  }>
}

export interface SubscriptionWindowSpuSaveReqVO {
  id: number
  recommendFlag: boolean
  sort: number
  gradeCatalogIds: number[]
  remark?: string
}

export const SubscriptionWindowSpuApi = {
  getWindowSpuPage: async (params: any) => {
    return await request.get({ url: '/subscription/window-spu/page', params })
  },

  getAvailablePage: async (params: any) => {
    return await request.get({
      url: '/subscription/window-spu/available-page',
      params,
      paramsSerializer: (requestParams) => qs.stringify(requestParams, { allowDots: true, indices: false })
    })
  },

  batchCreate: async (data: SubscriptionWindowSpuBatchCreateReqVO) => {
    return await request.post({ url: '/subscription/window-spu/batch-create', data })
  },

  updateWindowSpu: async (data: SubscriptionWindowSpuSaveReqVO) => {
    return await request.put({ url: '/subscription/window-spu/update', data })
  },

  deleteWindowSpu: async (id: number) => {
    return await request.delete({ url: '/subscription/window-spu/delete', params: { id } })
  }
}
