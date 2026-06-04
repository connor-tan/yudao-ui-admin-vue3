import request from '@/config/axios'

export interface PublicationSkuVO {
  spuId?: number
  skuId?: number
  productName?: string
  productSkuName?: string
  isbn?: string
}

export interface SupplierPublicationSkuVO {
  id?: number
  supplierId?: number
  supplierName?: string
  spuId?: number
  skuId?: number
  productNameSnapshot?: string
  productSkuNameSnapshot?: string
  isbn?: string
  status?: number
  sort?: number
  remark?: string
  createTime?: string
}

export const SupplierPublicationSkuApi = {
  getSupplierPublicationSkuPage: async (params: any) => {
    return await request.get({ url: '/repo/supplier-publication-sku/page', params })
  },

  getPublicationSkuPage: async (params: any) => {
    return await request.get({ url: '/repo/supplier-publication-sku/publication-sku-page', params })
  },

  getSupplierPublicationSku: async (id: number) => {
    return await request.get<SupplierPublicationSkuVO>({
      url: `/repo/supplier-publication-sku/get?id=${id}`
    })
  },

  createSupplierPublicationSku: async (data: SupplierPublicationSkuVO) => {
    return await request.post({ url: '/repo/supplier-publication-sku/create', data })
  },

  updateSupplierPublicationSku: async (data: SupplierPublicationSkuVO) => {
    return await request.put({ url: '/repo/supplier-publication-sku/update', data })
  },

  deleteSupplierPublicationSku: async (id: number) => {
    return await request.delete({ url: `/repo/supplier-publication-sku/delete?id=${id}` })
  }
}
