import request from '@/config/axios'

export const PUBLICATION_TYPE_IDENTIFIER_RULE_NONE = 'NONE'
export const PUBLICATION_TYPE_IDENTIFIER_RULE_TITLE_PERIODICAL_REQUIRED =
  'TITLE_PERIODICAL_IDENTIFIER_REQUIRED'
export const PUBLICATION_TYPE_IDENTIFIER_RULE_SKU_ISBN_REQUIRED = 'SKU_ISBN_REQUIRED'

export const PUBLICATION_TYPE_IDENTIFIER_RULE_OPTIONS = [
  { value: PUBLICATION_TYPE_IDENTIFIER_RULE_NONE, label: '不要求标识' },
  {
    value: PUBLICATION_TYPE_IDENTIFIER_RULE_TITLE_PERIODICAL_REQUIRED,
    label: '主档需填写 ISSN/CN/邮发代号'
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

export interface PublicationTypeVO {
  id?: number
  code: string
  name: string
  identifierRule?: string
  sort: number
  status: number
  remark?: string
  createTime?: string
}

export interface PublicationTypeSimpleVO {
  id: number
  code: string
  name: string
  identifierRule?: string
}

export const getPublicationTypePage = (params: PageParam) => {
  return request.get({ url: '/product/publication-type/page', params })
}

export const getPublicationType = (id: number) => {
  return request.get({ url: '/product/publication-type/get', params: { id } })
}

export const createPublicationType = (data: PublicationTypeVO) => {
  return request.post({ url: '/product/publication-type/create', data })
}

export const updatePublicationType = (data: PublicationTypeVO) => {
  return request.put({ url: '/product/publication-type/update', data })
}

export const deletePublicationType = (id: number) => {
  return request.delete({ url: '/product/publication-type/delete', params: { id } })
}

export const getPublicationTypeSimpleList = () => {
  return request.get({ url: '/product/publication-type/simple-list' })
}
