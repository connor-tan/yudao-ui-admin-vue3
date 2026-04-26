import request from '@/config/axios'

export interface YearCatalog {
  id?: number
  yearStart?: number
  yearEnd?: number
  name?: string
  createTime?: string
}

export interface YearCatalogSimple {
  id: number
  yearStart: number
  yearEnd: number
  name: string
}

export const YearCatalogApi = {
  getYearCatalogPage: async (params: any) => {
    return await request.get({ url: '/edu/year-catalog/page', params })
  },

  getYearCatalog: async (id: number) => {
    return await request.get({ url: '/edu/year-catalog/get', params: { id } })
  },

  getYearCatalogSimpleList: async (): Promise<YearCatalogSimple[]> => {
    return await request.get({ url: '/edu/year-catalog/simple-list' })
  },

  createYearCatalog: async (data: YearCatalog) => {
    return await request.post({ url: '/edu/year-catalog/create', data })
  },

  updateYearCatalog: async (data: YearCatalog) => {
    return await request.put({ url: '/edu/year-catalog/update', data })
  },

  deleteYearCatalog: async (id: number) => {
    return await request.delete({ url: '/edu/year-catalog/delete', params: { id } })
  }
}
