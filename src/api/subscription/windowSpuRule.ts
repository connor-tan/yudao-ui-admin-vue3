import request from '@/config/axios'

export interface SubscriptionWindowSpuRule {
  id?: number
  windowSpuId: number
  effectType: string
  scopeType: string
  schoolId?: number
  schoolName?: string
  gradeCatalogId?: number
  gradeName?: string
  gradeAliasName?: string
  sort: number
  remark?: string
  gradeApplicabilityOverride?: boolean
  warningReason?: string
  createTime?: string
}

export const SubscriptionWindowSpuRuleApi = {
  getPage: async (params: any) => {
    return await request.get({ url: '/subscription/window-spu-rule/page', params })
  },

  create: async (data: SubscriptionWindowSpuRule) => {
    return await request.post({ url: '/subscription/window-spu-rule/create', data })
  },

  update: async (data: SubscriptionWindowSpuRule) => {
    return await request.put({ url: '/subscription/window-spu-rule/update', data })
  },

  delete: async (id: number) => {
    return await request.delete({ url: '/subscription/window-spu-rule/delete', params: { id } })
  }
}
