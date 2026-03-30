import request from '@/config/axios'

export interface AreaNodeVO {
  id: number
  name: string
  status: number
  children?: AreaNodeVO[]
}

// 获得地区树
export const getAreaTree = async (): Promise<AreaNodeVO[]> => {
  return await request.get({ url: '/system/area/tree' })
}

// 获得启用的地区树
export const getEnabledAreaTree = async (
  includeAreaId?: number | number[] | null
): Promise<AreaNodeVO[]> => {
  const includeAreaIds = Array.isArray(includeAreaId)
    ? includeAreaId.filter((item): item is number => item !== null && item !== undefined)
    : undefined
  if (includeAreaIds && includeAreaIds.length) {
    return await request.post({
      url: '/system/area/tree-enabled',
      data: { includeAreaIds }
    })
  }
  const params =
    includeAreaId === undefined || includeAreaId === null
      ? undefined
      : { includeAreaId }
  return await request.get({
    url: '/system/area/tree-enabled',
    params
  })
}

// 修改地区状态
export const updateAreaStatus = async (id: number, status: number) => {
  return await request.put({ url: '/system/area/update-status', data: { id, status } })
}

// 批量修改地区状态
export const updateAreaStatusBatch = async (ids: number[], status: number) => {
  return await request.put({ url: '/system/area/update-status-batch', data: { ids, status } })
}

// 获得 IP 对应的地区名
export const getAreaByIp = async (ip: string): Promise<string> => {
  return await request.get({ url: '/system/area/get-by-ip?ip=' + ip })
}
