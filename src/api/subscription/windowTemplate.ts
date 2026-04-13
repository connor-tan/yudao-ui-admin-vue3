import request from '@/config/axios'

export interface SubscriptionWindowTemplate {
  id?: number
  name: string
  targetPeriod: string
  gradeCalcRule: string
  gradeResolveMode: string
  description?: string
  status: number
  sort: number
  builtIn?: boolean
  remark?: string
  createTime?: string
}

export interface SubscriptionWindowTemplateSimple {
  id: number
  name: string
  targetPeriod: string
  gradeCalcRule: string
  gradeResolveMode: string
  description?: string
  status?: number
  builtIn?: boolean
}

export const SubscriptionWindowTemplateApi = {
  getWindowTemplatePage: async (params: any) => {
    return await request.get({ url: '/subscription/window-template/page', params })
  },

  getWindowTemplate: async (id: number) => {
    return await request.get({ url: '/subscription/window-template/get', params: { id } })
  },

  getWindowTemplateSimpleList: async () => {
    return await request.get({ url: '/subscription/window-template/simple-list' })
  },

  createWindowTemplate: async (data: SubscriptionWindowTemplate) => {
    return await request.post({ url: '/subscription/window-template/create', data })
  },

  updateWindowTemplate: async (data: SubscriptionWindowTemplate) => {
    return await request.put({ url: '/subscription/window-template/update', data })
  },

  updateWindowTemplateStatus: async (data: { id: number; status: number }) => {
    return await request.put({ url: '/subscription/window-template/update-status', data })
  },

  deleteWindowTemplate: async (id: number) => {
    return await request.delete({ url: '/subscription/window-template/delete', params: { id } })
  }
}
