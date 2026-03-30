import request from '@/config/axios'

export const STUDENT_STATUS_OPTIONS = [
  { label: '在读', value: 1 },
  { label: '毕业', value: 2 },
  { label: '休学', value: 3 }
]

export const getStudentStatusLabel = (value?: number) => {
  return STUDENT_STATUS_OPTIONS.find((item) => item.value === value)?.label || ''
}

/** 学生班级记录信息 */
export interface StudentClass {
  id?: number
  studentId?: number
  classId?: number
  className?: string
  startDate?: string
  endDate?: string
  createTime?: string
}

/** 学生信息 */
export interface Student {
  id?: number
  studentName?: string
  belongTo?: number
  parentNickname?: string
  parentMobile?: string
  currentSchoolId?: number
  currentSchoolName?: string
  entryYear?: number
  studentCode?: number
  status?: number
  createTime?: string
  studentClasses?: StudentClass[]
}

export const StudentApi = {
  getStudentPage: async (params: any) => {
    return await request.get({ url: `/edu/student/page`, params })
  },

  getStudent: async (id: number) => {
    return await request.get({ url: `/edu/student/get?id=${id}` })
  },

  createStudent: async (data: Student) => {
    return await request.post({ url: `/edu/student/create`, data })
  },

  updateStudent: async (data: Student) => {
    return await request.put({ url: `/edu/student/update`, data })
  },

  deleteStudent: async (id: number) => {
    return await request.delete({ url: `/edu/student/delete?id=${id}` })
  },

  deleteStudentList: async (ids: number[]) => {
    return await request.delete({ url: `/edu/student/delete-list?ids=${ids.join(',')}` })
  },

  exportStudent: async (params: any) => {
    return await request.download({ url: `/edu/student/export-excel`, params })
  },

  getStudentClassListByStudentId: async (studentId: number) => {
    return await request.get({ url: `/edu/student/student-class/list-by-student-id?studentId=${studentId}` })
  }
}
