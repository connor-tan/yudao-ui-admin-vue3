import request from '@/config/axios'

export interface PublicationTypeVO {
  id?: number
  code: string
  name: string
  sort: number
  status: number
  remark?: string
  createTime?: string
}

export interface PublicationTypeSimpleVO {
  id: number
  code: string
  name: string
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
