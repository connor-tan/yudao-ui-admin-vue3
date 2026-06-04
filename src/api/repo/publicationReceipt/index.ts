import request from '@/config/axios'

export interface PublicationReceiptDemandVO {
  warehouseId?: number
  warehouseNameSnapshot?: string
  windowId?: number
  windowNameSnapshot?: string
  offerId?: number
  offerSkuId?: number
  spuId?: number
  skuId?: number
  productNameSnapshot?: string
  productSkuNameSnapshot?: string
  isbn?: string
  issueId?: number
  issueNo?: number
  issueName?: string
  demandCount?: number
  receivedCount?: number
  allocatedCount?: number
  availableCount?: number
  shortageCount?: number
  suggestExpectedCount?: number
  expectedCount?: number
}

export interface PublicationReceiptCreateReqVO {
  supplierId?: number
  warehouseId?: number
  remark?: string
  items: PublicationReceiptCreateItemReqVO[]
}

export interface PublicationReceiptCreateItemReqVO {
  windowId?: number
  offerId?: number
  offerSkuId?: number
  skuId?: number
  issueId?: number
  issueNo?: number
  expectedCount?: number
  remark?: string
}

export interface PublicationReceiptReceiveReqVO {
  receiptId?: number
  items: PublicationReceiptReceiveItemReqVO[]
}

export interface PublicationReceiptReceiveItemReqVO {
  receiptItemId?: number
  bundleCount?: number
  receivedCount?: number
  remark?: string
}

export interface PublicationReceiptVO {
  id?: number
  receiptNo?: string
  supplierId?: number
  supplierNameSnapshot?: string
  warehouseId?: number
  warehouseNameSnapshot?: string
  status?: number
  expectedCount?: number
  receivedCount?: number
  allocatedCount?: number
  submitTime?: string
  closeTime?: string
  closeReason?: string
  remark?: string
  createTime?: string
  items?: PublicationReceiptItemVO[]
}

export interface PublicationReceiptItemVO {
  id?: number
  windowId?: number
  windowNameSnapshot?: string
  offerId?: number
  offerSkuId?: number
  spuId?: number
  skuId?: number
  productNameSnapshot?: string
  productSkuNameSnapshot?: string
  isbn?: string
  issueId?: number
  issueNo?: number
  issueName?: string
  expectedCount?: number
  receivedCount?: number
  allocatedCount?: number
  availableCount?: number
  bundleCount?: number
  receiveCountInput?: number
  remark?: string
}

export const PublicationReceiptApi = {
  getDemandPage: async (params: any) => {
    return await request.get({ url: '/repo/publication-receipt/demand-page', params })
  },

  createReceipt: async (data: PublicationReceiptCreateReqVO) => {
    return await request.post<number>({ url: '/repo/publication-receipt/create', data })
  },

  submitReceipt: async (id: number) => {
    return await request.put({ url: '/repo/publication-receipt/submit', params: { id } })
  },

  receiveReceipt: async (data: PublicationReceiptReceiveReqVO) => {
    return await request.put({ url: '/repo/publication-receipt/receive', data })
  },

  closeReceipt: async (data: { id?: number; closeReason?: string }) => {
    return await request.put({ url: '/repo/publication-receipt/close', data })
  },

  getReceipt: async (id: number) => {
    return await request.get<PublicationReceiptVO>({ url: `/repo/publication-receipt/get?id=${id}` })
  },

  getReceiptPage: async (params: any) => {
    return await request.get({ url: '/repo/publication-receipt/page', params })
  }
}
