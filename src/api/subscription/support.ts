import request from '@/config/axios'

export interface SubscriptionSupportWindowYearSimple {
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

export const SubscriptionSupportApi = {
  getWindowYearSimpleList: async () => {
    return await request.get({ url: '/subscription/support/window-year/simple-list' })
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
  }
}
