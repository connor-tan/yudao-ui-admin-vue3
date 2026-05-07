import { DiyComponent } from '@/components/DiyEditor/util'

const XKH_TABBAR_IMAGES = {
  home: 'http://61.160.108.46:29000/connor/20260507/xkh-tab-home-tight_1778158484466.png',
  homeActive:
    'http://61.160.108.46:29000/connor/20260507/xkh-tab-home-active-tight_1778158484434.png',
  publication:
    'http://61.160.108.46:29000/connor/20260507/xkh-tab-publication-tight_1778158484603.png',
  publicationActive:
    'http://61.160.108.46:29000/connor/20260507/xkh-tab-publication-active-tight_1778158484570.png',
  cart: 'http://61.160.108.46:29000/connor/20260507/xkh-tab-cart-tight_1778158484400.png',
  cartActive:
    'http://61.160.108.46:29000/connor/20260507/xkh-tab-cart-active-tight_1778158484352.png',
  profile:
    'http://61.160.108.46:29000/connor/20260507/xkh-tab-profile-tight_1778158484534.png',
  profileActive:
    'http://61.160.108.46:29000/connor/20260507/xkh-tab-profile-active-tight_1778158484499.png'
} as const

/** 底部导航菜单属性 */
export interface TabBarProperty {
  // 选项列表
  items: TabBarItemProperty[]
  // 主题
  theme: string
  // 样式
  style: TabBarStyle
}

// 选项属性
export interface TabBarItemProperty {
  // 标签文字
  text: string
  // 链接
  url: string
  // 默认图标链接
  iconUrl: string
  // 选中的图标链接
  activeIconUrl: string
}

// 样式
export interface TabBarStyle {
  // 背景类型
  bgType: 'color' | 'img'
  // 背景颜色
  bgColor: string
  // 图片链接
  bgImg: string
  // 默认颜色
  color: string
  // 选中的颜色
  activeColor: string
}

// 定义组件
export const component = {
  id: 'TabBar',
  name: '底部导航',
  icon: 'fluent:table-bottom-row-16-filled',
  property: {
    theme: 'blue',
    style: {
      bgType: 'color',
      bgColor: '#FFFFFF',
      color: '#7A8794',
      activeColor: '#0081FF'
    },
    items: [
      {
        text: '首页',
        url: '/pages/index/index',
        iconUrl: XKH_TABBAR_IMAGES.home,
        activeIconUrl: XKH_TABBAR_IMAGES.homeActive
      },
      {
        text: '订刊',
        url: '/pages/index/category?id=3',
        iconUrl: XKH_TABBAR_IMAGES.publication,
        activeIconUrl: XKH_TABBAR_IMAGES.publicationActive
      },
      {
        text: '购物车',
        url: '/pages/index/cart',
        iconUrl: XKH_TABBAR_IMAGES.cart,
        activeIconUrl: XKH_TABBAR_IMAGES.cartActive
      },
      {
        text: '我的',
        url: '/pages/index/user',
        iconUrl: XKH_TABBAR_IMAGES.profile,
        activeIconUrl: XKH_TABBAR_IMAGES.profileActive
      }
    ]
  }
} as DiyComponent<TabBarProperty>

export const THEME_LIST = [
  { id: 'red', name: '中国红', icon: 'icon-park-twotone:theme', color: '#d10019' },
  { id: 'orange', name: '桔橙', icon: 'icon-park-twotone:theme', color: '#f37b1d' },
  { id: 'gold', name: '明黄', icon: 'icon-park-twotone:theme', color: '#fbbd08' },
  { id: 'green', name: '橄榄绿', icon: 'icon-park-twotone:theme', color: '#8dc63f' },
  { id: 'cyan', name: '天青', icon: 'icon-park-twotone:theme', color: '#1cbbb4' },
  { id: 'blue', name: '海蓝', icon: 'icon-park-twotone:theme', color: '#0081ff' },
  { id: 'purple', name: '姹紫', icon: 'icon-park-twotone:theme', color: '#6739b6' },
  { id: 'brightRed', name: '嫣红', icon: 'icon-park-twotone:theme', color: '#e54d42' },
  { id: 'forestGreen', name: '森绿', icon: 'icon-park-twotone:theme', color: '#39b54a' },
  { id: 'mauve', name: '木槿', icon: 'icon-park-twotone:theme', color: '#9c26b0' },
  { id: 'pink', name: '桃粉', icon: 'icon-park-twotone:theme', color: '#e03997' },
  { id: 'brown', name: '棕褐', icon: 'icon-park-twotone:theme', color: '#a5673f' },
  { id: 'grey', name: '玄灰', icon: 'icon-park-twotone:theme', color: '#8799a3' },
  { id: 'gray', name: '草灰', icon: 'icon-park-twotone:theme', color: '#aaaaaa' },
  { id: 'black', name: '墨黑', icon: 'icon-park-twotone:theme', color: '#333333' }
]
