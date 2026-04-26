import request from '@/config/axios'
import { YearCatalogApi } from '@/api/edu/yearCatalog'

export interface SubscriptionSupportWindowYearSimple {
  id: number
  yearStart: number
  yearEnd: number
  name: string
}

export interface SubscriptionSupportStudentSimple {
  id: number
  studentName?: string
  studentCode?: string
  gradeName?: string
  currentSchoolId?: number
  currentSchoolName?: string
  status?: number
}

export interface SubscriptionRuleConditionValue {
  value: string
  label: string
}

export const SubscriptionSupportApi = {
  getWindowYearSimpleList: async () => {
    return await YearCatalogApi.getYearCatalogSimpleList()
  },

  getStudentSimpleList: async (keyword?: string) => {
    return await request.get({
      url: '/subscription/support/student/simple-list',
      params: { keyword }
    })
  },

  getStudentSimpleListBySchool: async (schoolId: number, keyword?: string) => {
    return await request.get({
      url: '/subscription/support/student/simple-list',
      params: { schoolId, keyword }
    })
  },

  getRuleFactorList: async () => {
    return await request.get({ url: '/subscription/support/rule-factor-list' })
  },

  getRuleEffectList: async () => {
    return await request.get({ url: '/subscription/support/rule-effect-list' })
  },

  getRuleConditionValues: async (params: { factor: string; windowId?: number; offerId?: number }) => {
    return await request.get({ url: '/subscription/support/rule-condition-values', params })
  }
}
