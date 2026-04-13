import request from '@/config/axios'

export interface FinancePaymentItemVO {
  id?: number // 付款项编号
  bizId?: number // 业务单据编号
  bizType?: number // 业务类型
  bizNo?: string // 业务单号
  totalPrice: number // 应付金额
  paidPrice: number // 已付金额
  paymentPrice: number // 本次付款
  remark?: string // 备注
}

// ERP 付款单 VO
export interface FinancePaymentVO {
  id?: number // 付款单编号
  no?: string // 付款单号
  supplierId?: number // 供应商编号
  accountId?: number // 结算账户
  financeUserId?: number // 财务人员
  paymentTime?: string // 付款时间
  totalPrice: number // 合计金额，单位：元
  discountPrice: number // 优惠金额
  paymentPrice: number // 实际付款
  fileUrl: string // 附件
  status?: number // 状态
  remark?: string // 备注
  items: FinancePaymentItemVO[] // 明细项
}

// ERP 付款单 API
export const FinancePaymentApi = {
  // 查询付款单分页
  getFinancePaymentPage: async (params: any) => {
    return await request.get({ url: `/erp/finance-payment/page`, params })
  },

  // 查询付款单详情
  getFinancePayment: async (id: number) => {
    return await request.get<FinancePaymentVO>({ url: `/erp/finance-payment/get?id=` + id })
  },

  // 新增付款单
  createFinancePayment: async (data: FinancePaymentVO) => {
    return await request.post({ url: `/erp/finance-payment/create`, data })
  },

  // 修改付款单
  updateFinancePayment: async (data: FinancePaymentVO) => {
    return await request.put({ url: `/erp/finance-payment/update`, data })
  },

  // 更新付款单的状态
  updateFinancePaymentStatus: async (id: number, status: number) => {
    return await request.put({
      url: `/erp/finance-payment/update-status`,
      params: {
        id,
        status
      }
    })
  },

  // 删除付款单
  deleteFinancePayment: async (ids: number[]) => {
    return await request.delete({
      url: `/erp/finance-payment/delete`,
      params: {
        ids: ids.join(',')
      }
    })
  },

  // 导出付款单 Excel
  exportFinancePayment: async (params: any) => {
    return await request.download({ url: `/erp/finance-payment/export-excel`, params })
  }
}
