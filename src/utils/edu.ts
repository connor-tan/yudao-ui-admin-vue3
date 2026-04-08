export const formatGradeName = (gradeName?: string, aliasName?: string) => {
  if (!gradeName) {
    return '-'
  }
  return aliasName ? `${gradeName}（${aliasName}）` : gradeName
}

export const formatGradeLabel = (gradeNo?: string, gradeName?: string, aliasName?: string) => {
  if (!gradeNo && !gradeName) {
    return '-'
  }
  if (!gradeNo) {
    return formatGradeName(gradeName, aliasName)
  }
  return `${gradeNo} / ${formatGradeName(gradeName, aliasName)}`
}
