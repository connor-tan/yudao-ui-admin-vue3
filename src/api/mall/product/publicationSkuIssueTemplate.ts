import request from '@/config/axios'
import type { PublicationSkuIssueTemplate } from './spu'

export interface PublicationSkuIssueTemplateGenerateReqVO {
  skuId?: number
  startIssueNo?: number
  issueCount?: number
  issueNamePrefix?: string
  firstPublishOffsetDays?: number
  publishIntervalDays?: number
  firstDeliveryOffsetDays?: number
  deliveryIntervalDays?: number
}

export const PublicationSkuIssueTemplateApi = {
  getTemplateList: async (skuId: number) => {
    return await request.get<PublicationSkuIssueTemplate[]>({
      url: '/product/publication-sku-issue-template/list',
      params: { skuId }
    })
  },

  createTemplate: async (data: PublicationSkuIssueTemplate) => {
    return await request.post<number>({ url: '/product/publication-sku-issue-template/create', data })
  },

  updateTemplate: async (data: PublicationSkuIssueTemplate) => {
    return await request.put<boolean>({ url: '/product/publication-sku-issue-template/update', data })
  },

  generateTemplates: async (data: PublicationSkuIssueTemplateGenerateReqVO) => {
    return await request.post<number>({
      url: '/product/publication-sku-issue-template/generate',
      data
    })
  },

  deleteTemplate: async (id: number) => {
    return await request.delete<boolean>({
      url: '/product/publication-sku-issue-template/delete',
      params: { id }
    })
  }
}
