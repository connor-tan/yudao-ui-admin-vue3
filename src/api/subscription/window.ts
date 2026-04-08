import request from '@/config/axios'

export interface SubscriptionWindow {
  id?: number
  name?: string
  startTime?: string | number
  endTime?: string | number
  targetYearStart?: number
  targetYearEnd?: number
  targetYearName?: string
  templateId?: number
  templateNameSnapshot?: string
  targetPeriod?: string
  gradeCalcRule?: string
  templateLocked?: boolean
  status?: number
  remark?: string
  createTime?: string
}

export interface SubscriptionWindowSimple {
  id: number
  name: string
  targetYearStart?: number
  targetYearEnd?: number
  targetYearName?: string
  templateId?: number
  templateNameSnapshot?: string
  targetPeriod?: string
  gradeCalcRule?: string
  status?: number
}

export const SubscriptionWindowApi = {
  getWindowPage: async (params: any) => {
    return await request.get({ url: '/subscription/window/page', params })
  },

  getWindow: async (id: number) => {
    return await request.get({ url: '/subscription/window/get', params: { id } })
  },

  getWindowSimpleList: async () => {
    return await request.get({ url: '/subscription/window/simple-list' })
  },

  createWindow: async (data: SubscriptionWindow) => {
    return await request.post({ url: '/subscription/window/create', data })
  },

  updateWindow: async (data: SubscriptionWindow) => {
    return await request.put({ url: '/subscription/window/update', data })
  },

  updateWindowStatus: async (data: { id: number; status: number }) => {
    return await request.put({ url: '/subscription/window/update-status', data })
  }
}
