import request from '@/config/axios'

export interface SubscriptionRuleCondition {
  id?: number
  factor?: string
  operator?: string
  value?: string
  valueName?: string
}

export interface SubscriptionRule {
  id?: number
  windowId?: number
  offerId?: number
  offerProductName?: string
  name?: string
  effectType?: string
  allowGradeOverride?: boolean
  status?: number
  remark?: string
  conditions?: SubscriptionRuleCondition[]
  createTime?: string
}

export type SubscriptionRuleScope = 'WINDOW' | 'OFFER'

export const SubscriptionRuleApi = {
  getRulePage: async (params: any) => {
    return await request.get({ url: '/subscription/rule/page', params })
  },

  getRule: async (id: number) => {
    return await request.get({ url: '/subscription/rule/get', params: { id } })
  },

  createRule: async (data: SubscriptionRule) => {
    return await request.post({ url: '/subscription/rule/create', data })
  },

  updateRule: async (data: SubscriptionRule) => {
    return await request.put({ url: '/subscription/rule/update', data })
  },

  deleteRule: async (id: number) => {
    return await request.delete({ url: '/subscription/rule/delete', params: { id } })
  }
}
