import request from '@/config/axios'

export interface SubscriptionWindow {
  id?: number
  name?: string
  startTime?: string
  endTime?: string
  targetYearStart?: number
  targetYearEnd?: number
  targetYearName?: string
  templateId?: number
  templateNameSnapshot?: string
  targetPeriod?: string
  gradeCalcRule?: string
  gradeResolveMode?: string
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
  gradeResolveMode?: string
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
    return await request.get({ url: '/subscription/window/simple-list' })
  },

  createWindow: async (data: SubscriptionWindow) => {
    return await request.post({ url: '/subscription/window/create', data })
  },

  updateWindow: async (data: SubscriptionWindow) => {
    return await request.put({ url: '/subscription/window/update', data })
  },

  precheckEnableWindow: async (id: number) => {
    return await request.get({ url: '/subscription/window/precheck-enable', params: { id } })
  },

  updateWindowStatus: async (data: { id: number; status: number; confirmWarnings?: boolean }) => {
    return await request.put({ url: '/subscription/window/update-status', data })
  }
}
