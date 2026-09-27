// 记下用户进站时打开的第一个页面。详情页的返回按钮据此判断：
// 是从站内点进来的就后退（保留列表的筛选和滚动位置），直接打开的就回到列表页。
let landingPath: string | null = null

export function rememberLandingPath(pathname: string) {
  if (landingPath === null) landingPath = pathname
}

export function cameFromInsideSite(pathname: string) {
  return landingPath !== null && landingPath !== pathname
}
