import request from '@/config/axios'

export interface Station {
  id?: number
  stationName?: string
  areaId?: number
  areaName?: string
  contactName?: string
  contactMobile?: string
  stationAddress?: string
  sort?: number
  status?: number
  remark?: string
  schoolCount?: number
  createTime?: string
}

export interface StationSimple {
  id: number
  stationName: string
  areaId: number
  areaName?: string
}

export const StationApi = {
  getStationPage: async (params: any) => {
    return await request.get({ url: `/edu/station/page`, params })
  },

  getStation: async (id: number) => {
    return await request.get({ url: `/edu/station/get?id=${id}` })
  },

  getStationSimpleList: async () => {
    return await request.get({ url: `/edu/station/simple-list` })
  },

  createStation: async (data: Station) => {
    return await request.post({ url: `/edu/station/create`, data })
  },

  updateStation: async (data: Station) => {
    return await request.put({ url: `/edu/station/update`, data })
  },

  deleteStation: async (id: number) => {
    return await request.delete({ url: `/edu/station/delete?id=${id}` })
  }
}
