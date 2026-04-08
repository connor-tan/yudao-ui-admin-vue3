import request from '@/config/axios'

export interface SubscriptionSupportSchoolYearSimple {
  id: number
  name: string
}

export const SubscriptionSupportApi = {
  getSchoolYearSimpleList: async (schoolId?: number) => {
    return await request.get({ url: '/subscription/support/school-year/simple-list', params: { schoolId } })
  }
}
