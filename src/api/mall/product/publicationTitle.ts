import request from '@/config/axios'

export interface PublicationTitleVO {
  id?: number
  code: string
  name: string
  typeId: number
  publisherId: number
  issueCycle: string
  status: number
  issn?: string
  cnCode?: string
  postDistributionCode?: string
  remark?: string
  createTime?: string
  typeName?: string
  typeCode?: string
  publisherName?: string
}

export interface PublicationTitleSimpleVO {
  id: number
  code: string
  name: string
  typeId: number
  typeName?: string
  typeCode?: string
  publisherId: number
  publisherName?: string
  issueCycle?: string
}

export const getPublicationTitlePage = (params: PageParam) => {
  return request.get({ url: '/product/publication-title/page', params })
}

export const getPublicationTitle = (id: number) => {
  return request.get({ url: '/product/publication-title/get', params: { id } })
}

export const createPublicationTitle = (data: PublicationTitleVO) => {
  return request.post({ url: '/product/publication-title/create', data })
}

export const updatePublicationTitle = (data: PublicationTitleVO) => {
  return request.put({ url: '/product/publication-title/update', data })
}

export const deletePublicationTitle = (id: number) => {
  return request.delete({ url: '/product/publication-title/delete', params: { id } })
}

export const getPublicationTitleSimpleList = () => {
  return request.get({ url: '/product/publication-title/simple-list' })
}
