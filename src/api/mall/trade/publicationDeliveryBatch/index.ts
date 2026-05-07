import request from '@/config/axios'

export interface PublicationDeliveryCandidatePageReqVO {
  pageNo?: number
  pageSize?: number
  schoolId?: number
  stationId?: number
  windowId?: number
  offerId?: number
  offerSkuId?: number
  skuId?: number
}

export interface PublicationDeliveryCandidateRespVO {
  schoolId?: number
  schoolNameSnapshot?: string
  stationId?: number
  stationNameSnapshot?: string
  windowId?: number
  windowNameSnapshot?: string
  offerId?: number
  offerSkuId?: number
  skuId?: number
  productNameSnapshot?: string
  targetPeriod?: string
  totalCount?: number
  orderCount?: number
  studentCount?: number
}

export interface PublicationDeliveryBatchCreateReqVO {
  schoolId: number
  stationId: number
  windowId: number
  offerId: number
  offerSkuId: number
  skuId: number
  remark?: string
}

export interface PublicationDeliveryBatchPageReqVO {
  pageNo?: number
  pageSize?: number
  batchNo?: string
  schoolId?: number
  stationId?: number
  windowId?: number
  offerId?: number
  offerSkuId?: number
  skuId?: number
  status?: number
  deliveryTime?: string[]
}

export interface PublicationDeliveryBatchRespVO {
  id?: number
  batchNo?: string
  schoolId?: number
  schoolNameSnapshot?: string
  stationId?: number
  stationNameSnapshot?: string
  windowId?: number
  windowNameSnapshot?: string
  offerId?: number
  offerSkuId?: number
  skuId?: number
  productNameSnapshot?: string
  targetPeriod?: string
  totalCount?: number
  orderCount?: number
  studentCount?: number
  status?: number
  deliveryTime?: string
  operatorUserId?: number
  remark?: string
  createTime?: string
  items?: PublicationDeliveryBatchItemRespVO[]
}

export interface PublicationDeliveryBatchItemRespVO {
  id?: number
  batchId?: number
  orderId?: number
  orderNo?: string
  orderItemId?: number
  deliveryId?: number
  userId?: number
  count?: number
  studentId?: number
  studentNameSnapshot?: string
  classId?: number
  classNameSnapshot?: string
}

export const PublicationDeliveryBatchApi = {
  getCandidatePage: async (params: PublicationDeliveryCandidatePageReqVO) => {
    return await request.get({ url: '/trade/publication-delivery-batch/candidate-page', params })
  },

  createAndDeliver: async (data: PublicationDeliveryBatchCreateReqVO) => {
    return await request.post<number>({
      url: '/trade/publication-delivery-batch/create-and-deliver',
      data
    })
  },

  getBatchPage: async (params: PublicationDeliveryBatchPageReqVO) => {
    return await request.get({ url: '/trade/publication-delivery-batch/page', params })
  },

  getBatch: async (id: number) => {
    return await request.get<PublicationDeliveryBatchRespVO>({
      url: '/trade/publication-delivery-batch/get',
      params: { id }
    })
  }
}
