import request from '@/config/axios'

export interface PublicationPublisherVO {
  id?: number
  name: string
  sort: number
  status: number
  remark?: string
  createTime?: string
}

export type PublicationPublisherSaveReqVO = Omit<PublicationPublisherVO, 'createTime'>

export interface PublicationPublisherSimpleVO {
  id: number
  name: string
}

export const getPublicationPublisherPage = (params: PageParam) => {
  return request.get({ url: '/edu/publication-publisher/page', params })
}

export const getPublicationPublisher = (id: number) => {
  return request.get({ url: '/edu/publication-publisher/get', params: { id } })
}

export const createPublicationPublisher = (data: PublicationPublisherSaveReqVO) => {
  return request.post({ url: '/edu/publication-publisher/create', data })
}

export const updatePublicationPublisher = (data: PublicationPublisherSaveReqVO) => {
  return request.put({ url: '/edu/publication-publisher/update', data })
}

export const deletePublicationPublisher = (id: number) => {
  return request.delete({ url: '/edu/publication-publisher/delete', params: { id } })
}

export const getPublicationPublisherSimpleList = () => {
  return request.get({ url: '/edu/publication-publisher/simple-list' })
}
