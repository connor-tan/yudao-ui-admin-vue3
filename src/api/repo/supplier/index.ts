import request from '@/config/axios'

export interface SupplierVO {
  id?: number
  name?: string
  code?: string
  contactName?: string
  contactMobile?: string
  address?: string
  sort?: number
  status?: number
  remark?: string
  createTime?: string
}

export const SupplierApi = {
  getSupplierPage: async (params: any) => {
    return await request.get({ url: '/repo/supplier/page', params })
  },

  getSupplierSimpleList: async () => {
    return await request.get<SupplierVO[]>({ url: '/repo/supplier/simple-list' })
  },

  getSupplier: async (id: number) => {
    return await request.get<SupplierVO>({ url: `/repo/supplier/get?id=${id}` })
  },

  createSupplier: async (data: SupplierVO) => {
    return await request.post({ url: '/repo/supplier/create', data })
  },

  updateSupplier: async (data: SupplierVO) => {
    return await request.put({ url: '/repo/supplier/update', data })
  },

  deleteSupplier: async (id: number) => {
    return await request.delete({ url: `/repo/supplier/delete?id=${id}` })
  },

  exportSupplier: async (params: any) => {
    return await request.download({ url: '/repo/supplier/export-excel', params })
  }
}
