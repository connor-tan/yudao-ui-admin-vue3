import request from '@/config/axios'

export interface PayNotifyLogVO {
  createTime?: string
  id?: number
  lastExecuteTime?: string
  notifyTimes?: number
  response?: string
  status?: number
}

export interface PayNotifyTaskDetailVO {
  appId?: number
  appName?: string
  createTime?: string
  dataId?: number | string
  lastExecuteTime?: string
  logs: PayNotifyLogVO[]
  maxNotifyTimes?: number
  merchantOrderId?: string
  merchantRefundId?: string
  merchantTransferId?: string
  nextNotifyTime?: string
  notifyTimes?: number
  status?: number
  type?: number
  updateTime?: string
}

export interface PayNotifyTaskVO {
  id?: number
  appId?: number
  appName?: string
  type?: number
  dataId?: number | string
  status?: number
  merchantOrderId?: string
  merchantRefundId?: string
  merchantTransferId?: string
  lastExecuteTime?: string
  nextNotifyTime?: string
  notifyTimes?: number
  maxNotifyTimes?: number
}

// 获得支付通知明细
export const getNotifyTaskDetail = (id: number) => {
  return request.get<PayNotifyTaskDetailVO>({
    url: '/pay/notify/get-detail?id=' + id
  })
}

// 获得支付通知分页
export const getNotifyTaskPage = (query: Record<string, any>) => {
  return request.get({
    url: '/pay/notify/page',
    params: query
  })
}
