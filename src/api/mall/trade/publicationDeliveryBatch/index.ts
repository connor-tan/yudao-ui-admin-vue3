import request from '@/config/axios'

export interface PublicationDeliveryCandidatePageReqVO {
  pageNo?: number
  pageSize?: number
  deliveryType?: number
  schoolId?: number
  warehouseId?: number
  windowId?: number
  offerId?: number
  offerSkuId?: number
  skuId?: number
  issueId?: number
  issueNo?: number
}

export interface PublicationDeliveryCandidateRespVO {
  deliveryType?: number
  schoolId?: number
  schoolNameSnapshot?: string
  warehouseId?: number
  warehouseNameSnapshot?: string
  windowId?: number
  windowNameSnapshot?: string
  offerId?: number
  offerSkuId?: number
  skuId?: number
  productNameSnapshot?: string
  productSkuName?: string
  volumeLabel?: string
  editionLabel?: string
  isbn?: string
  issueId?: number
  issueNo?: number
  issueName?: string
  plannedDeliveryDate?: string
  totalCount?: number
  orderCount?: number
  studentCount?: number
}

export interface PublicationDeliveryBatchCreateReqVO {
  deliveryType: number
  schoolId: number
  warehouseId?: number
  windowId: number
  offerId: number
  offerSkuId: number
  skuId: number
  issueId?: number
  issueNo: number
  expressItems?: PublicationDeliveryBatchExpressItemReqVO[]
  remark?: string
}

export interface PublicationDeliveryBatchExpressItemReqVO {
  orderIssueId: number
  logisticsId: number
  logisticsNo: string
}

export interface PublicationDeliveryBatchPageReqVO {
  pageNo?: number
  pageSize?: number
  batchNo?: string
  deliveryType?: number
  schoolId?: number
  warehouseId?: number
  windowId?: number
  offerId?: number
  offerSkuId?: number
  skuId?: number
  issueId?: number
  issueNo?: number
  status?: number
  deliveryTime?: string[]
}

export interface PublicationDeliveryBatchRespVO {
  id?: number
  batchNo?: string
  deliveryType?: number
  schoolId?: number
  schoolNameSnapshot?: string
  warehouseId?: number
  warehouseNameSnapshot?: string
  windowId?: number
  windowNameSnapshot?: string
  offerId?: number
  offerSkuId?: number
  skuId?: number
  productNameSnapshot?: string
  issueId?: number
  issueNo?: number
  issueName?: string
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
  orderIssueId?: number
  deliveryId?: number
  userId?: number
  count?: number
  issueNo?: number
  issueName?: string
  logisticsId?: number
  logisticsNo?: string
  studentId?: number
  studentNameSnapshot?: string
  classId?: number
  classNameSnapshot?: string
}

export interface PublicationDeliveryCandidateItemRespVO {
  orderIssueId?: number
  orderId?: number
  orderNo?: string
  orderItemId?: number
  deliveryId?: number
  userId?: number
  deliveryType?: number
  count?: number
  schoolId?: number
  schoolNameSnapshot?: string
  warehouseId?: number
  warehouseNameSnapshot?: string
  windowId?: number
  windowNameSnapshot?: string
  offerId?: number
  offerSkuId?: number
  skuId?: number
  productNameSnapshot?: string
  studentId?: number
  studentNameSnapshot?: string
  classId?: number
  classNameSnapshot?: string
  issueId?: number
  issueNo?: number
  issueName?: string
  plannedDeliveryDate?: string
  logisticsId?: number
  logisticsNo?: string
}

export const PublicationDeliveryBatchApi = {
  getCandidatePage: async (params: PublicationDeliveryCandidatePageReqVO) => {
    return await request.get({ url: '/trade/publication-delivery-batch/candidate-page', params })
  },

  getCandidateItemList: async (params: PublicationDeliveryCandidatePageReqVO) => {
    return await request.get<PublicationDeliveryCandidateItemRespVO[]>({
      url: '/trade/publication-delivery-batch/candidate-item-list',
      params
    })
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
