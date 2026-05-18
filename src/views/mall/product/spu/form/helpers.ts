import type { CategoryVO } from '@/api/mall/product/category'
import type { Spu, Sku } from '@/api/mall/product/spu'
import { PUBLICATION_ISSUE_MODE_SINGLE } from '@/api/mall/product/spu'

export const createPublicationSpuExt = (): NonNullable<Spu['publicationExt']> => ({
  publisherId: undefined,
  publicationTypeId: undefined,
  issueMode: PUBLICATION_ISSUE_MODE_SINGLE,
  issueCycle: '',
  issn: '',
  cnCode: '',
  postDistributionCode: ''
})

export const createNormalSku = (): Sku => ({
  name: '',
  status: 0,
  price: 0,
  marketPrice: 0,
  costPrice: 0,
  barCode: '',
  picUrl: '',
  stock: 0,
  weight: 0,
  volume: 0,
  firstBrokeragePrice: 0,
  secondBrokeragePrice: 0
})

export const createPublicationSku = (): Sku => ({
  ...createNormalSku(),
  publicationExt: {
    isbn: '',
    remark: ''
  },
  issueTemplates: [],
  applicableGradeCatalogIds: []
})

export const resolveCategoryBizScene = (
  categoryList: CategoryVO[],
  categoryId?: number | string
): string | undefined => {
  if (categoryId === undefined || categoryId === null || categoryId === '') {
    return undefined
  }
  const stack = [...categoryList]
  while (stack.length > 0) {
    const node = stack.shift()
    if (!node) {
      continue
    }
    if (String(node.id) === String(categoryId)) {
      return node.bizScene
    }
    if (node.children && node.children.length > 0) {
      stack.push(...node.children)
    }
  }
  return undefined
}
