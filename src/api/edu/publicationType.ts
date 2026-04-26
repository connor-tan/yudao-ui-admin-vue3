import request from '@/config/axios'

export const PUBLICATION_TYPE_IDENTIFIER_RULE_NONE = 'NONE'
export const PUBLICATION_TYPE_IDENTIFIER_RULE_TITLE_PERIODICAL_REQUIRED =
  'TITLE_PERIODICAL_IDENTIFIER_REQUIRED'
export const PUBLICATION_TYPE_IDENTIFIER_RULE_SKU_ISBN_REQUIRED = 'SKU_ISBN_REQUIRED'

export const PUBLICATION_TYPE_IDENTIFIER_RULE_OPTIONS = [
  { value: PUBLICATION_TYPE_IDENTIFIER_RULE_NONE, label: '不要求标识' },
  {
    value: PUBLICATION_TYPE_IDENTIFIER_RULE_TITLE_PERIODICAL_REQUIRED,
    label: '刊物需填写 ISSN/CN/邮发代号'
  },
  { value: PUBLICATION_TYPE_IDENTIFIER_RULE_SKU_ISBN_REQUIRED, label: 'SKU 需填写 ISBN' }
]

export const formatPublicationTypeIdentifierRule = (rule?: string) => {
  return PUBLICATION_TYPE_IDENTIFIER_RULE_OPTIONS.find((item) => item.value === rule)?.label || '不要求标识'
}

export const requiresTitleIdentifier = (rule?: string) => {
  return rule === PUBLICATION_TYPE_IDENTIFIER_RULE_TITLE_PERIODICAL_REQUIRED
}

export const requiresSkuIsbn = (rule?: string) => {
  return rule === PUBLICATION_TYPE_IDENTIFIER_RULE_SKU_ISBN_REQUIRED
}

export const getPublicationTypeIdentifierRuleHint = (rule?: string) => {
  if (requiresTitleIdentifier(rule)) {
    return '当前刊物类型要求至少填写 ISSN、CN 刊号、邮发代号之一。'
  }
  if (requiresSkuIsbn(rule)) {
    return '当前刊物类型要求每个 SKU 都填写 ISBN。'
  }
  return '当前刊物类型不要求额外标识，ISSN、CN 刊号、邮发代号和 ISBN 均为选填。'
}

export interface PublicationTypeVO {
  id?: number
  name: string
  identifierRule?: string
  sort: number
  status: number
  remark?: string
  createTime?: string
}

export interface PublicationTypeSimpleVO {
  id: number
  name: string
  identifierRule?: string
}

export const getPublicationTypePage = (params: PageParam) => {
  return request.get({ url: '/edu/publication-type/page', params })
}

export const getPublicationType = (id: number) => {
  return request.get({ url: '/edu/publication-type/get', params: { id } })
}

export const createPublicationType = (data: PublicationTypeVO) => {
  return request.post({ url: '/edu/publication-type/create', data })
}

export const updatePublicationType = (data: PublicationTypeVO) => {
  return request.put({ url: '/edu/publication-type/update', data })
}

export const deletePublicationType = (id: number) => {
  return request.delete({ url: '/edu/publication-type/delete', params: { id } })
}

export const getPublicationTypeSimpleList = () => {
  return request.get({ url: '/edu/publication-type/simple-list' })
}
