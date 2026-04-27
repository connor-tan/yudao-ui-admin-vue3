import request from '@/config/axios'

export interface SubscriptionWindow {
  id?: number
  name?: string
  startTime?: string
  endTime?: string
  targetYearCatalogId?: number
  targetYearStart?: number
  targetYearEnd?: number
  targetYearNameSnapshot?: string
  targetPeriod?: string
  gradePolicyName?: string
  status?: number
  remark?: string
  createTime?: string
}

export interface SubscriptionWindowSimple {
  id: number
  targetYearCatalogId?: number
  name: string
  targetYearStart?: number
  targetYearEnd?: number
  targetYearNameSnapshot?: string
  targetPeriod?: string
  gradePolicyName?: string
  status?: number
}

export interface SubscriptionWindowEnablePrecheckRespVO {
  pass: boolean
  blockers: string[]
  warnings: string[]
}

export const SubscriptionWindowApi = {
  getWindowPage: async (params: any) => {
    return await request.get({ url: '/subscription/window/page', params })
  },

  getWindow: async (id: number) => {
    return await request.get({ url: '/subscription/window/get', params: { id } })
  },

  getWindowSimpleList: async () => {
    return await request.get({ url: '/subscription/window/page', params: { pageNo: 1, pageSize: 200 } })
  },

  createWindow: async (data: SubscriptionWindow) => {
    return await request.post({ url: '/subscription/window/create', data })
  },

  updateWindow: async (data: SubscriptionWindow) => {
    return await request.put({ url: '/subscription/window/update', data })
  },

  precheckEnableWindow: async (_id: number) => {
    return { pass: true, blockers: [], warnings: [] }
  },

  updateWindowStatus: async (data: { id: number; status: number; confirmWarnings?: boolean }) => {
    return await request.put({ url: '/subscription/window/update-status', data })
  },

  deleteWindow: async (id: number) => {
    return await request.delete({ url: '/subscription/window/delete', params: { id } })
  }
}
