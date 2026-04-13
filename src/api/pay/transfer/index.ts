import request from '@/config/axios'

export interface TransferDetailVO {
  appId?: number
  channelCode?: string
  channelNotifyData?: string
  channelTransferNo?: string
  createTime?: string
  merchantTransferId?: string
  no?: string
  notifyUrl?: string
  price?: number
  status?: number
  successTime?: string
  userAccount?: string
  userIp?: string
  userName?: string
}

// 查询转账单列表
export const getTransferPage = async (params: PageParam) => {
  return await request.get({ url: `/pay/transfer/page`, params })
}

// 查询转账单详情
export const getTransfer = async (id: number) => {
  return await request.get<TransferDetailVO>({ url: '/pay/transfer/get?id=' + id })
}

// 导出转账单
export const exportTransfer = async (params: PageParam) => {
  return await request.download({ url: '/pay/transfer/export-excel', params })
}
