import request from '@/config/axios'

export interface GradeCatalog {
  id: number
  stage: string
  gradeNo: string
  gradeName: string
  aliasName?: string
}

/** 年级定义信息 */
export interface SchoolGrade {
  id?: number
  schoolId?: number
  gradeCatalogId?: number
  stage?: string
  gradeNo?: string
  gradeName?: string
  aliasName?: string
  createTime?: string
}

export interface SchoolGradeSimple {
  id: number
  gradeCatalogId: number
  stage: string
  gradeNo: string
  gradeName: string
  aliasName?: string
}

/** 学年信息 */
export interface SchoolYear {
  id?: number
  schoolId?: number
  yearCatalogId?: number
  yearStart?: number
  yearEnd?: number
  startDate?: string
  endDate?: string
  createTime?: string
}

export interface SchoolYearSimple {
  id: number
  yearCatalogId?: number
  name: string
  yearStart: number
  yearEnd: number
  startDate?: string
  endDate?: string
}

export interface SchoolSimple {
  id: number
  schoolName: string
  stationId?: number
  stationName?: string
  stageCodes?: string[]
}

/** 班级信息 */
export interface SchoolClass {
  id?: number
  schoolId?: number
  entryYear?: number
  schoolGradeId?: number
  schoolYearId?: number
  schoolYearName?: string
  stage?: string
  gradeNo?: string
  gradeName?: string
  aliasName?: string
  classNo?: number
  className?: string
  createTime?: string
}

export interface SchoolClassSimple {
  id: number
  entryYear: number
  schoolGradeId: number
  className: string
  stage?: string
  gradeNo?: string
  gradeName?: string
  aliasName?: string
  schoolYearName?: string
}

/** 学校信息 */
export interface School {
  id?: number
  schoolName?: string
  areaId?: number
  areaName?: string
  schoolAddress?: string
  stationId?: number
  stationName?: string
  code?: string
  stageCode?: string
  stageCodes?: string[]
  stageNames?: string
  createTime?: string
}

export const SchoolApi = {
  getSchoolPage: async (params: any) => {
    return await request.get({ url: `/edu/school/page`, params })
  },

  getSchool: async (id: number) => {
    return await request.get({ url: `/edu/school/get?id=${id}` })
  },

  getSchoolSimpleList: async () => {
    return await request.get({ url: `/edu/school/simple-list` })
  },

  createSchool: async (data: School) => {
    return await request.post({ url: `/edu/school/create`, data })
  },

  updateSchool: async (data: School) => {
    return await request.put({ url: `/edu/school/update`, data })
  },

  deleteSchool: async (id: number) => {
    return await request.delete({ url: `/edu/school/delete?id=${id}` })
  },

  deleteSchoolList: async (ids: number[]) => {
    return await request.delete({ url: `/edu/school/delete-list?ids=${ids.join(',')}` })
  },

  exportSchool: async (params: any) => {
    return await request.download({ url: `/edu/school/export-excel`, params })
  },

  getGradeCatalogSimpleList: async () => {
    return await request.get({ url: `/edu/school/grade-catalog/simple-list` })
  },

  getSchoolGradePage: async (params: any) => {
    return await request.get({ url: `/edu/school/school-grade/page`, params })
  },

  getSchoolGradeSimpleList: async (schoolId: number) => {
    return await request.get({ url: `/edu/school/school-grade/simple-list`, params: { schoolId } })
  },

  createSchoolGrade: async (data: SchoolGrade) => {
    return await request.post({ url: `/edu/school/school-grade/create`, data })
  },

  updateSchoolGrade: async (data: SchoolGrade) => {
    return await request.put({ url: `/edu/school/school-grade/update`, data })
  },

  deleteSchoolGrade: async (id: number) => {
    return await request.delete({ url: `/edu/school/school-grade/delete?id=${id}` })
  },

  deleteSchoolGradeList: async (ids: number[]) => {
    return await request.delete({ url: `/edu/school/school-grade/delete-list?ids=${ids.join(',')}` })
  },

  getSchoolGrade: async (id: number) => {
    return await request.get({ url: `/edu/school/school-grade/get?id=${id}` })
  },

  getSchoolYearPage: async (params: any) => {
    return await request.get({ url: `/edu/school/school-year/page`, params })
  },

  getSchoolYearSimpleList: async (schoolId: number) => {
    return await request.get({ url: `/edu/school/school-year/simple-list`, params: { schoolId } })
  },

  createSchoolYear: async (data: SchoolYear) => {
    return await request.post({ url: `/edu/school/school-year/create`, data })
  },

  updateSchoolYear: async (data: SchoolYear) => {
    return await request.put({ url: `/edu/school/school-year/update`, data })
  },

  deleteSchoolYear: async (id: number) => {
    return await request.delete({ url: `/edu/school/school-year/delete?id=${id}` })
  },

  deleteSchoolYearList: async (ids: number[]) => {
    return await request.delete({ url: `/edu/school/school-year/delete-list?ids=${ids.join(',')}` })
  },

  getSchoolYear: async (id: number) => {
    return await request.get({ url: `/edu/school/school-year/get?id=${id}` })
  },

  getSchoolClassPage: async (params: any) => {
    return await request.get({ url: `/edu/school/school-class/page`, params })
  },

  getSchoolClassSimpleList: async (schoolId: number, schoolYearId?: number) => {
    return await request.get({ url: `/edu/school/school-class/simple-list`, params: { schoolId, schoolYearId } })
  },

  createSchoolClass: async (data: SchoolClass) => {
    return await request.post({ url: `/edu/school/school-class/create`, data })
  },

  updateSchoolClass: async (data: SchoolClass) => {
    return await request.put({ url: `/edu/school/school-class/update`, data })
  },

  deleteSchoolClass: async (id: number) => {
    return await request.delete({ url: `/edu/school/school-class/delete?id=${id}` })
  },

  deleteSchoolClassList: async (ids: number[]) => {
    return await request.delete({ url: `/edu/school/school-class/delete-list?ids=${ids.join(',')}` })
  },

  getSchoolClass: async (id: number) => {
    return await request.get({ url: `/edu/school/school-class/get?id=${id}` })
  }
}
