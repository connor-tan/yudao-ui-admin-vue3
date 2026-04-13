import request from '@/config/axios'

export interface UserVO {
  id?: number
  accountId?: number
  nickname?: string
  headImageUrl?: string
  remark?: string
  tagIds?: number[]
}

export interface UserPageReqVO extends PageParam {
  accountId: number
  openid?: string
  nickname?: string
}

// 更新公众号粉丝
export const updateUser = (data: UserVO) => {
  return request.put({
    url: '/mp/user/update',
    data: data
  })
}

// 获得公众号粉丝
export const getUser = (id: number): Promise<UserVO> => {
  return request.get({
    url: '/mp/user/get?id=' + id
  })
}

// 获得公众号粉丝分页
export const getUserPage = (query: UserPageReqVO): Promise<PageResult<UserVO>> => {
  return request.get({
    url: '/mp/user/page',
    params: query
  })
}

// 同步公众号粉丝
export const syncUser = (accountId: number) => {
  return request.post({
    url: '/mp/user/sync?accountId=' + accountId
  })
}
