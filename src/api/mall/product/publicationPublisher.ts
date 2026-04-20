import request from '@/config/axios'

export interface PublicationPublisherVO {
  id?: number
  code?: string
  name: string
  sort: number
  status: number
  remark?: string
  createTime?: string
}

export type PublicationPublisherSaveReqVO = Omit<PublicationPublisherVO, 'code' | 'createTime'>

export interface PublicationPublisherSimpleVO {
  id: number
  code?: string
  name: string
}

export const getPublicationPublisherPage = (params: PageParam) => {
  return request.get({ url: '/product/publication-publisher/page', params })
}

export const getPublicationPublisher = (id: number) => {
  return request.get({ url: '/product/publication-publisher/get', params: { id } })
}

export const createPublicationPublisher = (data: PublicationPublisherSaveReqVO) => {
  return request.post({ url: '/product/publication-publisher/create', data })
}

export const updatePublicationPublisher = (data: PublicationPublisherSaveReqVO) => {
  return request.put({ url: '/product/publication-publisher/update', data })
}

export const deletePublicationPublisher = (id: number) => {
  return request.delete({ url: '/product/publication-publisher/delete', params: { id } })
}

export const getPublicationPublisherSimpleList = () => {
  return request.get({ url: '/product/publication-publisher/simple-list' })
}
