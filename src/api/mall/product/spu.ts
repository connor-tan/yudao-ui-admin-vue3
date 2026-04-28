import request from '@/config/axios'

export const BIZ_SCENE_NORMAL = 'NORMAL'
export const BIZ_SCENE_PUBLICATION = 'PUBLICATION'

export const PUBLICATION_TARGET_PERIOD_FULL_YEAR = 'FULL_YEAR'
export const PUBLICATION_TARGET_PERIOD_FIRST_TERM = 'FIRST_TERM'
export const PUBLICATION_TARGET_PERIOD_SECOND_TERM = 'SECOND_TERM'
export const PUBLICATION_TARGET_PERIOD_OPTIONS = [
  { value: PUBLICATION_TARGET_PERIOD_FULL_YEAR, label: '全学年' },
  { value: PUBLICATION_TARGET_PERIOD_FIRST_TERM, label: '上学期' },
  { value: PUBLICATION_TARGET_PERIOD_SECOND_TERM, label: '下学期' }
]

export interface Property {
  propertyId?: number // 属性编号
  propertyName?: string // 属性名称
  valueId?: number // 属性值编号
  valueName?: string // 属性值名称
}

export interface PublicationSpuExt {
  publisherId?: number
  publisherName?: string
  publicationTypeId?: number
  publicationTypeName?: string
  publicationTypeIdentifierRule?: string
  issueCycle?: string
  issn?: string
  cnCode?: string
  postDistributionCode?: string
}

export interface PublicationSkuExt {
  targetPeriod?: string
  volumeLabel?: string
  editionLabel?: string
  isbn?: string
  remark?: string
}

export interface Sku {
  id?: number // 商品 SKU 编号
  name?: string // 商品 SKU 名称
  spuId?: number // SPU 编号
  status?: number // SKU 状态
  properties?: Property[] // 属性数组
  price?: number | string // 商品价格
  marketPrice?: number | string // 市场价
  costPrice?: number | string // 成本价
  barCode?: string // 商品条码
  picUrl?: string // 图片地址
  stock?: number // 库存
  weight?: number // 商品重量，单位：kg 千克
  volume?: number // 商品体积，单位：m^3 平米
  firstBrokeragePrice?: number | string // 一级分销的佣金
  secondBrokeragePrice?: number | string // 二级分销的佣金
  salesCount?: number // 商品销量
  publicationExt?: PublicationSkuExt
  applicableGradeCatalogIds?: number[]
  applicableGradeNames?: string[]
}

export interface GiveCouponTemplate {
  id?: number
  name?: string // 优惠券名称
}

export interface Spu {
  id?: number
  bizScene?: string // 业务场景
  name?: string // 商品名称
  categoryId?: number // 商品分类
  keyword?: string // 关键字
  picUrl?: string // 商品封面图
  sliderPicUrls?: string[] // 商品轮播图
  introduction?: string // 商品简介
  deliveryTypes?: number[] // 配送方式
  deliveryTemplateId?: number | undefined // 运费模版
  brandId?: number // 商品品牌编号
  specType?: boolean // 商品规格
  subCommissionType?: boolean // 分销类型
  skus?: Sku[] // sku数组
  description?: string // 商品详情
  sort?: number // 商品排序
  giveIntegral?: number // 赠送积分
  virtualSalesCount?: number // 虚拟销量
  price?: number // 商品价格
  combinationPrice?: number // 商品拼团价格
  seckillPrice?: number // 商品秒杀价格
  salesCount?: number // 商品销量
  marketPrice?: number // 市场价
  costPrice?: number // 成本价
  stock?: number // 商品库存
  createTime?: string // 商品创建时间
  status?: number // 商品状态
  publicationExt?: PublicationSpuExt
}

export interface PublicationSpuGradeSummary {
  productSpuId: number
  gradeCatalogIds: number[]
  gradeNames: string[]
}

// 获得 Spu 列表
export const getSpuPage = (params: PageParam & { bizScene?: string }) => {
  return request.get({ url: '/product/spu/page', params })
}

// 获得 Spu 列表 tabsCount
export const getTabsCount = (params?: { bizScene?: string }) => {
  return request.get({ url: '/product/spu/get-count', params })
}

// 创建商品 Spu
export const createSpu = (data: Spu) => {
  return request.post({ url: '/product/spu/create', data })
}

// 更新商品 Spu
export const updateSpu = (data: Spu) => {
  return request.put({ url: '/product/spu/update', data })
}

// 更新商品 Spu status
export const updateStatus = (data: { id: number; status: number }) => {
  return request.put({ url: '/product/spu/update-status', data })
}

// 获得商品 Spu
export const getSpu = (id: number) => {
  return request.get({ url: `/product/spu/get-detail?id=${id}` })
}

export const getPublicationSpuGradeSummary = async (
  id: number
): Promise<PublicationSpuGradeSummary> => {
  const spu = (await getSpu(id)) as Spu
  const gradeIdSet = new Set<number>()
  const gradeNameSet = new Set<string>()
  ;(spu.skus || []).forEach((sku) => {
    ;(sku.applicableGradeCatalogIds || []).forEach((gradeCatalogId) => {
      if (gradeCatalogId !== undefined && gradeCatalogId !== null) {
        gradeIdSet.add(gradeCatalogId)
      }
    })
    ;(sku.applicableGradeNames || []).forEach((gradeName) => {
      if (gradeName) {
        gradeNameSet.add(gradeName)
      }
    })
  })
  return {
    productSpuId: id,
    gradeCatalogIds: Array.from(gradeIdSet),
    gradeNames: Array.from(gradeNameSet)
  }
}

// 获得商品 Spu 详情列表
export const getSpuDetailList = (ids: number[]) => {
  return request.get({ url: `/product/spu/list?spuIds=${ids}` })
}

// 删除商品 Spu
export const deleteSpu = (id: number) => {
  return request.delete({ url: `/product/spu/delete?id=${id}` })
}

// 导出商品 Spu Excel
export const exportSpu = async (params: any) => {
  return await request.download({ url: '/product/spu/export-excel', params })
}

// 获得商品 SPU 精简列表
export const getSpuSimpleList = async () => {
  return request.get({ url: '/product/spu/list-all-simple' })
}
