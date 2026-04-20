import {
  getPublicationTargetPeriodLabel,
  PUBLICATION_TARGET_PERIOD_OPTIONS
} from '@/utils/publication'

export const SUBSCRIPTION_SEMESTER_OPTIONS = [
  { label: '上学期', value: 1 },
  { label: '下学期', value: 2 }
]

export const SUBSCRIPTION_TARGET_PERIOD_OPTIONS = PUBLICATION_TARGET_PERIOD_OPTIONS

export const SUBSCRIPTION_GRADE_CALC_RULE_OPTIONS = [
  { label: '当前学籍年级', value: 'CURRENT_GRADE' },
  { label: '升学后年级', value: 'PROMOTED_GRADE' }
]

export const SUBSCRIPTION_GRADE_RESOLVE_MODE_OPTIONS = [
  { label: '当前班级链路', value: 'CURRENT_CHAIN' },
  { label: '未来班级优先', value: 'TARGET_CLASS_FIRST' }
]

export const SUBSCRIPTION_RULE_EFFECT_TYPE_OPTIONS = [
  { label: '允许', value: 'INCLUDE' },
  { label: '排除', value: 'EXCLUDE' }
]

export const SUBSCRIPTION_RULE_SCOPE_TYPE_OPTIONS = [
  { label: '全部学生', value: 'ALL' },
  { label: '指定学校', value: 'SCHOOL' },
  { label: '指定年级', value: 'GRADE' },
  { label: '指定学校+年级', value: 'SCHOOL_GRADE' }
]

export const getSubscriptionSemesterLabel = (value?: number | null) =>
  SUBSCRIPTION_SEMESTER_OPTIONS.find((item) => item.value === value)?.label || '-'

export const getSubscriptionTargetPeriodLabel = getPublicationTargetPeriodLabel

export const getSubscriptionGradeCalcRuleLabel = (value?: string | null) =>
  value === 'PROMOTED_GRADE'
    ? '升学后年级'
    : value === 'CURRENT_GRADE'
      ? '当前学籍年级'
      : '-'

export const getSubscriptionGradeResolveModeLabel = (value?: string | null) =>
  value === 'TARGET_CLASS_FIRST'
    ? '未来班级优先'
    : value === 'CURRENT_CHAIN'
      ? '当前班级链路'
      : '-'

export const getSubscriptionRuleEffectTypeLabel = (value?: string | null) =>
  SUBSCRIPTION_RULE_EFFECT_TYPE_OPTIONS.find((item) => item.value === value)?.label || '-'

export const getSubscriptionRuleScopeTypeLabel = (value?: string | null) =>
  SUBSCRIPTION_RULE_SCOPE_TYPE_OPTIONS.find((item) => item.value === value)?.label || '-'

export function buildSubscriptionTargetYearKey(yearStart: number, yearEnd: number): string
export function buildSubscriptionTargetYearKey(
  yearStart?: number,
  yearEnd?: number
): string | undefined
export function buildSubscriptionTargetYearKey(yearStart?: number, yearEnd?: number) {
  return yearStart != null && yearEnd != null ? `${yearStart}-${yearEnd}` : undefined
}
