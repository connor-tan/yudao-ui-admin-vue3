export const PUBLICATION_TARGET_PERIOD = {
  FIRST_TERM: 'FIRST_TERM',
  SECOND_TERM: 'SECOND_TERM',
  FULL_YEAR: 'FULL_YEAR'
} as const

export const PUBLICATION_TARGET_PERIOD_FULL_YEAR = PUBLICATION_TARGET_PERIOD.FULL_YEAR

export const PUBLICATION_TARGET_PERIOD_OPTIONS = [
  { label: '上学期', value: PUBLICATION_TARGET_PERIOD.FIRST_TERM },
  { label: '下学期', value: PUBLICATION_TARGET_PERIOD.SECOND_TERM },
  { label: '全学年', value: PUBLICATION_TARGET_PERIOD.FULL_YEAR }
]

export const getPublicationTargetPeriodLabel = (value?: string | null) =>
  PUBLICATION_TARGET_PERIOD_OPTIONS.find((item) => item.value === value)?.label || '-'

export const normalizePublicationTargetPeriod = (value?: string | null): string => {
  if (!value) {
    return PUBLICATION_TARGET_PERIOD_FULL_YEAR
  }
  return PUBLICATION_TARGET_PERIOD_OPTIONS.some((item) => item.value === value)
    ? value
    : PUBLICATION_TARGET_PERIOD_FULL_YEAR
}
