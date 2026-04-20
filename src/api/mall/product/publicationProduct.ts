import request from '@/config/axios'
import type { Property } from './spu'

export interface PublicationGradeSimpleVO {
  id: number
  gradeNo: string
  gradeName: string
  aliasName?: string
}

export interface PublicationSpuGradeRespVO {
  productSpuId: number
  gradeCatalogIds: number[]
  gradeNames?: string[]
}

export interface PublicationProductSkuVO {
  skuId?: number
  id?: number
  name?: string
  properties?: Property[]
  price?: number | string
  marketPrice?: number | string
  costPrice?: number | string
  barCode?: string
  picUrl?: string
  stock?: number
  weight?: number
  volume?: number
  firstBrokeragePrice?: number | string
  secondBrokeragePrice?: number | string
  volumeLabel?: string
  editionLabel?: string
  targetPeriod?: string
  isbn?: string
  remark?: string
}

export interface PublicationProductVO {
  id?: number
  domainType?: string
  name?: string
  keyword?: string
  introduction?: string
  description?: string
  categoryId?: number
  brandId?: number
  picUrl?: string
  sliderPicUrls?: string[]
  sort?: number
  status?: number
  specType?: boolean
  price?: number
  marketPrice?: number
  costPrice?: number
  stock?: number
  deliveryTypes?: number[]
  deliveryTemplateId?: number
  giveIntegral?: number
  subCommissionType?: boolean
  salesCount?: number
  virtualSalesCount?: number
  browseCount?: number
  publicationTitleId?: number
  publicationTitleName?: string
  publicationTypeId?: number
  publicationTypeCode?: string
  publicationTypeName?: string
  publicationTypeIdentifierRule?: string
  publisherId?: number
  publisherName?: string
  issueCycle?: string
  issn?: string
  cnCode?: string
  postDistributionCode?: string
  applicableGradeCatalogIds?: number[]
  applicableGradeNames?: string[]
  skus?: PublicationProductSkuVO[]
  createTime?: string
}

export const getPublicationProductPage = (params: PageParam) => {
  return request.get({ url: '/product/publication-product/page', params })
}

export const getPublicationProductCount = () => {
  return request.get({ url: '/product/publication-product/get-count' })
}

export const getPublicationProduct = (id: number) => {
  return request.get({ url: '/product/publication-product/get', params: { id } })
}

export const createPublicationProduct = (data: PublicationProductVO) => {
  return request.post({ url: '/product/publication-product/create', data })
}

export const updatePublicationProduct = (data: PublicationProductVO) => {
  return request.put({ url: '/product/publication-product/update', data })
}

export const updatePublicationProductStatus = (data: { id: number; status: number }) => {
  return request.put({ url: '/product/publication-product/update-status', data })
}

export const deletePublicationProduct = (id: number) => {
  return request.delete({ url: `/product/publication-product/delete?id=${id}` })
}

export const getPublicationGradeSimpleList = () => {
  return request.get({ url: '/product/publication-spu-grade/simple-list' })
}

export const getPublicationSpuGradeBySpuId = (productSpuId: number) => {
  return request.get({ url: '/product/publication-spu-grade/get-by-spu-id', params: { productSpuId } })
}
