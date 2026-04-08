export const SUBSCRIPTION_SEMESTER_OPTIONS = [
  { label: '上学期', value: 1 },
  { label: '下学期', value: 2 }
]

export const SUBSCRIPTION_GRADE_CALC_RULE_OPTIONS = [
  { label: '当前学籍年级', value: 'CURRENT_GRADE' },
  { label: '升学后年级', value: 'PROMOTED_GRADE' }
]

export const getSubscriptionSemesterLabel = (value?: number | null) =>
  SUBSCRIPTION_SEMESTER_OPTIONS.find((item) => item.value === value)?.label || '-'

export const getSubscriptionGradeCalcRuleLabel = (value?: string | null) =>
  value === 'PROMOTED_GRADE'
    ? '升学后年级'
    : value === 'CURRENT_GRADE'
      ? '当前学籍年级'
      : '-'
